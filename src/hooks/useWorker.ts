import { useEffect, useRef, useCallback, useState } from "react";

interface WorkerMessage<T = unknown> {
  type: string;
  id: string;
  data?: T;
  result?: unknown;
  error?: string;
}

interface UseWorkerOptions {
  workerPath: string;
  timeout?: number;
}

interface UseWorkerReturn {
  postMessage: <T = unknown>(type: string, data?: T) => Promise<unknown>;
  isReady: boolean;
  error: string | null;
  terminate: () => void;
}

/**
 * Hook to manage Web Worker lifecycle and communication
 * Provides type-safe message passing with promise-based API
 */
export function useWorker({ workerPath, timeout = 5000 }: UseWorkerOptions): UseWorkerReturn {
  const workerRef = useRef<Worker | null>(null);
  const pendingRequests = useRef<Map<string, {
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
    timeoutId: NodeJS.Timeout;
  }>>(new Map());
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageId = useRef(0);

  // Initialize worker
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const worker = new Worker(workerPath);
      workerRef.current = worker;

      // Handle messages from worker
      worker.addEventListener("message", (event: MessageEvent<WorkerMessage>) => {
        const { type, id, result, error: workerError } = event.data;

        // Handle ready signal
        if (type === "READY") {
          setIsReady(true);
          return;
        }

        // Handle response to pending request
        const pending = pendingRequests.current.get(id);
        if (!pending) {
          return;
        }

        clearTimeout(pending.timeoutId);
        pendingRequests.current.delete(id);

        if (type === "SUCCESS") {
          pending.resolve(result);
        } else if (type === "ERROR") {
          pending.reject(new Error(workerError || "Worker error"));
        }
      });

      // Handle worker errors
      worker.addEventListener("error", (event: ErrorEvent) => {
        setError(event.message);
        console.error("Worker error:", event.message);
      });

      // Cleanup
      return () => {
        // Reject all pending requests
        pendingRequests.current.forEach(({ reject, timeoutId }) => {
          clearTimeout(timeoutId);
          reject(new Error("Worker terminated"));
        });
        pendingRequests.current.clear();

        worker.terminate();
        workerRef.current = null;
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create worker");
    }
  }, [workerPath]);

  // Post message to worker
  const postMessage = useCallback(
    <T = unknown>(type: string, data?: T): Promise<unknown> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error("Worker not initialized"));
          return;
        }

        if (!isReady) {
          reject(new Error("Worker not ready"));
          return;
        }

        const id = `msg_${messageId.current++}`;

        // Setup timeout
        const timeoutId = setTimeout(() => {
          pendingRequests.current.delete(id);
          reject(new Error(`Worker timeout after ${timeout}ms`));
        }, timeout);

        // Store pending request
        pendingRequests.current.set(id, {
          resolve,
          reject,
          timeoutId,
        });

        // Send message to worker
        workerRef.current.postMessage({ type, id, data });
      });
    },
    [isReady, timeout]
  );

  // Terminate worker manually
  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
      setIsReady(false);
    }
  }, []);

  return {
    postMessage,
    isReady,
    error,
    terminate,
  };
}

/**
 * Hook specifically for data aggregation worker
 */
export function useDataAggregatorWorker() {
  const worker = useWorker({
    workerPath: "/workers/dataAggregator.worker.js",
    timeout: 10000, // 10 seconds for heavy calculations
  });

  const processBatch = useCallback(
    async (matches: unknown[]) => {
      return worker.postMessage("PROCESS_BATCH", { matches });
    },
    [worker]
  );

  const calculateStatistics = useCallback(
    async (matches: unknown[]) => {
      return worker.postMessage("CALCULATE_STATISTICS", { matches });
    },
    [worker]
  );

  const calculateAggregatedOdds = useCallback(
    async (sources: unknown[]) => {
      return worker.postMessage("CALCULATE_AGGREGATED_ODDS", { sources });
    },
    [worker]
  );

  return {
    ...worker,
    processBatch,
    calculateStatistics,
    calculateAggregatedOdds,
  };
}

