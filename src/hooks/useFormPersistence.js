// Auto-save form data to localStorage to prevent data loss
import { useEffect } from 'react';

export const useFormPersistence = (formData, setFormData, storageKey = 'somersetBookingForm') => {
  // Load saved data on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Only restore if data is less than 24 hours old
        if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          // Don't restore sensitive data like recaptcha token
          const { recaptchaToken, ...restoredData } = parsed.data;
          setFormData(prevData => ({ ...prevData, ...restoredData }));
          
          // Show notification that data was restored
          console.log('Previous form data restored');
        } else {
          // Clear old data
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error('Error loading saved form data:', error);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save data on change
  useEffect(() => {
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
      console.error('Error saving form data:', error);
    }
  }, [formData, storageKey]);

  // Clear saved data function
  const clearSavedData = () => {
    localStorage.removeItem(storageKey);
  };

  return { clearSavedData };
};

export default useFormPersistence;