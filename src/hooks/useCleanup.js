import { useEffect, useRef } from 'react';

// Hook to manage cleanup of async operations
export function useCleanup() {
  const cleanupFns = useRef([]);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      cleanupFns.current.forEach(fn => fn());
      cleanupFns.current = [];
    };
  }, []);

  const addCleanup = (fn) => {
    cleanupFns.current.push(fn);
  };

  const isComponentMounted = () => isMounted.current;

  return { addCleanup, isComponentMounted };
}

// Hook to manage AbortController for fetch requests
export function useAbortController() {
  const abortControllerRef = useRef(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const getSignal = () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current.signal;
  };

  return { getSignal };
}

// Hook to manage event listeners with automatic cleanup
export function useEventListener(eventName, handler, element = window) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    const eventListener = (event) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener);

    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
}

// Hook to manage intervals with automatic cleanup
export function useInterval(callback, delay) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]);
}

// Hook to manage timeouts with automatic cleanup
export function useTimeout(callback, delay) {
  const savedCallback = useRef(callback);
  const timeoutRef = useRef(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const set = useCallback(() => {
    timeoutRef.current = setTimeout(() => savedCallback.current(), delay);
  }, [delay]);

  const clear = useCallback(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    set();
    return clear;
  }, [delay, set, clear]);

  const reset = useCallback(() => {
    clear();
    set();
  }, [clear, set]);

  return { clear, reset };
}