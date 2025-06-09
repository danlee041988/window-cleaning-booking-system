import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useRef, useEffect } from 'react';

// Custom hook with built-in optimization strategies
export function useOptimizedQuery<TData = unknown, TError = unknown>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  options?: UseQueryOptions<TData, TError>
) {
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      // Cancel any pending requests on unmount
      abortControllerRef.current?.abort();
    };
  }, []);

  return useQuery({
    queryKey,
    queryFn: async () => {
      // Cancel previous request if still pending
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      
      try {
        return await queryFn();
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request cancelled');
        }
        throw error;
      }
    },
    // Default optimization options
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    retry: (failureCount, error) => {
      // Only retry on network errors, not on 4xx errors
      if (error instanceof Error && error.message.includes('4')) return false;
      return failureCount < 2;
    },
    ...options
  });
}

// Hook for paginated queries with optimistic updates
export function usePaginatedQuery<TData = unknown>(
  queryKey: any[],
  queryFn: (params: any) => Promise<TData>,
  params: any
) {
  return useOptimizedQuery(
    [...queryKey, params],
    () => queryFn(params),
    {
      keepPreviousData: true, // Smooth pagination transitions
      staleTime: 2 * 60 * 1000, // Shorter stale time for frequently changing data
    }
  );
}