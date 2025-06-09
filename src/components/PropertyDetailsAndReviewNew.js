/**
 * PropertyDetailsAndReview - Refactored contact details and review step
 * Simplified and modular version of the original massive component
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReCAPTCHA from "react-google-recaptcha";

// Form components
import InputField from './forms/InputField';
import SelectField from './forms/SelectField';
import TextareaField from './forms/TextareaField';
import LoadingButton from './common/LoadingButton';

// Services and utilities
import { FormDataShape, LoadingErrorProps, StepNavigationProps } from '../types';
import { CONTACT_METHODS, TIME_PREFERENCES } from '../shared/constants';
import { sanitizeTextInput, sanitizeEmail, sanitizePhone } from '../utils/sanitization';
import EmailTemplateService from '../services/EmailTemplateService';

// Sub-components
import ContactDetailsSection from './sections/ContactDetailsSection';
import BookingReviewSection from './sections/BookingReviewSection';
import CommercialDetailsSection from './sections/CommercialDetailsSection';
import GeneralEnquirySection from './sections/GeneralEnquirySection';

const PropertyDetailsAndReview = ({ 
  prevStep, 
  values, 
  setFormData, 
  handleChange, 
  handleSubmit, 
  isLoading, 
  submissionError 
}) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Determine booking type for conditional rendering
  const isStandardResidential = values.isResidential && !values.isCustomQuote;
  const isCommercial = values.isCommercial;
  const isGeneralEnquiry = values.isGeneralEnquiry;
  const isCustomQuote = values.isCustomQuote;

  // Validation effect
  useEffect(() => {
    validateForm();
  }, [values]);

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!values.customerName?.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!values.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!values.mobile?.trim()) {
      newErrors.mobile = 'Mobile number is required';
    }

    if (!values.addressLine1?.trim()) {
      newErrors.addressLine1 = 'Address is required';
    }

    if (!values.townCity?.trim()) {
      newErrors.townCity = 'Town/City is required';
    }

    if (!values.postcode?.trim()) {
      newErrors.postcode = 'Postcode is required';
    }

    // Commercial-specific validation
    if (isCommercial && !values.commercialDetails?.companyName?.trim()) {
      newErrors.companyName = 'Company name is required for commercial bookings';
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  const handleFieldChange = (name, value) => {
    let sanitizedValue = value;
    
    // Apply sanitization based on field type
    if (name === 'email') {
      sanitizedValue = sanitizeEmail(value);
    } else if (name === 'mobile' || name === 'landline') {
      sanitizedValue = sanitizePhone(value);
    } else if (typeof value === 'string') {
      sanitizedValue = sanitizeTextInput(value);
    }

    handleChange(name, sanitizedValue);
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleFieldBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched to show validation errors
    const allFields = [
      'customerName', 'email', 'mobile', 'addressLine1', 
      'townCity', 'postcode', 'preferredContactMethod'
    ];
    
    const newTouched = {};
    allFields.forEach(field => {
      newTouched[field] = true;
    });
    setTouched(newTouched);

    if (isFormValid) {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Contact Details & Review
            </h2>
            <p className="text-gray-300">
              Please provide your contact information and review your {EmailTemplateService.getBookingOrEnquiryText(values)}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-8">
            
            {/* Contact Details Section */}
            <ContactDetailsSection
              values={values}
              errors={errors}
              touched={touched}
              onFieldChange={handleFieldChange}
              onFieldBlur={handleFieldBlur}
            />

            {/* Commercial Details Section */}
            {isCommercial && (
              <CommercialDetailsSection
                values={values}
                errors={errors}
                touched={touched}
                onFieldChange={handleFieldChange}
                onFieldBlur={handleFieldBlur}
              />
            )}

            {/* General Enquiry Section */}
            {isGeneralEnquiry && (
              <GeneralEnquirySection
                values={values}
                errors={errors}
                touched={touched}
                onFieldChange={handleFieldChange}
                onFieldBlur={handleFieldBlur}
              />
            )}

            {/* Booking Review Section */}
            <BookingReviewSection
              values={values}
              isStandardResidential={isStandardResidential}
              isCommercial={isCommercial}
              isGeneralEnquiry={isGeneralEnquiry}
              isCustomQuote={isCustomQuote}
            />

            {/* Additional Notes */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Additional Information</h3>
              
              <TextareaField
                label="Access Notes"
                name="accessNotes"
                value={values.accessNotes || ''}
                onChange={(e) => handleFieldChange('accessNotes', e.target.value)}
                onBlur={() => handleFieldBlur('accessNotes')}
                placeholder="Any special access requirements, gate codes, or instructions for our team..."
                hint="Help us access your property efficiently"
                rows={3}
                maxLength={500}
                showCharCount={true}
              />

              <TextareaField
                label="Additional Notes"
                name="bookingNotes"
                value={values.bookingNotes || ''}
                onChange={(e) => handleFieldChange('bookingNotes', e.target.value)}
                onBlur={() => handleFieldBlur('bookingNotes')}
                placeholder="Any other information you'd like us to know..."
                rows={3}
                maxLength={500}
                showCharCount={true}
              />
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                onChange={(value) => handleFieldChange('recaptchaToken', value)}
                theme="dark"
              />
            </div>

            {/* Error Display */}
            {submissionError && (
              <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-300">{submissionError}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6">
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
              >
                ← Back
              </button>

              <LoadingButton
                type="submit"
                isLoading={isLoading}
                disabled={!isFormValid || isLoading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                {isLoading ? 'Submitting...' : `Submit ${EmailTemplateService.getBookingOrEnquiryText(values)}`}
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

PropertyDetailsAndReview.propTypes = {
  ...StepNavigationProps,
  ...LoadingErrorProps,
  values: FormDataShape.isRequired,
  setFormData: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired
};

export default PropertyDetailsAndReview;