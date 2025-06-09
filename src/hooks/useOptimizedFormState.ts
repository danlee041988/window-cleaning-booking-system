/**
 * useOptimizedFormState - Optimized form state management hook
 * Provides debounced updates and memoized values for better performance
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { debounce } from 'lodash-es';

interface UseOptimizedFormStateOptions<T> {
  initialState: T;
  debounceDelay?: number;
  onStateChange?: (newState: T) => void;
}

export const useOptimizedFormState = <T extends Record<string, any>>({
  initialState,
  debounceDelay = 300,
  onStateChange
}: UseOptimizedFormStateOptions<T>) => {
  const [state, setState] = useState<T>(initialState);
  const [debouncedState, setDebouncedState] = useState<T>(initialState);
  const onStateChangeRef = useRef(onStateChange);

  // Update ref when callback changes
  onStateChangeRef.current = onStateChange;

  // Debounced state update
  const debouncedSetState = useMemo(
    () => debounce((newState: T) => {
      setDebouncedState(newState);
      onStateChangeRef.current?.(newState);
    }, debounceDelay),
    [debounceDelay]
  );

  // Optimized field update function
  const updateField = useCallback((
    field: keyof T,
    value: T[keyof T]
  ) => {
    setState(prevState => {
      const newState = { ...prevState, [field]: value };
      debouncedSetState(newState);
      return newState;
    });
  }, [debouncedSetState]);

  // Optimized multiple fields update
  const updateFields = useCallback((
    updates: Partial<T>
  ) => {
    setState(prevState => {
      const newState = { ...prevState, ...updates };
      debouncedSetState(newState);
      return newState;
    });
  }, [debouncedSetState]);

  // Reset form state
  const resetState = useCallback(() => {
    setState(initialState);
    setDebouncedState(initialState);
    debouncedSetState.cancel();
  }, [initialState, debouncedSetState]);

  // Memoized derived values
  const hasChanges = useMemo(() => {
    return JSON.stringify(state) !== JSON.stringify(initialState);
  }, [state, initialState]);

  const isValid = useMemo(() => {
    // Basic validation - can be extended
    return Object.values(state).every(value => 
      value !== null && value !== undefined && value !== ''
    );
  }, [state]);

  return {
    // Current state (immediate updates)
    state,
    // Debounced state (delayed updates)
    debouncedState,
    // Update functions
    updateField,
    updateFields,
    resetState,
    // Derived values
    hasChanges,
    isValid,
    // Direct state setter (use sparingly)
    setState
  };
};

// Hook for form field with optimized change handling
export const useOptimizedField = <T>(
  initialValue: T,
  onChange?: (value: T) => void,
  debounceDelay = 300
) => {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const onChangeRef = useRef(onChange);

  onChangeRef.current = onChange;

  const debouncedOnChange = useMemo(
    () => debounce((newValue: T) => {
      setDebouncedValue(newValue);
      onChangeRef.current?.(newValue);
    }, debounceDelay),
    [debounceDelay]
  );

  const handleChange = useCallback((newValue: T) => {
    setValue(newValue);
    debouncedOnChange(newValue);
  }, [debouncedOnChange]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setDebouncedValue(initialValue);
    debouncedOnChange.cancel();
  }, [initialValue, debouncedOnChange]);

  return {
    value,
    debouncedValue,
    handleChange,
    reset,
    hasChanged: value !== initialValue
  };
};