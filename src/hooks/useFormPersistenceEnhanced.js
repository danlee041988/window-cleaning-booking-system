import { useEffect, useRef, useCallback } from 'react';
import { debounce } from '../utils/stateUtils';

const STORAGE_KEY = 'bookingFormData';
const STORAGE_VERSION = '2.0';
const EXPIRY_HOURS = 24;

/**
 * Enhanced form persistence hook with error handling and data validation
 */
const useFormPersistenceEnhanced = (formData, setFormData, initialFormData) => {
  const isMountedRef = useRef(true);
  const hasRestoredRef = useRef(false);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Validates saved data structure
   */
  const validateSavedData = (data) => {
    if (!data || typeof data !== 'object') return false;
    if (!data.version || !data.timestamp || !data.formData) return false;
    if (data.version !== STORAGE_VERSION) return false;
    
    // Check if data is not expired
    const hoursSince = (Date.now() - data.timestamp) / (1000 * 60 * 60);
    if (hoursSince > EXPIRY_HOURS) return false;
    
    return true;
  };

  /**
   * Safely saves form data to localStorage
   */
  const saveFormData = useCallback(() => {
    if (!isMountedRef.current) return;

    try {
      const dataToSave = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        formData: formData,
        currentStep: formData.currentStep || 1
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      console.log('Form data saved successfully');
    } catch (error) {
      console.error('Failed to save form data:', error);
      
      // If quota exceeded, try to clear old data
      if (error.name === 'QuotaExceededError') {
        try {
          // Clear old form data
          const keys = Object.keys(localStorage).filter(key => 
            key.startsWith('booking') || key.includes('form')
          );
          keys.forEach(key => localStorage.removeItem(key));
          
          // Try again
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            version: STORAGE_VERSION,
            timestamp: Date.now(),
            formData: formData
          }));
        } catch (retryError) {
          console.error('Failed to save after clearing storage:', retryError);
        }
      }
    }
  }, [formData]);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(saveFormData, 2000),
    [saveFormData]
  );

  /**
   * Restores form data from localStorage
   */
  const restoreFormData = useCallback(() => {
    if (hasRestoredRef.current || !isMountedRef.current) return;

    try {
      const savedDataStr = localStorage.getItem(STORAGE_KEY);
      if (!savedDataStr) return;

      const savedData = JSON.parse(savedDataStr);
      
      if (!validateSavedData(savedData)) {
        console.log('Saved data is invalid or expired, clearing...');
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      // Merge with initial data to ensure all fields exist
      const restoredData = {
        ...initialFormData,
        ...savedData.formData
      };

      // Ask user if they want to restore
      const timeAgo = Math.floor((Date.now() - savedData.timestamp) / (1000 * 60));
      const message = timeAgo < 60 
        ? `Continue where you left off ${timeAgo} minutes ago?`
        : `Continue where you left off ${Math.floor(timeAgo / 60)} hours ago?`;

      if (window.confirm(message)) {
        setFormData(restoredData);
        hasRestoredRef.current = true;
        console.log('Form data restored successfully');
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to restore form data:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [setFormData, initialFormData]);

  /**
   * Clears saved form data
   */
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Saved form data cleared');
    } catch (error) {
      console.error('Failed to clear saved data:', error);
    }
  }, []);

  /**
   * Gets summary of saved data without loading it
   */
  const getSavedDataInfo = useCallback(() => {
    try {
      const savedDataStr = localStorage.getItem(STORAGE_KEY);
      if (!savedDataStr) return null;

      const savedData = JSON.parse(savedDataStr);
      if (!validateSavedData(savedData)) return null;

      return {
        timestamp: savedData.timestamp,
        currentStep: savedData.currentStep,
        hasData: true
      };
    } catch (error) {
      return null;
    }
  }, []);

  // Restore data on mount
  useEffect(() => {
    // Small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      restoreFormData();
    }, 100);

    return () => clearTimeout(timer);
  }, [restoreFormData]);

  // Save data when it changes
  useEffect(() => {
    // Don't save if we just restored
    if (hasRestoredRef.current) {
      hasRestoredRef.current = false;
      return;
    }

    // Don't save initial/empty data
    if (!formData || Object.keys(formData).length === 0) return;

    debouncedSave();
  }, [formData, debouncedSave]);

  return {
    clearSavedData,
    getSavedDataInfo,
    saveFormData: debouncedSave
  };
};

export default useFormPersistenceEnhanced;