// Auto-save form data to localStorage to prevent data loss
import { useEffect, useRef, useCallback } from 'react';

export const useFormPersistence = (formData, setFormData, storageKey = 'somersetBookingForm') => {
  const isMountedRef = useRef(true);
  const saveTimeoutRef = useRef(null);
  
  // Load saved data on mount
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedData = localStorage.getItem(storageKey);
        if (savedData && isMountedRef.current) {
          const parsed = JSON.parse(savedData);
          // Only restore if data is less than 24 hours old
          if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
            // Don't restore sensitive data like recaptcha token
            const { recaptchaToken, ...restoredData } = parsed.data;
            setFormData(prevData => ({ ...prevData, ...restoredData }));
            
            // Remove console.log for production
          } else {
            // Clear old data
            localStorage.removeItem(storageKey);
          }
        }
      } catch (error) {
        // Silent fail for localStorage errors
      }
    };
    
    loadSavedData();
    
    // Handle storage events from other tabs
    const handleStorageChange = (e) => {
      if (e.key === storageKey && e.newValue && isMountedRef.current) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
            const { recaptchaToken, ...restoredData } = parsed.data;
            setFormData(prevData => ({ ...prevData, ...restoredData }));
          }
        } catch (error) {
          // Silent fail
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [storageKey, setFormData]);

  // Save data on change with debouncing
  useEffect(() => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce saves to prevent excessive localStorage writes
    saveTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      try {
        // Don't save if form is empty or only has default values
        const hasUserData = formData.customerName || formData.email || formData.propertyType;
        
        if (hasUserData) {
          const dataToSave = {
            timestamp: Date.now(),
            data: formData
          };
          localStorage.setItem(storageKey, JSON.stringify(dataToSave));
        }
      } catch (error) {
        // Silent fail for localStorage errors
      }
    }, 2000); // Save after 2 seconds of inactivity
    
    // Cleanup timeout on unmount or dependency change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, storageKey]);

  // Clear saved data function with safety check
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      // Clear any pending save timeouts
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    } catch (error) {
      // Silent fail
    }
  }, [storageKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return { clearSavedData };
};

export default useFormPersistence;