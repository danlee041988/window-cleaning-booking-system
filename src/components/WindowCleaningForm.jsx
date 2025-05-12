import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReCAPTCHA from "react-google-recaptcha"; // NEW: Import reCAPTCHA
import emailjs from '@emailjs/browser';
import { scheduleData, specialPostcodeRules } from '../config/scheduleConfig';

// --- Helper Component Definitions ---

// InputField Component
const InputField = ({ label, name, type = 'text', value, onChange, required, error, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}{required && ' *'}</label>
        {type === 'textarea' ? (
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                rows={3}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 ${error ? 'border-red-500' : ''}`}
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
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 ${error ? 'border-red-500' : ''}`}
                placeholder={placeholder || ''}
                required={required}
            />
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);

// ReviewSection Component
const ReviewSection = ({ title, children }) => (
    <div className="mb-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <div className="space-y-1">{children}</div>
    </div>
);

// ReviewItem Component
const ReviewItem = ({ label, value }) => (
    <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}:</span>
        <span className="text-gray-800 font-medium text-right">{value}</span>
    </div>
);

// PriceLine Component (Placeholder - adjust as needed)
const PriceLine = ({ label, price, formatCurrency, isDiscount }) => (
    <div className={`flex justify-between py-1 ${isDiscount ? 'text-green-600' : ''}`}>
        <span>{label}</span>
        <span>{formatCurrency(price)}</span>
    </div>
);

// QuoteServiceCard Component (Placeholder)
const QuoteServiceCard = ({ title, selected, onToggle, note, children }) => (
    <div 
        onClick={onToggle}
        className={`p-4 border rounded-lg shadow-sm cursor-pointer transition-all duration-150 hover:shadow-md
            ${selected ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500' : 'bg-white border-gray-300 hover:border-blue-300'}`}
    >
        <div className="flex justify-between items-center">
            <h3 className="text-md sm:text-lg font-semibold text-gray-800">{title}</h3>
            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 transition-colors
                ${selected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-400'}`}
            >
                {selected && <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7"></path></svg>}
            </div>
        </div>
        {note && <p className="text-xs sm:text-sm text-gray-500 mt-1">{note}</p>}
        {children && <div className="mt-2 pt-2 border-t border-gray-200">{children}</div>}
    </div>
);

// ServiceCard Component (Placeholder)
const ServiceCard = ({ title, price, selected, onToggle, formatCurrency, note, children, isFullyDiscounted }) => (
    <div 
        onClick={onToggle}
        className={`p-4 border rounded-lg shadow-sm cursor-pointer transition-all duration-150 hover:shadow-md
            ${selected ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500' : 'bg-white border-gray-300 hover:border-blue-300'}`}
    >
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-md sm:text-lg font-semibold text-gray-800">{title}</h3>
                {note && <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-md">{note}</p>}
            </div>
            <div className="text-right ml-2 flex-shrink-0">
                {isFullyDiscounted ? (
                    <span className="text-lg font-bold text-green-600">FREE</span>
                ) : (
                    <span className={`text-lg font-bold ${selected ? 'text-blue-700' : 'text-gray-700'}`}>{formatCurrency(price)}</span>
                )}
                 <div className={`mt-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 transition-colors ml-auto
                    ${selected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-400'}`}
                >
                    {selected && <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7"></path></svg>}
                </div>
            </div>
        </div>
        {children && <div className="mt-3 pt-3 border-t border-gray-200">{children}</div>}
    </div>
);

// AdminBookingCard (Placeholder - this is a complex component, actual implementation may vary)
const AdminBookingCard = ({ booking, onUpdateStatus, houseOptions, frequencyOptions, solarFrequencyOptions, formatCurrency, formatDateForDisplay, isCompletedView }) => {
    // Simplified placeholder
    return (
        <div className={`p-4 rounded-lg shadow ${isCompletedView ? 'bg-gray-700' : 'bg-gray-700/50'}`}>
            <p className="font-semibold">{booking.firstName} {booking.lastName} - {formatDateForDisplay(new Date(booking.submittedAt))}</p>
            <p>Postcode: {booking.postcode} - Status: {booking.adminStatus?.customerConfirmed || 'N/A'}</p>
            {/* Add more details and controls as needed */}
        </div>
    );
};

// CompactCompletedBookingLine (Placeholder)
const CompactCompletedBookingLine = ({ booking, onToggleExpand, formatCurrency, formatDateForDisplay }) => {
    // Simplified placeholder
    return (
        <div onClick={() => onToggleExpand(booking.id)} className="p-3 bg-gray-700 hover:bg-gray-600 rounded-md cursor-pointer">
            <p>{booking.firstName} {booking.lastName} ({formatDateForDisplay(new Date(booking.submittedAt))}) - <span className="text-green-400">Completed</span></p>
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
    { id: 'commercial', label: 'Commercial Property', bedrooms: 0, isDetached: false, basePrice: 0, isSpecialQuote: true } // NEW Commercial option
];

const frequencyOptionsData = [
    { value: '4-weekly', label: '4 Weekly', priceMod: 0, multiplier: 1 },
    { value: '8-weekly', label: '8 Weekly', priceMod: 0, multiplier: 1 },
    { value: '12-weekly', label: '12 Weekly', priceMod: 5, multiplier: 1 },
    { value: 'adhoc', label: 'One-off', priceMod: 0, multiplier: 1 } // MODIFIED: Adhoc is now neutral, specific logic below
];

// Add Solar Frequency Options
const solarFrequencyOptions = [
    { value: "adhoc", label: "One-off" },
    { value: "3-monthly", label: "Every 3 Months" },
    { value: "6-monthly", label: "Every 6 Months" },
    { value: "12-monthly", label: "Every 12 Months" },
    { value: "24-monthly", label: "Every 24 Months" }
];

// --- NEW Gutter/Fascia Frequency Options ---
const gutterFasciaFrequencyOptions = [
    { value: "adhoc", label: "One-off" },
    { value: "6-monthly", label: "Every 6 months" },
    { value: "12-monthly", label: "Every 12 months" },
    { value: "24-monthly", label: "Every 24 months" }
];

// --- NEW Admin Status Options ---
// const customerConfirmedOptions = [
//     { value: 'Pending', label: 'Pending Confirmation' },
//     { value: 'Confirmed by Call', label: 'Confirmed by Call' },
//     { value: 'Confirmed by Text', label: 'Confirmed by Text' },
//     { value: 'No Answer', label: 'No Answer (Call Attempted)' },
//     { value: 'Left Message', label: 'Left Message' }
// ]; // Unused
// --- END NEW Admin Status Options ---

// --- Date/Schedule Data & Helpers (from original form) ---
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

// --- Schedule Data ---
// const scheduleData = [
//   { postcodes: ['BS40', 'BS48', 'BS49', 'BS22', 'BS23', 'BS24', 'BS21'], area: 'Weston Backwell Blagdon Yatton Clevedon', dates: generate4WeeklyDates('13 May') },
//   { postcodes: ['BS25', 'BS29'], area: 'Banwell Winscombe', dates: generate4WeeklyDates('14 May') },
//   { postcodes: ['BS26'], area: 'Axbridge', dates: generate4WeeklyDates('15 May') },
//   { postcodes: ['BS26', 'BS27'], area: 'Axbridge / Cheddar', dates: generate4WeeklyDates('16 May') },
//   { postcodes: ['BS27'], area: 'Cheddar', dates: generate4WeeklyDates('17 May') },
//   { postcodes: ['BA7', 'BA9', 'BA10', 'BA11', 'BA8'], area: 'Wincanton Bruton Castle Cary Frome Templecombe', dates: generate4WeeklyDates('20 May') },
//   { postcodes: ['BS39', 'BA3', 'BA4'], area: 'Paulton Radstock Shepton', dates: generate4WeeklyDates('21 May') },
//   { postcodes: ['BA5', 'BA4'], area: 'Shepton Wells (BA4 Part)', dates: generate4WeeklyDates('22 May') },
//   { postcodes: ['BA5'], area: 'Wells', dates: generate4WeeklyDates('23 May') },
//   { postcodes: ['BA5'], area: 'Wells', dates: generate4WeeklyDates('24 May') },
//   { postcodes: ['TA18', 'TA19', 'TA20', 'BA22', 'TA17', 'TA12', 'TA13', 'TA14', 'DT9'], area: 'Yeovil Illminster Chard Crewkerne etc', dates: generate4WeeklyDates('27 May') },
//   { postcodes: ['TA10', 'TA11'], area: 'Langport Somerton', dates: generate4WeeklyDates('28 May') },
//   { postcodes: ['TA10', 'TA11'], area: 'Langport Somerton', dates: generate4WeeklyDates('29 May') },
//   { postcodes: ['BA6'], area: 'Glastonbury (non-Meare)', dates: generate4WeeklyDates('30 May') },
//   { postcodes: ['BA6'], area: 'Glastonbury (non-Meare)', dates: generate4WeeklyDates('31 May') },
//   { postcodes: ['TA7', 'TA6', 'TA2', 'TA3', 'TA9', 'TA8', 'TA1'], area: 'Bridgwater Taunton Mark Highbridge', dates: generate4WeeklyDates('03 Jun') },
//   { postcodes: ['BS28'], area: 'Wedmore', dates: generate4WeeklyDates('04 Jun') },
//   { postcodes: ['BS28'], area: 'Wedmore', dates: generate4WeeklyDates('05 Jun') },
//   { postcodes: ['BS28', 'BA6-MEARE'], area: 'Wedmore / Meare', dates: generate4WeeklyDates('06 Jun') },
//   { postcodes: ['BA16'], area: 'Street', dates: generate4WeeklyDates('07 Jun') }
// ];

// --- NEW Property Detail Options ---
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

// Add this after propertyStyleOptions
const commercialPropertyTypes = [
    { value: 'office', label: 'Office Building' },
    { value: 'retail', label: 'Retail Shop' },
    { value: 'restaurant', label: 'Restaurant / Cafe' },
    { value: 'warehouse', label: 'Warehouse / Industrial' },
    { value: 'medical', label: 'Medical / Dental Practice' },
    { value: 'other-commercial', label: 'Other Commercial Property' }
];
// --- END NEW Property Detail Options ---

const initialFormData = {
    numBedrooms: '',
    propertyStyle: '',
    commercialPropertyType: '', // Add this line
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

// --- Constants ---
const stepTitles = ["Property Details", "Services", "Contact", "Review"];

// Add these helper functions near the top (after date helpers, before the component)
const formatDateForDisplay = (date) => {
  if (!date || isNaN(date.getTime())) return "Invalid Date";
  return date.toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
};

const formatDateForStorage = (date) => {
  if (!date || isNaN(date.getTime())) return "";
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

const WindowCleaningForm = () => {
    const [currentStep, setCurrentStep] = useState(1); 
    const [formData, setFormData] = useState(JSON.parse(JSON.stringify(initialFormData)));
    const [calculatedPrices, setCalculatedPrices] = useState({});
    const [availableDates, setAvailableDates] = useState([]);
    const [postcodeError, setPostcodeError] = useState('');
    const [dateSelectionError, setDateSelectionError] = useState('');
    const [appView, setAppView] = useState('customerForm'); // Added appView state
    
    const [adminPassword, setAdminPassword] = useState('');
    const [adminLoginError, setAdminLoginError] = useState('');
    const [allBookings, setAllBookings] = useState([ /* ... fake bookings ... */ ]); // Will need update later
    const [expandedCompletedBookingId, setExpandedCompletedBookingId] = useState(null); 
    const [lastSubmittedBookingDetails, setLastSubmittedBookingDetails] = useState(null); 
    const [reCaptchaError, setReCaptchaError] = useState(''); 
    const recaptchaRef = useRef(); 
    const [isLoadingDates, setIsLoadingDates] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState('');
    const [contactValidationErrors, setContactValidationErrors] = useState({});
    const [selectedArea, setSelectedArea] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    // State for submission status
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState('');

    // State for continue button error message
    const [continueError, setContinueError] = useState('');

    // Conservatory Roof Frequency Options - MOVED INSIDE
    const conservatoryRoofFrequencyOptions = [
        { value: "adhoc", label: "One-off" },
        { value: "3-monthly", label: "Every 3 Months" },
        { value: "6-monthly", label: "Every 6 Months" },
        { value: "12-monthly", label: "Every 12 Months" },
        { value: "24-monthly", label: "Every 24 Months" }
    ];

    // Handle Conservatory Roof Frequency Change - MOVED INSIDE
    const handleConservatoryRoofFrequencyChange = (value) => {
        setFormData(prev => ({
            ...prev,
            conservatoryRoofFrequency: value,
            services: { ...prev.services, conservatoryRoof: true } // Auto-select service
        }));
    };

    // Create a new handler for Solar Panel Frequency Change
    const handleSolarPanelFrequencyChange = (value) => {
        setFormData(prev => ({
            ...prev,
            solarPanelFrequency: value,
            services: { ...prev.services, solarPanels: true } // Auto-select service
        }));
    };

    // Move isSpecialQuoteScenario above any useEffect or JSX that uses it
    const isSpecialQuoteScenario = useCallback(() => {
      return (
        formData.numBedrooms === '6+' ||
        formData.propertyStyle === 'other' ||
        formData.propertyStyle === 'commercial'
      );
    }, [formData.numBedrooms, formData.propertyStyle]);

    // --- Price Calculation Logic (adapted from original) ---
    useEffect(() => {
        if (isSpecialQuoteScenario()) {
            setCalculatedPrices({
                window: 0, gutter: 0, fascia: 0, conservatoryRoof: 0, solarPanels: 0,
                discount: 0, total: 0, originalWindowPriceForDiscount: 0
            });
            return;
        }

        let rawBaseWindowPrice = 0;
        const beds = formData.numBedrooms;
        const style = formData.propertyStyle;

        if (beds === '1' || beds === '2') rawBaseWindowPrice = (style === 'detached') ? 25 : 20;
        else if (beds === '3') rawBaseWindowPrice = (style === 'detached') ? 30 : 25;
        else if (beds === '4') rawBaseWindowPrice = (style === 'detached') ? 35 : 30;
        else if (beds === '5') rawBaseWindowPrice = (style === 'detached') ? 40 : 35;
        else rawBaseWindowPrice = 20; // Fallback

        let finalBaseWindowPrice = rawBaseWindowPrice;
        let extensionPrice = 0;
        let conservatoryPrice = 0;

        // Calculate extension and conservatory prices
        if (formData.hasExtension) {
            extensionPrice = 5;
            finalBaseWindowPrice += extensionPrice;
        }
        if (formData.hasConservatory) {
            conservatoryPrice = 5;
            finalBaseWindowPrice += conservatoryPrice;
        }

        let currentWindowPrice = finalBaseWindowPrice;
        let adhocTierAddition = 0;

        const selectedFrequencyData = frequencyOptionsData.find(f => f.value === formData.windowFrequency);

        if (formData.windowFrequency === 'adhoc') {
            const bedsForTier = formData.numBedrooms;
            const styleForTier = formData.propertyStyle;
            if (bedsForTier === '1' || bedsForTier === '2') adhocTierAddition = 15;
            else if (bedsForTier === '3') adhocTierAddition = 20;
            else if (bedsForTier === '4') adhocTierAddition = (styleForTier === 'detached') ? 25 : 20;
            else if (bedsForTier === '5') adhocTierAddition = 25;
            
            currentWindowPrice = finalBaseWindowPrice + adhocTierAddition;
        } else if (selectedFrequencyData) {
            currentWindowPrice = finalBaseWindowPrice + selectedFrequencyData.priceMod;
            currentWindowPrice *= selectedFrequencyData.multiplier;
        }

        const gutterBasePrice = 80;
        const fasciaBasePrice = 100;
        const conservatoryPerPanelPrice = 8;
        const solarPerPanelPrice = 10;

        const gutterPrice = gutterBasePrice;
        const fasciaPrice = fasciaBasePrice;
        const conservatoryRoofPriceVal = formData.hasConservatory ? formData.conservatoryRoofPanels * conservatoryPerPanelPrice : 0;
        const solarPanelsPriceVal = formData.solarPanelCount * solarPerPanelPrice;

        let total = 0;
        let discount = 0;
        let originalWindowPriceForDiscount = 0;

        if (formData.services.window) total += currentWindowPrice;
        if (formData.services.gutter) total += gutterPrice;
        if (formData.services.fascia) total += fasciaPrice;
        if (formData.services.conservatoryRoof && formData.hasConservatory) total += conservatoryRoofPriceVal;
        if (formData.services.solarPanels) total += solarPanelsPriceVal;

        // "Windows FREE" offer
        if (formData.services.window && formData.services.gutter && formData.services.fascia && formData.windowFrequency !== 'adhoc') {
            originalWindowPriceForDiscount = currentWindowPrice;
            discount = currentWindowPrice;
            total -= discount;
        }

        setCalculatedPrices({
            window: currentWindowPrice,
            windowBase: rawBaseWindowPrice,
            extensionPrice: extensionPrice,
            conservatoryPrice: conservatoryPrice,
            gutter: gutterPrice,
            fascia: fasciaPrice,
            conservatoryRoof: conservatoryRoofPriceVal,
            solarPanels: solarPanelsPriceVal,
            discount: discount,
            total: Math.max(0, total),
            originalWindowPriceForDiscount: originalWindowPriceForDiscount,
        });

    }, [
        formData.numBedrooms, formData.propertyStyle, formData.hasExtension, formData.hasConservatory,
        formData.services, formData.windowFrequency, formData.conservatoryRoofPanels, formData.solarPanelCount,
        formData.gutterFrequency, formData.fasciaFrequency, formData.solarPanelFrequency,
        isSpecialQuoteScenario
    ]);

    // --- UPDATED: Date Calculation Logic ---
    useEffect(() => {
        if (formData.postcode) {
            const postcodePrefix = formData.postcode.split(' ')[0].toUpperCase();
            const isSpecialFridayArea = specialPostcodeRules && 
                                       Array.isArray(specialPostcodeRules.fridayOnly) && 
                                       specialPostcodeRules.fridayOnly.some(pc => postcodePrefix.startsWith(pc));

            if (isSpecialFridayArea) {
                // Generate all Fridays for the next 6 weeks for special areas
                const fridays = [];
                let date = new Date();
                date.setHours(0, 0, 0, 0);
                const sixWeeksFromNow = new Date(date);
                sixWeeksFromNow.setDate(date.getDate() + 42);

                // Move to the next Friday
                while (date.getDay() !== 5) {
                    date.setDate(date.getDate() + 1);
                }

                while (date <= sixWeeksFromNow) {
                    // *** Placeholder for Bank Holiday Check ***
                    // if (!isBankHoliday(date)) { // Requires a bank holiday function/library
                        fridays.push(new Date(date)); // Store Date objects
                    // }
                    date.setDate(date.getDate() + 7); // Move to next Friday
                }
                setAvailableDates(fridays);
                setSelectedArea('Special Friday Area'); // Indicate it's a special case
                setPostcodeError(''); // Clear postcode error if it matches special area
            } else {
                // Original logic for other postcodes
                const matchingSchedule = scheduleData.find(schedule => 
                    schedule.postcodes.some(pc => postcodePrefix.startsWith(pc))
                );

                if (matchingSchedule) {
                    // Convert schedule dates (strings) to Date objects
                    const scheduleDates = matchingSchedule.dates
                        .map(dateStr => getNextOccurrence(dateStr))
                        .filter(date => date instanceof Date); // Ensure only valid dates
                    setAvailableDates(scheduleDates);
                    setSelectedArea(matchingSchedule.area);
                    setPostcodeError(''); // Clear error
                } else {
                    setAvailableDates([]);
                    setSelectedArea('');
                    setPostcodeError('Sorry, we do not cover this postcode area.'); // Set specific error
                }
            }
        } else {
            setAvailableDates([]); // Clear dates if postcode is empty
            setSelectedArea('');
            setPostcodeError(''); // Clear error
        }
    }, [formData.postcode]); // Rerun only when postcode changes

    // --- Event Handlers ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        let newFormData = { ...formData };

        if (name === "conservatoryRoofPanels") {
            newFormData = {
                ...newFormData,
                conservatoryRoofPanels: value,
                services: { ...newFormData.services, conservatoryRoof: true } // Always keep checked
            };
        } else if (name === "solarPanelCount") {
            newFormData = {
                ...newFormData,
                solarPanelCount: value,
                services: { ...newFormData.services, solarPanels: true } // Always keep checked
            };
        } else if (name === "solarPanelFrequency") { // Ensure selecting frequency also selects the service
            newFormData = {
                ...newFormData,
                solarPanelFrequency: value,
                services: { ...newFormData.services, solarPanels: true }
            };
        } else {
            newFormData = {
                ...newFormData,
                [name]: type === 'checkbox' ? checked : value
            };
        }
        setFormData(newFormData);

        // Clear specific validation error when user types
        if (contactValidationErrors[name]) {
            setContactValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
        // Clear general continue error if it was set
        if (continueError === 'Please fill in all required contact details marked with *.') {
            setContinueError('');
        }
    };
    
    const handlePropertyDetailChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleService = (serviceKey) => {
        setFormData(prev => ({
            ...prev, 
            services: { ...prev.services, [serviceKey]: !prev.services[serviceKey] }
        }));
    };

    const handleFrequencyChange = (value) => {
        setFormData(prev => ({
            ...prev,
            windowFrequency: value,
            services: { ...prev.services, window: true } // Ensure window cleaning is selected
        }));
    };

    const handleGutterFrequencyChange = (value) => {
        setFormData(prev => ({
            ...prev,
            gutterFrequency: value,
            services: { ...prev.services, gutter: true } // Auto-select service
        }));
    };

    const handleFasciaFrequencyChange = (value) => {
        setFormData(prev => ({
            ...prev,
            fasciaFrequency: value,
            services: { ...prev.services, fascia: true } // Auto-select service
        }));
    };

    const formatCurrency = (amount) => `£${Number(amount).toFixed(2)}`;
    
    const handleDateSelect = (date) => {
        const postcodePrefix = formData.postcode.split(' ')[0].toUpperCase();
        // Make specialPostcodeRules check more robust
        const isFridayOnly = specialPostcodeRules && 
                             Array.isArray(specialPostcodeRules.fridayOnly) && 
                             specialPostcodeRules.fridayOnly.some(pc => postcodePrefix.startsWith(pc));
        const dateValue = formatDateForStorage(date);
        if (isFridayOnly) {
            // date is already a Date object
            if (date.getDay() !== 5) { // 5 is Friday
                setValidationErrors(prev => ({
                    ...prev,
                    date: 'Selected date is not a Friday for this area.'
                }));
                return;
            }
        }
        setFormData(prev => ({
            ...prev,
            selectedDate: dateValue, // This line is critical for selection
            isAsapRequested: false // Deselect ASAP when a date is chosen
        }));
        setValidationErrors(prev => ({
            ...prev,
            date: ''
        }));
        // Clear general continue error if it was date related
        if (continueError === 'Please select an available date or request ASAP booking.') {
            setContinueError('');
        }
    };

    const handleAsapRequestToggle = () => {
        const turnAsapOn = !formData.isAsapRequested;
        if (formData.postcode.trim().length >= 2 && postcodeError === '' && availableDates.length === 0 && !isLoadingDates) {
            // This case means postcode is valid enough to search, but no specific dates were found
            // or if dates are available, they can still choose ASAP.
             setFormData(prev => ({
                ...prev,
                isAsapRequested: turnAsapOn,
                selectedDate: turnAsapOn ? 'ASAP_REQUESTED' : '' // Clear date if ASAP is on
            }));
            setDateSelectionError('');
            setContinueError('');
        } else if (availableDates.length > 0 || (formData.postcode.trim().length >=2 && postcodeError === '' && !isLoadingDates) ) {
             setFormData(prev => ({
                ...prev,
                isAsapRequested: turnAsapOn,
                selectedDate: turnAsapOn ? 'ASAP_REQUESTED' : '' // Clear date if ASAP is on
            }));
            setDateSelectionError('');
            setContinueError('');
        }
        else {
            setPostcodeError('Please enter a valid postcode for an area we cover to request ASAP booking.');
        }
    };

    const validateContactDetails = () => {
        const errors = {};
        if (!formData.firstName.trim()) errors.firstName = 'First name is required.';
        if (!formData.lastName.trim()) errors.lastName = 'Last name is required.';
        if (!formData.email.trim()) {
            errors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address.';
        }
        if (!formData.mobile.trim()) {
            errors.mobile = 'Mobile number is required.';
        } else if (!/^\+?[0-9\s-]{10,15}$/.test(formData.mobile)) {
            errors.mobile = 'Please enter a valid mobile number.';
        }
        if (!formData.address.trim()) errors.address = 'Address is required.';
        if (!formData.postcode.trim()) errors.postcode = 'Postcode is required.';
        
        setContactValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleContinueToReview = () => {
        const contactValid = validateContactDetails();
        const dateValid = formData.selectedDate || formData.isAsapRequested || isSpecialQuoteScenario();

        if (!contactValid) {
            setContinueError('Please fill in all required contact details marked with *.');
            return;
        }
        if (!dateValid) {
            const dateErr = 'Please select an available date or request ASAP booking.';
            setDateSelectionError(dateErr);
            setContinueError(dateErr); // Also set the general error
            return;
        }

        // If validation passes
        setContinueError(''); // Clear general error
        setDateSelectionError(''); // Clear specific date error
        setCurrentStep(5); // Go directly to Review step (Step 5 is review)
    };

    const handleSubmitBooking = (e) => {
        e.preventDefault();
        if (!recaptchaToken) {
            alert('Please complete the reCAPTCHA.');
            return;
        }
        
        setIsSubmitting(true); // Start submission
        setSubmissionError(''); // Clear previous errors

        const forQuoteOnly = isSpecialQuoteScenario();

        // Calculate 12-month values for each service
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

        // Determine if bespoke/commercial/6+ bed
        const isBespokeOrCommercial = (
          formData.numBedrooms === '6+' ||
          formData.propertyStyle === 'commercial' ||
          formData.propertyStyle === 'other'
        ) ? 'Yes' : 'No';

        // Prepare all variables for EmailJS
        const emailVars = {
          numBedrooms: formData.numBedrooms,
          propertyStyle: formData.propertyStyle,
          hasExtension: formData.hasExtension ? 'Yes' : 'No',
          hasConservatory: formData.hasConservatory ? 'Yes' : 'No',
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          mobile: formData.mobile,
          address: formData.address,
          postcode: formData.postcode,
          window: formData.services.window ? 'Yes' : 'No',
          gutter: formData.services.gutter ? 'Yes' : 'No',
          fascia: formData.services.fascia ? 'Yes' : 'No',
          solarPanels: formData.services.solarPanels ? 'Yes' : 'No',
          conservatoryRoof: formData.hasConservatory && formData.services.conservatoryRoof ? 'Yes' : 'No',
          windowFrequency: formData.windowFrequency || '',
          gutterFrequency: formData.gutterFrequency || '',
          fasciaFrequency: formData.fasciaFrequency || '',
          solarPanelFrequency: formData.solarPanelFrequency || '',
          conservatoryRoofFrequency: formData.conservatoryRoofFrequency || '',
          windowPrice: forQuoteOnly ? 'Quote Requested' : (calculatedPrices.window || ''),
          gutterPrice: forQuoteOnly ? 'Quote Requested' : (calculatedPrices.gutter || ''),
          fasciaPrice: forQuoteOnly ? 'Quote Requested' : (calculatedPrices.fascia || ''),
          solarPanelPrice: forQuoteOnly ? 'Quote Requested' : (calculatedPrices.solarPanels || ''),
          conservatoryRoofPrice: forQuoteOnly ? 'Quote Requested' : (calculatedPrices.conservatoryRoof || ''),
          windowAnnual: forQuoteOnly ? 'Quote Requested' : getAnnualValue(calculatedPrices.window, formData.windowFrequency),
          gutterAnnual: forQuoteOnly ? 'Quote Requested' : getAnnualValue(calculatedPrices.gutter, formData.gutterFrequency),
          fasciaAnnual: forQuoteOnly ? 'Quote Requested' : getAnnualValue(calculatedPrices.fascia, formData.fasciaFrequency),
          solarPanelAnnual: forQuoteOnly ? 'Quote Requested' : getAnnualValue(calculatedPrices.solarPanels, formData.solarPanelFrequency),
          conservatoryRoofAnnual: forQuoteOnly ? 'Quote Requested' : 'Adhoc',
          selectedDate: forQuoteOnly ? 'N/A - Quote Request' : formData.selectedDate,
          isAsapRequested: forQuoteOnly ? 'N/A - Quote Request' : (formData.isAsapRequested ? 'Yes' : 'No'),
          total: forQuoteOnly ? 'Quote Requested' : (calculatedPrices.total || ''),
          discount: forQuoteOnly ? 'Quote Requested' : (calculatedPrices.discount || ''),
          isBespokeOrCommercial: forQuoteOnly ? 'Yes - Quote Request' : isBespokeOrCommercial,
          services: JSON.stringify(formData.services),
          specialInstructions: formData.specialInstructions || '',
          'g-recaptcha-response': recaptchaToken,
          formType: forQuoteOnly ? 'Bespoke Quote Request' : 'Standard Booking Enquiry',
          emailSubject: 'New Customer Booking',
        };

        emailjs.send(
          process.env.REACT_APP_EMAILJS_SERVICE_ID,      // Use environment variable
          process.env.REACT_APP_EMAILJS_TEMPLATE_ID,     // Use environment variable
          emailVars,
          process.env.REACT_APP_EMAILJS_PUBLIC_KEY       // Use environment variable
        )
        .then((result) => {
            console.log('EmailJS success:', result.text);
            setLastBookingDetailsForConfirmation(formData); // Store details for confirmation page
            setAppView('bookingConfirmation'); // Switch to confirmation view
            // Reset form state if needed for a clean confirmation page load (optional)
            // setFormData(JSON.parse(JSON.stringify(initialFormData))); 
            // setCurrentStep(1); // Might not be needed if switching view
            // setRecaptchaToken('');
            // if (recaptchaRef.current) recaptchaRef.current.reset();
        }, (error) => {
            console.error('EmailJS error:', error);
            setSubmissionError('There was an error sending your booking. Please check your details or contact us directly.'); // Set user-friendly error message
        })
        .finally(() => {
            setIsSubmitting(false); // End submission regardless of success/failure
        });
    };

    const handleMakeAnotherEnquiry = () => {
        setFormData(JSON.parse(JSON.stringify(initialFormData)));
        setCurrentStep(1);
        setAvailableDates([]);
        setPostcodeError('');
        setDateSelectionError('');
        setRecaptchaToken(''); // Corrected: lowercase 'c'
        setReCaptchaError('');
        if (recaptchaRef.current) {
            recaptchaRef.current.reset();
        }
    };

    // --- NEW Admin Functions ---
    const handleAdminLogin = (e) => {
        e.preventDefault();
        if (adminPassword === '1') { // In a real app, use a secure comparison
            setAppView('adminDashboard');
            setAdminPassword('');
            setAdminLoginError('');
        } else {
            setAdminLoginError('Incorrect password.');
        }
    };

    const handleUpdateBookingStatus = (bookingId, statusField, newValue) => {
        // This function would interact with your backend or state management for bookings
        // For now, just logging the action
        console.log(`Updating booking ${bookingId}, ${statusField} to ${newValue}`);
        // Example of updating local state if allBookings were managed here:
        // setAllBookings(prevBookings => 
        //     prevBookings.map(booking => 
        //         booking.id === bookingId 
        //             ? { ...booking, adminStatus: { ...booking.adminStatus, [statusField]: newValue } }
        //             : booking
        //     )
        // );
    };

    const handleToggleCompletedBookingExpand = (bookingId) => {
        setExpandedCompletedBookingId(prevId => prevId === bookingId ? null : bookingId);
    };

    // Placeholder for when the actual booking submission happens and we need to set details
    // This would be called within handleSubmitBooking on success
    const setLastBookingDetailsForConfirmation = (submittedData) => {
        setLastSubmittedBookingDetails(submittedData);
    };

    // --- RENDER CONTROL ---
    if (appView === 'adminLogin') {
        return (
            <div className="max-w-md mx-auto mt-20 bg-white shadow-2xl rounded-3xl p-8 font-sans border border-gray-200">
                <div className="h-2 w-28 bg-red-600 rounded-full mx-auto mb-10" />
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Admin Login</h2>
                <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div>
                        <label htmlFor="adminPass" className="block text-sm font-medium text-gray-700">Password</label>
                        <input 
                            type="password"
                            id="adminPass"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-3"
                            required
                        />
                    </div>
                    {adminLoginError && <p className="text-sm text-red-600 text-center">{adminLoginError}</p>}
                    <button 
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                    >
                        Login
                    </button>
                </form>
                <button onClick={() => setAppView('customerForm')} className="mt-8 text-sm text-blue-600 hover:text-blue-800 text-center w-full">Back to Booking Form</button>
            </div>
        );
    }

    if (appView === 'adminDashboard') {
        // Placeholder for Admin Dashboard - to be built in next step
        return (
            <div className="max-w-4xl mx-auto mt-10 bg-gray-800 text-white shadow-2xl rounded-3xl p-8 font-sans">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-4xl font-bold">Admin Dashboard</h2>
                    <button 
                        onClick={() => setAppView('customerForm')} 
                        className="px-6 py-2 text-sm font-medium text-gray-200 bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ring-offset-gray-800 transition-colors"
                    >
                        Back to Customer Form
                    </button>
            </div>
                
                {allBookings.length === 0 ? (
                    <p className="text-xl text-center py-20 text-gray-400">No bookings submitted yet.</p>
                ) : (
                    <div className="space-y-12">
                        {(() => {
                            const isBookingCompleted = (booking) => 
                                !!booking.adminStatus.squeegeeRef && // Check if squeegeeRef is not empty
                                (booking.adminStatus.customerConfirmed === 'Confirmed by Call' || booking.adminStatus.customerConfirmed === 'Confirmed by Text');

                            const activeBookings = allBookings
                                .filter(b => !isBookingCompleted(b))
                                .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
                            
                            const completedBookings = allBookings
                                .filter(b => isBookingCompleted(b))
                                .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        return (
                                <>
                                    {/* Active Bookings Section */}
                                    <section>
                                        <h3 className="text-3xl font-semibold text-red-400 mb-6 pb-2 border-b border-gray-600">Active Bookings ({activeBookings.length})</h3>
                                        {activeBookings.length > 0 ? (
                                            <div className="space-y-8">
                                                {activeBookings.map(booking => (
                                                    <AdminBookingCard 
                                                        key={booking.id} 
                                                        booking={booking} 
                                                        onUpdateStatus={handleUpdateBookingStatus} 
                                                        houseOptions={houseOptions} 
                                                        frequencyOptions={frequencyOptionsData}
                                                        solarFrequencyOptions={solarFrequencyOptions}
                                                        formatCurrency={formatCurrency}
                                                        formatDateForDisplay={formatDateForDisplay}
                                                    />
                                                ))}
                    </div>
                                        ) : (
                                            <p className="text-lg text-center py-10 text-gray-400">No active bookings.</p>
                                        )}
                                    </section>

                                    {/* Completed Bookings Section */}
                                    {completedBookings.length > 0 && (
                                        <section className="mt-16">
                                            <h3 className="text-3xl font-semibold text-green-400 mb-6 pb-2 border-b border-gray-600">Completed Bookings ({completedBookings.length})</h3>
                                            <div className="space-y-2"> {/* Reduced space for compact lines */}
                                                {completedBookings.map(booking => (
                                                    booking.id === expandedCompletedBookingId ? (
                                                        <AdminBookingCard 
                                                            key={booking.id} 
                                                            booking={booking} 
                                                            onUpdateStatus={handleUpdateBookingStatus} 
                                                            houseOptions={houseOptions} 
                                                            frequencyOptions={frequencyOptionsData}
                                                            solarFrequencyOptions={solarFrequencyOptions}
                                                            formatCurrency={formatCurrency}
                                                            formatDateForDisplay={formatDateForDisplay}
                                                            isCompletedView={true}
                                                        />
                                                    ) : (
                                                        <CompactCompletedBookingLine
                                                            key={booking.id}
                                                            booking={booking}
                                                            onToggleExpand={handleToggleCompletedBookingExpand}
                                                            formatCurrency={formatCurrency}
                                                            formatDateForDisplay={formatDateForDisplay}
                                                        />
                                                    )
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
    // --- END RENDER CONTROL ---

    if (appView === 'bookingConfirmation') {
        // Determine if GoCardless section should be shown (e.g., for recurring services)
        const showGoCardless = lastSubmittedBookingDetails?.isRecurring || (lastSubmittedBookingDetails?.windowFrequency && lastSubmittedBookingDetails.windowFrequency !== 'adhoc') || true; // Show if any recurring service or default to true

        // Determine if the last submission was a quote request based on its details
        const wasQuoteRequest = lastSubmittedBookingDetails?.numBedrooms === '6+' || 
                                lastSubmittedBookingDetails?.propertyStyle === 'commercial' || 
                                lastSubmittedBookingDetails?.propertyStyle === 'other';

    return (
            <div className="max-w-2xl mx-auto mt-12 mb-12 bg-white p-6 sm:p-10 rounded-2xl shadow-xl font-sans">
                <div className="text-center">
                    <svg className="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                        {wasQuoteRequest ? 'Thank You For Your Enquiry!' : 'Thank You For Your Booking!'}
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base mb-6">
                        {lastSubmittedBookingDetails?.firstName ? `Thanks, ${lastSubmittedBookingDetails.firstName}! ` : ''}
                        {wasQuoteRequest 
                            ? "We\'ve received your enquiry details. We will be in touch via email shortly to discuss your requirements and provide a bespoke quotation."
                            : "We\'ve received your booking details. Your appointment is provisionally scheduled. Thank you for choosing Somerset Window Cleaning!"
                        }
                    </p>
                     <p className="text-xs text-gray-500 mb-10">
                        Please note: All prices quoted are based on standard property sizes and conditions. If your property requires significantly more work, we will notify you of any potential additional charges for your approval before commencing.
                    </p>
                </div>

                {/* GoCardless Section */}
                {showGoCardless && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-xl p-6 sm:p-8 my-8 shadow-lg">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                            <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6 p-3 bg-white rounded-full shadow-md">
                                <svg className="w-10 h-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                </svg>
                            </div>
                            <div className="flex-grow">
                                <h2 className="text-xl sm:text-2xl font-semibold text-blue-700 mb-1.5">Make Payments Easy with Direct Debit</h2>
                                <p className="text-sm text-gray-600 mb-4">
                                    For hassle-free payments for your regular cleaning services, set up a secure Direct Debit with GoCardless, our trusted payment partner. It's simple, secure, and means one less thing for you to worry about!
                                </p>
                            </div>
                             <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0">
                                <a 
                                    href="https://pay.gocardless.com/billing/static/collect-customer-details?id=BRF001Z09AYQNQ7HRK9HRF9J2BNPFJK8&initial=%2Fcollect-customer-details"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 text-base transform hover:scale-105"
                                >
                                    Set Up Direct Debit
                                </a>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-blue-200 text-xs text-gray-600 space-y-2">
                            <p className="font-semibold text-sm text-blue-700 text-center sm:text-left">Why Use Direct Debit?</p>
                            <ul className="list-disc list-outside pl-5 space-y-1 marker:text-blue-500">
                                <li><span className="font-medium text-gray-700">Convenient:</span> Say goodbye to manual payments! We'll automatically collect payment after each clean.</li>
                                <li><span className="font-medium text-gray-700">Secure:</span> All payments are processed by GoCardless, an FCA authorised payment institution, and protected by the Direct Debit Guarantee.</li>
                                <li><span className="font-medium text-gray-700">Transparent:</span> You'll always receive an email notification before any payment is taken.</li>
                                <li><span className="font-medium text-gray-700">Flexible:</span> You're in control and can cancel your Direct Debit mandate at any time through your bank.</li>
                            </ul>
                            <p className="mt-4 text-center text-[0.7rem] text-gray-500">You are fully protected by the Direct Debit Guarantee.</p>
                        </div>
                    </div>
                )}

                {/* REMOVED Make Another Enquiry Button 
                <div className="text-center mt-10">
                    <button 
                        onClick={handleMakeAnotherEnquiry}
                        className="px-8 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg font-semibold text-base transition-colors duration-150"
                    >
                        Make Another Enquiry
                    </button>
                </div>
                */}
            </div>
        );
    }

    // Original Customer Form Render (now wrapped in appView === 'customerForm')
    return appView === 'customerForm' ? (
        <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-3xl p-6 sm:p-8 font-sans border border-gray-200" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Step Indicator - Updated titles for 5 steps */}
            <div className="flex justify-center mb-12 text-xs sm:text-sm">
                 {stepTitles.map((title, idx) => {
                      const stepNumber = idx + 1;
                      const isActive = currentStep === stepNumber;
                      const isCompleted = currentStep > stepNumber;
                      // Allow navigation back to completed steps.
                      // For this redesign, navigation forward will be linear for now.
                      const goToStep = (targetStep) => {
                          if (targetStep === 4 && !isSpecialQuoteScenario() && !formData.selectedDate && !formData.isAsapRequested) {
                              setDateSelectionError('Please select an available date or request ASAP booking.');
                              return;
                          }
                          setCurrentStep(targetStep);
                      }
                    return (
                        <div key={title}
                              onClick={() => goToStep(stepNumber)}
                              className={`flex-1 text-center px-1 py-2 border-b-4 transition-all duration-200 font-semibold cursor-pointer
                                ${isActive ? 'border-blue-600 text-blue-600 bg-blue-50 rounded-t-md shadow-inner' 
                                          : isCompleted ? 'border-green-500 text-green-600 hover:bg-green-50' 
                                          : 'border-transparent text-gray-400 hover:text-blue-500'}`}
                        >
                              <span>{stepNumber}. {title}</span>
                        </div>
                    );
                })}
            </div>

            {/* Step 1: Property Details (NEW) */}
            {currentStep === 1 && (
                <section>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-8">1. Tell us about your property</h2>
                    
                    <div className="space-y-8">
                        {/* Property Style */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">What type of property is it? *</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {propertyStyleOptions.map(option => (
                                    <button
                                        key={option.value} type="button"
                                        onClick={() => {
                                            handlePropertyDetailChange('propertyStyle', option.value);
                                            // If commercial is selected, clear numBedrooms and commercialPropertyType
                                            if (option.value === 'commercial') {
                                                handlePropertyDetailChange('numBedrooms', '');
                                                handlePropertyDetailChange('commercialPropertyType', '');
                                            }
                                        }}
                                        className={`p-3 border rounded-lg text-center text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
                                            ${formData.propertyStyle === option.value ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-white hover:bg-blue-50 border-gray-300 text-gray-700'}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Commercial Property Type - Only show if commercial is selected */}
                        {formData.propertyStyle === 'commercial' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">What type of commercial property? *</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {commercialPropertyTypes.map(option => (
                                        <button
                                            key={option.value} type="button"
                                            onClick={() => handlePropertyDetailChange('commercialPropertyType', option.value)}
                                            className={`p-3 border rounded-lg text-center text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
                                                ${formData.commercialPropertyType === option.value ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-white hover:bg-blue-50 border-gray-300 text-gray-700'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Number of Bedrooms - Only show if not commercial */}
                        {formData.propertyStyle !== 'commercial' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Number of Bedrooms? *</h3>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {bedroomOptions.map(option => (
                                        <button
                                            key={option.value} type="button"
                                            onClick={() => handlePropertyDetailChange('numBedrooms', option.value)}
                                            className={`p-3 border rounded-lg text-center text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
                                                ${formData.numBedrooms === option.value ? 'bg-blue-600 text-white border-blue-700 shadow-md' : 'bg-white hover:bg-blue-50 border-gray-300 text-gray-700'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Extension & Conservatory - Only show if not commercial */}
                        {formData.propertyStyle !== 'commercial' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Does it have an extension?</h3>
                                    <div className="flex space-x-3">
                                        <button type="button" onClick={() => handlePropertyDetailChange('hasExtension', true)}
                                            className={`flex-1 p-3 border rounded-lg text-center ${formData.hasExtension === true ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50'}`}>Yes</button>
                                        <button type="button" onClick={() => handlePropertyDetailChange('hasExtension', false)}
                                            className={`flex-1 p-3 border rounded-lg text-center ${formData.hasExtension === false ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50'}`}>No</button>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Does it have a conservatory?</h3>
                                    <div className="flex space-x-3">
                                        <button type="button" onClick={() => handlePropertyDetailChange('hasConservatory', true)}
                                            className={`flex-1 p-3 border rounded-lg text-center ${formData.hasConservatory === true ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50'}`}>Yes</button>
                                        <button type="button" onClick={() => handlePropertyDetailChange('hasConservatory', false)}
                                            className={`flex-1 p-3 border rounded-lg text-center ${formData.hasConservatory === false ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50'}`}>No</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end mt-10">
                        <button 
                            type="button" 
                            disabled={
                                !formData.propertyStyle || 
                                (formData.propertyStyle !== 'commercial' && !formData.numBedrooms) ||
                                (formData.propertyStyle === 'commercial' && !formData.commercialPropertyType)
                            }
                            onClick={() => setCurrentStep(2)}
                            className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 
                                ${(!formData.propertyStyle || 
                                   (formData.propertyStyle !== 'commercial' && !formData.numBedrooms) ||
                                   (formData.propertyStyle === 'commercial' && !formData.commercialPropertyType)) 
                                    ? 'bg-gray-300 text-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            Continue
                        </button>
                    </div>
                </section>
            )}

            {/* Step 2: Services - Conditional Rendering */}
            {currentStep === 2 && (
                isSpecialQuoteScenario() ? (
                    // --- RENDER: SERVICES FOR QUOTATION (COMMERCIAL/BESPOKE) --- 
                    <section>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6 sm:mb-8">2. Services for Quotation</h2>
                        <p className="text-center text-gray-600 mb-8 text-sm">
                            Please select the services you are interested in receiving a quote for. We will contact you to discuss details and provide a tailored price.
                        </p>
                        <div className="space-y-5 sm:space-y-6">
                            <QuoteServiceCard 
                                title="Window Cleaning" 
                                selected={formData.services.window} 
                                onToggle={() => toggleService('window')} 
                            >
                                {/* Add frequency selection specifically for window cleaning in quote scenario */}
                                <div className="mt-3 mb-1">
                                    <span className="text-sm font-medium text-gray-600 block mb-2">Preferred Frequency (optional):</span>
                                    <div className="flex flex-wrap gap-2">
                                        {frequencyOptionsData.map(freq => (
                                            <button key={freq.value} type="button"
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    handleFrequencyChange(freq.value); 
                                                }}
                                                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-150 shadow-sm
                                                    ${formData.windowFrequency === freq.value && formData.services.window ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:border-blue-300'}`}
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
                                        <label htmlFor="conservatoryRoofPanelsQuote" className="block text-sm font-medium text-gray-600">Approx. Number of Roof Panels (optional): <span className="font-semibold text-blue-700">{formData.conservatoryRoofPanels}</span></label>
                                        <input type="range" id="conservatoryRoofPanelsQuote" name="conservatoryRoofPanels" min="1" max="30"
                                            value={formData.conservatoryRoofPanels}
                                            onChange={handleInputChange}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1 range-thumb-blue"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 px-1"><span>1</span><span>30</span></div>
                                    </div>
                                </QuoteServiceCard>
                            )}
                            <QuoteServiceCard title="Solar Panel Cleaning" selected={formData.services.solarPanels} onToggle={() => toggleService('solarPanels')} note="Maintain efficiency with regular cleaning.">
                                <div className="mt-3">
                                    <label htmlFor="solarPanelCountQuote" className="block text-sm font-medium text-gray-600">Approx. Number of Panels (optional): <span className="font-semibold text-blue-700">{formData.solarPanelCount}</span></label>
                                    <input type="range" id="solarPanelCountQuote" name="solarPanelCount" min="1" max="40"
                                        value={formData.solarPanelCount}
                                        onChange={handleInputChange}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1 range-thumb-blue"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 px-1"><span>1</span><span>40</span></div>
                                </div>
                            </QuoteServiceCard>
                        </div>
                        <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                            <button type="button" onClick={() => setCurrentStep(1)} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Back</button>
                            <button 
                                type="button" 
                                onClick={() => setCurrentStep(3)} 
                                className={`px-8 py-3 text-white font-semibold rounded-lg shadow-md transition-colors text-base bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                            >
                                Continue to Contact Details
                            </button>
                        </div>
                    </section>
                ) : (
                    // --- RENDER: STANDARD SERVICES WITH PRICING (REGULAR RESIDENTIAL) --- 
                    <section> 
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6 sm:mb-8">2. Build Your Clean</h2>
                        <div className="space-y-5 sm:space-y-6">
                            <ServiceCard
                                title="Window Cleaning"
                                price={calculatedPrices.window}
                                selected={formData.services.window}
                                onToggle={() => toggleService('window')}
                                formatCurrency={formatCurrency}
                                isFullyDiscounted={calculatedPrices.discount > 0 && calculatedPrices.discount === calculatedPrices.window}
                            >
                                <div className="mt-3 mb-1">
                                    <span className="text-sm font-medium text-gray-600 block mb-2">Frequency:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {frequencyOptionsData.map(freq => (
                                            <button key={freq.value} type="button"
                                                onClick={(e) => { e.stopPropagation(); handleFrequencyChange(freq.value); }}
                                                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-150 shadow-sm
                                                    ${formData.services.window && formData.windowFrequency === freq.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:border-blue-300'}`}
                                            >{freq.label}</button>
                                        ))}
                                    </div>
                                </div>
                            </ServiceCard>

                            <div className={`p-4 my-2 border-l-4 rounded-r-lg shadow transition-colors duration-300 ${formData.services.gutter && formData.services.fascia ? 'bg-green-100 border-green-500' : 'bg-amber-100 border-amber-500'}`}>
                                <p className={`text-sm sm:text-base ${formData.services.gutter && formData.services.fascia ? 'text-green-800' : 'text-amber-800'}`}>
                                   🎁 <span className="font-semibold">Special Offer:</span> Select Gutter Clearing & Fascia Cleaning and get regular Window Cleaning <span className="font-bold">FREE!</span> (Excludes One-off cleans).
                                </p>
                            </div>

                            <ServiceCard
                                title="Gutter Clearing"
                                price={calculatedPrices.gutter}
                                selected={formData.services.gutter}
                                onToggle={() => toggleService('gutter')}
                                formatCurrency={formatCurrency}
                                note="Clears debris from *inside* your gutters to ensure proper water flow and prevent blockages."
                            >
                               <div className="mt-3">
                                    <span className="text-sm font-medium text-gray-600 block mb-1.5">Frequency:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {gutterFasciaFrequencyOptions.map(freq => (
                                            <button key={freq.value} type="button"
                                                onClick={(e) => { e.stopPropagation(); handleGutterFrequencyChange(freq.value);}}
                                                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-150 shadow-sm
                                                    ${formData.services.gutter && formData.gutterFrequency === freq.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:border-blue-300'}`}
                                            >{freq.label}</button>
                                        ))}
                            </div>
                                </div>
                            </ServiceCard>

                            <ServiceCard
                                title="Fascia & Soffit Cleaning"
                                price={calculatedPrices.fascia}
                                selected={formData.services.fascia}
                                onToggle={() => toggleService('fascia')}
                                formatCurrency={formatCurrency}
                                note="Cleans the *external* surfaces of your gutters, fascias, and soffits – the parts visible from the ground – restoring their appearance."
                            >
                                <div className="mt-3">
                                    <span className="text-sm font-medium text-gray-600 block mb-1.5">Frequency:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {gutterFasciaFrequencyOptions.map(freq => (
                                            <button key={freq.value} type="button"
                                                onClick={(e) => { e.stopPropagation(); handleFasciaFrequencyChange(freq.value);}}
                                                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-150 shadow-sm
                                                    ${formData.services.fascia && formData.fasciaFrequency === freq.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:border-blue-300'}`}
                                            >{freq.label}</button>
                                        ))}
                                    </div>
                                </div>
                            </ServiceCard>
                            
                            {formData.hasConservatory && (
                                <ServiceCard
                                    title="Conservatory Roof Cleaning"
                                    price={calculatedPrices.conservatoryRoof}
                                    selected={formData.services.conservatoryRoof}
                                    onToggle={() => toggleService('conservatoryRoof')}
                                    formatCurrency={formatCurrency}
                                >
                                    <div className="mt-3">
                                        <label htmlFor="conservatoryRoofPanels" className="block text-sm font-medium text-gray-600">Number of Roof Panels: <span className="font-semibold text-blue-700">{formData.conservatoryRoofPanels}</span></label>
                                        <input type="range" id="conservatoryRoofPanels" name="conservatoryRoofPanels" min="1" max="30"
                                            value={formData.conservatoryRoofPanels}
                                            onChange={handleInputChange} // This keeps the service selected
                                            onClick={(e) => e.stopPropagation()} // Prevent card toggle when clicking slider
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1 range-thumb-blue"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 px-1"><span>1</span><span>30</span></div>
                                    </div>
                                    <div className="mt-3">
                                        <span className="text-sm font-medium text-gray-600 block mb-1.5">Frequency:</span>
                                        <div className="flex flex-wrap gap-2">
                                            {conservatoryRoofFrequencyOptions.map(freq => (
                                                <button key={freq.value} type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleConservatoryRoofFrequencyChange(freq.value);}} // stopPropagation is already here
                                                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-150 shadow-sm
                                                        ${formData.services.conservatoryRoof && formData.conservatoryRoofFrequency === freq.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:border-blue-300'}`}
                                                >{freq.label}</button>
                                            ))}
                                        </div>
                                    </div>
                                </ServiceCard>
                            )}

                            <ServiceCard
                                title="Solar Panel Cleaning"
                                price={calculatedPrices.solarPanels}
                                selected={formData.services.solarPanels}
                                onToggle={() => toggleService('solarPanels')}
                                formatCurrency={formatCurrency}
                                note="Maintain efficiency with regular cleaning."
                            >
                               <div className="space-y-4 mt-3"> {/* Changed from grid to space-y-4 for vertical stacking */}
                                    <div>
                                        <label htmlFor="solarPanelCount" className="block text-sm font-medium text-gray-600">Number of Panels: <span className="font-semibold text-blue-700">{formData.solarPanelCount}</span></label>
                                        <input type="range" id="solarPanelCount" name="solarPanelCount" min="1" max="40"
                                            value={formData.solarPanelCount}
                                            onChange={handleInputChange} // This should now keep the service selected
                                            onClick={(e) => e.stopPropagation()} // Prevent card toggle when clicking slider
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1 range-thumb-blue"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 px-1"><span>1</span><span>40</span></div>
                                    </div>
                                    <div>
                                         <label htmlFor="solarPanelFrequency" className="block text-sm font-medium text-gray-600 mb-1.5">Frequency:</label>
                                         <div className="flex flex-wrap gap-2">
                                            {solarFrequencyOptions.map(opt => (
                                                <button key={opt.value} type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleSolarPanelFrequencyChange(opt.value);}}
                                                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all duration-150 shadow-sm
                                                        ${formData.services.solarPanels && formData.solarPanelFrequency === opt.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:border-blue-300'}`}
                                                >{opt.label}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                 <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                                     <p className="font-medium">Access Note:</p>
                                     <p className="mt-1">If lift access or other specialised equipment is required to safely reach your solar panels, any additional hire costs will be quoted and charged separately after discussion.</p>
                                </div>
                            </ServiceCard>
                        </div>
                         <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                             <button type="button" onClick={() => setCurrentStep(1)} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Back</button>
                             <button 
                                 type="button" 
                                 disabled={!(formData.services.window || formData.services.gutter || formData.services.fascia || formData.services.conservatoryRoof || formData.services.solarPanels)}
                                 onClick={() => setCurrentStep(3)} 
                                 className={`px-8 py-3 text-white font-semibold rounded-lg shadow-md transition-colors text-base 
                                     ${!(formData.services.window || formData.services.gutter || formData.services.fascia || formData.services.conservatoryRoof || formData.services.solarPanels) ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                             >
                                 Continue to Contact Details
                            </button>
                        </div>
                    </section>
                )
            )}
            {/* REMOVED Fallback message for Special Quote Scenarios on Step 2 as the primary logic now handles it. */}
            
            {/* Step 3: Contact & Date Selection */}
            {currentStep === 3 && (
                    <section>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-6 sm:mb-8">3. Contact Details</h2>
                        <form className="space-y-4 sm:space-y-5" onSubmit={(e) => e.preventDefault()}> {/* Prevent default form submission */}
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
                                
                                {/* Inline Date Selection */}
                                {!isSpecialQuoteScenario() && (
                                    <div id="date-selection-area" className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Available Date for First Clean *</label>
                                        <div className="mt-2">
                                            {formData.postcode.trim().length < 2 ? (
                                                <p className="text-sm text-gray-500 p-3 border rounded-md bg-gray-50">Please enter your postcode above to see available dates.</p>
                                            ) : isLoadingDates ? (
                                                <div className="flex justify-center items-center p-4 border rounded-md bg-gray-50 text-gray-500">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Calculating available dates...</span>
                                                </div>
                                            ) : postcodeError ? (
                                                <p className="text-sm text-red-600 p-3 border border-red-200 rounded-md bg-red-50">{postcodeError}</p>
                                            ) : availableDates.length > 0 ? (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                                    {(() => {
                                                        // Filter to only unique dates by their time value, then sort ascending
                                                        const uniqueDates = [];
                                                        const seen = new Set();
                                                        const postcodePrefix = formData.postcode.split(' ')[0].toUpperCase();
                                                        const isCurrentlyFridayOnlyArea = specialPostcodeRules &&
                                                                                      Array.isArray(specialPostcodeRules.fridayOnly) &&
                                                                                      specialPostcodeRules.fridayOnly.some(pc => postcodePrefix.startsWith(pc));

                                                        availableDates
                                                            .filter(date => {
                                                                const dateObj = (date instanceof Date) ? date : getNextOccurrence(date);
                                                                if (!dateObj) return false;

                                                                // If it's a Friday-only area, only allow Fridays through this initial filter
                                                                if (isCurrentlyFridayOnlyArea && dateObj.getDay() !== 5) {
                                                                    return false;
                                                                }

                                                                const today = new Date();
                                                                today.setHours(0, 0, 0, 0);
                                                                const sixWeeksFromNow = new Date(today);
                                                                sixWeeksFromNow.setDate(today.getDate() + 42);
                                                                return dateObj >= today && dateObj <= sixWeeksFromNow;
                                                            })
                                                            .forEach(date => {
                                                                const dateObj = (date instanceof Date) ? date : getNextOccurrence(date);
                                                                if (!dateObj) return; // Should be redundant due to filter, but safe
                                                                const time = dateObj.getTime();
                                                                if (!seen.has(time)) {
                                                                    seen.add(time);
                                                                    uniqueDates.push(dateObj);
                                                                }
                                                            });
                                                        uniqueDates.sort((a, b) => a - b); // Sort ascending

                                                        if (uniqueDates.length === 0 && isCurrentlyFridayOnlyArea) {
                                                            return <p className="text-sm text-center col-span-full text-red-600 p-3 border border-red-200 rounded-md bg-red-50">No Fridays available in the next 6 weeks for this area. This area is only serviced on Fridays.</p>;
                                                        } else if (uniqueDates.length === 0) {
                                                            return <p className="text-sm text-center col-span-full text-gray-500 p-3 border rounded-md bg-gray-50">No available dates in the next 6 weeks for this postcode.</p>;
                                                        }

                                                        return uniqueDates.map(dateObj => {
                                                            const dateValue = formatDateForStorage(dateObj);
                                                            const isSelected = formData.selectedDate === dateValue;
                                                            return (
                                                                <button
                                                                    type="button"
                                                                    key={dateValue}
                                                                    onClick={() => handleDateSelect(dateObj)}
                                                                    className={`w-full text-center px-4 py-2 rounded border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 ${ // Added w-full and text-center
                                                                        isSelected
                                                                            ? 'bg-blue-600 text-white border-blue-700' // Highlight selected
                                                                            : 'bg-white text-gray-800 border-gray-300 hover:bg-blue-50'
                                                                    }`}
                                                                    aria-pressed={isSelected}
                                                                >
                                                                    {formatDateForDisplay(dateObj)}
                                                                </button>
                                                            );
                                                        });
                                                    })()}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500">No available dates found for this postcode.</p>
                                            )}
                                        </div>
                                        {dateSelectionError && <p className="mt-2 text-sm text-red-600 text-center">{dateSelectionError}</p>}
                                        <div className="mt-6 pt-6 border-t border-gray-200 text-center"> {/* ASAP Request */}
                                            <p className="text-sm text-gray-600 mb-3">Can't find a suitable date or need it sooner?</p>
                                            <button 
                                                type="button" 
                                                onClick={handleAsapRequestToggle} 
                                                disabled={formData.postcode.trim().length < 2 || postcodeError !== '' || isLoadingDates}
                                                className={`px-4 py-2 rounded-lg font-semibold border transition-colors duration-150 ${
                                                    formData.isAsapRequested 
                                                        ? 'bg-green-600 text-white border-green-700' 
                                                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-50'
                                                } ${(formData.postcode.trim().length < 2 || (postcodeError !== '' && availableDates.length === 0) || isLoadingDates) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {formData.isAsapRequested ? 'ASAP Requested' : 'Request ASAP Booking'}
                                            </button>
                                            {(postcodeError !== '') && (
                                                <p className="mt-2 text-xs text-red-500">Please enter a valid postcode for a covered area first.</p>
                                            )}
                                            {formData.isAsapRequested && (
                                                <p className="mt-2 text-xs text-gray-500">
                                                    We'll do our best to fit you in sooner if possible and will contact you to arrange.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                                    <button 
                                        type="button" 
                                        onClick={() => setCurrentStep(isSpecialQuoteScenario() ? 1 : 2)} 
                                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                                    >
                                        Back
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleContinueToReview} 
                                        disabled={
                                            !formData.firstName || !formData.lastName || !formData.email || !formData.mobile || !formData.address || !formData.postcode ||
                                            (!formData.selectedDate && !formData.isAsapRequested && !isSpecialQuoteScenario())
                                        } 
                                        className={`px-8 py-3 text-white font-semibold rounded-lg shadow-md transition-colors text-base bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                            (!formData.firstName || !formData.lastName || !formData.email || !formData.mobile || !formData.address || !formData.postcode ||
                                            (!formData.selectedDate && !formData.isAsapRequested && !isSpecialQuoteScenario()))
                                                ? 'opacity-50 cursor-not-allowed' 
                                                : ''
                                        }`}
                                    >
                                        Continue to Review
                                    </button>
                                </div>
                                {continueError && (
                                    <p className="mt-3 text-sm text-red-600 text-center p-2 bg-red-50 border border-red-200 rounded-md">
                                        {continueError}
                                    </p>
                                )}
                            </div>
                        </form>
                    </section>
                )}
                
                {/* Step 5 (was 4): Review */}
                {currentStep === 5 && (
                    <section> 
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-8 sm:mb-10">5. Review & Confirm Your Booking</h2>
                        <div className="space-y-6 bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 shadow">
                            {/* Trust/Guarantee Message */}
                            {/* Trust/Guarantee Message */}
                            {/* Property Details */}
                            <ReviewSection title="Property Details">
                                <ReviewItem label="Property Style" value={propertyStyleOptions.find(o => o.value === formData.propertyStyle)?.label || formData.propertyStyle} />
                                {formData.propertyStyle !== 'commercial' && (
                                    <ReviewItem label="Bedrooms" value={formData.numBedrooms} />
                                )}
                                <ReviewItem label="Extension" value={formData.hasExtension ? 'Yes' : 'No'} />
                                <ReviewItem label="Conservatory" value={formData.hasConservatory ? 'Yes' : 'No'} />
                            </ReviewSection>
                            {/* Selected Services */}
                            <ReviewSection title={isSpecialQuoteScenario() ? "Services Requested for Quotation" : "Selected Services & Price Breakdown"}>
                              {Object.entries(formData.services).filter(([key, val]) => val).length === 0 ? (
                                <span className="text-gray-500">No services selected.</span>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-sm border-separate border-spacing-y-2">
                                    <thead>
                                      <tr className="text-left text-gray-700 border-b">
                                        <th className="pr-4 pb-2">Service</th>
                                        {!isSpecialQuoteScenario() && (
                                          <>
                                            <th className="pr-4 pb-2">Details</th>
                                            <th className="pr-4 pb-2 text-right">Price</th>
                                          </>
                                        )}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {formData.services.window && (
                                        <tr className="bg-white rounded-lg shadow-sm">
                                          <td className="p-3 pr-4 font-semibold text-blue-900">Window Cleaning</td>
                                          {!isSpecialQuoteScenario() && (
                                            <>
                                              <td className="p-3 pr-4">
                                                {frequencyOptionsData.find(f=>f.value===formData.windowFrequency)?.label || formData.windowFrequency}
                                                <div className="text-xs text-gray-500">All external glass, frames, and sills cleaned.</div>
                                              </td>
                                              <td className="p-3 pr-4 text-right font-medium">{calculatedPrices.discount > 0 && calculatedPrices.discount === calculatedPrices.window ? <span className="text-green-600">FREE</span> : formatCurrency(calculatedPrices.window)}</td>
                                            </>
                                          )}
                                        </tr>
                                      )}
                                      {formData.services.gutter && (
                                        <tr className="bg-white rounded-lg shadow-sm">
                                          <td className="p-3 pr-4 font-semibold text-blue-900">Internal Gutter Clear</td>
                                          {!isSpecialQuoteScenario() && (
                                            <>
                                              <td className="p-3 pr-4">
                                                {gutterFasciaFrequencyOptions.find(f=>f.value===formData.gutterFrequency)?.label || formData.gutterFrequency}
                                                <div className="text-xs text-gray-500">Removal of debris from inside gutters to prevent blockages.</div>
                                              </td>
                                              <td className="p-3 pr-4 text-right font-medium">{formatCurrency(calculatedPrices.gutter)}</td>
                                            </>
                                          )}
                                        </tr>
                                      )}
                                      {formData.services.fascia && (
                                        <tr className="bg-white rounded-lg shadow-sm">
                                          <td className="p-3 pr-4 font-semibold text-blue-900">Fascia and Soffit Cleaning</td>
                                          {!isSpecialQuoteScenario() && (
                                            <>
                                              <td className="p-3 pr-4">
                                                {gutterFasciaFrequencyOptions.find(f=>f.value===formData.fasciaFrequency)?.label || formData.fasciaFrequency}
                                                <div className="text-xs text-gray-500">Restores the appearance of fascia and soffit boards.</div>
                                              </td>
                                              <td className="p-3 pr-4 text-right font-medium">{formatCurrency(calculatedPrices.fascia)}</td>
                                            </>
                                          )}
                                        </tr>
                                      )}
                                      {formData.services.solarPanels && (
                                        <tr className="bg-white rounded-lg shadow-sm">
                                          <td className="p-3 pr-4 font-semibold text-blue-900">Solar Panel Cleaning</td>
                                          {!isSpecialQuoteScenario() && (
                                            <>
                                              <td className="p-3 pr-4">
                                                {formData.solarPanelCount} panels, {solarFrequencyOptions.find(f=>f.value===formData.solarPanelFrequency)?.label || formData.solarPanelFrequency}
                                                <div className="text-xs text-gray-500">Maintains efficiency by removing dirt and debris.</div>
                                              </td>
                                              <td className="p-3 pr-4 text-right font-medium">{formatCurrency(calculatedPrices.solarPanels)}</td>
                                            </>
                                          )}
                                        </tr>
                                      )}
                                      {formData.services.conservatoryRoof && formData.hasConservatory && (
                                        <tr className="bg-white rounded-lg shadow-sm">
                                          <td className="p-3 pr-4 font-semibold text-blue-900">Conservatory Roof Cleaning</td>
                                          {!isSpecialQuoteScenario() && (
                                            <>
                                              <td className="p-3 pr-4">
                                                {formData.conservatoryRoofPanels} panels, {conservatoryRoofFrequencyOptions.find(f=>f.value===formData.conservatoryRoofFrequency)?.label || formData.conservatoryRoofFrequency}
                                                <div className="text-xs text-gray-500">Cleans and brightens conservatory roof panels.</div>
                                              </td>
                                              <td className="p-3 pr-4 text-right font-medium">{formatCurrency(calculatedPrices.conservatoryRoof)}</td>
                                            </>
                                          )}
                                        </tr>
                                      )}
                                    </tbody>
                                    {!isSpecialQuoteScenario() && (
                                      <tfoot>
                                        {/* Subtotal Row - Add if discount > 0 */}
                                        {calculatedPrices.discount > 0 && (
                                            <tr>
                                                <td colSpan={2} className="pt-4 text-right font-semibold text-gray-600">Subtotal</td>
                                                <td className="pt-4 text-right font-semibold text-gray-600">{formatCurrency(calculatedPrices.total + calculatedPrices.discount)}</td>
                                            </tr>
                                        )}
                                        {/* Discount Row - Modified for clarity */}
                                        {calculatedPrices.discount > 0 && (
                                          <tr>
                                            <td colSpan={2} className="pt-1 text-right font-semibold text-green-700">Discount Applied (Windows FREE Offer)</td>
                                            <td className="pt-1 text-right font-semibold text-green-700">- {formatCurrency(calculatedPrices.discount)}</td>
                                          </tr>
                                        )}
                                        {/* Total Row */}
                                        <tr>
                                          <td colSpan={2} className={`pt-2 text-right font-bold text-gray-900 ${calculatedPrices.discount > 0 ? 'border-t border-green-300' : ''}`}>Total</td>
                                          <td className={`pt-2 text-right text-2xl font-bold text-blue-700 ${calculatedPrices.discount > 0 ? 'border-t border-green-300' : ''}`}>{formatCurrency(calculatedPrices.total)}</td>
                                        </tr>
                                         {/* VAT Note */}
                                         <tr>
                                            <td colSpan={3} className="text-xs text-gray-500 text-right pt-1">(VAT Included)</td>
                                         </tr>
                                      </tfoot>
                                    )}
                                  </table>
                                </div>
                              )}
                            </ReviewSection>
                            {/* Contact Information */}
                            <ReviewSection title="Contact Information">
                                <ReviewItem label="First Name" value={formData.firstName} />
                                <ReviewItem label="Last Name" value={formData.lastName} />
                                <ReviewItem label="Email" value={formData.email} />
                                <ReviewItem label="Mobile" value={formData.mobile} />
                                <ReviewItem label="Address" value={formData.address} />
                                <ReviewItem label="Postcode" value={formData.postcode} />
                            </ReviewSection>
                            {/* Special Instructions */}
                            <ReviewSection title="Special Instructions (Optional)">
                                <textarea
                                    aria-label="Special instructions, e.g. gate code, ring bell before starting"
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    placeholder="Gate code, ring bell before starting, etc."
                                    value={formData.specialInstructions || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                                    rows={2}
                                />
                            </ReviewSection>
                            {/* Scheduled Date - Only show if not a special quote */}
                            {!isSpecialQuoteScenario() && (
                                <ReviewSection title="Scheduled Date">
                                    {formData.isAsapRequested ? (
                                        <span>ASAP Requested</span>
                                    ) : formData.selectedDate ? (
                                        <span>{
                                            (() => {
                                                const found = availableDates.find(d => {
                                                    const dateObj = (d instanceof Date) ? d : getNextOccurrence(d);
                                                    return dateObj && formatDateForStorage(dateObj) === formData.selectedDate;
                                                });
                                                if (found) {
                                                    const dateObj = (found instanceof Date) ? found : getNextOccurrence(found);
                                                    return dateObj ? formatDateForDisplay(dateObj) : formData.selectedDate;
                                                }
                                                return formData.selectedDate;
                                            })()
                                        }</span>
                                    ) : (
                                        <span className="text-gray-500">No date selected.</span>
                                    )}
                                </ReviewSection>
                            )}
                            {/* Quote Total / Bespoke Message - MODIFIED TO REMOVE REDUNDANT QUOTE TOTAL */}
                            {isSpecialQuoteScenario() && (
                                <ReviewSection title="Quotation Type">
                                    <p className="text-sm text-blue-700 p-3 border border-blue-200 rounded-md bg-blue-50">
                                        This is a request for a bespoke quotation. We will review the details and contact you shortly with a price.
                                    </p>
                                </ReviewSection>
                            )}
                            {/* The else block that showed a separate "Quote Total" section has been removed,
                               as the table in "Selected Services & Price Breakdown" already shows the total and discount. */}
                            
                            <p className="mt-4 text-xs text-gray-500 px-1">
                                Please note: Prices are estimates based on standard property sizes and access. We reserve the right to adjust the price on-site for properties that are larger, more complex, or require special access. Any changes will be fully discussed and agreed with you before any work commences.
                            </p>
                            {/* Need Help Link */}
                            <div className="mt-6 text-center">
                                <a href="mailto:info@yourcompany.com" className="text-blue-700 underline text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Need help? Email us">Need help? Contact us</a>
                            </div>
                        </div>
                        {/* ...existing reCAPTCHA and buttons... */}
                        <div className="my-6 flex flex-col items-center">
                            <ReCAPTCHA 
                                ref={recaptchaRef} 
                                sitekey="6LdwUDQrAAAAAJh5Z2V5paJn003OrFouc8KVdA0H" // NEW Site Key
                                onChange={(token) => setRecaptchaToken(token)} 
                            />
                            {reCaptchaError && <p className="mt-2 text-sm text-red-600">{reCaptchaError}</p>}
                        </div>
                        <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-8">
                            <button type="button" onClick={() => setCurrentStep(3)} className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Back</button>
                            <button 
                                type="button" 
                                onClick={handleSubmitBooking} 
                                disabled={!recaptchaToken}
                                className={`px-8 py-3 text-white font-semibold rounded-lg shadow-md transition-colors text-base bg-green-600 hover:bg-green-700 ${(!recaptchaToken || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Confirm & Submit Booking'}
                            </button>
                        </div>
                        {submissionError && (
                            <p className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-md border border-red-300">
                                {submissionError}
                            </p>
                        )}
                    </section>
                )}

                {/* Live Booking Summary -  Will need update to use isSpecialQuoteScenario */}
                {currentStep !== 1 && currentStep !== 5 && !isSpecialQuoteScenario() && (formData.services.window || formData.services.gutter || formData.services.fascia || formData.services.conservatoryRoof || formData.services.solarPanels) && (
                     <section className="mt-10 pt-6 sm:pt-8 border-t border-gray-200">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Your Quote Summary</h3>
                         <div className="space-y-2 bg-gray-50 p-4 sm:p-6 rounded-lg shadow-inner border border-gray-200">
                            {formData.services.window && (
                                <PriceLine 
                                    label={`Window Cleaning${formData.windowFrequency ? ` (${frequencyOptionsData.find(f=>f.value===formData.windowFrequency)?.label || formData.windowFrequency})` : ''}`}
                                    price={calculatedPrices.window} 
                                    formatCurrency={formatCurrency} 
                                    isDiscounted={calculatedPrices.discount > 0 && calculatedPrices.discount === calculatedPrices.window}
                                    originalPrice={calculatedPrices.originalWindowPriceForDiscount > 0 ? calculatedPrices.originalWindowPriceForDiscount : calculatedPrices.window}
                                    isWindowCleaning={true}
                                    calculatedPrices={calculatedPrices}
                                />
                            )}
                            {formData.hasExtension && calculatedPrices.extensionPrice > 0 && (
                                <div className="flex justify-between pl-4 text-xs text-gray-600">
                                    <span>+ Includes: Extension</span>
                                    <span>{formatCurrency(calculatedPrices.extensionPrice)}</span>
                                </div>
                            )}
                            {formData.hasConservatory && calculatedPrices.conservatoryPrice > 0 && (
                                <div className="flex justify-between pl-4 text-xs text-gray-600">
                                    <span>+ Includes: Conservatory (Windows)</span>
                                    <span>{formatCurrency(calculatedPrices.conservatoryPrice)}</span>
                                </div>
                            )}
                            {formData.services.gutter && (
                                <PriceLine 
                                    label={`Gutter Clearing${formData.gutterFrequency ? ` (${gutterFasciaFrequencyOptions.find(f=>f.value===formData.gutterFrequency)?.label || formData.gutterFrequency})` : ''}`}
                                    price={calculatedPrices.gutter} 
                                    formatCurrency={formatCurrency} 
                                    calculatedPrices={calculatedPrices}
                                />
                            )}
                            {formData.services.fascia && (
                                <PriceLine 
                                    label={`Fascia & Soffit Cleaning${formData.fasciaFrequency ? ` (${gutterFasciaFrequencyOptions.find(f=>f.value===formData.fasciaFrequency)?.label || formData.fasciaFrequency})` : ''}`}
                                    price={calculatedPrices.fascia} 
                                    formatCurrency={formatCurrency} 
                                    calculatedPrices={calculatedPrices}
                                />
                            )}
                            {formData.services.conservatoryRoof && formData.hasConservatory && (
                                <PriceLine 
                                    label={`Conservatory Roof Cleaning${formData.conservatoryRoofFrequency ? ` (${conservatoryRoofFrequencyOptions.find(f=>f.value===formData.conservatoryRoofFrequency)?.label || formData.conservatoryRoofFrequency})` : ''}`}
                                    price={calculatedPrices.conservatoryRoof} 
                                    formatCurrency={formatCurrency} 
                                    calculatedPrices={calculatedPrices}
                                />
                            )}
                            {formData.services.solarPanels && (
                                <PriceLine 
                                    label={`Solar Panel Cleaning${formData.solarPanelFrequency ? ` (${solarFrequencyOptions.find(f=>f.value===formData.solarPanelFrequency)?.label || formData.solarPanelFrequency})` : ''}`}
                                    price={calculatedPrices.solarPanels} 
                                    formatCurrency={formatCurrency} 
                                    calculatedPrices={calculatedPrices}
                                />
                            )}
                            {calculatedPrices.discount > 0 && (
                                <div className="flex justify-between items-center pt-2 border-t border-gray-300 mt-2">
                                    <span className="text-sm font-medium text-green-600">Special Offer Discount:</span>
                                    <span className="text-sm font-bold text-green-600">-{formatCurrency(calculatedPrices.discount)}</span>
                                </div>
                            )}
                            {/* Subtotal Line - Add if discount > 0 */}
                            {calculatedPrices.discount > 0 && (
                                <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-300">
                                    <span className="text-sm font-medium text-gray-600">Subtotal:</span>
                                    <span className="text-sm font-medium text-gray-600">{formatCurrency(calculatedPrices.total + calculatedPrices.discount)}</span>
                                </div>
                            )}
                            {/* Discount Line - Modified for clarity */}
                            {calculatedPrices.discount > 0 && (
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-sm font-medium text-green-600">Discount Applied (Windows FREE Offer):</span>
                                    <span className="text-sm font-bold text-green-600">-{formatCurrency(calculatedPrices.discount)}</span>
                                        </div>
                            )}
                            {/* Total Line */}
                            <div className={`flex justify-between items-center pt-3 mt-3 ${calculatedPrices.discount > 0 ? 'border-t-2 border-green-300' : 'border-t-2 border-gray-300'}`}>
                                <span className="text-lg font-bold text-gray-800">Estimated Total:</span>
                                <span className="text-2xl font-bold text-blue-600">{formatCurrency(calculatedPrices.total)}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-right">(VAT Included)</p>
                            {(formData.services.window || formData.services.gutter || formData.services.fascia) &&
                                <p className="text-xs text-gray-500 mt-3 text-center">This is an estimated price. All jobs are confirmed on-site before work commences. Payment is due upon completion.</p>
                            }
                        </div>
                     </section>
                    )}
                {/* Admin Area & FAQ links */}
                {/* ... */}
            </div>
        ) : null; // This closes the ternary for appView === 'customerForm'
    // THIS IS WHERE THE MAIN WindowCleaningForm COMPONENT FUNCTION SHOULD END
    // }; // REMOVE ANY EXTRA .adminDashboard return (...); block AND THE WindowCleaningForm = () => before it.

// --- Placeholder Helper Components ---
// These should be OUTSIDE the WindowCleaningForm component, or defined above it.
// For simplicity, I am assuming they are correctly defined elsewhere or above.
// const ServiceCard = (...) => ( ... );
// const InputField = (...) => ( ... );
// const RadioOption = (...) => ( ... );
// const ReviewSection = (...) => ( ... );
// const ReviewItem = (...) => ( ... );
// const AdminBookingCard = (...) => ( ... );
// const CompactCompletedBookingLine = (...) => ( ... );
// const PriceLine = (...) => ( ... );
// const QuoteServiceCard = (...) => ( ... );

// The conservatoryRoofFrequencyOptions and its handler were also moved inside in previous steps.
// They should remain inside the WindowCleaningForm component.

}; // This is the correct closing brace for the WindowCleaningForm arrow function.

export default WindowCleaningForm;
