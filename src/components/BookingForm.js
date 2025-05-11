// Main parent component for the multi-step booking form
import React, { useState } from 'react';
import PropertyDetailsForm from './PropertyDetailsForm';
import AdditionalServicesForm from './AdditionalServicesForm';
import ContactSchedulerForm from './ContactSchedulerForm';
import ReviewSubmitForm from './ReviewSubmitForm';

function BookingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Initialise all your form fields here
    propertyChoice: null, // Added for the selected property card option
    frequency: '8-weekly', // Default frequency
    hasExtension: false,
    hasConservatory: false,
    hasSolarPanels: false,
    solarPanels: 0,
    internalGutterCleaning: false,
    externalGutterCleaning: false,
    name: '',
    address: '',
    postcode: '',
    mobile: '',
    preferredContact: 'email',
    email: '',
    // ... any other fields
  });

  const handleChange = (input) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [input]: value });
  };

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  // Render steps based on currentStep
  switch (currentStep) {
    case 1:
      return <PropertyDetailsForm nextStep={nextStep} handleChange={handleChange} values={formData} />;
    case 2:
      return <AdditionalServicesForm nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={formData} />;
    case 3:
      return <ContactSchedulerForm nextStep={nextStep} prevStep={prevStep} handleChange={handleChange} values={formData} />;
    case 4:
      return <ReviewSubmitForm prevStep={prevStep} values={formData} />;
    default:
      return <PropertyDetailsForm nextStep={nextStep} handleChange={handleChange} values={formData} />;
  }
}

export default BookingForm;
