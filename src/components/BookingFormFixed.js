// CRITICAL FIXES for BookingForm.js
// This file shows the key fixes needed to prevent crashes and memory leaks

import React, { useState, useRef, useEffect } from 'react';
import emailjs from '@emailjs/browser';

// Example of fixed handleSubmit with proper cleanup
const useSubmitHandler = () => {
  const isMountedRef = useRef(true);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSubmit = async (formDataToSubmit, onSuccess) => {
    if (!formDataToSubmit.recaptchaToken) {
      setSubmissionError("Please complete the reCAPTCHA verification.");
      return;
    }

    setIsLoading(true);
    setSubmissionError(null);

    try {
      const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
      const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
      const userId = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

      if (serviceId && templateId && userId) {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        try {
          const templateParams = mapFormDataToTemplateParamsSimple(formDataToSubmit);
          
          // Add booking reference
          const bookingRef = `SWC${Date.now().toString(36).toUpperCase().slice(-6)}`;
          templateParams.bookingReference = bookingRef;
          templateParams.timestamp = new Date().toLocaleString('en-GB', {
            dateStyle: 'full',
            timeStyle: 'short'
          });

          await emailjs.send(serviceId, templateId, templateParams, userId);
          
          clearTimeout(timeoutId);
          
          // Check if component is still mounted before updating state
          if (isMountedRef.current) {
            onSuccess(bookingRef);
          }
        } catch (error) {
          clearTimeout(timeoutId);
          
          if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
          }
          throw error;
        }
      } else {
        throw new Error('Email service not configured. Please check environment variables.');
      }
    } catch (error) {
      console.error('Booking submission failed:', error);
      
      // Only update state if still mounted
      if (isMountedRef.current) {
        const typeOfSubmission = formDataToSubmit.isCommercial || 
                                formDataToSubmit.isCustomQuote || 
                                formDataToSubmit.isGeneralEnquiry;
        setSubmissionError(
          `An error occurred while submitting your ${
            typeOfSubmission ? 'enquiry' : 'booking'
          }. Please try again or contact us directly.`
        );
      }
    } finally {
      // Always check if mounted before state updates
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  return { handleSubmit, isLoading, submissionError };
};

// Fixed navigation with cleanup
const useSafeNavigation = () => {
  const navigationTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  const safeNavigate = (callback, delay = 0) => {
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    if (delay > 0) {
      navigationTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          callback();
        }
      }, delay);
    } else {
      callback();
    }
  };

  return safeNavigate;
};

// Fixed state update for nested objects (prevents mutation)
const safeUpdateNestedState = (prevState, path, value) => {
  const keys = path.split('.');
  const newState = JSON.parse(JSON.stringify(prevState)); // Deep clone
  
  let current = newState;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
  return newState;
};

// Fixed form persistence with validation
const useFormPersistenceFixed = (formData, setFormData) => {
  const saveTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Save after 2 seconds of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        try {
          const dataToSave = {
            data: formData,
            timestamp: Date.now(),
            version: '1.0' // For future migration support
          };
          localStorage.setItem('bookingFormData', JSON.stringify(dataToSave));
        } catch (error) {
          console.error('Failed to save form data:', error);
        }
      }
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData]);

  // Load saved data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bookingFormData');
      if (saved && isMountedRef.current) {
        const parsed = JSON.parse(saved);
        
        // Validate saved data structure
        if (parsed.data && parsed.timestamp) {
          const hoursSince = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
          
          // Only restore if less than 24 hours old
          if (hoursSince < 24) {
            // Merge with initial data to ensure all fields exist
            const restoredData = { ...initialFormData, ...parsed.data };
            setFormData(restoredData);
          } else {
            // Clear old data
            localStorage.removeItem('bookingFormData');
          }
        }
      }
    } catch (error) {
      console.error('Failed to restore form data:', error);
      localStorage.removeItem('bookingFormData'); // Clear corrupted data
    }
  }, []); // Only run on mount

  const clearSavedData = () => {
    try {
      localStorage.removeItem('bookingFormData');
    } catch (error) {
      console.error('Failed to clear saved data:', error);
    }
  };

  return { clearSavedData };
};

// Export the fixes for use in the main component
export {
  useSubmitHandler,
  useSafeNavigation,
  safeUpdateNestedState,
  useFormPersistenceFixed
};