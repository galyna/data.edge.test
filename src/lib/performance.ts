/**
 * Performance utilities for high-frequency data updates
 * Optimized for real-time sports data with high update frequency
 */

/**
 * Debounce function to limit how often a function can be called
 * Use for user input or non-critical updates
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function execution rate
 * Use for high-frequency events like scroll or real-time updates
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: ReturnType<T> | undefined;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      lastResult = func(...args) as ReturnType<T>;
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult as void;
  };
}

/**
 * Check if two arrays are shallowly equal
 */
export function shallowEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

/**
 * Deep equality check for objects
 */
export function deepEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) return true;
  
  if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
    return false;
  }
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual((obj1 as Record<string, unknown>)[key], (obj2 as Record<string, unknown>)[key])) {
      return false;
    }
  }
  
  return true;
}

/**
 * Memoize function results with LRU cache
 */
export function memoize<Args extends unknown[], Return>(
  fn: (...args: Args) => Return,
  options?: {
    getKey?: (...args: Args) => string;
    maxSize?: number;
  }
): (...args: Args) => Return {
  const cache = new Map<string, { value: Return; lastAccessed: number }>();
  const maxSize = options?.maxSize ?? 100;

  return (...args: Args): Return => {
    const key = options?.getKey ? options.getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      const cached = cache.get(key)!;
      cached.lastAccessed = Date.now();
      return cached.value;
    }
    
    const result = fn(...args);
    
    // LRU eviction if cache is full
    if (cache.size >= maxSize) {
      let oldestKey = "";
      let oldestTime = Infinity;
      
      for (const [k, v] of cache.entries()) {
        if (v.lastAccessed < oldestTime) {
          oldestTime = v.lastAccessed;
          oldestKey = k;
        }
      }
      
      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }
    
    cache.set(key, { value: result, lastAccessed: Date.now() });
    return result;
  };
}

/**
 * Batch updates to reduce re-renders
 * Collects updates and executes them in a single batch after delay
 */
export function batchUpdates<T>(
  updateFn: (items: T[]) => void,
  delay: number = 16 // ~1 frame at 60fps
): (item: T) => void {
  let pending: T[] = [];
  let timeoutId: NodeJS.Timeout | null = null;

  return (item: T) => {
    pending.push(item);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      if (pending.length > 0) {
        updateFn([...pending]);
        pending = [];
      }
      timeoutId = null;
    }, delay);
  };
}

/**
 * Request idle callback polyfill for better performance
 */
export const requestIdleCallback =
  typeof window !== "undefined" && "requestIdleCallback" in window
    ? window.requestIdleCallback
    : (cb: IdleRequestCallback) => setTimeout(cb, 1);

export const cancelIdleCallback =
  typeof window !== "undefined" && "cancelIdleCallback" in window
    ? window.cancelIdleCallback
    : (id: number) => clearTimeout(id);

/**
 * Run task when browser is idle
 */
export function runWhenIdle(task: () => void, options?: IdleRequestOptions): number {
  return requestIdleCallback(task, options);
}

/**
 * Lazy initialization - compute value only when first accessed
 */
export function lazy<T>(init: () => T): () => T {
  let value: T;
  let initialized = false;

  return () => {
    if (!initialized) {
      value = init();
      initialized = true;
    }
    return value;
  };
}

/**
 * Check if value has changed based on shallow comparison
 */
export function hasChanged<T>(prev: T, next: T): boolean {
  if (prev === next) return false;
  
  if (Array.isArray(prev) && Array.isArray(next)) {
    return !shallowEqual(prev, next);
  }
  
  if (typeof prev === "object" && prev !== null && typeof next === "object" && next !== null) {
    const prevKeys = Object.keys(prev);
    const nextKeys = Object.keys(next);
    
    if (prevKeys.length !== nextKeys.length) return true;
    
    return prevKeys.some(
      (key) => (prev as Record<string, unknown>)[key] !== (next as Record<string, unknown>)[key]
    );
  }
  
  return true;
}

/**
 * Optimize object allocation by reusing previous reference if values haven't changed
 */
export function optimizeObject<T extends Record<string, unknown>>(
  prev: T | null,
  next: T
): T {
  if (!prev) return next;
  if (!hasChanged(prev, next)) return prev;
  return next;
}

