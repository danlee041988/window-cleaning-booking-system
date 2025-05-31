import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook that prevents state updates on unmounted components
 * Prevents memory leaks in async operations
 */
export const useSafeState = (initialState) => {
  const [state, setState] = useState(initialState);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const setSafeState = useCallback((newState) => {
    if (isMountedRef.current) {
      setState(newState);
    }
  }, []);

  return [state, setSafeState];
};

/**
 * Hook for managing async operations with proper cleanup
 */
export const useAsyncSafeState = () => {
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const executeAsync = useCallback(async (asyncFunction, onSuccess, onError) => {
    // Cancel any pending operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const result = await asyncFunction(abortControllerRef.current.signal);
      
      if (isMountedRef.current && !abortControllerRef.current.signal.aborted) {
        onSuccess?.(result);
      }
    } catch (error) {
      if (error.name !== 'AbortError' && isMountedRef.current) {
        onError?.(error);
      }
    }
  }, []);

  return { executeAsync, isMounted: () => isMountedRef.current };
};

/**
 * Hook for safe timeout management
 */
export const useSafeTimeout = () => {
  const timeoutRefs = useRef([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Clear all timeouts on unmount
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  const setSafeTimeout = useCallback((callback, delay) => {
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        callback();
      }
    }, delay);

    timeoutRefs.current.push(timeoutId);
    return timeoutId;
  }, []);

  const clearSafeTimeout = useCallback((timeoutId) => {
    clearTimeout(timeoutId);
    timeoutRefs.current = timeoutRefs.current.filter(id => id !== timeoutId);
  }, []);

  return { setSafeTimeout, clearSafeTimeout };
};

export default useSafeState;