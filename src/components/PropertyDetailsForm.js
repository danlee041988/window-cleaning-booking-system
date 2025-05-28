import React, { useState } from 'react';
import {
    formatDateForStorage
} from '../utils/scheduleUtils';
import { calculateGutterClearingPrice } from '../utils/pricingUtils';
import * as FORM_CONSTANTS from '../constants/formConstants';
import Tooltip from './common/Tooltip';
import ValidationFeedback from './common/ValidationFeedback';
import LoadingButton from './common/LoadingButton';
import { getFieldHints, getErrorMessages } from '../utils/smartDefaults';
import ScheduleSelection from './steps/ScheduleSelection';

// Enhanced Input Field Component with validation and tooltips
const InputField = ({ label, name, value, onChange, type = 'text', placeholder, required = false, error, touched, hint, onBlur }) => {
    const fieldHints = getFieldHints();
    const showHint = hint || fieldHints[name];
    
    return (
        <div className="mb-6">
            <div className="flex items-center mb-2">
                <label htmlFor={name} className="block text-sm font-semibold text-gray-200">
                    {label}{required && <span className="text-red-400">*</span>}
                </label>
                {showHint && (
                    <Tooltip content={showHint} position="top">
                        <svg className="w-4 h-4 ml-2 text-gray-400 hover:text-gray-300 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                    </Tooltip>
                )}
            </div>
            <input
                type={type}
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                required={required}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 hover:border-gray-500 ${
                    error && touched 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : value && touched && !error
                        ? 'border-green-500 focus:ring-green-500 focus:border-green-500'
                        : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                }`}
            />
            <ValidationFeedback field={name} value={value} error={error} touched={touched} />
        </div>
    );
};

// Reusable Textarea Field Component
const TextAreaField = ({ label, name, value, onChange, placeholder, rows = 3 }) => (
    <div className="mb-6">
        <label htmlFor={name} className="block text-sm font-semibold text-gray-200 mb-2">{label}</label>
        <textarea
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500 resize-vertical"
        />
    </div>
);

const PropertyDetailsForm = ({ nextStep, prevStep, handleChange, values, setFormData, goToStep }) => {
    // Add field blur handler for validation
    const handleFieldBlur = (fieldName) => {
        setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
        validateField(fieldName);
    };
    
    // Real-time field validation
    const validateField = (fieldName) => {
        const value = values[fieldName] || '';
        let error = '';
        
        switch(fieldName) {
            case 'customerName':
                if (!value) error = errorMessages.customerName?.required;
                else if (!/^[a-zA-Z\s'-]+$/.test(value)) error = errorMessages.customerName?.invalid;
                break;
            case 'email':
                if (!value) error = errorMessages.email?.required;
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = errorMessages.email?.invalid;
                break;
            case 'mobile':
                const cleanPhone = value.replace(/\s/g, '');
                if (!value) error = errorMessages.mobile?.required;
                else if (!/^(?:(?:\+44)|(?:0))(?:\d{10})$/.test(cleanPhone)) error = errorMessages.mobile?.invalid;
                break;
            case 'postcode':
                if (!value) error = errorMessages.postcode?.required;
                else if (!/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(value.trim())) error = errorMessages.postcode?.invalid;
                break;
            case 'addressLine1':
                if (!value) error = errorMessages.addressLine1?.required;
                break;
            default:
                break;
        }
        
        setFormErrors(prev => ({ ...prev, [fieldName]: error }));
        return !error;
    };

    const { 
        customerName, addressLine1, addressLine2, townCity, postcode, mobile, email, preferredContactMethod,
        propertyType, bedrooms, selectedFrequency, 
        initialWindowPrice,
        isCustomQuote, isCommercial, isResidential, isGeneralEnquiry,
        hasConservatory, additionalServices, windowCleaningDiscount, grandTotal,
        selectedDate,
        commercialDetails,
        customResidentialDetails
    } = values;

    const [dateSelectionError, setDateSelectionError] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});
    
    const errorMessages = getErrorMessages();

    const handleDateSelect = (dateOrASAP) => {
        if (dateOrASAP === "ASAP") {
            setFormData(prev => ({ ...prev, selectedDate: "ASAP" }));
        } else if (typeof dateOrASAP === 'string') {
            // Already formatted as YYYY-MM-DD from ScheduleSelection component
            setFormData(prev => ({ ...prev, selectedDate: dateOrASAP }));
        } else {
            // Legacy format - Date object
            const dateValue = formatDateForStorage(dateOrASAP);
            setFormData(prev => ({ ...prev, selectedDate: dateValue }));
        }
        setDateSelectionError(''); // Clear error on any selection
    };

    const backStep = (e) => {
        e.preventDefault();
        if (isCustomQuote || isCommercial) {
            // For Custom Quotes (6+ Beds) or Commercial, always go back to Step 1 (Pricing Page)
            if (goToStep) {
                goToStep(1);
            } else {
                // As a fallback, try prevStep, though this might not be the desired step for quotes.
                prevStep(); 
            }
        } else if (isGeneralEnquiry) {
            // For General Enquiry, back from PropertyDetails (Step 3) should go to AdditionalServices (Step 2)
            // where they selected services. prevStep() correctly handles this (3 -> 2).
            prevStep();
        } else {
            // For Standard Residential, back from PropertyDetails (Step 3) should go to AdditionalServices (Step 2).
            // prevStep() correctly handles this (3 -> 2).
            prevStep();
        }
    };

    const validateForm = () => {
        const errors = {};
        // Common contact details validation
        if (!customerName.trim()) errors.customerName = 'Full Name is required.';
        if (!addressLine1.trim()) errors.addressLine1 = 'Address Line 1 is required.';
        if (!townCity.trim()) errors.townCity = 'Town/City is required.';
        if (!postcode.trim()) errors.postcode = 'Postcode is required.';
        else if (postcode.trim().length < 3) errors.postcode = 'Postcode seems too short.'; // Basic postcode check
        if (!mobile.trim()) errors.mobile = 'Mobile Number is required.';
        if (!email.trim()) errors.email = 'Email Address is required.';
        else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email address is invalid.';
        if (!preferredContactMethod) errors.preferredContactMethod = 'Preferred Contact Method is required.';

        // Path-specific validation
        if (isResidential && !isCustomQuote && !isGeneralEnquiry) { // Standard Residential Booking
            if (!selectedDate) {
                errors.selectedDate = 'Please select an available date or choose ASAP.';
                // Unlike setDateSelectionError, this won't scroll immediately but will be part of formErrors
            }
        } else if (isCustomQuote && isResidential) { // Custom Residential Quote
            if (!customResidentialDetails?.exactBedrooms) errors.exactBedrooms = 'Number of Bedrooms is required.';
            if (!customResidentialDetails?.propertyStyle) errors.propertyStyle = 'Property Style is required.';
            if (customResidentialDetails?.propertyStyle === FORM_CONSTANTS.PROP_STYLE_OTHER_CUSTOM && !customResidentialDetails?.otherPropertyStyleText?.trim()) {
                errors.otherPropertyStyleText = 'Please specify the other property style.';
            }
            // Optionally, require at least one service for custom quotes
            const servicesSelected = Object.values(customResidentialDetails?.servicesRequested || {}).some(selected => selected);
            if (!servicesSelected) errors.customServices = 'Please select at least one service for the custom quote.';

        } else if (isCommercial) { // Commercial Enquiry
            if (!commercialDetails?.propertyType?.trim()) errors.commercialPropertyType = 'Please select your business type.';
        }
        // General Enquiry doesn't have many specific required fields beyond contact info here, mostly free text.

        return errors;
    };

    const continueStep = (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            // Scroll to first error
            const firstErrorKey = Object.keys(errors)[0];
            if (firstErrorKey) {
                const errorElement = document.getElementsByName(firstErrorKey)[0] || document.querySelector(`[name*="${firstErrorKey}"]`);
                if (errorElement) {
                    errorElement.focus();
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            return; // Stop if validation fails
        }
        // If validation passes
        setFormErrors({}); // Clear any previous errors
        setDateSelectionError(''); // Clear specific date error if any
        nextStep();
    };

    const handleContactPreference = (e) => {
        setFormData(prev => ({ ...prev, preferredContactMethod: e.target.value }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
            <div className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl p-8 border border-gray-700">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-white mb-4">
                            {isGeneralEnquiry 
                                ? "Your Contact Details for Enquiry"
                                : isCommercial 
                                    ? "Business Enquiry Details" 
                                    : isCustomQuote 
                                        ? `Custom Quote: ${values.selectedWindowService?.bedrooms || 'Bespoke Property'}`
                                        : "Your Details & Preferred Date"}
                        </h2>
                        <p className="text-blue-300 text-lg">
                            {isCommercial 
                                ? "Professional window cleaning services for your business"
                                : "Complete your details to secure your booking"}
                        </p>
                        
                        {/* Decorative divider */}
                        <div className="flex items-center justify-center mt-6">
                            <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent w-32"></div>
                            <div className="mx-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent w-32"></div>
                        </div>
                    </div>

            <form onSubmit={continueStep} className="space-y-6">
                {/* Customer Name always shown */}
                <InputField 
                    label={isCommercial ? "Business/Contact Name" : "Full Name"} 
                    name="customerName" 
                    value={customerName} 
                    onChange={handleChange('customerName')} 
                    placeholder={isCommercial ? "e.g., ACME Ltd or Jane Smith (Site Manager)" : "e.g., Jane Smith"} 
                    required 
                />
                {formErrors.customerName && <p className="text-sm text-red-400 -mt-3 mb-1 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.customerName}</p>}

                {/* Address fields always shown */}
                <InputField label="Address Line 1" name="addressLine1" value={addressLine1} onChange={handleChange('addressLine1')} placeholder="e.g., 123 High Street" required />
                {formErrors.addressLine1 && <p className="text-sm text-red-400 -mt-3 mb-1 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.addressLine1}</p>}
                <InputField label="Address Line 2 (Optional)" name="addressLine2" value={addressLine2} onChange={handleChange('addressLine2')} placeholder="e.g., The Old Mill, Suite B" />
                <InputField label="Town/City" name="townCity" value={townCity} onChange={handleChange('townCity')} placeholder="e.g., Market Harborough" required />
                {formErrors.townCity && <p className="text-sm text-red-400 -mt-3 mb-1 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.townCity}</p>}
                <InputField label="Postcode" name="postcode" value={postcode} onChange={handleChange('postcode')} placeholder="e.g., BA16 0AA" required />
                {formErrors.postcode && <p className="text-sm text-red-400 -mt-3 mb-1 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.postcode}</p>}

                {/* Contact Info: Mobile/Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputField 
                            label={isCommercial ? "Contact Number" : "Mobile Number"} 
                            name="mobile" 
                            type="tel" 
                            value={mobile} 
                            onChange={handleChange('mobile')} 
                            placeholder={isCommercial ? "e.g., 01234 567890" : "e.g., 07123 456789"} 
                            required 
                        />
                        {formErrors.mobile && <p className="text-sm text-red-400 -mt-3 mb-1 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.mobile}</p>}
                    </div>
                    <div>
                        <InputField label="Email Address" name="email" type="email" value={email} onChange={handleChange('email')} placeholder="e.g., john.doe@example.com" required />
                        {formErrors.email && <p className="text-sm text-red-400 -mt-3 mb-1 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.email}</p>}
                    </div>
                </div>

                {/* Preferred Contact Method - Shown for all types including General Enquiry */}
                <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-200 mb-3">Preferred Contact Method <span className="text-red-400">*</span></label>
                    <div className="mt-2 flex items-center space-x-6">
                        <label className="inline-flex items-center cursor-pointer group">
                            <input 
                                type="radio" 
                                className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2 transition duration-150 ease-in-out" 
                                name="preferredContactMethod" 
                                value="email" 
                                checked={preferredContactMethod === 'email'} 
                                onChange={handleContactPreference} 
                            />
                            <span className="ml-3 text-gray-200 group-hover:text-blue-300 transition-colors">Email</span>
                        </label>
                        <label className="inline-flex items-center cursor-pointer group">
                            <input 
                                type="radio" 
                                className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2 transition duration-150 ease-in-out" 
                                name="preferredContactMethod" 
                                value="mobile" 
                                checked={preferredContactMethod === 'mobile'} 
                                onChange={handleContactPreference} 
                            />
                            <span className="ml-3 text-gray-200 group-hover:text-blue-300 transition-colors">{isCommercial ? "Contact Number" : "Mobile Phone"}</span>
                        </label>
                    </div>
                    {formErrors.preferredContactMethod && <p className="text-sm text-red-400 mt-2 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.preferredContactMethod}</p>}
                </div>

                {/* Enhanced Date Selection UI - Only for Standard Residential Bookings and when postcode is entered */}
                {!isCommercial && !isCustomQuote && isResidential && !isGeneralEnquiry && postcode && postcode.trim().length >= 2 && (
                    <div className="mt-8 pt-6 border-t border-gray-600 animate-pop-in">
                        <h3 id="date-selection-heading" className="text-2xl font-semibold text-gray-200 mb-3">
                            Select Date for First Clean <span className="text-red-400">*</span>
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Choose from available dates or request ASAP service
                        </p>
                        
                        {/* Window Accessibility Information */}
                        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h4 className="text-blue-300 font-semibold mb-2">Window Accessibility Information</h4>
                                    <p className="text-blue-200 text-sm leading-relaxed">
                                        We do our best to reach all windows, however some may be too high or not accessible. 
                                        We can reach most third story windows but some windows may be inaccessible due to height or structural limitations. 
                                        If you have concerns about window accessibility or have particularly high windows, 
                                        please mention this in the additional comments section.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Form Validation Errors */}
                        {dateSelectionError && (
                            <p className="text-red-400 text-sm mb-3 bg-red-900/20 border border-red-700 rounded p-2">{dateSelectionError}</p>
                        )}
                        {formErrors.selectedDate && !dateSelectionError && (
                            <p className="text-red-400 text-sm mb-3 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.selectedDate}</p>
                        )}

                        {/* New Schedule Selection Component */}
                        <ScheduleSelection
                            postcode={postcode}
                            selectedDate={selectedDate}
                            onDateSelect={handleDateSelect}
                            isEmergency={false}
                            showCalendarView={true}
                        />
                    </div>
                )}

                {/* Conditional Fields for Custom Residential Quote (6+ beds) */}
                {isCustomQuote && isResidential && (
                    <div className="mt-8 pt-6 border-t border-gray-600">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-lg border border-gray-600 mb-6">
                            <h3 className="text-2xl font-semibold text-gray-200 mb-2">Property Specifics (6+ Beds / Bespoke)</h3>
                            <p className="text-gray-400 mb-4">Help us understand your unique property requirements</p>
                        </div>

                        <InputField
                            label="Number of Bedrooms"
                            name="customResidentialDetails.exactBedrooms"
                            value={values.customResidentialDetails?.exactBedrooms || ''}
                            onChange={handleChange('customResidentialDetails.exactBedrooms')}
                            placeholder="e.g., 6, 7, 8+"
                            type="text"
                            required
                        />
                        {formErrors.exactBedrooms && <p className="text-sm text-red-400 -mt-3 mb-1 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.exactBedrooms}</p>}

                        {/* Property Style */}
                        <div className="mb-8">
                            <label className="block text-lg font-semibold text-gray-200 mb-4">Property Style <span className="text-red-400">*</span></label>
                            <div className="space-y-3">
                                {[
                                    { id: FORM_CONSTANTS.PROP_STYLE_DETACHED_LARGE_UNIQUE, label: 'Detached House (Large/Unique)' },
                                    { id: FORM_CONSTANTS.PROP_STYLE_SEMI_DETACHED_LARGE_EXTENDED, label: 'Semi-Detached House (Large/Extended)' },
                                    { id: FORM_CONSTANTS.PROP_STYLE_TERRACED_MULTI_LARGE, label: 'Terraced House (Multiple/Large)' },
                                    { id: FORM_CONSTANTS.PROP_STYLE_BUNGALOW_LARGE_COMPLEX, label: 'Bungalow (Large/Complex)' },
                                    { id: FORM_CONSTANTS.PROP_STYLE_APARTMENT_BLOCK, label: 'Apartment Block (specify units if known)' },
                                    { id: FORM_CONSTANTS.PROP_STYLE_OTHER_CUSTOM, label: 'Other (Please specify)' }
                                ].map(style => (
                                    <div key={style.id} className="flex items-center group">
                                        <input
                                            type="radio"
                                            id={`customPropertyStyle-${style.id}`}
                                            name="customResidentialDetails.propertyStyle"
                                            value={style.id}
                                            checked={values.customResidentialDetails?.propertyStyle === style.id}
                                            onChange={handleChange('customResidentialDetails.propertyStyle')}
                                            className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2 transition duration-150 ease-in-out"
                                        />
                                        <label htmlFor={`customPropertyStyle-${style.id}`} className="ml-3 block text-sm text-gray-200 group-hover:text-blue-300 transition-colors cursor-pointer">
                                            {style.label}
                                        </label>
                                    </div>
                                ))}
                                {values.customResidentialDetails?.propertyStyle === FORM_CONSTANTS.PROP_STYLE_OTHER_CUSTOM && (
                                    <InputField
                                        label="Please specify other property style"
                                        name="customResidentialDetails.otherPropertyStyleText"
                                        value={values.customResidentialDetails?.otherPropertyStyleText || ''}
                                        onChange={handleChange}
                                        placeholder="e.g., Converted Barn, Unique Build"
                                    />
                                )}
                            </div>
                            {formErrors.propertyStyle && <p className="text-sm text-red-400 mt-2 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.propertyStyle}</p>}
                            {formErrors.otherPropertyStyleText && <p className="text-sm text-red-400 -mt-3 mb-1 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.otherPropertyStyleText}</p>}
                        </div>

                        {/* Services Requested */}
                        <div className="mb-8">
                            <label className="block text-lg font-semibold text-gray-200 mb-4">Services Required <span className="text-sm text-gray-400">(Select all that apply)</span></label>
                            <div className="space-y-3">
                                {[
                                    { id: FORM_CONSTANTS.CUSTOM_RES_SERVICE_WINDOW_CLEANING, label: 'Window Cleaning (Exterior) - Regular frequency options available' },
                                    { id: FORM_CONSTANTS.CUSTOM_RES_SERVICE_GUTTER_CLEANING, label: 'Gutter Clearing (Interior)' },
                                    { id: FORM_CONSTANTS.CUSTOM_RES_SERVICE_FASCIA_SOFFIT_CLEANING, label: 'Fascia & Soffit Cleaning (Exterior)' },
                                    { id: FORM_CONSTANTS.CUSTOM_RES_SERVICE_CONSERVATORY_WINDOW_CLEANING, label: 'Conservatory Window Cleaning (Sides)' },
                                    { id: FORM_CONSTANTS.CUSTOM_RES_SERVICE_CONSERVATORY_ROOF_CLEANING, label: 'Conservatory Roof Cleaning' },
                                    { id: FORM_CONSTANTS.CUSTOM_RES_SERVICE_OTHER, label: 'Other (Please specify)' }
                                ].map(service => (
                                    <div key={service.id} className="flex items-center group">
                                        <input
                                            type="checkbox"
                                            id={`customService-${service.id}`}
                                            name={`customResidentialDetails.servicesRequested.${service.id}`}
                                            checked={values.customResidentialDetails?.servicesRequested?.[service.id] || false}
                                            onChange={handleChange(`customResidentialDetails.servicesRequested.${service.id}`)}
                                            className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 transition duration-150 ease-in-out"
                                        />
                                        <label htmlFor={`customService-${service.id}`} className="ml-3 block text-sm text-gray-200 group-hover:text-blue-300 transition-colors cursor-pointer">
                                            {service.label}
                                        </label>
                                    </div>
                                ))}
                                {values.customResidentialDetails?.servicesRequested?.[FORM_CONSTANTS.CUSTOM_RES_SERVICE_OTHER] && (
                                    <InputField
                                        label="Please specify other service(s)"
                                        name="customResidentialDetails.otherServiceText"
                                        value={values.customResidentialDetails?.otherServiceText || ''}
                                        onChange={handleChange}
                                        placeholder="e.g., Solar Panel Cleaning, Driveway Cleaning"
                                    />
                                )}
                            </div>
                            {formErrors.customServices && <p className="text-sm text-red-400 mt-2 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.customServices}</p>}
                        </div>

                        {/* Preferred Frequency (Conditional on Window Cleaning) */}
                        {values.customResidentialDetails?.servicesRequested?.[FORM_CONSTANTS.CUSTOM_RES_SERVICE_WINDOW_CLEANING] && (
                            <div className="mb-8">
                                <label className="block text-lg font-semibold text-gray-200 mb-4">Preferred Window Cleaning Frequency</label>
                                <div className="space-y-3">
                                    {[
                                        { id: FORM_CONSTANTS.CUSTOM_RES_FREQ_4_WEEKLY, label: '4 Weekly' },
                                        { id: FORM_CONSTANTS.CUSTOM_RES_FREQ_8_WEEKLY, label: '8 Weekly' },
                                        { id: FORM_CONSTANTS.CUSTOM_RES_FREQ_12_WEEKLY, label: '12 Weekly' },
                                        { id: FORM_CONSTANTS.CUSTOM_RES_FREQ_ONE_OFF, label: 'One-off Clean' },
                                        { id: FORM_CONSTANTS.CUSTOM_RES_FREQ_OTHER, label: 'Other (Please specify)' }
                                    ].map(freq => (
                                        <div key={freq.id} className="flex items-center group">
                                            <input
                                                type="radio"
                                                id={`customFreq-${freq.id}`}
                                                name="customResidentialDetails.frequencyPreference"
                                                value={freq.id}
                                                checked={values.customResidentialDetails?.frequencyPreference === freq.id}
                                                onChange={handleChange('customResidentialDetails.frequencyPreference')}
                                                className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2 transition duration-150 ease-in-out"
                                            />
                                            <label htmlFor={`customFreq-${freq.id}`} className="ml-3 block text-sm text-gray-200 group-hover:text-blue-300 transition-colors cursor-pointer">
                                                {freq.label}
                                            </label>
                                        </div>
                                    ))}
                                    {values.customResidentialDetails?.frequencyPreference === FORM_CONSTANTS.CUSTOM_RES_FREQ_OTHER && (
                                        <InputField
                                            label="Please specify other frequency"
                                            name="customResidentialDetails.otherFrequencyText"
                                            value={values.customResidentialDetails?.otherFrequencyText || ''}
                                            onChange={handleChange}
                                            placeholder="e.g., Bi-monthly, specific dates"
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        <InputField
                            label="Approximate Number of Windows (if known)"
                            name="customResidentialDetails.approxWindows"
                            value={values.customResidentialDetails?.approxWindows || ''}
                            onChange={handleChange('customResidentialDetails.approxWindows')}
                            placeholder="e.g., 30+"
                            type="text"
                        />

                    </div>
                )}

                {/* Simplified Commercial Enquiry */}
                {isCommercial && (
                    <div className="mt-8 pt-6 border-t border-gray-600">
                        <div className="bg-gradient-to-r from-purple-800 to-purple-700 p-6 rounded-lg border border-purple-600 mb-6">
                            <h3 className="text-2xl font-semibold text-white mb-2">Business Details</h3>
                            <p className="text-purple-200">Just a few quick details about your business cleaning needs</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-200 mb-2">
                                    Type of Business <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="commercialDetails.propertyType"
                                    value={commercialDetails?.propertyType || ''}
                                    onChange={handleChange('commercialDetails.propertyType')}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500"
                                    required
                                >
                                    <option value="">Select your business type</option>
                                    <option value={FORM_CONSTANTS.COMM_PROP_TYPE_OFFICE}>Office Building</option>
                                    <option value={FORM_CONSTANTS.COMM_PROP_TYPE_RETAIL}>Shop/Retail Store</option>
                                    <option value={FORM_CONSTANTS.COMM_PROP_TYPE_RESTAURANT}>Restaurant/Café</option>
                                    <option value={FORM_CONSTANTS.COMM_PROP_TYPE_WAREHOUSE}>Warehouse/Industrial</option>
                                    <option value={FORM_CONSTANTS.COMM_PROP_TYPE_MEDICAL}>Medical/Dental Practice</option>
                                    <option value={FORM_CONSTANTS.COMM_PROP_TYPE_SCHOOL}>School/Educational</option>
                                    <option value={FORM_CONSTANTS.COMM_PROP_TYPE_HOTEL}>Hotel/Accommodation</option>
                                    <option value={FORM_CONSTANTS.COMM_PROP_TYPE_OTHER}>Other</option>
                                </select>
                                {formErrors.commercialPropertyType && <p className="text-sm text-red-400 mt-2 bg-red-900/20 border border-red-700 rounded p-2">{formErrors.commercialPropertyType}</p>}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-200 mb-2">
                                    Approximate Size
                                </label>
                                <select
                                    name="commercialDetails.approxSizeOrWindows"
                                    value={commercialDetails?.approxSizeOrWindows || ''}
                                    onChange={handleChange('commercialDetails.approxSizeOrWindows')}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500"
                                >
                                    <option value="">Select approximate size</option>
                                    <option value={FORM_CONSTANTS.COMM_SIZE_SMALL}>Small (up to 20 windows)</option>
                                    <option value={FORM_CONSTANTS.COMM_SIZE_MEDIUM}>Medium (20-50 windows)</option>
                                    <option value={FORM_CONSTANTS.COMM_SIZE_LARGE}>Large (50+ windows)</option>
                                    <option value={FORM_CONSTANTS.COMM_SIZE_MULTI_STOREY}>Multi-storey building</option>
                                    <option value={FORM_CONSTANTS.COMM_SIZE_COMPLEX}>Large complex/multiple buildings</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-200 mb-2">
                                What cleaning services do you need?
                            </label>
                            <textarea
                                name="commercialDetails.specificRequirements"
                                value={commercialDetails?.specificRequirements || ''}
                                onChange={handleChange('commercialDetails.specificRequirements')}
                                placeholder="Tell us what you need... e.g., 'Weekly window cleaning for our office. We're a 2-storey building with about 30 windows. Would prefer cleaning during business hours.'"
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500 resize-vertical"
                            />
                        </div>
                    </div>
                )}

                {/* Enhanced Additional Comments Section */}
                <div className="mt-8 pt-6 border-t border-gray-600">
                    <div className="mb-6">
                        <label className="block text-lg font-semibold text-gray-200 mb-3">
                            Additional Comments or Special Requests (Optional)
                        </label>
                        <p className="text-sm text-gray-400 mb-4">
                            Help us provide the best service by sharing any relevant details:
                        </p>
                        
                        {/* Helpful hints based on booking type */}
                        <div className="mb-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                            <p className="text-sm text-blue-300 font-semibold mb-3">💡 Helpful information to include:</p>
                            <ul className="text-sm text-blue-200 space-y-2">
                                {isGeneralEnquiry ? (
                                    <>
                                        <li>• Describe your property type and size</li>
                                        <li>• Specific areas needing attention</li>
                                        <li>• Preferred contact times</li>
                                        <li>• Any urgent cleaning needs</li>
                                    </>
                                ) : isCommercial ? (
                                    <>
                                        <li>• Operating hours for cleaning access</li>
                                        <li>• Health & safety requirements</li>
                                        <li>• Parking arrangements</li>
                                        <li>• Key contact person details</li>
                                    </>
                                ) : isCustomQuote ? (
                                    <>
                                        <li>• Unique architectural features</li>
                                        <li>• Previous cleaning history</li>
                                        <li>• Budget considerations</li>
                                        <li>• Timeline requirements</li>
                                    </>
                                ) : (
                                    <>
                                        <li>• Access codes (gate, parking, etc.)</li>
                                        <li>• Pet information</li>
                                        <li>• Any areas requiring special attention</li>
                                        <li>• Window accessibility concerns</li>
                                    </>
                                )}
                            </ul>
                        </div>

                        <textarea
                            name={isGeneralEnquiry ? "generalEnquiryDetails.enquiryComments" : "bookingNotes"}
                            value={isGeneralEnquiry ? values.generalEnquiryDetails?.enquiryComments || '' : values.bookingNotes || ''}
                            onChange={handleChange(isGeneralEnquiry ? "generalEnquiryDetails.enquiryComments" : "bookingNotes")}
                            placeholder={
                                isGeneralEnquiry
                                    ? "Example: I have a 4-bedroom detached house with conservatory. Interested in monthly window cleaning and occasional gutter clearing. Property has side gate access but 2 friendly dogs in garden. Best contact time is weekday mornings."
                                    : isCommercial
                                        ? "Example: Office building with 40+ windows across 3 floors. Require monthly cleaning during business hours (9-5). Parking available on-site. Health & safety induction required for all contractors."
                                        : isCustomQuote
                                            ? "Example: Large property with unique window types or access needs. Please describe any specific challenges or requirements."
                                            : "Example: Gate code is 1234*. Side gate is usually unlocked. We have 2 small dogs (friendly but excitable). Please avoid parking in marked visitor spaces. Some upper floor windows may be difficult to reach."
                            }
                            rows={5}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500 resize-vertical"
                            style={{ minHeight: '120px' }}
                        />
                        
                        <p className="text-sm text-gray-400 mt-3">
                            The more detail you provide, the better we can prepare for your service.
                        </p>
                    </div>
                </div>



                {/* Navigation Buttons */}
                <div className="mt-12 flex justify-between items-center">
                    <button
                        type="button"
                        onClick={backStep}
                        className="px-8 py-3 border-2 border-gray-600 rounded-lg text-sm font-semibold text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                        <span className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Back
                        </span>
                    </button>
                    <button
                        type="submit"
                        className="px-8 py-3 border-2 border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                    >
                        <span className="flex items-center">
                            {isGeneralEnquiry 
                                ? "Submit Enquiry" 
                                : isCustomQuote || isCommercial 
                                    ? "Next: Review Enquiry" 
                                    : "Next: Review Booking"}
                            <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </span>
                    </button>
                </div>
            </form>
                </div>
            </div>
        </div>
    );
}

export default PropertyDetailsForm;