import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReCAPTCHA from "react-google-recaptcha"; // NEW: Import reCAPTCHA
import emailjs from '@emailjs/browser';
import { scheduleData, specialPostcodeRules } from '../config/scheduleConfig';

// --- Helper Component Definitions ---

// InputField Component
const InputField = ({ label, name, type = 'text', value, onChange, required, error, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-natural-text">{label}{required && ' *'}</label>
        {type === 'textarea' ? (
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                rows={3}
                className={`mt-1 block w-full rounded-md border-natural-secondary shadow-sm focus:border-natural-primary focus:ring-natural-primary sm:text-sm p-2 ${error ? 'border-natural-error' : ''}`}
                placeholder={placeholder || ''}
                required={required}
            />
        ) : (
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className={`mt-1 block w-full rounded-md border-natural-secondary shadow-sm focus:border-natural-primary focus:ring-natural-primary sm:text-sm p-2 ${error ? 'border-natural-error' : ''}`}
                placeholder={placeholder || ''}
                required={required}
            />
        )}
        {error && <p className="mt-1 text-xs text-natural-error-dark">{error}</p>}
    </div>
);

// ReviewSection Component
const ReviewSection = ({ title, children }) => (
    <div className="mb-4 pb-4 border-b border-natural-secondary last:border-b-0 last:pb-0">
        <h3 className="text-lg font-semibold text-natural-text mb-2">{title}</h3>
        <div className="space-y-1">{children}</div>
    </div>
);

// ReviewItem Component
const ReviewItem = ({ label, value }) => (
    <div className="flex justify-between text-sm">
        <span className="text-natural-text-light">{label}:</span>
        <span className="text-natural-text font-medium text-right">{value}</span>
    </div>
);

// PriceLine Component
const PriceLine = ({ label, price, formatCurrency, isDiscount }) => (
    <div className={`flex justify-between py-1 ${isDiscount ? 'text-natural-success-dark' : 'text-natural-text'}`}>
        <span className='text-natural-text'>{label}</span>
        <span className={`${isDiscount ? 'text-natural-success-dark' : 'text-natural-text'}`}>{formatCurrency(price)}</span>
    </div>
);

// QuoteServiceCard Component
const QuoteServiceCard = ({ title, selected, onToggle, note, children }) => (
    <div 
        onClick={onToggle}
        className={`p-4 border rounded-lg shadow-sm cursor-pointer transition-all duration-150 hover:shadow-md
            ${selected ? 'bg-natural-secondary-light border-natural-primary ring-2 ring-natural-primary' : 'bg-natural-bg-light border-natural-secondary hover:border-natural-primary'}`}
    >
        <div className="flex justify-between items-center">
            <h3 className="text-md sm:text-lg font-semibold text-natural-text">{title}</h3>
            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 transition-colors
                ${selected ? 'bg-natural-primary border-natural-primary' : 'bg-natural-bg-light border-natural-text-light'}`}
            >
                {selected && <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7"></path></svg>}
            </div>
        </div>
        {note && <p className="text-xs sm:text-sm text-natural-text-light mt-1">{note}</p>}
        {children && <div className="mt-2 pt-2 border-t border-natural-secondary">{children}</div>}
    </div>
);

// ServiceCard Component
const ServiceCard = ({ title, price, selected, onToggle, formatCurrency, note, children, isFullyDiscounted }) => (
    <div 
        onClick={onToggle}
        className={`p-4 border rounded-lg shadow-sm cursor-pointer transition-all duration-150 hover:shadow-md
            ${selected ? 'bg-natural-secondary-light border-natural-primary ring-2 ring-natural-primary' : 'bg-natural-bg-light border-natural-secondary hover:border-natural-primary'}`}
    >
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-md sm:text-lg font-semibold text-natural-text">{title}</h3>
                {note && <p className="text-xs sm:text-sm text-natural-text-light mt-1 max-w-md">{note}</p>}
            </div>
            <div className="text-right ml-2 flex-shrink-0">
                {isFullyDiscounted ? (
                    <span className="text-lg font-bold text-natural-success-dark">FREE</span>
                ) : (
                    <span className={`text-lg font-bold ${selected ? 'text-natural-primary' : 'text-natural-text'}`}>{formatCurrency(price)}</span>
                )}
                 <div className={`mt-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 transition-colors ml-auto
                    ${selected ? 'bg-natural-primary border-natural-primary' : 'bg-natural-bg-light border-natural-text-light'}`}
                >
                    {selected && <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7"></path></svg>}
                </div>
            </div>
        </div>
        {children && <div className="mt-3 pt-3 border-t border-natural-secondary">{children}</div>}
    </div>
);

// AdminBookingCard 
const AdminBookingCard = ({ booking, onUpdateStatus, houseOptions, frequencyOptions, solarFrequencyOptions, formatCurrency, formatDateForDisplay, isCompletedView }) => {
    return (
        <div className={`p-4 rounded-lg shadow ${isCompletedView ? 'bg-natural-text' : 'bg-natural-text-light/50 text-natural-bg-light'}`}>
            <p className={`font-semibold ${isCompletedView ? 'text-natural-bg-light' : 'text-natural-text'}`}>{booking.firstName} {booking.lastName} - {formatDateForDisplay(new Date(booking.submittedAt))}</p>
            <p className={`${isCompletedView ? 'text-natural-bg-light' : 'text-natural-text'}`}>Postcode: {booking.postcode} - Status: {booking.adminStatus?.customerConfirmed || 'N/A'}</p>
        </div>
    );
};

// CompactCompletedBookingLine
const CompactCompletedBookingLine = ({ booking, onToggleExpand, formatCurrency, formatDateForDisplay }) => {
    return (
        <div onClick={() => onToggleExpand(booking.id)} className="p-3 bg-natural-text hover:bg-natural-text-light rounded-md cursor-pointer text-natural-bg-light">
            <p>{booking.firstName} {booking.lastName} ({formatDateForDisplay(new Date(booking.submittedAt))}) - <span className="text-natural-success">Completed</span></p>
        </div>
    );
};


// --- Data Definitions from Original Form ---
const houseOptions = [
    { id: 'semi-small', label: '1-2 Bed Semi-Detached', bedrooms: 2, isDetached: false, basePrice: 20 }, { id: 'detached-small', label: '1-2 Bed Detached', bedrooms: 2, isDetached: true, basePrice: 25 },
    { id: 'semi-3', label: '3 Bed Semi-Detached', bedrooms: 3, isDetached: false, basePrice: 25 }, { id: 'detached-3', label: '3 Bed Detached', bedrooms: 3, isDetached: true, basePrice: 30 },
    { id: 'semi-4', label: '4 Bed Semi-Detached', bedrooms: 4, isDetached: false, basePrice: 30 }, { id: 'detached-4', label: '4 Bed Detached', bedrooms: 4, isDetached: true, basePrice: 35 },
    { id: 'semi-5', label: '5 Bed Semi-Detached', bedrooms: 5, isDetached: false, basePrice: 35 }, { id: 'detached-5', label: '5 Bed Detached', bedrooms: 5, isDetached: true, basePrice: 40 },
    { id: 'bespoke', label: '6+ Beds / Bespoke', bedrooms: 6, isDetached: true, basePrice: 0, isSpecialQuote: true },
    { id: 'commercial', label: 'Commercial Property', bedrooms: 0, isDetached: false, basePrice: 0, isSpecialQuote: true } 
];

const frequencyOptionsData = [
    { value: '4-weekly', label: '4 Weekly', priceMod: 0, multiplier: 1 },
    { value: '8-weekly', label: '8 Weekly', priceMod: 0, multiplier: 1 },
    { value: '12-weekly', label: '12 Weekly', priceMod: 5, multiplier: 1 },
    { value: 'adhoc', label: 'One-off', priceMod: 0, multiplier: 1 } 
];

const solarFrequencyOptions = [
    { value: "adhoc", label: "One-off" },
    { value: "3-monthly", label: "Every 3 Months" },
    { value: "6-monthly", label: "Every 6 Months" },
    { value: "12-monthly", label: "Every 12 Months" },
    { value: "24-monthly", label: "Every 24 Months" }
];

const gutterFasciaFrequencyOptions = [
    { value: "adhoc", label: "One-off" },
    { value: "6-monthly", label: "Every 6 months" },
    { value: "12-monthly", label: "Every 12 months" },
    { value: "24-monthly", label: "Every 24 months" }
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const findFirstWorkingDayFrom = (date) => {
    if (!date || isNaN(date.getTime())) return new Date();
    let loopDate = new Date(date);
    let safety = 0;
    while (loopDate.getDay() === 0 || loopDate.getDay() === 6) {
        loopDate.setDate(loopDate.getDate() + 1);
        safety++;
        if (safety > 30) return loopDate;
    }
    return loopDate;
};

const getNextOccurrence = (dateStr) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const parts = dateStr.split(' '); if (parts.length !== 2) return null;
    const day = parseInt(parts[0], 10);
    const monthIndex = months.findIndex(m => m.toLowerCase() === parts[1].toLowerCase());
    if (monthIndex === -1 || isNaN(day)) return null;
    let targetYear = today.getFullYear();
    let targetDate = new Date(targetYear, monthIndex, day);
    targetDate.setHours(0,0,0,0);
    while (targetDate < today) {
        targetDate.setDate(targetDate.getDate() + 28);
        if (targetDate.getFullYear() > today.getFullYear() + 2) return null;
    }
    return targetDate;
};

const bedroomOptions = [
    { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' },
    { value: '4', label: '4' }, { value: '5', label: '5' }, { value: '6+', label: '6+' }
];

const propertyStyleOptions = [
    { value: 'terraced', label: 'Terraced House' }, { value: 'semi-detached', label: 'Semi-Detached House' },
    { value: 'detached', label: 'Detached House' }, { value: 'townhouse', label: 'Townhouse' },
    { value: 'bungalow', label: 'Bungalow' }, { value: 'flat', label: 'Flat / Apartment' },
    { value: 'commercial', label: 'Commercial Property' }, { value: 'other', label: 'Other / Not Sure' }
];

const commercialPropertyTypes = [
    { value: 'office', label: 'Office Building' },
    { value: 'retail', label: 'Retail Shop' },
    { value: 'restaurant', label: 'Restaurant / Cafe' },
    { value: 'warehouse', label: 'Warehouse / Industrial' },
    { value: 'medical', label: 'Medical / Dental Practice' },
    { value: 'other-commercial', label: 'Other Commercial Property' }
];

const initialFormData = {
    numBedrooms: '',
    propertyStyle: '',
    commercialPropertyType: '', 
    hasExtension: false,
    hasConservatory: false,
    services: {
        window: false,
        gutter: false,
        fascia: false,
        conservatoryRoof: false,
        solarPanels: false,
    },
    windowFrequency: '4-weekly',
    gutterFrequency: 'adhoc', 
    fasciaFrequency: 'adhoc', 
    conservatoryRoofPanels: 6,
    solarPanelCount: 5,
    solarPanelFrequency: 'adhoc',
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    address: '',
    postcode: '',
    contactPreference: 'email', 
    message: '',
    selectedDate: '',
    isAsapRequested: false, 
    conservatoryRoofFrequency: 'adhoc',
};

const stepTitles = ["Property Type", "Select Services", "Your Details & Date", "Review & Confirm"];

const formatDateForDisplay = (date) => {
  if (!date || isNaN(date.getTime())) return "Invalid Date";
  return date.toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
};

const formatDateForStorage = (date) => {
  if (!date || isNaN(date.getTime())) return "";
  return date.toISOString().split('T')[0]; 
};

const WindowCleaningForm = () => {
    const [currentStep, setCurrentStep] = useState(1); 
    const [formData, setFormData] = useState(JSON.parse(JSON.stringify(initialFormData)));
    const [calculatedPrices, setCalculatedPrices] = useState({});
    const [availableDates, setAvailableDates] = useState([]);
    const [postcodeError, setPostcodeError] = useState('');
    const [dateSelectionError, setDateSelectionError] = useState('');
    const [appView, setAppView] = useState('customerForm'); 
    
    const [adminPassword, setAdminPassword] = useState('');
    const [adminLoginError, setAdminLoginError] = useState('');
    const [allBookings, setAllBookings] = useState([]); 
    const [expandedCompletedBookingId, setExpandedCompletedBookingId] = useState(null); 
    const [lastSubmittedBookingDetails, setLastSubmittedBookingDetails] = useState(null); 
    const [reCaptchaError, setReCaptchaError] = useState(''); 
    const recaptchaRef = useRef(); 
    const [isLoadingDates, setIsLoadingDates] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState('');
    const [contactValidationErrors, setContactValidationErrors] = useState({});
    const [selectedArea, setSelectedArea] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [dynamicAdhocAdd, setDynamicAdhocAdd] = useState(0);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState('');
    const [continueError, setContinueError] = useState('');

    const conservatoryRoofFrequencyOptions = [
        { value: "adhoc", label: "One-off" },
        { value: "3-monthly", label: "Every 3 Months" },
        { value: "6-monthly", label: "Every 6 Months" },
        { value: "12-monthly", label: "Every 12 Months" },
        { value: "24-monthly", label: "Every 24 Months" }
    ];

    const handleConservatoryRoofFrequencyChange = (value) => {
        setFormData(prev => ({
            ...prev,
            conservatoryRoofFrequency: value,
            services: { ...prev.services, conservatoryRoof: true } 
        }));
    };

    const handleSolarPanelFrequencyChange = (value) => {
        setFormData(prev => ({
            ...prev,
            solarPanelFrequency: value,
            services: { ...prev.services, solarPanels: true } 
        }));
    };

    const isSpecialQuoteScenario = useCallback(() => {
      return (
        formData.numBedrooms === '6+' ||
        formData.propertyStyle === 'other' ||
        formData.propertyStyle === 'commercial'
      );
    }, [formData.numBedrooms, formData.propertyStyle]);

    useEffect(() => {
        const calculateAdhocForUI = () => {
            const numBedroomsInt = parseInt(formData.numBedrooms, 10);
            const queryIsDetached = formData.propertyStyle === 'detached';
            let adhocAddAmount = 0;

            if (!isNaN(numBedroomsInt) && formData.propertyStyle && !isSpecialQuoteScenario()) {
                const tempDerivedHouse = houseOptions.find(option => {
                    if (option.isSpecialQuote) return false;
                    const optionIsEffectivelyDetached = option.isDetached;
                    if (optionIsEffectivelyDetached !== queryIsDetached) return false;
                    if (numBedroomsInt <= 2) return option.bedrooms === 2;
                    return option.bedrooms === numBedroomsInt;
                });

                if (tempDerivedHouse) {
                    const bedsForTier = tempDerivedHouse.bedrooms;
                    const styleIsDetached = tempDerivedHouse.isDetached;
                    if (bedsForTier <= 2) adhocAddAmount = 15;
                    else if (bedsForTier === 3) adhocAddAmount = 20;
                    else if (bedsForTier === 4) adhocAddAmount = styleIsDetached ? 25 : 20;
                    else if (bedsForTier === 5) adhocAddAmount = 25;
                }
            }
            setDynamicAdhocAdd(adhocAddAmount);
        };
        calculateAdhocForUI();
    }, [formData.numBedrooms, formData.propertyStyle, isSpecialQuoteScenario, houseOptions]);

    useEffect(() => {
        const calculatePrice = () => {
            let rawBaseWindowPrice = 0;
            let extensionPrice = 0;
            let conservatoryWindowPrice = 0;
            let finalBaseWindowPrice = 0;
            let currentWindowPrice = 0;
            let baseGutterClearingPrice = 0;
            let baseGutterFasciaPrice = 0;
            let conservatoryRoofPrice = 0;
            let solarPanelPrice = 0;
            let total = 0;
            let discount = 0;
            let originalWindowPriceForDiscount = 0;

            let derivedSelectedHouse = null;
            const numBedroomsInt = parseInt(formData.numBedrooms, 10);
            const queryIsDetached = formData.propertyStyle === 'detached';

            if (!isNaN(numBedroomsInt) && formData.propertyStyle && !isSpecialQuoteScenario()) {
                derivedSelectedHouse = houseOptions.find(option => {
                    if (option.isSpecialQuote) return false; 
                    const optionIsEffectivelyDetached = option.isDetached;
                    if (optionIsEffectivelyDetached !== queryIsDetached) return false;
                    if (numBedroomsInt <= 2) return option.bedrooms === 2; 
                    else return option.bedrooms === numBedroomsInt;
                });
            }

            if (derivedSelectedHouse && !isSpecialQuoteScenario()) {
                rawBaseWindowPrice = derivedSelectedHouse.basePrice;
                finalBaseWindowPrice = rawBaseWindowPrice;

                if (formData.hasExtension) {
                    extensionPrice = 5;
                    finalBaseWindowPrice += extensionPrice;
                }
                if (formData.hasConservatory) {
                    conservatoryWindowPrice = 5;
                    finalBaseWindowPrice += conservatoryWindowPrice;
                }

                const selectedFrequency = frequencyOptionsData.find(f => f.value === formData.windowFrequency);
                if (selectedFrequency) {
                    if (formData.windowFrequency === 'adhoc') {
                        let adhocAdd = 0;
                        const bedsForTier = derivedSelectedHouse.bedrooms;
                        const styleIsDetached = derivedSelectedHouse.isDetached;
                        if (bedsForTier <= 2) adhocAdd = 15;
                        else if (bedsForTier === 3) adhocAdd = 20;
                        else if (bedsForTier === 4) adhocAdd = styleIsDetached ? 25 : 20;
                        else if (bedsForTier === 5) adhocAdd = 25;
                        currentWindowPrice = finalBaseWindowPrice + adhocAdd;
                    } else {
                        currentWindowPrice = finalBaseWindowPrice + selectedFrequency.priceMod;
                    }
                } else {
                    currentWindowPrice = finalBaseWindowPrice; 
                }

                if (formData.services.conservatoryRoof && formData.hasConservatory) {
                    conservatoryRoofPrice = formData.conservatoryRoofPanels * 10;
                }
                if (formData.services.solarPanels) {
                    solarPanelPrice = formData.solarPanelCount * 10;
                }

                const bedrooms = derivedSelectedHouse.bedrooms;
                const isDetached = derivedSelectedHouse.isDetached;

                if (bedrooms <= 2) baseGutterClearingPrice = isDetached ? 100 : 80;
                else if (bedrooms === 3) baseGutterClearingPrice = isDetached ? 100 : 80;
                else if (bedrooms === 4) baseGutterClearingPrice = isDetached ? 120 : 100;
                else if (bedrooms === 5) baseGutterClearingPrice = isDetached ? 140 : 120;
                else baseGutterClearingPrice = 0;

                if (bedrooms <= 2) baseGutterFasciaPrice = isDetached ? 120 : 100;
                else if (bedrooms === 3) baseGutterFasciaPrice = isDetached ? 120 : 100;
                else if (bedrooms === 4) baseGutterFasciaPrice = isDetached ? 140 : 120;
                else if (bedrooms === 5) baseGutterFasciaPrice = isDetached ? 160 : 140;
                else baseGutterFasciaPrice = 0;

                total = 0;
                if (formData.services.window) total += currentWindowPrice;
                if (formData.services.gutter) total += baseGutterClearingPrice;
                if (formData.services.fascia) total += baseGutterFasciaPrice;
                if (formData.services.conservatoryRoof && formData.hasConservatory) total += conservatoryRoofPrice;
                if (formData.services.solarPanels) total += solarPanelPrice;
                
                originalWindowPriceForDiscount = currentWindowPrice;

                if (formData.services.window && formData.services.gutter && formData.services.fascia && formData.windowFrequency !== 'adhoc') {
                    discount = currentWindowPrice;
                    total -= discount;
                }
                
                setCalculatedPrices({
                    window: currentWindowPrice,
                    windowBase: rawBaseWindowPrice,
                    extensionPrice: extensionPrice,
                    conservatoryPrice: conservatoryWindowPrice,
                    gutter: baseGutterClearingPrice,
                    fascia: baseGutterFasciaPrice,
                    conservatoryRoof: conservatoryRoofPrice,
                    solarPanels: solarPanelPrice,
                    discount: discount,
                    total: Math.max(0, total),
                    originalWindowPriceForDiscount: originalWindowPriceForDiscount,
                });

            } else { 
                setCalculatedPrices({
                    window: 0, windowBase: 0, extensionPrice: 0, conservatoryPrice: 0,
                    gutter: 0, fascia: 0, conservatoryRoof: 0, solarPanels: 0,
                    discount: 0, total: 0, originalWindowPriceForDiscount: 0
                });
            }
        };
        calculatePrice();
    }, [formData, houseOptions, frequencyOptionsData, isSpecialQuoteScenario]);

    useEffect(() => {
        if (formData.postcode) {
            const postcodePrefix = formData.postcode.split(' ')[0].toUpperCase();
            const isSpecialFridayArea = specialPostcodeRules && 
                                       Array.isArray(specialPostcodeRules.fridayOnly) && 
                                       specialPostcodeRules.fridayOnly.some(pc => postcodePrefix.startsWith(pc));

            if (isSpecialFridayArea) {
                const fridays = [];
                let date = new Date();
                date.setHours(0, 0, 0, 0);
                const sixWeeksFromNow = new Date(date);
                sixWeeksFromNow.setDate(date.getDate() + 42);
                while (date.getDay() !== 5) {
                    date.setDate(date.getDate() + 1);
                }
                while (date <= sixWeeksFromNow) {
                    fridays.push(new Date(date)); 
                    date.setDate(date.getDate() + 7); 
                }
                setAvailableDates(fridays);
                setSelectedArea('Special Friday Area'); 
                setPostcodeError(''); 
            } else {
                const matchingSchedule = scheduleData.find(schedule => 
                    schedule.postcodes.some(pc => postcodePrefix.startsWith(pc))
                );

                if (matchingSchedule) {
                    const scheduleDates = matchingSchedule.dates
                        .map(dateStr => getNextOccurrence(dateStr))
                        .filter(date => date instanceof Date); 
                    setAvailableDates(scheduleDates);
                    setSelectedArea(matchingSchedule.area);
                    setPostcodeError(''); 
                } else {
                    setAvailableDates([]);
                    setSelectedArea('');
                    if (postcodePrefix.length >= 3) { 
                        setPostcodeError('Sorry, we do not cover this postcode area.');
                    } else {
                        setPostcodeError(''); 
                    }
                }
            }
        } else {
            setAvailableDates([]); 
            setSelectedArea('');
            setPostcodeError(''); 
        }
    }, [formData.postcode]); 

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newFormData = { ...formData };
        if (name === "conservatoryRoofPanels") {
            newFormData = { ...newFormData, conservatoryRoofPanels: value, services: { ...newFormData.services, conservatoryRoof: true } };
        } else if (name === "solarPanelCount") {
            newFormData = { ...newFormData, solarPanelCount: value, services: { ...newFormData.services, solarPanels: true } };
        } else if (name === "solarPanelFrequency") { 
            newFormData = { ...newFormData, solarPanelFrequency: value, services: { ...newFormData.services, solarPanels: true } };
        } else {
            newFormData = { ...newFormData, [name]: type === 'checkbox' ? checked : value };
        }
        setFormData(newFormData);
        if (contactValidationErrors[name]) {
            setContactValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
        if (continueError === 'Please fill in all required contact details marked with *.') {
            setContinueError('');
        }
    };
    
    const handlePropertyDetailChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleService = (serviceKey) => {
        setFormData(prev => ({ ...prev, services: { ...prev.services, [serviceKey]: !prev.services[serviceKey] } }));
    };

    const handleFrequencyChange = (value) => {
        setFormData(prev => ({ ...prev, windowFrequency: value, services: { ...prev.services, window: true } }));
    };

    const handleGutterFrequencyChange = (value) => {
        setFormData(prev => ({ ...prev, gutterFrequency: value, services: { ...prev.services, gutter: true } }));
    };

    const handleFasciaFrequencyChange = (value) => {
        setFormData(prev => ({ ...prev, fasciaFrequency: value, services: { ...prev.services, fascia: true } }));
    };

    const formatCurrency = (amount) => `£${Number(amount).toFixed(2)}`;
    
    const handleDateSelect = (date) => {
        const postcodePrefix = formData.postcode.split(' ')[0].toUpperCase();
        const isFridayOnly = specialPostcodeRules && 
                             Array.isArray(specialPostcodeRules.fridayOnly) && 
                             specialPostcodeRules.fridayOnly.some(pc => postcodePrefix.startsWith(pc));
        const dateValue = formatDateForStorage(date);
        if (isFridayOnly) {
            if (date.getDay() !== 5) { 
                setValidationErrors(prev => ({ ...prev, date: 'Selected date is not a Friday for this area.' }));
                return;
            }
        }
        setFormData(prev => ({ ...prev, selectedDate: dateValue, isAsapRequested: false }));
        setValidationErrors(prev => ({ ...prev, date: '' }));
        if (continueError === 'Please select an available date or request ASAP booking.') {
            setContinueError('');
        }
    };

    const handleAsapRequestToggle = () => {
        const turnAsapOn = !formData.isAsapRequested;
        if (formData.postcode.trim().length >= 2 && postcodeError === '' && availableDates.length === 0 && !isLoadingDates) {
             setFormData(prev => ({ ...prev, isAsapRequested: turnAsapOn, selectedDate: turnAsapOn ? 'ASAP_REQUESTED' : '' }));
            setDateSelectionError(''); setContinueError('');
        } else if (availableDates.length > 0 || (formData.postcode.trim().length >=2 && postcodeError === '' && !isLoadingDates) ) {
             setFormData(prev => ({ ...prev, isAsapRequested: turnAsapOn, selectedDate: turnAsapOn ? 'ASAP_REQUESTED' : '' }));
            setDateSelectionError(''); setContinueError('');
        } else {
            setPostcodeError('Please enter a valid postcode for an area we cover to request ASAP booking.');
        }
    };

    const validateContactDetails = () => {
        const errors = {};
        if (!formData.firstName.trim()) errors.firstName = 'First name is required.';
        if (!formData.lastName.trim()) errors.lastName = 'Last name is required.';
        if (!formData.email.trim()) { errors.email = 'Email is required.'; } 
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { errors.email = 'Please enter a valid email address.';}
        if (!formData.mobile.trim()) { errors.mobile = 'Mobile number is required.'; } 
        else if (!/^\+?[0-9\s-]{10,15}$/.test(formData.mobile)) { errors.mobile = 'Please enter a valid mobile number.';}
        if (!formData.address.trim()) errors.address = 'Address is required.';
        if (!formData.postcode.trim()) errors.postcode = 'Postcode is required.';
        setContactValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleContinueToReview = () => {
        const contactValid = validateContactDetails();
        const dateValid = formData.selectedDate || formData.isAsapRequested || isSpecialQuoteScenario();
        if (!contactValid) { setContinueError('Please fill in all required contact details marked with *.'); return; }
        if (!dateValid) {
            let specificDateErr = 'Please select an available date or request ASAP booking.';
            if (postcodeError) { specificDateErr = `Please resolve the postcode issue (${postcodeError}) and then select a date or choose ASAP.`; }
            setDateSelectionError(specificDateErr); setContinueError(specificDateErr); return;
        }
        setContinueError(''); setDateSelectionError(''); setCurrentStep(4); 
    };

    const handleSubmitBooking = (e) => {
        e.preventDefault();
        if (!recaptchaToken) { setReCaptchaError('Please complete the reCAPTCHA validation.'); return; }
        setReCaptchaError(''); 
        setIsSubmitting(true); setSubmissionError('');
        const forQuoteOnly = isSpecialQuoteScenario();
        const getAnnualValue = (price, freq) => {
          if (!price || !freq) return '';
          if (freq === '4-weekly') return `£${(price * 13).toFixed(2)}`;
          if (freq === '8-weekly') return `£${(price * 6).toFixed(2)}`;
          if (freq === '12-weekly') return `£${(price * 4).toFixed(2)}`;
          if (freq === '6-monthly') return `£${(price * 2).toFixed(2)}`;
          if (freq === '12-monthly' || freq === 'annually') return `£${(price * 1).toFixed(2)}`;
          if (freq === '24-monthly') return `£${(price / 2).toFixed(2)}`;
          if (freq === 'adhoc') return 'Adhoc';
          return '';
        };
        const isBespokeOrCommercial = ( formData.numBedrooms === '6+' || formData.propertyStyle === 'commercial' || formData.propertyStyle === 'other' ) ? 'Yes' : 'No';
        const emailVars = {
          numBedrooms: formData.numBedrooms, propertyStyle: formData.propertyStyle,
          hasExtension: formData.hasExtension ? 'Yes' : 'No', hasConservatory: formData.hasConservatory ? 'Yes' : 'No',
          firstName: formData.firstName, lastName: formData.lastName, email: formData.email, mobile: formData.mobile,
          address: formData.address, postcode: formData.postcode,
          window: formData.services.window ? 'Yes' : 'No', gutter: formData.services.gutter ? 'Yes' : 'No',
          fascia: formData.services.fascia ? 'Yes' : 'No', solarPanels: formData.services.solarPanels ? 'Yes' : 'No',
          conservatoryRoof: formData.hasConservatory && formData.services.conservatoryRoof ? 'Yes' : 'No',
          windowFrequency: formData.windowFrequency || '', gutterFrequency: formData.gutterFrequency || '', fasciaFrequency: formData.fasciaFrequency || '',
          solarPanelFrequency: formData.solarPanelFrequency || '', conservatoryRoofFrequency: formData.conservatoryRoofFrequency || '',
          windowPrice: forQuoteOnly ? 'Quote Requested' : (calculatedPrices.window || ''), gutterPrice: forQuoteOnly ? 'Quote Requested' : (calculatedPrices.gutter || ''),
          fasciaPrice: forQuoteOnly ? 'Quote Requested' : (calculatedPrices.fascia || ''), solarPanelPrice: forQuoteOnly ? 'Quote Requested' : (calculatedPrices.solarPanels || ''),
          conservatoryRoofPrice: forQuoteOnly ? 'Quote Requested' : (calculatedPrices.conservatoryRoof || ''),
          windowAnnual: forQuoteOnly ? 'Quote Requested' : getAnnualValue(calculatedPrices.window, formData.windowFrequency),
          gutterAnnual: forQuoteOnly ? 'Quote Requested' : getAnnualValue(calculatedPrices.gutter, formData.gutterFrequency),
          fasciaAnnual: forQuoteOnly ? 'Quote Requested' : getAnnualValue(calculatedPrices.fascia, formData.fasciaFrequency),
          solarPanelAnnual: forQuoteOnly ? 'Quote Requested' : getAnnualValue(calculatedPrices.solarPanels, formData.solarPanelFrequency),
          conservatoryRoofAnnual: forQuoteOnly ? 'Quote Requested' : 'Adhoc',
          selectedDate: forQuoteOnly ? 'N/A - Quote Request' : formData.selectedDate,
          isAsapRequested: forQuoteOnly ? 'N/A - Quote Request' : (formData.isAsapRequested ? 'Yes' : 'No'),
          total: forQuoteOnly ? 'Quote Requested' : (calculatedPrices.total || ''), discount: forQuoteOnly ? 'Quote Requested' : (calculatedPrices.discount || ''),
          isBespokeOrCommercial: forQuoteOnly ? 'Yes - Quote Request' : isBespokeOrCommercial,
          services: JSON.stringify(formData.services), specialInstructions: formData.specialInstructions || '',
          'g-recaptcha-response': recaptchaToken, formType: forQuoteOnly ? 'Bespoke Quote Request' : 'Standard Booking Enquiry',
          emailSubject: 'New Customer Booking',
        };
        emailjs.send( process.env.REACT_APP_EMAILJS_SERVICE_ID, process.env.REACT_APP_EMAILJS_TEMPLATE_ID, emailVars, process.env.REACT_APP_EMAILJS_PUBLIC_KEY )
        .then((result) => {
            console.log('EmailJS success:', result.text);
            setLastBookingDetailsForConfirmation(formData); 
            setAppView('bookingConfirmation'); 
        }, (error) => {
            console.error('EmailJS error:', error);
            setSubmissionError('There was an error sending your booking. Please check your details or contact us directly.'); 
        })
        .finally(() => { setIsSubmitting(false); });
    };

    const handleMakeAnotherEnquiry = () => {
        setFormData(JSON.parse(JSON.stringify(initialFormData))); setCurrentStep(1); setAvailableDates([]);
        setPostcodeError(''); setDateSelectionError(''); setRecaptchaToken(''); setReCaptchaError('');
        if (recaptchaRef.current) { recaptchaRef.current.reset(); }
    };

    const handleAdminLogin = (e) => {
        e.preventDefault();
        if (adminPassword === process.env.REACT_APP_ADMIN_PASSWORD) { // Use env var for admin password
            setAppView('adminDashboard'); setAdminPassword(''); setAdminLoginError('');
        } else { setAdminLoginError('Incorrect password.'); }
    };
    
    const handleUpdateBookingStatus = (bookingId, statusField, newValue) => { console.log(`Updating booking ${bookingId}, ${statusField} to ${newValue}`); };
    const handleToggleCompletedBookingExpand = (bookingId) => { setExpandedCompletedBookingId(prevId => prevId === bookingId ? null : bookingId); };
    const setLastBookingDetailsForConfirmation = (submittedData) => { setLastSubmittedBookingDetails(submittedData); };

    // --- RENDER CONTROL ---
    // Admin Login View
    if (appView === 'adminLogin') {
        return (
            <div className="max-w-md mx-auto mt-20 bg-natural-bg-light shadow-2xl rounded-3xl p-8 font-sans border border-natural-secondary">
                <div className="h-2 w-28 bg-natural-accent rounded-full mx-auto mb-10" />
                <h2 className="text-3xl font-bold text-natural-text text-center mb-8">Admin Login</h2>
                <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div>
                        <label htmlFor="adminPass" className="block text-sm font-medium text-natural-text">Password</label>
                        <input 
                            type="password" id="adminPass" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md border-natural-secondary shadow-sm focus:border-natural-primary focus:ring-natural-primary sm:text-sm p-3"
                            required
                        />
                    </div>
                    {adminLoginError && <p className="text-sm text-natural-error-dark text-center">{adminLoginError}</p>}
                    <button 
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-natural-primary hover:bg-natural-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-natural-primary transition-colors duration-150"
                    >
                        Login
                    </button>
                </form>
                <button onClick={() => setAppView('customerForm')} className="mt-8 text-sm text-natural-primary hover:text-natural-primary-hover text-center w-full">Back to Booking Form</button>
            </div>
        );
    }

    // Admin Dashboard View
    if (appView === 'adminDashboard') {
        return (
            <div className="max-w-4xl mx-auto mt-10 bg-natural-text-light shadow-2xl rounded-3xl p-8 font-sans"> {/* Using a darker bg for admin */}
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-4xl font-bold text-natural-bg-light">Admin Dashboard</h2>
                    <button 
                        onClick={() => setAppView('customerForm')} 
                        className="px-6 py-2 text-sm font-medium text-natural-bg-light bg-natural-accent hover:bg-natural-accent-hover rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-natural-accent ring-offset-natural-text-light transition-colors"
                    >
                        Back to Customer Form
                    </button>
                </div>
                {allBookings.length === 0 ? (
                    <p className="text-xl text-center py-20 text-natural-secondary-light">No bookings submitted yet.</p>
                ) : (
                    <div className="space-y-12">
                        {(() => {
                            const isBookingCompleted = (booking) => !!booking.adminStatus?.squeegeeRef && (booking.adminStatus?.customerConfirmed === 'Confirmed by Call' || booking.adminStatus?.customerConfirmed === 'Confirmed by Text');
                            const activeBookings = allBookings.filter(b => !isBookingCompleted(b)).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
                            const completedBookings = allBookings.filter(b => isBookingCompleted(b)).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
                            return (
                                <>
                                    <section>
                                        <h3 className="text-3xl font-semibold text-natural-accent mb-6 pb-2 border-b border-natural-secondary">Active Bookings ({activeBookings.length})</h3>
                                        {activeBookings.length > 0 ? (
                                            <div className="space-y-8">
                                                {activeBookings.map(booking => (
                                                    <AdminBookingCard key={booking.id} booking={booking} onUpdateStatus={handleUpdateBookingStatus} houseOptions={houseOptions} frequencyOptions={frequencyOptionsData} solarFrequencyOptions={solarFrequencyOptions} formatCurrency={formatCurrency} formatDateForDisplay={formatDateForDisplay} />
                                                ))}
                                            </div>
                                        ) : ( <p className="text-lg text-center py-10 text-natural-secondary-light">No active bookings.</p> )}
                                    </section>
                                    {completedBookings.length > 0 && (
                                        <section className="mt-16">
                                            <h3 className="text-3xl font-semibold text-natural-success mb-6 pb-2 border-b border-natural-secondary">Completed Bookings ({completedBookings.length})</h3>
                                            <div className="space-y-2">
                                                {completedBookings.map(booking => (
                                                    booking.id === expandedCompletedBookingId ? (
                                                        <AdminBookingCard key={booking.id} booking={booking} onUpdateStatus={handleUpdateBookingStatus} houseOptions={houseOptions} frequencyOptions={frequencyOptionsData} solarFrequencyOptions={solarFrequencyOptions} formatCurrency={formatCurrency} formatDateForDisplay={formatDateForDisplay} isCompletedView={true} />
                                                    ) : ( <CompactCompletedBookingLine key={booking.id} booking={booking} onToggleExpand={handleToggleCompletedBookingExpand} formatCurrency={formatCurrency} formatDateForDisplay={formatDateForDisplay} /> )
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                )}
            </div>
        );
    }
    
    // Booking Confirmation View
    if (appView === 'bookingConfirmation') {
        const showGoCardless = lastSubmittedBookingDetails?.isRecurring || (lastSubmittedBookingDetails?.windowFrequency && lastSubmittedBookingDetails.windowFrequency !== 'adhoc') || true; 
        const wasQuoteRequest = lastSubmittedBookingDetails?.numBedrooms === '6+' || lastSubmittedBookingDetails?.propertyStyle === 'commercial' || lastSubmittedBookingDetails?.propertyStyle === 'other';
        return (
            <div className="max-w-2xl mx-auto mt-12 mb-12 bg-natural-bg-light p-6 sm:p-10 rounded-2xl shadow-xl font-sans border-natural-secondary">
                <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-natural-success mb-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <h1 className="text-3xl sm:text-4xl font-bold text-natural-text mb-3">
                        {wasQuoteRequest ? 'Thank You For Your Enquiry!' : 'Thank You For Your Booking!'}
                    </h1>
                    <p className="text-natural-text-light text-sm sm:text-base mb-6">
                        {lastSubmittedBookingDetails?.firstName ? `Thanks, ${lastSubmittedBookingDetails.firstName}! ` : ''}
                        {wasQuoteRequest 
                            ? "We've received your enquiry details. We will be in touch via email shortly to discuss your requirements and provide a bespoke quotation."
                            : "We've received your booking details. Your appointment is provisionally scheduled. Thank you for choosing Somerset Window Cleaning!"
                        }
                    </p>
                     <p className="text-xs text-natural-text-light mb-10">
                        Please note: All prices quoted are based on standard property sizes and conditions. If your property requires significantly more work, we will notify you of any potential additional charges for your approval before commencing.
                    </p>
                </div>
                {showGoCardless && (
                    <div className="bg-gradient-to-br from-natural-secondary-light to-natural-primary/10 border border-natural-secondary rounded-xl p-6 sm:p-8 my-8 shadow-lg">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6 p-3 bg-natural-bg-light rounded-full shadow-md">
                                <svg className="w-10 h-10 text-natural-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
                            </div>
                            <div className="flex-grow">
                                <h2 className="text-xl sm:text-2xl font-semibold text-natural-primary mb-1.5">Make Payments Easy with Direct Debit</h2>
                                <p className="text-sm text-natural-text-light mb-4">
                                    For hassle-free payments for your regular cleaning services, set up a secure Direct Debit with GoCardless, our trusted payment partner. It's simple, secure, and means one less thing for you to worry about!
                                </p>
                            </div>
                             <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0">
                                <a 
                                    href="https://pay.gocardless.com/billing/static/collect-customer-details?id=BRF001Z09AYQNQ7HRK9HRF9J2BNPFJK8&initial=%2Fcollect-customer-details"
                                    target="_blank" rel="noopener noreferrer"
                                    className="inline-block bg-natural-primary hover:bg-natural-primary-hover text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 text-base transform hover:scale-105"
                                > Set Up Direct Debit </a>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-natural-primary/30 text-xs text-natural-text-light space-y-2">
                            <p className="font-semibold text-sm text-natural-primary text-center sm:text-left">Why Use Direct Debit?</p>
                            <ul className="list-disc list-outside pl-5 space-y-1 marker:text-natural-primary">
                                <li><span className="font-medium text-natural-text">Convenient:</span> Say goodbye to manual payments! We'll automatically collect payment after each clean.</li>
                                <li><span className="font-medium text-natural-text">Secure:</span> All payments are processed by GoCardless, an FCA authorised payment institution, and protected by the Direct Debit Guarantee.</li>
                                <li><span className="font-medium text-natural-text">Transparent:</span> You'll always receive an email notification before any payment is taken.</li>
                                <li><span className="font-medium text-natural-text">Flexible:</span> You're in control and can cancel your Direct Debit mandate at any time through your bank.</li>
                            </ul>
                            <p className="mt-4 text-center text-[0.7rem] text-natural-text-light">You are fully protected by the Direct Debit Guarantee.</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Original Customer Form Render (now wrapped in appView === 'customerForm')
    return appView === 'customerForm' ? (
        <div className="max-w-3xl mx-auto bg-natural-bg-light shadow-2xl rounded-3xl p-6 sm:p-8 font-sans border border-natural-secondary" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Step Indicator */}
            <div className="flex justify-center mb-12 text-xs sm:text-sm">
                 {stepTitles.map((title, idx) => {
                      const stepNumber = idx + 1;
                      const isActive = currentStep === stepNumber;
                      const isCompleted = currentStep > stepNumber;
                      const goToStep = (targetStep) => {
                          if (targetStep > currentStep && targetStep !== stepTitles.length) return; 
                          if (targetStep === currentStep && targetStep === stepTitles.length) return; 
                          if (targetStep === stepTitles.length && !isSpecialQuoteScenario() && !formData.selectedDate && !formData.isAsapRequested) { 
                              setDateSelectionError('Please select an available date or request ASAP booking.'); return;
                          }
                          setCurrentStep(targetStep);
                      }
                    return (
                        <div key={title} onClick={() => goToStep(stepNumber)}
                              className={`flex-1 text-center px-1 py-2 border-b-4 transition-all duration-200 font-semibold 
                                ${isActive ? 'border-natural-primary text-natural-primary bg-natural-secondary-light rounded-t-md shadow-inner' 
                                          : isCompleted ? 'border-natural-success text-natural-success hover:bg-natural-success/10 cursor-pointer' 
                                          : 'border-transparent text-natural-text-light hover:text-natural-primary'}
                                ${ (stepNumber > currentStep || (isActive && stepNumber === stepTitles.length)) ? 'cursor-default hover:bg-transparent hover:text-natural-text-light' : 'cursor-pointer' }`}
                        >
                              <span>{stepNumber}. {title}</span>
                        </div>
                    );
                })}
            </div>

            {/* Step 1: Property Details */}
            {currentStep === 1 && (
                <section>
                    <h2 className="text-2xl sm:text-3xl font-bold text-natural-text text-center mb-8">1. Tell us about your property</h2>
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-natural-text mb-3">What type of property is it? *</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {propertyStyleOptions.map(option => (
                                    <button key={option.value} type="button"
                                        onClick={() => { handlePropertyDetailChange('propertyStyle', option.value); if (option.value === 'commercial') { handlePropertyDetailChange('numBedrooms', ''); handlePropertyDetailChange('commercialPropertyType', '');}}}
                                        className={`p-3 border rounded-lg text-center text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-natural-primary
                                            ${formData.propertyStyle === option.value ? 'bg-natural-primary text-white border-natural-primary shadow-md' : 'bg-natural-bg-light hover:bg-natural-secondary-light border-natural-secondary text-natural-text'}`}
                                    > {option.label} </button>
                                ))}
                            </div>
                        </div>
                        {formData.propertyStyle === 'commercial' && (
                            <div>
                                <h3 className="text-lg font-semibold text-natural-text mb-3">What type of commercial property? *</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {commercialPropertyTypes.map(option => (
                                        <button key={option.value} type="button" onClick={() => handlePropertyDetailChange('commercialPropertyType', option.value)}
                                            className={`p-3 border rounded-lg text-center text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-natural-primary
                                                ${formData.commercialPropertyType === option.value ? 'bg-natural-primary text-white border-natural-primary shadow-md' : 'bg-natural-bg-light hover:bg-natural-secondary-light border-natural-secondary text-natural-text'}`}
                                        > {option.label} </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {formData.propertyStyle !== 'commercial' && (
                            <div>
                                <h3 className="text-lg font-semibold text-natural-text mb-3">Number of Bedrooms? *</h3>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {bedroomOptions.map(option => (
                                        <button key={option.value} type="button" onClick={() => handlePropertyDetailChange('numBedrooms', option.value)}
                                            className={`p-3 border rounded-lg text-center text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-natural-primary
                                                ${formData.numBedrooms === option.value ? 'bg-natural-primary text-white border-natural-primary shadow-md' : 'bg-natural-bg-light hover:bg-natural-secondary-light border-natural-secondary text-natural-text'}`}
                                        > {option.label} </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {formData.propertyStyle !== 'commercial' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-natural-secondary">
                                <div>
                                    <h3 className="text-lg font-semibold text-natural-text mb-3">Does it have an extension?</h3>
                                    <div className="flex space-x-3">
                                        <button type="button" onClick={() => handlePropertyDetailChange('hasExtension', true)} className={`flex-1 p-3 border rounded-lg text-center ${formData.hasExtension === true ? 'bg-natural-primary text-white' : 'bg-natural-bg-light hover:bg-natural-secondary-light border-natural-secondary text-natural-text'}`}>Yes</button>
                                        <button type="button" onClick={() => handlePropertyDetailChange('hasExtension', false)} className={`flex-1 p-3 border rounded-lg text-center ${formData.hasExtension === false ? 'bg-natural-primary text-white' : 'bg-natural-bg-light hover:bg-natural-secondary-light border-natural-secondary text-natural-text'}`}>No</button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-natural-text mb-3">Does it have a conservatory?</h3>
                                    <div className="flex space-x-3">
                                        <button type="button" onClick={() => handlePropertyDetailChange('hasConservatory', true)} className={`flex-1 p-3 border rounded-lg text-center ${formData.hasConservatory === true ? 'bg-natural-primary text-white' : 'bg-natural-bg-light hover:bg-natural-secondary-light border-natural-secondary text-natural-text'}`}>Yes</button>
                                        <button type="button" onClick={() => handlePropertyDetailChange('hasConservatory', false)} className={`flex-1 p-3 border rounded-lg text-center ${formData.hasConservatory === false ? 'bg-natural-primary text-white' : 'bg-natural-bg-light hover:bg-natural-secondary-light border-natural-secondary text-natural-text'}`}>No</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end mt-10">
                        <button type="button" 
                            disabled={ !formData.propertyStyle || (formData.propertyStyle !== 'commercial' && !formData.numBedrooms) || (formData.propertyStyle === 'commercial' && !formData.commercialPropertyType) }
                            onClick={() => setCurrentStep(2)}
                            className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 text-white
                                ${(!formData.propertyStyle || (formData.propertyStyle !== 'commercial' && !formData.numBedrooms) || (formData.propertyStyle === 'commercial' && !formData.commercialPropertyType)) 
                                    ? 'bg-natural-text-light/50 cursor-not-allowed' : 'bg-natural-primary hover:bg-natural-primary-hover'}`}
                        > Continue to Select Services </button>
                    </div>
                </section>
            )}

            {/* Step 2: Services */}
            {currentStep === 2 && (
                isSpecialQuoteScenario() ? (
                    <section>
                        <h2 className="text-2xl sm:text-3xl font-bold text-natural-text text-center mb-6 sm:mb-8">2. Services for Quotation</h2>
                        <p className="text-center text-natural-text-light mb-8 text-sm"> Please select the services you are interested in receiving a quote for. We will contact you to discuss details and provide a tailored price. </p>
                        <div className="space-y-5 sm:space-y-6">
                            <QuoteServiceCard title="Window Cleaning" selected={formData.services.window} onToggle={() => toggleService('window')} >
                                <div className="mt-3 mb-1">
                                    <span className="text-sm font-medium text-natural-text-light block mb-2">Preferred Frequency (optional):</span>
                                    <div className="flex flex-wrap gap-2">
                                        {frequencyOptionsData.map(freq => (
                                            <button key={freq.value} type="button" onClick={(e) => { e.stopPropagation(); handleFrequencyChange(freq.value); }}
                                                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-150 shadow-sm
                                                    ${formData.windowFrequency === freq.value && formData.services.window ? 'bg-natural-primary text-white border-natural-primary' : 'bg-natural-bg-light text-natural-text border-natural-secondary hover:bg-natural-secondary-light hover:border-natural-primary'}`}
                                            >{freq.label}</button>
                                        ))}
                                    </div>
                                </div>
                            </QuoteServiceCard>
                            <QuoteServiceCard title="Gutter Clearing" selected={formData.services.gutter} onToggle={() => toggleService('gutter')} note="Clears debris from *inside* your gutters." />
                            <QuoteServiceCard title="Fascia & Soffit Cleaning" selected={formData.services.fascia} onToggle={() => toggleService('fascia')} note="Cleans the *external* surfaces of your gutters, fascias, and soffits." />
                            {formData.hasConservatory && (
                                <QuoteServiceCard title="Conservatory Roof Cleaning" selected={formData.services.conservatoryRoof} onToggle={() => toggleService('conservatoryRoof')}>
                                    <div className="mt-3">
                                        <label htmlFor="conservatoryRoofPanelsQuote" className="block text-sm font-medium text-natural-text-light">Approx. Number of Roof Panels (optional): <span className="font-semibold text-natural-primary">{formData.conservatoryRoofPanels}</span></label>
                                        <input type="range" id="conservatoryRoofPanelsQuote" name="conservatoryRoofPanels" min="1" max="30" value={formData.conservatoryRoofPanels} onChange={handleInputChange} className="w-full h-2 bg-natural-secondary rounded-lg appearance-none cursor-pointer mt-1 range-thumb-natural-primary" />
                                        <div className="flex justify-between text-xs text-natural-text-light px-1"><span>1</span><span>30</span></div>
                                    </div>
                                </QuoteServiceCard>
                            )}
                            <QuoteServiceCard title="Solar Panel Cleaning" selected={formData.services.solarPanels} onToggle={() => toggleService('solarPanels')} note="Maintain efficiency with regular cleaning.">
                                <div className="mt-3">
                                    <label htmlFor="solarPanelCountQuote" className="block text-sm font-medium text-natural-text-light">Approx. Number of Panels (optional): <span className="font-semibold text-natural-primary">{formData.solarPanelCount}</span></label>
                                    <input type="range" id="solarPanelCountQuote" name="solarPanelCount" min="1" max="40" value={formData.solarPanelCount} onChange={handleInputChange} className="w-full h-2 bg-natural-secondary rounded-lg appearance-none cursor-pointer mt-1 range-thumb-natural-primary" />
                                    <div className="flex justify-between text-xs text-natural-text-light px-1"><span>1</span><span>40</span></div>
                                </div>
                            </QuoteServiceCard>
                        </div>
                        <div className="flex justify-between items-center pt-6 border-t border-natural-secondary mt-8">
                            <button type="button" onClick={() => setCurrentStep(1)} className="px-6 py-2 text-sm font-medium text-natural-text bg-natural-secondary hover:bg-natural-secondary-light border border-natural-secondary rounded-md shadow-sm">Back</button>
                            <button type="button" onClick={() => setCurrentStep(3)} className={`px-8 py-3 text-white font-semibold rounded-lg shadow-md transition-colors text-base bg-natural-primary hover:bg-natural-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-natural-primary`}> Continue to Contact Details </button>
                        </div>
                    </section>
                ) : (
                    <section> 
                        <h2 className="text-2xl sm:text-3xl font-bold text-natural-text text-center mb-6 sm:mb-8">2. Build Your Clean</h2>
                        <div className="space-y-5 sm:space-y-6">
                            <ServiceCard title="Window Cleaning" price={calculatedPrices.window} selected={formData.services.window} onToggle={() => toggleService('window')} formatCurrency={formatCurrency} isFullyDiscounted={calculatedPrices.discount > 0 && calculatedPrices.discount === calculatedPrices.window}>
                                <div className="mt-3 mb-1">
                                    <span className="text-sm font-medium text-natural-text-light block mb-2">Frequency:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {frequencyOptionsData.map(freq => {
                                            let label = freq.label;
                                            if (freq.value === 'adhoc' && dynamicAdhocAdd > 0 && !isSpecialQuoteScenario()) { label = `One-off (+£${dynamicAdhocAdd.toFixed(0)})`; } 
                                            else if (freq.value === 'adhoc') { label = 'One-off'; }
                                            return ( <button key={freq.value} type="button" onClick={(e) => { e.stopPropagation(); handleFrequencyChange(freq.value); }}
                                                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-150 shadow-sm
                                                    ${formData.services.window && formData.windowFrequency === freq.value ? 'bg-natural-primary text-white border-natural-primary' : 'bg-natural-bg-light text-natural-text border-natural-secondary hover:bg-natural-secondary-light hover:border-natural-primary'}`}
                                            >{label}</button> );
                                        })}
                                    </div>
                                </div>
                            </ServiceCard>
                            <div className={`p-4 my-2 border-l-4 rounded-r-lg shadow transition-colors duration-300 ${formData.services.gutter && formData.services.fascia ? 'bg-natural-success/20 border-natural-success' : 'bg-natural-accent/20 border-natural-accent'}`}>
                                <p className={`text-sm sm:text-base ${formData.services.gutter && formData.services.fascia ? 'text-natural-success-dark' : 'text-natural-accent-dark'}`}> 🎁 <span className="font-semibold">Special Offer:</span> Select Gutter Clearing & Fascia Cleaning and get regular Window Cleaning <span className="font-bold">FREE!</span> (Excludes One-off cleans). </p>
                            </div>
                            <ServiceCard title="Gutter Clearing" price={calculatedPrices.gutter} selected={formData.services.gutter} onToggle={() => toggleService('gutter')} formatCurrency={formatCurrency} note="Clears debris from *inside* your gutters to ensure proper water flow and prevent blockages.">
                               <div className="mt-3">
                                    <span className="text-sm font-medium text-natural-text-light block mb-1.5">Frequency:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {gutterFasciaFrequencyOptions.map(freq => ( <button key={freq.value} type="button" onClick={(e) => { e.stopPropagation(); handleGutterFrequencyChange(freq.value);}}
                                                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-150 shadow-sm
                                                    ${formData.services.gutter && formData.gutterFrequency === freq.value ? 'bg-natural-primary text-white border-natural-primary' : 'bg-natural-bg-light text-natural-text border-natural-secondary hover:bg-natural-secondary-light hover:border-natural-primary'}`}
                                            >{freq.label}</button>
                                        ))}
                                    </div>
                                </div>
                            </ServiceCard>
                            <ServiceCard title="Fascia & Soffit Cleaning" price={calculatedPrices.fascia} selected={formData.services.fascia} onToggle={() => toggleService('fascia')} formatCurrency={formatCurrency} note="Cleans the *external* surfaces of your gutters, fascias, and soffits – the parts visible from the ground – restoring their appearance.">
                                <div className="mt-3">
                                    <span className="text-sm font-medium text-natural-text-light block mb-1.5">Frequency:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {gutterFasciaFrequencyOptions.map(freq => ( <button key={freq.value} type="button" onClick={(e) => { e.stopPropagation(); handleFasciaFrequencyChange(freq.value);}}
                                                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-150 shadow-sm
                                                    ${formData.services.fascia && formData.fasciaFrequency === freq.value ? 'bg-natural-primary text-white border-natural-primary' : 'bg-natural-bg-light text-natural-text border-natural-secondary hover:bg-natural-secondary-light hover:border-natural-primary'}`}
                                            >{freq.label}</button>
                                        ))}
                                    </div>
                                </div>
                            </ServiceCard>
                            {formData.hasConservatory && (
                                <ServiceCard title="Conservatory Roof Cleaning" price={calculatedPrices.conservatoryRoof} selected={formData.services.conservatoryRoof} onToggle={() => toggleService('conservatoryRoof')} formatCurrency={formatCurrency} >
                                    <div className="mt-3">
                                        <label htmlFor="conservatoryRoofPanels" className="block text-sm font-medium text-natural-text-light">Number of Roof Panels: <span className="font-semibold text-natural-primary">{formData.conservatoryRoofPanels}</span></label>
                                        <input type="range" id="conservatoryRoofPanels" name="conservatoryRoofPanels" min="1" max="30" value={formData.conservatoryRoofPanels} onChange={handleInputChange} onClick={(e) => e.stopPropagation()} className="w-full h-2 bg-natural-secondary rounded-lg appearance-none cursor-pointer mt-1 range-thumb-natural-primary" />
                                        <div className="flex justify-between text-xs text-natural-text-light px-1"><span>1</span><span>30</span></div>
                                    </div>
                                    <div className="mt-3">
                                        <span className="text-sm font-medium text-natural-text-light block mb-1.5">Frequency:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {conservatoryRoofFrequencyOptions.map(freq => ( <button key={freq.value} type="button" onClick={(e) => { e.stopPropagation(); handleConservatoryRoofFrequencyChange(freq.value);}}
                                                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-150 shadow-sm
                                                        ${formData.services.conservatoryRoof && formData.conservatoryRoofFrequency === freq.value ? 'bg-natural-primary text-white border-natural-primary' : 'bg-natural-bg-light text-natural-text border-natural-secondary hover:bg-natural-secondary-light hover:border-natural-primary'}`}
                                                >{freq.label}</button>
                                            ))}
                                        </div>
                                    </div>
                                </ServiceCard>
                            )}
                            <ServiceCard title="Solar Panel Cleaning" price={calculatedPrices.solarPanels} selected={formData.services.solarPanels} onToggle={() => toggleService('solarPanels')} formatCurrency={formatCurrency} note="Maintain efficiency with regular cleaning.">
                               <div className="space-y-4 mt-3"> 
                                    <div>
                                        <label htmlFor="solarPanelCount" className="block text-sm font-medium text-natural-text-light">Number of Panels: <span className="font-semibold text-natural-primary">{formData.solarPanelCount}</span></label>
                                        <input type="range" id="solarPanelCount" name="solarPanelCount" min="1" max="40" value={formData.solarPanelCount} onChange={handleInputChange} onClick={(e) => e.stopPropagation()} className="w-full h-2 bg-natural-secondary rounded-lg appearance-none cursor-pointer mt-1 range-thumb-natural-primary" />
                                        <div className="flex justify-between text-xs text-natural-text-light px-1"><span>1</span><span>40</span></div>
                                    </div>
                                    <div>
                                         <label htmlFor="solarPanelFrequency" className="block text-sm font-medium text-natural-text-light mb-1.5">Frequency:</label>
                                         <div className="flex flex-wrap gap-2">
                                            {solarFrequencyOptions.map(opt => ( <button key={opt.value} type="button" onClick={(e) => { e.stopPropagation(); handleSolarPanelFrequencyChange(opt.value);}}
                                                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-150 shadow-sm
                                                        ${formData.services.solarPanels && formData.solarPanelFrequency === opt.value ? 'bg-natural-primary text-white border-natural-primary' : 'bg-natural-bg-light text-natural-text border-natural-secondary hover:bg-natural-secondary-light hover:border-natural-primary'}`}
                                                >{opt.label}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                 <div className="mt-3 p-3 bg-natural-secondary-light border border-natural-secondary rounded-lg text-xs text-natural-primary">
                                     <p className="font-medium">Access Note:</p>
                                     <p className="mt-1">If lift access or other specialised equipment is required to safely reach your solar panels, any additional hire costs will be quoted and charged separately after discussion.</p>
                                 </div>
                            </ServiceCard>
                        </div>
                         <div className="flex justify-between items-center pt-6 border-t border-natural-secondary mt-8">
                             <button type="button" onClick={() => setCurrentStep(1)} className="px-6 py-2 text-sm font-medium text-natural-text bg-natural-secondary hover:bg-natural-secondary-light border-natural-secondary rounded-md shadow-sm">Back</button>
                             <button type="button" disabled={!(formData.services.window || formData.services.gutter || formData.services.fascia || formData.services.conservatoryRoof || formData.services.solarPanels)}
                                 onClick={() => setCurrentStep(3)} 
                                 className={`px-8 py-3 text-white font-semibold rounded-lg shadow-md transition-colors text-base 
                                     ${!(formData.services.window || formData.services.gutter || formData.services.fascia || formData.services.conservatoryRoof || formData.services.solarPanels) ? 'bg-natural-text-light/50 cursor-not-allowed' : 'bg-natural-primary hover:bg-natural-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-natural-primary'}`}
                             > Continue to Contact Details </button>
                        </div>
                    </section>
                )
            )}
            
            {/* Step 3: Contact & Date Selection */}
            {currentStep === 3 && (
                    <section>
                        <h2 className="text-2xl sm:text-3xl font-bold text-natural-text text-center mb-6 sm:mb-8">3. Contact Details</h2>
                        <form className="space-y-4 sm:space-y-5" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} required error={contactValidationErrors.firstName} />
                                <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} required error={contactValidationErrors.lastName} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} required error={contactValidationErrors.email} />
                                <InputField label="Mobile Number" name="mobile" type="tel" value={formData.mobile} onChange={handleInputChange} required error={contactValidationErrors.mobile} />
                            </div>
                            <InputField label="Full Address" name="address" type="textarea" value={formData.address} onChange={handleInputChange} required error={contactValidationErrors.address} />
                            <div className="space-y-4">
                                <InputField label="Postcode" name="postcode" value={formData.postcode} onChange={handleInputChange} required error={contactValidationErrors.postcode} />
                                {!isSpecialQuoteScenario() && (
                                    <div id="date-selection-area" className="mt-4">
                                        <label className="block text-sm font-medium text-natural-text mb-2">Select Available Date for First Clean *</label>
                                        <div className="mt-2">
                                            {formData.postcode.trim().length < 2 ? ( <p className="text-sm text-natural-text-light p-3 border rounded-md bg-natural-secondary-light">Please enter your postcode above to see available dates.</p> ) 
                                            : isLoadingDates ? ( <div className="flex justify-center items-center p-4 border rounded-md bg-natural-secondary-light text-natural-text-light"> <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-natural-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> <span>Calculating available dates...</span> </div> ) 
                                            : postcodeError ? ( <p className="text-sm text-natural-error-dark p-3 border border-natural-error rounded-md bg-natural-error/10">{postcodeError}</p> ) 
                                            : availableDates.length > 0 ? (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                                    {(() => {
                                                        const uniqueDates = []; const seen = new Set(); const postcodePrefix = formData.postcode.split(' ')[0].toUpperCase();
                                                        const isCurrentlyFridayOnlyArea = specialPostcodeRules && Array.isArray(specialPostcodeRules.fridayOnly) && specialPostcodeRules.fridayOnly.some(pc => postcodePrefix.startsWith(pc));
                                                        availableDates.filter(date => { const dateObj = (date instanceof Date) ? date : getNextOccurrence(date); if (!dateObj) return false; if (isCurrentlyFridayOnlyArea && dateObj.getDay() !== 5) { return false; } const today = new Date(); today.setHours(0, 0, 0, 0); const sixWeeksFromNow = new Date(today); sixWeeksFromNow.setDate(today.getDate() + 42); return dateObj >= today && dateObj <= sixWeeksFromNow; }).forEach(date => { const dateObj = (date instanceof Date) ? date : getNextOccurrence(date); if (!dateObj) return; const time = dateObj.getTime(); if (!seen.has(time)) { seen.add(time); uniqueDates.push(dateObj); } });
                                                        uniqueDates.sort((a, b) => a - b); 
                                                        if (uniqueDates.length === 0 && isCurrentlyFridayOnlyArea) { return <p className="text-sm text-center col-span-full text-natural-error-dark p-3 border border-natural-error rounded-md bg-natural-error/10">No Fridays available in the next 6 weeks for this area. This area is only serviced on Fridays.</p>; } 
                                                        else if (uniqueDates.length === 0) { return <p className="text-sm text-center col-span-full text-natural-text-light p-3 border rounded-md bg-natural-secondary-light">No available dates in the next 6 weeks for this postcode.</p>; }
                                                        return uniqueDates.map(dateObj => { const dateValue = formatDateForStorage(dateObj); const isSelected = formData.selectedDate === dateValue;
                                                            return ( <button type="button" key={dateValue} onClick={() => handleDateSelect(dateObj)}
                                                                    className={`w-full text-center px-4 py-2 rounded border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-natural-primary ${ isSelected ? 'bg-natural-primary text-white border-natural-primary' : 'bg-natural-bg-light text-natural-text border-natural-secondary hover:bg-natural-secondary-light' }`}
                                                                    aria-pressed={isSelected} > {formatDateForDisplay(dateObj)} </button> );
                                                        });
                                                    })()}
                                                </div>
                                            ) : ( <p className="text-natural-text-light">No available dates found for this postcode.</p> )}
                                        </div>
                                        {dateSelectionError && <p className="mt-2 text-sm text-natural-error-dark text-center">{dateSelectionError}</p>}
                                        <div className="mt-6 pt-6 border-t border-natural-secondary text-center"> 
                                            <p className="text-sm text-natural-text-light mb-3">Can't find a suitable date or need it sooner?</p>
                                            <button type="button" onClick={handleAsapRequestToggle} disabled={formData.postcode.trim().length < 2 || postcodeError !== '' || isLoadingDates}
                                                className={`px-4 py-2 rounded-lg font-semibold border transition-colors duration-150 ${ formData.isAsapRequested ? 'bg-natural-success text-white border-natural-success-dark' : 'bg-natural-secondary hover:bg-natural-secondary-light text-natural-text border-natural-secondary' } ${(formData.postcode.trim().length < 2 || (postcodeError !== '' && availableDates.length === 0) || isLoadingDates) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            > {formData.isAsapRequested ? 'ASAP Requested' : 'Request ASAP Booking'} </button>
                                            {(postcodeError !== '') && ( <p className="mt-2 text-xs text-natural-error-dark">Please enter a valid postcode for a covered area first.</p> )}
                                            {formData.isAsapRequested && ( <p className="mt-2 text-xs text-natural-text-light"> We'll do our best to fit you in sooner if possible and will contact you to arrange. </p> )}
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-6 border-t border-natural-secondary mt-8">
                                    <button type="button" onClick={() => setCurrentStep(isSpecialQuoteScenario() ? 1 : 2)} className="px-6 py-2 text-sm font-medium text-natural-text bg-natural-secondary hover:bg-natural-secondary-light border-natural-secondary rounded-md shadow-sm" > Back </button>
                                    <button type="button" onClick={handleContinueToReview} 
                                        disabled={ !formData.firstName || !formData.lastName || !formData.email || !formData.mobile || !formData.address || !formData.postcode || (!formData.selectedDate && !formData.isAsapRequested && !isSpecialQuoteScenario()) } 
                                        className={`px-8 py-3 text-white font-semibold rounded-lg shadow-md transition-colors text-base bg-natural-primary hover:bg-natural-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-natural-primary ${ (!formData.firstName || !formData.lastName || !formData.email || !formData.mobile || !formData.address || !formData.postcode || (!formData.selectedDate && !formData.isAsapRequested && !isSpecialQuoteScenario())) ? 'opacity-50 cursor-not-allowed bg-natural-text-light/50' : '' }`}
                                    > Continue to Review </button>
                                </div>
                                {continueError && ( <p className="mt-3 text-sm text-natural-error-dark text-center p-2 bg-natural-error/10 border border-natural-error rounded-md"> {continueError} </p> )}
                            </div>
                        </form>
                    </section>
                )}
            
            {/* Step 4: Review */}
            {currentStep === 4 && (
                    <section> 
                        <h2 className="text-2xl sm:text-3xl font-bold text-natural-text text-center mb-8 sm:mb-10">4. Review & Confirm Your Booking</h2>
                        <div className="space-y-6 bg-natural-secondary-light p-4 sm:p-6 rounded-xl border border-natural-secondary shadow">
                            <ReviewSection title="Property Details">
                                <ReviewItem label="Property Style" value={propertyStyleOptions.find(o => o.value === formData.propertyStyle)?.label || formData.propertyStyle} />
                                {formData.propertyStyle !== 'commercial' && ( <ReviewItem label="Bedrooms" value={formData.numBedrooms} /> )}
                                <ReviewItem label="Extension" value={formData.hasExtension ? 'Yes' : 'No'} />
                                <ReviewItem label="Conservatory" value={formData.hasConservatory ? 'Yes' : 'No'} />
                            </ReviewSection>
                            <ReviewSection title={isSpecialQuoteScenario() ? "Services Requested for Quotation" : "Selected Services & Price Breakdown"}>
                              {Object.entries(formData.services).filter(([key, val]) => val).length === 0 ? ( <span className="text-natural-text-light">No services selected.</span> ) : (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-sm border-separate border-spacing-y-2">
                                    <thead> <tr className="text-left text-natural-text border-b border-natural-secondary"> <th className="pr-4 pb-2">Service</th> {!isSpecialQuoteScenario() && ( <> <th className="pr-4 pb-2">Details</th> <th className="pr-4 pb-2 text-right">Price</th> </> )} </tr> </thead>
                                    <tbody>
                                      {formData.services.window && ( <tr className="bg-natural-bg-light rounded-lg shadow-sm"> <td className="p-3 pr-4 font-semibold text-natural-primary">{isSpecialQuoteScenario() ? "Window Cleaning" : "Window Cleaning"}</td> {!isSpecialQuoteScenario() && ( <> <td className="p-3 pr-4 text-natural-text"> {frequencyOptionsData.find(f=>f.value===formData.windowFrequency)?.label || formData.windowFrequency} <div className="text-xs text-natural-text-light">All external glass, frames, and sills cleaned.</div> </td> <td className="p-3 pr-4 text-right font-medium text-natural-text">{calculatedPrices.discount > 0 && calculatedPrices.discount === calculatedPrices.window ? <span className="text-natural-success-dark">FREE</span> : formatCurrency(calculatedPrices.window)}</td> </> )} </tr> )}
                                      {formData.services.gutter && ( <tr className="bg-natural-bg-light rounded-lg shadow-sm"> <td className="p-3 pr-4 font-semibold text-natural-primary">Internal Gutter Clear</td> {!isSpecialQuoteScenario() && ( <> <td className="p-3 pr-4 text-natural-text"> {gutterFasciaFrequencyOptions.find(f=>f.value===formData.gutterFrequency)?.label || formData.gutterFrequency} <div className="text-xs text-natural-text-light">Removal of debris from inside gutters to prevent blockages.</div> </td> <td className="p-3 pr-4 text-right font-medium text-natural-text">{formatCurrency(calculatedPrices.gutter)}</td> </> )} </tr> )}
                                      {formData.services.fascia && ( <tr className="bg-natural-bg-light rounded-lg shadow-sm"> <td className="p-3 pr-4 font-semibold text-natural-primary">Fascia and Soffit Cleaning</td> {!isSpecialQuoteScenario() && ( <> <td className="p-3 pr-4 text-natural-text"> {gutterFasciaFrequencyOptions.find(f=>f.value===formData.fasciaFrequency)?.label || formData.fasciaFrequency} <div className="text-xs text-natural-text-light">Restores the appearance of fascia and soffit boards.</div> </td> <td className="p-3 pr-4 text-right font-medium text-natural-text">{formatCurrency(calculatedPrices.fascia)}</td> </> )} </tr> )}
                                      {formData.services.solarPanels && ( <tr className="bg-natural-bg-light rounded-lg shadow-sm"> <td className="p-3 pr-4 font-semibold text-natural-primary">Solar Panel Cleaning</td> {!isSpecialQuoteScenario() && ( <> <td className="p-3 pr-4 text-natural-text"> {formData.solarPanelCount} panels, {solarFrequencyOptions.find(f=>f.value===formData.solarPanelFrequency)?.label || formData.solarPanelFrequency} <div className="text-xs text-natural-text-light">Maintains efficiency by removing dirt and debris.</div> </td> <td className="p-3 pr-4 text-right font-medium text-natural-text">{formatCurrency(calculatedPrices.solarPanels)}</td> </> )} </tr> )}
                                      {formData.services.conservatoryRoof && formData.hasConservatory && ( <tr className="bg-natural-bg-light rounded-lg shadow-sm"> <td className="p-3 pr-4 font-semibold text-natural-primary">Conservatory Roof Cleaning</td> {!isSpecialQuoteScenario() && ( <> <td className="p-3 pr-4 text-natural-text"> {formData.conservatoryRoofPanels} panels, {conservatoryRoofFrequencyOptions.find(f=>f.value===formData.conservatoryRoofFrequency)?.label || formData.conservatoryRoofFrequency} <div className="text-xs text-natural-text-light">Cleans and brightens conservatory roof panels.</div> </td> <td className="p-3 pr-4 text-right font-medium text-natural-text">{formatCurrency(calculatedPrices.conservatoryRoof)}</td> </> )} </tr> )}
                                    </tbody>
                                    {!isSpecialQuoteScenario() && (
                                      <tfoot>
                                        {calculatedPrices.discount > 0 && ( <tr> <td colSpan={2} className="pt-4 text-right font-semibold text-natural-text-light">Subtotal</td> <td className="pt-4 text-right font-semibold text-natural-text-light">{formatCurrency(calculatedPrices.total + calculatedPrices.discount)}</td> </tr> )}
                                        {calculatedPrices.discount > 0 && ( <tr> <td colSpan={2} className="pt-1 text-right font-semibold text-natural-success-dark">Discount Applied (Windows FREE Offer)</td> <td className="pt-1 text-right font-semibold text-natural-success-dark">- {formatCurrency(calculatedPrices.discount)}</td> </tr> )}
                                        <tr> <td colSpan={2} className={`pt-2 text-right font-bold text-natural-text ${calculatedPrices.discount > 0 ? 'border-t border-natural-success' : ''}`}>Total</td> <td className={`pt-2 text-right text-2xl font-bold text-natural-primary ${calculatedPrices.discount > 0 ? 'border-t border-natural-success' : ''}`}>{formatCurrency(calculatedPrices.total)}</td> </tr>
                                        <tr> <td colSpan={3} className="text-xs text-natural-text-light text-right pt-1">(VAT Included)</td> </tr>
                                      </tfoot>
                                    )}
                                  </table>
                                </div>
                              )}
                            </ReviewSection>
                            <ReviewSection title="Contact Information">
                                <ReviewItem label="First Name" value={formData.firstName} /> <ReviewItem label="Last Name" value={formData.lastName} /> <ReviewItem label="Email" value={formData.email} />
                                <ReviewItem label="Mobile" value={formData.mobile} /> <ReviewItem label="Address" value={formData.address} /> <ReviewItem label="Postcode" value={formData.postcode} />
                            </ReviewSection>
                            <ReviewSection title="Special Instructions (Optional)">
                                <textarea aria-label="Special instructions, e.g. gate code, ring bell before starting" className="w-full p-2 border border-natural-secondary rounded focus:ring-2 focus:ring-natural-primary focus:border-natural-primary text-sm bg-natural-bg-light text-natural-text" placeholder="Gate code, ring bell before starting, etc." value={formData.specialInstructions || ''} onChange={e => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))} rows={2} />
                            </ReviewSection>
                            {!isSpecialQuoteScenario() && (
                                <ReviewSection title="Scheduled Date">
                                    {formData.isAsapRequested ? ( <span className="text-natural-text">ASAP Requested</span> ) 
                                    : formData.selectedDate ? ( <span className="text-natural-text">{ (() => { const found = availableDates.find(d => { const dateObj = (d instanceof Date) ? d : getNextOccurrence(d); return dateObj && formatDateForStorage(dateObj) === formData.selectedDate; }); if (found) { const dateObj = (found instanceof Date) ? found : getNextOccurrence(found); return dateObj ? formatDateForDisplay(dateObj) : formData.selectedDate; } return formData.selectedDate; })() }</span> ) 
                                    : ( <span className="text-natural-text-light">No date selected.</span> )}
                                </ReviewSection>
                            )}
                            {isSpecialQuoteScenario() && (
                                <ReviewSection title="Quotation Type">
                                    <p className="text-sm text-natural-primary p-3 border border-natural-primary/50 rounded-md bg-natural-primary/10"> This is a request for a bespoke quotation. We will review the details and contact you shortly with a price. </p>
                                </ReviewSection>
                            )}
                            <p className="mt-4 text-xs text-natural-text-light px-1"> Please note: Prices are estimates based on standard property sizes and access. We reserve the right to adjust the price on-site for properties that are larger, more complex, or require special access. Any changes will be fully discussed and agreed with you before any work commences. </p>
                            <div className="mt-6 text-center"> <a href="mailto:info@yourcompany.com" className="text-natural-primary underline text-sm focus:outline-none focus:ring-2 focus:ring-natural-primary" aria-label="Need help? Email us">Need help? Contact us</a> </div>
                        </div>
                        <div className="my-6 flex flex-col items-center">
                            <ReCAPTCHA ref={recaptchaRef} sitekey="6LdwUDQrAAAAAJh5Z2V5paJn003OrFouc8KVdA0H" onChange={(token) => { setRecaptchaToken(token); if (token) { setReCaptchaError(''); } }} />
                            {reCaptchaError && <p className="mt-2 text-sm text-natural-error-dark">{reCaptchaError}</p>}
                        </div>
                        <div className="flex justify-between items-center pt-6 border-t border-natural-secondary mt-8">
                            <button type="button" onClick={() => setCurrentStep(3)} className="px-6 py-2 text-sm font-medium text-natural-text bg-natural-secondary hover:bg-natural-secondary-light border-natural-secondary rounded-md shadow-sm">Back</button>
                            <button type="button" onClick={handleSubmitBooking} disabled={!recaptchaToken || isSubmitting}
                                className={`px-8 py-3 text-white font-semibold rounded-lg shadow-md transition-colors text-base ${(!recaptchaToken || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''} ${isSpecialQuoteScenario() ? 'bg-natural-primary hover:bg-natural-primary-hover' : 'bg-natural-success hover:bg-natural-success-dark'}`}
                            > {isSubmitting ? 'Submitting...' : (isSpecialQuoteScenario() ? 'Submit Quote Enquiry' : 'Confirm & Submit Booking')} </button>
                        </div>
                        {submissionError && ( <p className="mt-4 text-center text-natural-error-dark bg-natural-error/10 p-3 rounded-md border border-natural-error"> {submissionError} </p> )}
                    </section>
                )}

                {/* Live Booking Summary */}
                {currentStep !== 1 && !isSpecialQuoteScenario() && (formData.services.window || formData.services.gutter || formData.services.fascia || formData.services.conservatoryRoof || formData.services.solarPanels) && (
                     <section className="mt-10 pt-6 sm:pt-8 border-t border-natural-secondary">
                        <h3 className="text-xl sm:text-2xl font-bold text-natural-text mb-4 sm:mb-6">Your Quote Summary</h3>
                         <div className="space-y-2 bg-natural-secondary-light p-4 sm:p-6 rounded-lg shadow-inner border border-natural-secondary">
                            {formData.services.window && ( <PriceLine label={`Window Cleaning${formData.windowFrequency ? ` (${frequencyOptionsData.find(f=>f.value===formData.windowFrequency)?.label || formData.windowFrequency})` : ''}`} price={calculatedPrices.window} formatCurrency={formatCurrency} isDiscounted={calculatedPrices.discount > 0 && calculatedPrices.discount === calculatedPrices.window} originalPrice={calculatedPrices.originalWindowPriceForDiscount > 0 ? calculatedPrices.originalWindowPriceForDiscount : calculatedPrices.window} isWindowCleaning={true} calculatedPrices={calculatedPrices} /> )}
                            {formData.hasExtension && calculatedPrices.extensionPrice > 0 && ( <div className="flex justify-between pl-4 text-xs text-natural-text-light"> <span>+ Includes: Extension</span> <span>{formatCurrency(calculatedPrices.extensionPrice)}</span> </div> )}
                            {formData.hasConservatory && calculatedPrices.conservatoryPrice > 0 && ( <div className="flex justify-between pl-4 text-xs text-natural-text-light"> <span>+ Includes: Conservatory (Windows)</span> <span>{formatCurrency(calculatedPrices.conservatoryPrice)}</span> </div> )}
                            {formData.services.gutter && ( <PriceLine label={`Gutter Clearing${formData.gutterFrequency ? ` (${gutterFasciaFrequencyOptions.find(f=>f.value===formData.gutterFrequency)?.label || formData.gutterFrequency})` : ''}`} price={calculatedPrices.gutter} formatCurrency={formatCurrency} calculatedPrices={calculatedPrices} /> )}
                            {formData.services.fascia && ( <PriceLine label={`Fascia & Soffit Cleaning${formData.fasciaFrequency ? ` (${gutterFasciaFrequencyOptions.find(f=>f.value===formData.fasciaFrequency)?.label || formData.fasciaFrequency})` : ''}`} price={calculatedPrices.fascia} formatCurrency={formatCurrency} calculatedPrices={calculatedPrices} /> )}
                            {formData.services.conservatoryRoof && formData.hasConservatory && ( <PriceLine label={`Conservatory Roof Cleaning${formData.conservatoryRoofFrequency ? ` (${conservatoryRoofFrequencyOptions.find(f=>f.value===formData.conservatoryRoofFrequency)?.label || formData.conservatoryRoofFrequency})` : ''}`} price={calculatedPrices.conservatoryRoof} formatCurrency={formatCurrency} calculatedPrices={calculatedPrices} /> )}
                            {formData.services.solarPanels && ( <PriceLine label={`Solar Panel Cleaning${formData.solarPanelFrequency ? ` (${solarFrequencyOptions.find(f=>f.value===formData.solarPanelFrequency)?.label || formData.solarPanelFrequency})` : ''}`} price={calculatedPrices.solarPanels} formatCurrency={formatCurrency} calculatedPrices={calculatedPrices} /> )}
                            {calculatedPrices.discount > 0 && ( <div className="flex justify-between items-center pt-2 border-t border-natural-secondary mt-2"> <span className="text-sm font-medium text-natural-success-dark">Special Offer Discount:</span> <span className="text-sm font-bold text-natural-success-dark">-{formatCurrency(calculatedPrices.discount)}</span> </div> )}
                            {calculatedPrices.discount > 0 && ( <div className="flex justify-between items-center pt-2 mt-2 border-t border-natural-secondary"> <span className="text-sm font-medium text-natural-text-light">Subtotal:</span> <span className="text-sm font-medium text-natural-text-light">{formatCurrency(calculatedPrices.total + calculatedPrices.discount)}</span> </div> )}
                            {calculatedPrices.discount > 0 && ( <div className="flex justify-between items-center pt-1"> <span className="text-sm font-medium text-natural-success-dark">Discount Applied (Windows FREE Offer):</span> <span className="text-sm font-bold text-natural-success-dark">-{formatCurrency(calculatedPrices.discount)}</span> </div> )}
                            <div className={`flex justify-between items-center pt-3 mt-3 ${calculatedPrices.discount > 0 ? 'border-t-2 border-natural-success' : 'border-t-2 border-natural-secondary'}`}> <span className="text-lg font-bold text-natural-text">Estimated Total:</span> <span className="text-2xl font-bold text-natural-primary">{formatCurrency(calculatedPrices.total)}</span> </div>
                            <p className="text-xs text-natural-text-light mt-1 text-right">(VAT Included)</p>
                            {(formData.services.window || formData.services.gutter || formData.services.fascia) && <p className="text-xs text-natural-text-light mt-3 text-center">This is an estimated price. All jobs are confirmed on-site before work commences. Payment is due upon completion.</p> }
                        </div>
                     </section>
                    )}
            </div>
        ) : null; 
}; 

export default WindowCleaningForm;
