"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { useState, useRef, useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Optimize for high-frequency real-time data updates
            staleTime: 500, // 500ms - data is considered fresh (reduced for faster updates)
            gcTime: 5 * 60 * 1000, // 5 minutes cache time
            refetchOnWindowFocus: false, // Don't refetch on window focus for real-time data
            refetchOnReconnect: true, // Refetch on reconnect
            refetchOnMount: false, // Don't refetch on mount if data is fresh
            retry: 2, // Retry twice on failure (increased for reliability)
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
            
            // Performance optimizations for high-frequency updates
            structuralSharing: true, // Enable structural sharing to reduce re-renders
            notifyOnChangeProps: "tracked", // Only notify on tracked props
            
            // Network mode
            networkMode: "online", // Only fetch when online
          },
          mutations: {
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
            networkMode: "online",
          },
        },
        // Optimize query cache for performance
        queryCache: undefined,
        mutationCache: undefined,
      })
  );

  // Add query client cleanup on unmount
  const queryClientRef = useRef(queryClient);
  useEffect(() => {
    return () => {
      queryClientRef.current.clear();
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider 
          delayDuration={200} 
          skipDelayDuration={300}
        >
          <Toaster />
          <Sonner 
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              className: "terminal-card",
            }}
          />
          {children}
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
