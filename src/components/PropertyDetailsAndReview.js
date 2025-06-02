import React, { useState, useEffect } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import { formatDateForStorage } from '../utils/scheduleUtils';
import { calculateGutterClearingPrice } from '../utils/pricingUtils';
import * as FORM_CONSTANTS from '../constants/formConstants';
import Tooltip from './common/Tooltip';
import ValidationFeedback from './common/ValidationFeedback';
import LoadingButton from './common/LoadingButton';
import { getFieldHints, getErrorMessages } from '../utils/smartDefaults';
import ScheduleSelection from './steps/ScheduleSelection';
import { sanitizeTextInput, sanitizeEmail, sanitizePhone } from '../utils/sanitization';

// Enhanced Input Field Component
const InputField = ({ label, name, value, onChange, type = 'text', placeholder, required = false, error, touched, hint, onBlur }) => {
    const fieldHints = getFieldHints();
    const showHint = hint || fieldHints[name];
    
    return (
        <div className="mb-4">
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
                aria-label={label}
                aria-required={required}
                aria-invalid={error && touched ? 'true' : 'false'}
                aria-describedby={
                    error && touched ? `${name}-error` : 
                    showHint ? `${name}-hint` : 
                    undefined
                }
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

// Summary Section Component
const SummarySection = ({ title, children }) => (
    <div className="mb-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            {title}
        </h3>
        <div className="space-y-2 text-gray-200 text-sm">{children}</div>
    </div>
);

const SummaryItem = ({ label, value, highlight = false }) => {
    if (!value || value === 'N/A') return null;
    return (
        <div className="flex justify-between items-center py-1">
            <span className="text-gray-400">{label}:</span>
            <span className={`font-medium ${highlight ? 'text-green-400' : 'text-white'}`}>
                {value}
            </span>
        </div>
    );
};

function PropertyDetailsAndReview({ prevStep, handleChange, values, setFormData, handleSubmit, isLoading, submissionError }) {
    const [validationErrors, setValidationErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});
    const [selectedDate, setSelectedDate] = useState(values.selectedDate || '');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(values.selectedTimeSlot || '');
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Determine if it's a standard residential booking
    const isStandardResidential = values.isResidential && !values.isCustomQuote && !values.isCommercial && !values.isGeneralEnquiry;
    const isQuoteOrEnquiry = values.isCustomQuote || values.isCommercial || values.isGeneralEnquiry;

    // Validation
    const validateField = (name, value) => {
        const errorMessages = getErrorMessages();
        
        switch (name) {
            case 'customerName':
                if (!value || value.trim().length < 2) {
                    return errorMessages.customerName || 'Name must be at least 2 characters';
                }
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value || !emailRegex.test(value)) {
                    return errorMessages.email || 'Please enter a valid email address';
                }
                break;
            case 'mobile':
                const phoneRegex = /^(?:(?:\+44\s?|0)(?:7\d{3}|\d{4}|\d{3})[\s\-]?\d{3}[\s\-]?\d{3,4}|(?:\+44\s?|0)(?:1\d{3}|2\d{3}|3\d{3}|8\d{3}|9\d{3})[\s\-]?\d{3}[\s\-]?\d{3,4})$/;
                if (!value || !phoneRegex.test(value.replace(/\s/g, ''))) {
                    return errorMessages.mobile || 'Please enter a valid UK phone number';
                }
                break;
            case 'addressLine1':
                if (!value || value.trim().length < 3) {
                    return errorMessages.addressLine1 || 'Please enter your address';
                }
                break;
            case 'townCity':
                if (!value || value.trim().length < 2) {
                    return errorMessages.townCity || 'Please enter your town or city';
                }
                break;
            case 'postcode':
                const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
                if (!value || !postcodeRegex.test(value.replace(/\s/g, ''))) {
                    return errorMessages.postcode || 'Please enter a valid UK postcode';
                }
                break;
            default:
                return null;
        }
        return null;
    };

    const handleFieldChange = (e) => {
        const { name, value, type } = e.target;
        let sanitizedValue = value;
        
        // Apply sanitization based on field type/name
        if (name === 'bookingNotes' || name === 'enquiryComments' || name === 'otherNotes' || 
            name === 'specificRequirements' || name === 'customAdditionalComments') {
            sanitizedValue = sanitizeTextInput(value, { maxLength: 500 });
        } else if (name === 'email') {
            const { sanitized } = sanitizeEmail(value);
            sanitizedValue = sanitized;
        } else if (name === 'mobile' || name === 'phone') {
            sanitizedValue = sanitizePhone(value);
        } else if (name === 'addressLine1' || name === 'addressLine2' || name === 'townCity') {
            // Allow spaces and longer content for addresses
            sanitizedValue = sanitizeTextInput(value, { 
                maxLength: 200,
                allowNewlines: false,
                trimWhitespace: false // Preserve spaces within addresses
            });
        } else if (name === 'postcode') {
            // Preserve postcode formatting including spaces
            sanitizedValue = sanitizeTextInput(value, { 
                maxLength: 10,
                allowNewlines: false,
                trimWhitespace: false
            });
        } else if (type === 'text') {
            // Sanitize other text inputs but allow more characters
            sanitizedValue = sanitizeTextInput(value, { 
                maxLength: 100,
                allowNewlines: false 
            });
        }
        
        // Create a synthetic event with sanitized value
        const sanitizedEvent = {
            ...e,
            target: {
                ...e.target,
                value: sanitizedValue
            }
        };
        
        handleChange(name)(sanitizedEvent);
        
        const error = validateField(name, sanitizedValue);
        setValidationErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouchedFields(prev => ({ ...prev, [name]: true }));
    };

    const handleRecaptchaChange = (token) => {
        setRecaptchaToken(token);
        setFormData(prev => ({ ...prev, recaptchaToken: token }));
    };

    const handleActualSubmit = async () => {
        // Validate all required fields
        const requiredFields = ['customerName', 'email', 'mobile', 'addressLine1', 'townCity', 'postcode'];
        const errors = {};
        let hasErrors = false;

        requiredFields.forEach(field => {
            const error = validateField(field, values[field]);
            if (error) {
                errors[field] = error;
                hasErrors = true;
            }
        });

        setValidationErrors(errors);
        setTouchedFields(requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

        if (hasErrors) {
            const firstErrorField = requiredFields.find(field => errors[field]);
            document.getElementById(firstErrorField)?.focus();
            return;
        }

        if (!recaptchaToken) {
            alert('Please complete the reCAPTCHA verification');
            return;
        }

        // Add selected date/time if applicable
        const formDataToSubmit = {
            ...values,
            selectedDate: selectedDate,
            selectedTimeSlot: selectedTimeSlot,
            recaptchaToken: recaptchaToken
        };

        setIsSubmitting(true);
        await handleSubmit(formDataToSubmit);
        setIsSubmitting(false);
    };

    // Format display values
    const formatPrice = (price) => {
        return typeof price === 'number' ? `£${price.toFixed(2)}` : '£0.00';
    };

    const formatFrequency = (freq) => {
        if (!freq) return 'Not selected';
        return freq.charAt(0).toUpperCase() + freq.slice(1);
    };

    // Calculate totals for summary
    const calculateTotals = () => {
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
    };

    const { subtotal, discount, total } = calculateTotals();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8 text-center">Complete Your Booking</h2>
                    
                    <div className={`grid gap-8 ${values.isCommercial ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
                        {/* Left Column - Contact Details */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-700">
                            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                                <svg className="w-6 h-6 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                                </svg>
                                Your Details
                            </h3>

                            <InputField
                                label="Full Name"
                                name="customerName"
                                value={values.customerName || ''}
                                onChange={handleFieldChange}
                                onBlur={handleBlur}
                                placeholder="John Smith"
                                required
                                error={validationErrors.customerName}
                                touched={touchedFields.customerName}
                            />

                            <InputField
                                label="Email Address"
                                name="email"
                                type="email"
                                value={values.email || ''}
                                onChange={handleFieldChange}
                                onBlur={handleBlur}
                                placeholder="john@example.com"
                                required
                                error={validationErrors.email}
                                touched={touchedFields.email}
                            />

                            <InputField
                                label="Mobile Number"
                                name="mobile"
                                type="tel"
                                value={values.mobile || ''}
                                onChange={handleFieldChange}
                                onBlur={handleBlur}
                                placeholder="07700 900000"
                                required
                                error={validationErrors.mobile}
                                touched={touchedFields.mobile}
                            />

                            <h4 className="text-lg font-semibold text-white mt-6 mb-4">Property Address</h4>

                            <InputField
                                label="Address Line 1"
                                name="addressLine1"
                                value={values.addressLine1 || ''}
                                onChange={handleFieldChange}
                                onBlur={handleBlur}
                                placeholder="123 Main Street"
                                required
                                error={validationErrors.addressLine1}
                                touched={touchedFields.addressLine1}
                            />

                            <InputField
                                label="Address Line 2"
                                name="addressLine2"
                                value={values.addressLine2 || ''}
                                onChange={handleFieldChange}
                                onBlur={handleBlur}
                                placeholder="Apartment, suite, etc. (optional)"
                            />

                            <InputField
                                label="Town/City"
                                name="townCity"
                                value={values.townCity || ''}
                                onChange={handleFieldChange}
                                onBlur={handleBlur}
                                placeholder="Bristol"
                                required
                                error={validationErrors.townCity}
                                touched={touchedFields.townCity}
                            />

                            <InputField
                                label="Postcode"
                                name="postcode"
                                value={values.postcode || ''}
                                onChange={handleFieldChange}
                                onBlur={handleBlur}
                                placeholder="BS1 2AB"
                                required
                                error={validationErrors.postcode}
                                touched={touchedFields.postcode}
                            />

                            {/* Schedule Selection for Standard Bookings */}
                            {isStandardResidential && (
                                <div className="mt-6">
                                    <h4 className="text-lg font-semibold text-white mb-4">Preferred Start Date</h4>
                                    <ScheduleSelection
                                        selectedDate={selectedDate}
                                        onDateSelect={(date) => {
                                            setSelectedDate(date);
                                            setFormData(prev => ({ ...prev, selectedDate: date }));
                                        }}
                                        postcode={values.postcode}
                                    />
                                </div>
                            )}

                            {/* Enhanced Commercial Enquiry Form */}
                            {values.isCommercial && (
                                <div className="mt-8 pt-6 border-t border-gray-600">
                                    <div className="bg-gradient-to-r from-purple-800 to-purple-700 p-6 rounded-lg border border-purple-600 mb-6">
                                        <h3 className="text-2xl font-semibold text-white mb-2">Commercial Services Details</h3>
                                        <p className="text-purple-200">Tell us about your business and cleaning requirements</p>
                                    </div>
                                    
                                    {/* Business Information */}
                                    <div className="mb-8">
                                        <h4 className="text-xl font-semibold text-gray-200 mb-4">Business Information</h4>
                                        <div className="space-y-6">
                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold text-gray-200 mb-2">
                                                    Business Name <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="commercialDetails.businessName"
                                                    value={values.commercialDetails?.businessName || ''}
                                                    onChange={handleChange('commercialDetails.businessName')}
                                                    placeholder="e.g., ACME Corporation Ltd"
                                                    required
                                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-200 mb-2">
                                                    Type of Business <span className="text-red-400">*</span>
                                                </label>
                                                <select
                                                    name="commercialDetails.propertyType"
                                                    value={values.commercialDetails?.propertyType || ''}
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
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-200 mb-2">
                                                    Building Size
                                                </label>
                                                <select
                                                    name="commercialDetails.approxSizeOrWindows"
                                                    value={values.commercialDetails?.approxSizeOrWindows || ''}
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
                                            
                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold text-gray-200 mb-2">
                                                    Number of Floors
                                                </label>
                                                <input
                                                    type="text"
                                                    name="commercialDetails.numberOfFloors"
                                                    value={values.commercialDetails?.numberOfFloors || ''}
                                                    onChange={handleChange('commercialDetails.numberOfFloors')}
                                                    placeholder="e.g., 3 floors"
                                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Contact Information */}
                                    <div className="mb-8">
                                        <h4 className="text-xl font-semibold text-gray-200 mb-4">Site Contact Details</h4>
                                        <div className="space-y-6">
                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold text-gray-200 mb-2">
                                                    Contact Person Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="commercialDetails.contactPerson"
                                                    value={values.commercialDetails?.contactPerson || ''}
                                                    onChange={handleChange('commercialDetails.contactPerson')}
                                                    placeholder="e.g., John Smith"
                                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500"
                                                />
                                            </div>
                                            
                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold text-gray-200 mb-2">
                                                    Contact Role/Position
                                                </label>
                                                <input
                                                    type="text"
                                                    name="commercialDetails.contactRole"
                                                    value={values.commercialDetails?.contactRole || ''}
                                                    onChange={handleChange('commercialDetails.contactRole')}
                                                    placeholder="e.g., Facilities Manager"
                                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Services Selection */}
                                    <div className="mb-8">
                                        <h4 className="text-xl font-semibold text-gray-200 mb-4">
                                            Services Required <span className="text-sm text-gray-400">(Select all that apply)</span>
                                        </h4>
                                        <div className="space-y-6">
                                            {/* External Window Cleaning */}
                                            <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                                                <div className="flex items-center mb-3">
                                                    <input
                                                        type="checkbox"
                                                        id="comm-window-external"
                                                        name="commercialDetails.services.windowCleaningExternal"
                                                        checked={values.commercialDetails?.services?.windowCleaningExternal || false}
                                                        onChange={handleChange('commercialDetails.services.windowCleaningExternal')}
                                                        className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                                    />
                                                    <label htmlFor="comm-window-external" className="ml-3 text-white font-medium cursor-pointer">
                                                        External Window Cleaning
                                                    </label>
                                                </div>
                                                {values.commercialDetails?.services?.windowCleaningExternal && (
                                                    <div className="ml-7">
                                                        <label className="block text-sm text-gray-300 mb-2">Preferred Frequency:</label>
                                                        <select
                                                            name="commercialDetails.frequencies.windowCleaningExternal"
                                                            value={values.commercialDetails?.frequencies?.windowCleaningExternal || ''}
                                                            onChange={handleChange('commercialDetails.frequencies.windowCleaningExternal')}
                                                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="">Select frequency</option>
                                                            <option value="weekly">Weekly</option>
                                                            <option value="fortnightly">Fortnightly (2 weeks)</option>
                                                            <option value="monthly">Monthly (4 weeks)</option>
                                                            <option value="6-weekly">6 Weekly</option>
                                                            <option value="8-weekly">8 Weekly</option>
                                                            <option value="quarterly">Quarterly (12 weeks)</option>
                                                            <option value="twice-yearly">Twice yearly</option>
                                                            <option value="annually">Annually</option>
                                                            <option value="one-off">One-off clean</option>
                                                            <option value="as-required">As required</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Internal Window Cleaning */}
                                            <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                                                <div className="flex items-center mb-3">
                                                    <input
                                                        type="checkbox"
                                                        id="comm-window-internal"
                                                        name="commercialDetails.services.windowCleaningInternal"
                                                        checked={values.commercialDetails?.services?.windowCleaningInternal || false}
                                                        onChange={handleChange('commercialDetails.services.windowCleaningInternal')}
                                                        className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                                    />
                                                    <label htmlFor="comm-window-internal" className="ml-3 text-white font-medium cursor-pointer">
                                                        Internal Window Cleaning
                                                    </label>
                                                </div>
                                                {values.commercialDetails?.services?.windowCleaningInternal && (
                                                    <div className="ml-7">
                                                        <label className="block text-sm text-gray-300 mb-2">Preferred Frequency:</label>
                                                        <select
                                                            name="commercialDetails.frequencies.windowCleaningInternal"
                                                            value={values.commercialDetails?.frequencies?.windowCleaningInternal || ''}
                                                            onChange={handleChange('commercialDetails.frequencies.windowCleaningInternal')}
                                                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="">Select frequency</option>
                                                            <option value="weekly">Weekly</option>
                                                            <option value="fortnightly">Fortnightly (2 weeks)</option>
                                                            <option value="monthly">Monthly (4 weeks)</option>
                                                            <option value="6-weekly">6 Weekly</option>
                                                            <option value="8-weekly">8 Weekly</option>
                                                            <option value="quarterly">Quarterly (12 weeks)</option>
                                                            <option value="twice-yearly">Twice yearly</option>
                                                            <option value="annually">Annually</option>
                                                            <option value="one-off">One-off clean</option>
                                                            <option value="as-required">As required</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Gutter Clearing */}
                                            <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                                                <div className="flex items-center mb-3">
                                                    <input
                                                        type="checkbox"
                                                        id="comm-gutter-clearing"
                                                        name="commercialDetails.services.gutterClearing"
                                                        checked={values.commercialDetails?.services?.gutterClearing || false}
                                                        onChange={handleChange('commercialDetails.services.gutterClearing')}
                                                        className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                                    />
                                                    <label htmlFor="comm-gutter-clearing" className="ml-3 text-white font-medium cursor-pointer">
                                                        Gutter Clearing
                                                    </label>
                                                </div>
                                                {values.commercialDetails?.services?.gutterClearing && (
                                                    <div className="ml-7">
                                                        <label className="block text-sm text-gray-300 mb-2">Preferred Frequency:</label>
                                                        <select
                                                            name="commercialDetails.frequencies.gutterClearing"
                                                            value={values.commercialDetails?.frequencies?.gutterClearing || ''}
                                                            onChange={handleChange('commercialDetails.frequencies.gutterClearing')}
                                                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="">Select frequency</option>
                                                            <option value="twice-yearly">Twice yearly</option>
                                                            <option value="annually">Annually</option>
                                                            <option value="one-off">One-off clean</option>
                                                            <option value="as-required">As required</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Fascia & Soffit Cleaning */}
                                            <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                                                <div className="flex items-center mb-3">
                                                    <input
                                                        type="checkbox"
                                                        id="comm-fascia-soffit"
                                                        name="commercialDetails.services.fasciaSoffit"
                                                        checked={values.commercialDetails?.services?.fasciaSoffit || false}
                                                        onChange={handleChange('commercialDetails.services.fasciaSoffit')}
                                                        className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                                    />
                                                    <label htmlFor="comm-fascia-soffit" className="ml-3 text-white font-medium cursor-pointer">
                                                        Fascia & Soffit Cleaning
                                                    </label>
                                                </div>
                                                {values.commercialDetails?.services?.fasciaSoffit && (
                                                    <div className="ml-7">
                                                        <label className="block text-sm text-gray-300 mb-2">Preferred Frequency:</label>
                                                        <select
                                                            name="commercialDetails.frequencies.fasciaSoffit"
                                                            value={values.commercialDetails?.frequencies?.fasciaSoffit || ''}
                                                            onChange={handleChange('commercialDetails.frequencies.fasciaSoffit')}
                                                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="">Select frequency</option>
                                                            <option value="twice-yearly">Twice yearly</option>
                                                            <option value="annually">Annually</option>
                                                            <option value="one-off">One-off clean</option>
                                                            <option value="as-required">As required</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Solar Panel Cleaning */}
                                            <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                                                <div className="flex items-center mb-3">
                                                    <input
                                                        type="checkbox"
                                                        id="comm-solar-panels"
                                                        name="commercialDetails.services.solarPanels"
                                                        checked={values.commercialDetails?.services?.solarPanels || false}
                                                        onChange={handleChange('commercialDetails.services.solarPanels')}
                                                        className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                                    />
                                                    <label htmlFor="comm-solar-panels" className="ml-3 text-white font-medium cursor-pointer">
                                                        Solar Panel Cleaning
                                                    </label>
                                                </div>
                                                {values.commercialDetails?.services?.solarPanels && (
                                                    <div className="ml-7">
                                                        <label className="block text-sm text-gray-300 mb-2">Preferred Frequency:</label>
                                                        <select
                                                            name="commercialDetails.frequencies.solarPanels"
                                                            value={values.commercialDetails?.frequencies?.solarPanels || ''}
                                                            onChange={handleChange('commercialDetails.frequencies.solarPanels')}
                                                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="">Select frequency</option>
                                                            <option value="quarterly">Quarterly (3 months)</option>
                                                            <option value="twice-yearly">Twice yearly</option>
                                                            <option value="annually">Annually</option>
                                                            <option value="one-off">One-off clean</option>
                                                            <option value="as-required">As required</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Pressure Washing */}
                                            <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                                                <div className="flex items-center mb-3">
                                                    <input
                                                        type="checkbox"
                                                        id="comm-pressure-washing"
                                                        name="commercialDetails.services.pressureWashing"
                                                        checked={values.commercialDetails?.services?.pressureWashing || false}
                                                        onChange={handleChange('commercialDetails.services.pressureWashing')}
                                                        className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                                    />
                                                    <label htmlFor="comm-pressure-washing" className="ml-3 text-white font-medium cursor-pointer">
                                                        Pressure Washing
                                                    </label>
                                                    <span className="ml-2 text-sm text-gray-400">(car parks, walkways, building exterior)</span>
                                                </div>
                                                {values.commercialDetails?.services?.pressureWashing && (
                                                    <div className="ml-7">
                                                        <label className="block text-sm text-gray-300 mb-2">Preferred Frequency:</label>
                                                        <select
                                                            name="commercialDetails.frequencies.pressureWashing"
                                                            value={values.commercialDetails?.frequencies?.pressureWashing || ''}
                                                            onChange={handleChange('commercialDetails.frequencies.pressureWashing')}
                                                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="">Select frequency</option>
                                                            <option value="monthly">Monthly</option>
                                                            <option value="quarterly">Quarterly (3 months)</option>
                                                            <option value="6-monthly">6 Monthly</option>
                                                            <option value="annually">Annually</option>
                                                            <option value="one-off">One-off clean</option>
                                                            <option value="as-required">As required</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Cladding Cleaning */}
                                            <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                                                <div className="flex items-center mb-3">
                                                    <input
                                                        type="checkbox"
                                                        id="comm-cladding"
                                                        name="commercialDetails.services.claddingCleaning"
                                                        checked={values.commercialDetails?.services?.claddingCleaning || false}
                                                        onChange={handleChange('commercialDetails.services.claddingCleaning')}
                                                        className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                                    />
                                                    <label htmlFor="comm-cladding" className="ml-3 text-white font-medium cursor-pointer">
                                                        Cladding & Panel Cleaning
                                                    </label>
                                                </div>
                                                {values.commercialDetails?.services?.claddingCleaning && (
                                                    <div className="ml-7">
                                                        <label className="block text-sm text-gray-300 mb-2">Preferred Frequency:</label>
                                                        <select
                                                            name="commercialDetails.frequencies.claddingCleaning"
                                                            value={values.commercialDetails?.frequencies?.claddingCleaning || ''}
                                                            onChange={handleChange('commercialDetails.frequencies.claddingCleaning')}
                                                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="">Select frequency</option>
                                                            <option value="quarterly">Quarterly (3 months)</option>
                                                            <option value="6-monthly">6 Monthly</option>
                                                            <option value="annually">Annually</option>
                                                            <option value="one-off">One-off clean</option>
                                                            <option value="as-required">As required</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Signage Cleaning */}
                                            <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                                                <div className="flex items-center mb-3">
                                                    <input
                                                        type="checkbox"
                                                        id="comm-signage"
                                                        name="commercialDetails.services.signageCleaning"
                                                        checked={values.commercialDetails?.services?.signageCleaning || false}
                                                        onChange={handleChange('commercialDetails.services.signageCleaning')}
                                                        className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                                    />
                                                    <label htmlFor="comm-signage" className="ml-3 text-white font-medium cursor-pointer">
                                                        Signage & Shop Front Cleaning
                                                    </label>
                                                </div>
                                                {values.commercialDetails?.services?.signageCleaning && (
                                                    <div className="ml-7">
                                                        <label className="block text-sm text-gray-300 mb-2">Preferred Frequency:</label>
                                                        <select
                                                            name="commercialDetails.frequencies.signageCleaning"
                                                            value={values.commercialDetails?.frequencies?.signageCleaning || ''}
                                                            onChange={handleChange('commercialDetails.frequencies.signageCleaning')}
                                                            className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                                                        >
                                                            <option value="">Select frequency</option>
                                                            <option value="weekly">Weekly</option>
                                                            <option value="fortnightly">Fortnightly (2 weeks)</option>
                                                            <option value="monthly">Monthly</option>
                                                            <option value="quarterly">Quarterly (3 months)</option>
                                                            <option value="one-off">One-off clean</option>
                                                            <option value="as-required">As required</option>
                                                        </select>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Other Services */}
                                            <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                                                <div className="flex items-center mb-3">
                                                    <input
                                                        type="checkbox"
                                                        id="comm-other-services"
                                                        name="commercialDetails.services.other"
                                                        checked={values.commercialDetails?.services?.other || false}
                                                        onChange={handleChange('commercialDetails.services.other')}
                                                        className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                                    />
                                                    <label htmlFor="comm-other-services" className="ml-3 text-white font-medium cursor-pointer">
                                                        Other Services (please specify below)
                                                    </label>
                                                </div>
                                                {values.commercialDetails?.services?.other && (
                                                    <div className="ml-7 space-y-3">
                                                        <div>
                                                            <label className="block text-sm text-gray-300 mb-2">Service Details:</label>
                                                            <textarea
                                                                name="commercialDetails.otherServiceDetails"
                                                                value={values.commercialDetails?.otherServiceDetails || ''}
                                                                onChange={handleChange('commercialDetails.otherServiceDetails')}
                                                                placeholder="e.g., Conservatory roof cleaning, UPVC cleaning, signage cleaning..."
                                                                rows={2}
                                                                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-300 mb-2">Preferred Frequency:</label>
                                                            <select
                                                                name="commercialDetails.frequencies.other"
                                                                value={values.commercialDetails?.frequencies?.other || ''}
                                                                onChange={handleChange('commercialDetails.frequencies.other')}
                                                                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-blue-500 focus:border-blue-500"
                                                            >
                                                                <option value="">Select frequency</option>
                                                                <option value="weekly">Weekly</option>
                                                                <option value="fortnightly">Fortnightly (2 weeks)</option>
                                                                <option value="monthly">Monthly</option>
                                                                <option value="quarterly">Quarterly (3 months)</option>
                                                                <option value="twice-yearly">Twice yearly</option>
                                                                <option value="annually">Annually</option>
                                                                <option value="one-off">One-off clean</option>
                                                                <option value="as-required">As required</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Site Access & Operational Details */}
                                    <div className="mb-8">
                                        <h4 className="text-xl font-semibold text-gray-200 mb-4">Site Access & Operational Details</h4>
                                        
                                        <div className="mt-6">
                                            <label className="block text-sm font-semibold text-gray-200 mb-2">Access Requirements</label>
                                            <textarea
                                                name="commercialDetails.accessRequirements"
                                                value={values.commercialDetails?.accessRequirements || ''}
                                                onChange={handleChange('commercialDetails.accessRequirements')}
                                                placeholder="e.g., Security codes, key collection, specific entry points, height restrictions, equipment access..."
                                                rows={3}
                                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500 resize-vertical"
                                            />
                                        </div>
                                    </div>

                                    {/* Additional Requirements */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-200 mb-2">
                                            Additional Information (Optional)
                                        </label>
                                        <textarea
                                            name="commercialDetails.specificRequirements"
                                            value={values.commercialDetails?.specificRequirements || ''}
                                            onChange={handleChange('commercialDetails.specificRequirements')}
                                            placeholder="Any other specific requirements, budget considerations, current supplier details, or additional information that would help us provide an accurate quote..."
                                            rows={4}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500 resize-vertical"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Booking Summary */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
                            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                                <svg className="w-6 h-6 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
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
                                            <span className="text-lg font-semibold text-white">Total</span>
                                            <span className="text-2xl font-bold text-green-400">{formatPrice(total)}</span>
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

                            {/* Additional Notes - Show for non-commercial */}
                            {!values.isCommercial && (
                                <div className="mt-6">
                                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                                        Additional Notes (Optional)
                                    </label>
                                    <textarea
                                        name="bookingNotes"
                                        value={values.bookingNotes || ''}
                                        onChange={handleChange('bookingNotes')}
                                        placeholder="Any special requirements or access instructions..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}

                            {/* reCAPTCHA */}
                            <div className="mt-6 flex justify-center">
                                <div className="bg-white p-2 rounded-lg">
                                    <ReCAPTCHA
                                        sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6LfRNJQqAAAAAMXSD_rvdqVTfHPCk0wqnSfKBupj"}
                                        onChange={handleRecaptchaChange}
                                    />
                                </div>
                            </div>

                            {/* Enhanced Error Message */}
                            {submissionError && (
                                <div className="mt-4 p-4 bg-red-900/30 border border-red-600 rounded-lg">
                                    <div className="flex items-start">
                                        <svg className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        <div className="flex-1">
                                            <h4 className="text-red-300 font-semibold mb-2">Submission Failed</h4>
                                            <p className="text-red-200 text-sm mb-3">
                                                {typeof submissionError === 'string' ? submissionError : submissionError.message}
                                            </p>
                                            
                                            {typeof submissionError === 'object' && submissionError.canRetry && (
                                                <button
                                                    onClick={() => handleActualSubmit()}
                                                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors mr-3"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                                    </svg>
                                                    Try Again
                                                </button>
                                            )}
                                            
                                            {typeof submissionError === 'object' && submissionError.contactInfo && (
                                                <div className="text-xs text-red-200 bg-red-800/30 p-2 rounded mt-3">
                                                    <p className="font-medium mb-1">Need immediate assistance?</p>
                                                    <p>📞 Call: <a href={`tel:${submissionError.contactInfo.phone}`} className="underline hover:text-white">{submissionError.contactInfo.phone}</a></p>
                                                    <p>✉️ Email: <a href={`mailto:${submissionError.contactInfo.email}`} className="underline hover:text-white">{submissionError.contactInfo.email}</a></p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                <button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-6 py-3 border-2 border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleActualSubmit}
                                    disabled={isLoading || isSubmitting || !recaptchaToken}
                                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                                        isLoading || isSubmitting || !recaptchaToken
                                            ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                                            : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white transform hover:scale-105'
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PropertyDetailsAndReview;