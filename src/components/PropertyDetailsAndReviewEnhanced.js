import React, { useState, useEffect, useCallback, memo } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import { formatDateForStorage } from '../utils/scheduleUtils';
import { calculateGutterClearingPrice } from '../utils/pricingUtils';
import * as FORM_CONSTANTS from '../constants/formConstants';
import Tooltip from './common/Tooltip';
import ValidationFeedback from './common/ValidationFeedback';
import { useFieldValidation, useFormSubmit } from '../hooks/useFieldValidation';
import { useSafeState } from '../hooks/useSafeState';
import ScheduleSelection from './steps/ScheduleSelection';
import { debounce } from '../utils/stateUtils';

// Enhanced mobile-first input field component
const InputField = memo(({ 
  label, 
  name, 
  value, 
  onChange, 
  onBlur,
  type = 'text', 
  placeholder, 
  required = false, 
  error, 
  touched, 
  hint,
  isValidating = false,
  autoComplete
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center mb-2">
        <label htmlFor={name} className="block text-sm font-semibold text-gray-200">
          {label}{required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {hint && (
          <Tooltip content={hint} position="top">
            <svg className="w-4 h-4 ml-2 text-gray-400 hover:text-gray-300 cursor-help" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </Tooltip>
        )}
        {isValidating && (
          <div className="ml-auto">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
      <div className="relative">
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`w-full px-4 py-3 bg-gray-700 border rounded-lg shadow-sm text-white placeholder-gray-400 
            focus:outline-none focus:ring-2 transition-all duration-200 hover:border-gray-500
            text-base sm:text-sm min-h-[44px] ${
            error && touched 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : value && touched && !error
              ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
              : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
          }`}
        />
        {/* Success checkmark */}
        {value && touched && !error && !isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      <ValidationFeedback field={name} value={value} error={error} touched={touched} />
    </div>
  );
});

InputField.displayName = 'InputField';

// Mobile-optimized summary section
const SummarySection = ({ title, children, icon }) => (
  <div className="mb-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600 rounded-lg p-4">
    <h3 className="text-base sm:text-lg font-semibold text-white mb-3 flex items-center">
      {icon && <div className="mr-2">{icon}</div>}
      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
      {title}
    </h3>
    <div className="space-y-2 text-gray-200 text-sm">{children}</div>
  </div>
);

const SummaryItem = ({ label, value, highlight = false }) => {
  if (!value || value === 'N/A') return null;
  return (
    <div className="flex justify-between items-center py-1 text-sm">
      <span className="text-gray-400">{label}:</span>
      <span className={`font-medium ${highlight ? 'text-green-400' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
};

function PropertyDetailsAndReviewEnhanced({ 
  prevStep, 
  handleChange, 
  values, 
  setFormData, 
  handleSubmit, 
  isLoading, 
  submissionError 
}) {
  // Enhanced validation with debouncing
  const {
    values: fieldValues,
    errors,
    touched,
    isValidating,
    handleChange: handleFieldChange,
    handleBlur,
    validateAll,
    getFieldError,
    isValid,
    setMultipleValues
  } = useFieldValidation({
    customerName: values.customerName || '',
    email: values.email || '',
    mobile: values.mobile || '',
    addressLine1: values.addressLine1 || '',
    addressLine2: values.addressLine2 || '',
    townCity: values.townCity || '',
    postcode: values.postcode || '',
    bookingNotes: values.bookingNotes || ''
  });

  // Form submission handler
  const { isSubmitting, submitError, handleSubmit: handleFormSubmit } = useFormSubmit(handleSubmit);

  // Safe state
  const [selectedDate, setSelectedDate] = useSafeState(values.selectedDate || '');
  const [selectedTimeSlot, setSelectedTimeSlot] = useSafeState(values.selectedTimeSlot || '');
  const [recaptchaToken, setRecaptchaToken] = useSafeState(null);
  const [showRecaptcha, setShowRecaptcha] = useSafeState(false);

  // Determine booking type
  const isStandardResidential = values.isResidential && !values.isCustomQuote && !values.isCommercial && !values.isGeneralEnquiry;
  const isQuoteOrEnquiry = values.isCustomQuote || values.isCommercial || values.isGeneralEnquiry;

  // Sync field values with parent form data
  useEffect(() => {
    const updatedValues = { ...values };
    Object.keys(fieldValues).forEach(key => {
      if (fieldValues[key] !== values[key]) {
        updatedValues[key] = fieldValues[key];
      }
    });
    
    if (JSON.stringify(updatedValues) !== JSON.stringify(values)) {
      setFormData(updatedValues);
    }
  }, [fieldValues, values, setFormData]);

  // Show reCAPTCHA when form is valid
  useEffect(() => {
    if (isValid && !showRecaptcha) {
      setShowRecaptcha(true);
    }
  }, [isValid, showRecaptcha, setShowRecaptcha]);

  // Enhanced field change handler
  const handleEnhancedFieldChange = useCallback((e) => {
    const { name, value } = e.target;
    handleFieldChange(name, value);
    
    // Special handling for certain fields
    if (name === 'postcode') {
      handleChange(name)({ target: { name, value: value.toUpperCase() } });
    } else {
      handleChange(name)(e);
    }
  }, [handleFieldChange, handleChange]);

  const handleRecaptchaChange = useCallback((token) => {
    setRecaptchaToken(token);
    setFormData(prev => ({ ...prev, recaptchaToken: token }));
  }, [setRecaptchaToken, setFormData]);

  const handleActualSubmit = useCallback(async () => {
    // Touch all fields to show errors
    const fields = ['customerName', 'email', 'mobile', 'addressLine1', 'townCity', 'postcode'];
    fields.forEach(field => handleBlur(field));

    // Validate all fields
    if (!validateAll()) {
      const firstErrorField = fields.find(field => getFieldError(field));
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.focus();
        
        // Smooth scroll to error field on mobile
        setTimeout(() => {
          document.getElementById(firstErrorField)?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 100);
      }
      return;
    }

    if (!recaptchaToken) {
      alert('Please complete the reCAPTCHA verification');
      return;
    }

    // Prepare form data for submission
    const formDataToSubmit = {
      ...values,
      ...fieldValues,
      selectedDate,
      selectedTimeSlot,
      recaptchaToken
    };

    await handleFormSubmit(formDataToSubmit, validateAll);
  }, [validateAll, getFieldError, handleBlur, recaptchaToken, values, fieldValues, 
      selectedDate, selectedTimeSlot, handleFormSubmit]);

  // Format display values
  const formatPrice = (price) => {
    return typeof price === 'number' ? `£${price.toFixed(2)}` : '£0.00';
  };

  const formatFrequency = (freq) => {
    if (!freq) return 'Not selected';
    return freq.charAt(0).toUpperCase() + freq.slice(1);
  };

  // Calculate totals for summary
  const calculateTotals = useCallback(() => {
    let subtotal = values.initialWindowPrice || 0;
    if (values.hasConservatory) subtotal += values.conservatorySurcharge || 0;
    if (values.hasExtension) subtotal += values.extensionSurcharge || 0;
    if (values.additionalServices?.[FORM_CONSTANTS.ADDON_GUTTER_CLEARING]) {
      subtotal += values.gutterClearingServicePrice || 0;
    }
    if (values.additionalServices?.[FORM_CONSTANTS.ADDON_FASCIA_SOFFIT_GUTTER]) {
      subtotal += values.fasciaSoffitGutterServicePrice || 0;
    }
    const discount = values.windowCleaningDiscount || 0;
    const total = subtotal - discount;
    return { subtotal, discount, total };
  }, [values]);

  const { subtotal, discount, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
            Complete Your Booking
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column - Contact Details */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-2xl border border-gray-700">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                </svg>
                Your Details
              </h3>

              <div className="space-y-4">
                <InputField
                  label="Full Name"
                  name="customerName"
                  value={fieldValues.customerName}
                  onChange={handleEnhancedFieldChange}
                  onBlur={() => handleBlur('customerName')}
                  placeholder="John Smith"
                  required
                  error={getFieldError('customerName')}
                  touched={touched.customerName}
                  isValidating={isValidating.customerName}
                  autoComplete="name"
                />

                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={fieldValues.email}
                  onChange={handleEnhancedFieldChange}
                  onBlur={() => handleBlur('email')}
                  placeholder="john@example.com"
                  required
                  error={getFieldError('email')}
                  touched={touched.email}
                  isValidating={isValidating.email}
                  autoComplete="email"
                />

                <InputField
                  label="Mobile Number"
                  name="mobile"
                  type="tel"
                  value={fieldValues.mobile}
                  onChange={handleEnhancedFieldChange}
                  onBlur={() => handleBlur('mobile')}
                  placeholder="07700 900000"
                  required
                  error={getFieldError('mobile')}
                  touched={touched.mobile}
                  isValidating={isValidating.mobile}
                  autoComplete="tel"
                />

                <h4 className="text-base sm:text-lg font-semibold text-white mt-6 mb-4">Property Address</h4>

                <InputField
                  label="Address Line 1"
                  name="addressLine1"
                  value={fieldValues.addressLine1}
                  onChange={handleEnhancedFieldChange}
                  onBlur={() => handleBlur('addressLine1')}
                  placeholder="123 Main Street"
                  required
                  error={getFieldError('addressLine1')}
                  touched={touched.addressLine1}
                  isValidating={isValidating.addressLine1}
                  autoComplete="address-line1"
                />

                <InputField
                  label="Address Line 2"
                  name="addressLine2"
                  value={fieldValues.addressLine2}
                  onChange={handleEnhancedFieldChange}
                  onBlur={() => handleBlur('addressLine2')}
                  placeholder="Apartment, suite, etc. (optional)"
                  autoComplete="address-line2"
                />

                <InputField
                  label="Town/City"
                  name="townCity"
                  value={fieldValues.townCity}
                  onChange={handleEnhancedFieldChange}
                  onBlur={() => handleBlur('townCity')}
                  placeholder="Bristol"
                  required
                  error={getFieldError('townCity')}
                  touched={touched.townCity}
                  isValidating={isValidating.townCity}
                  autoComplete="address-level2"
                />

                <InputField
                  label="Postcode"
                  name="postcode"
                  value={fieldValues.postcode}
                  onChange={handleEnhancedFieldChange}
                  onBlur={() => handleBlur('postcode')}
                  placeholder="BS1 2AB"
                  required
                  error={getFieldError('postcode')}
                  touched={touched.postcode}
                  isValidating={isValidating.postcode}
                  autoComplete="postal-code"
                />

                {/* Schedule Selection for Standard Bookings */}
                {isStandardResidential && (
                  <div className="mt-6">
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-4">
                      Preferred Start Date
                    </h4>
                    <ScheduleSelection
                      selectedDate={selectedDate}
                      onDateSelect={(date) => {
                        setSelectedDate(date);
                        setFormData(prev => ({ ...prev, selectedDate: date }));
                      }}
                      postcode={fieldValues.postcode}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Booking Summary */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 shadow-2xl border border-gray-700">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100-4h-.5a1 1 0 000-2H8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd"/>
                </svg>
                Booking Summary
              </h3>

              {/* Property Details */}
              {isStandardResidential && (
                <SummarySection title="Property Details">
                  <SummaryItem label="Property Type" value={values.propertyType} />
                  <SummaryItem label="Bedrooms" value={values.bedrooms} />
                  <SummaryItem label="Frequency" value={formatFrequency(values.selectedFrequency)} />
                  {values.hasConservatory && <SummaryItem label="Has Conservatory" value="Yes" />}
                  {values.hasExtension && <SummaryItem label="Has Extension" value="Yes" />}
                </SummarySection>
              )}

              {/* Services & Pricing */}
              {isStandardResidential && (
                <SummarySection title="Services & Pricing">
                  <SummaryItem label="Window Cleaning" value={formatPrice(values.initialWindowPrice)} />
                  {values.hasConservatory && (
                    <SummaryItem label="Conservatory Surcharge" value={`+${formatPrice(values.conservatorySurcharge)}`} />
                  )}
                  {values.hasExtension && (
                    <SummaryItem label="Extension Surcharge" value={`+${formatPrice(values.extensionSurcharge)}`} />
                  )}
                  {values.additionalServices?.[FORM_CONSTANTS.ADDON_GUTTER_CLEARING] && (
                    <SummaryItem label="Gutter Clearing" value={`+${formatPrice(values.gutterClearingServicePrice)}`} />
                  )}
                  {values.additionalServices?.[FORM_CONSTANTS.ADDON_FASCIA_SOFFIT_GUTTER] && (
                    <SummaryItem label="Fascia & Soffit" value={`+${formatPrice(values.fasciaSoffitGutterServicePrice)}`} />
                  )}
                  {discount > 0 && (
                    <div className="border-t border-gray-600 mt-2 pt-2">
                      <SummaryItem label="Discount Applied" value={`-${formatPrice(discount)}`} highlight />
                    </div>
                  )}
                  <div className="border-t border-gray-600 mt-2 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-base sm:text-lg font-semibold text-white">Total</span>
                      <span className="text-xl sm:text-2xl font-bold text-green-400">{formatPrice(total)}</span>
                    </div>
                  </div>
                </SummarySection>
              )}

              {/* Quote/Enquiry Summary */}
              {isQuoteOrEnquiry && (
                <SummarySection title="Enquiry Details">
                  <SummaryItem label="Type" value={
                    values.isCommercial ? 'Commercial Enquiry' :
                    values.isCustomQuote ? 'Custom Residential Quote' :
                    'General Enquiry'
                  } />
                  {values.commercialDetails?.businessName && (
                    <SummaryItem label="Business" value={values.commercialDetails.businessName} />
                  )}
                  <p className="text-sm text-gray-400 mt-2">
                    We'll review your requirements and provide a detailed quote.
                  </p>
                </SummarySection>
              )}

              {/* Additional Notes */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="bookingNotes"
                  value={fieldValues.bookingNotes || ''}
                  onChange={handleEnhancedFieldChange}
                  onBlur={() => handleBlur('bookingNotes')}
                  placeholder="Any special requirements or access instructions..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              {/* reCAPTCHA - Only show when form is valid */}
              {showRecaptcha && (
                <div className="mt-6 flex justify-center">
                  <div className="bg-white p-2 rounded-lg scale-90 sm:scale-100">
                    <ReCAPTCHA
                      sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6LfRNJQqAAAAAMXSD_rvdqVTfHPCk0wqnSfKBupj"}
                      onChange={handleRecaptchaChange}
                    />
                  </div>
                </div>
              )}

              {/* Error Messages */}
              {(submissionError || submitError) && (
                <div className="mt-4 p-4 bg-red-900/30 border border-red-600 rounded-lg">
                  <p className="text-red-300 text-sm">{submissionError || submitError}</p>
                </div>
              )}

              {/* Action Buttons - Mobile optimized */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border-2 border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 
                    transition-all font-medium min-h-[44px] text-sm sm:text-base"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleActualSubmit}
                  disabled={isLoading || isSubmitting || !recaptchaToken}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all min-h-[44px] text-sm sm:text-base ${
                    isLoading || isSubmitting || !recaptchaToken
                      ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                      : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white transform hover:scale-105 active:scale-95'
                  }`}
                >
                  {isLoading || isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                      Submit {isQuoteOrEnquiry ? 'Enquiry' : 'Booking'}
                    </span>
                  )}
                </button>
              </div>

              {/* Form validation hint */}
              {!isValid && !showRecaptcha && (
                <p className="mt-4 text-center text-sm text-gray-400">
                  Please fill in all required fields to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetailsAndReviewEnhanced;