import React, { useState, useEffect } from 'react';

// --- Icons ---
// Reusable Icon component
const Icon = ({ path, className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d={path} clipRule="evenodd" />
    </svg>
);

// Specific Icon components using the Icon base
const BuildingIcon = () => <Icon path="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm-7.071 0a1 1 0 001.414 1.414l.707-.707a1 1 0 10-1.414-1.414l-.707.707zM10 16a6 6 0 100-12 6 6 0 000 12z" />;
const CheckIcon = ({ className }) => <Icon path="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" className={className} />;
const ArrowRightIcon = ({ className }) => <Icon path="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" className={className} />;
const InfoIcon = () => <Icon path="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />;
const MailIcon = () => <Icon path="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884zM18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" className="w-6 h-6 mr-2"/>;
const DirectDebitIcon = () => <Icon path="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 6a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2v-4a2 2 0 00-2-2H4z" className="w-6 h-6 mr-2"/>;
// --- END Icons ---

// --- Date/Holiday Helper Functions ---
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// --- Helper function to generate 4-weekly dates ---
const generate4WeeklyDates = (startDateStr, numDates = 20) => {
    const dates = [];
    const parts = startDateStr.split(' ');
    if (parts.length !== 2) return dates; // Invalid format

    const day = parseInt(parts[0], 10);
    const monthIndex = months.findIndex(m => m.toLowerCase() === parts[1].toLowerCase());

    if (monthIndex === -1 || isNaN(day)) return dates; // Invalid month or day

    // Assume start year is 2025 based on user input context
    let currentDate = new Date(2025, monthIndex, day);

    for (let i = 0; i < numDates; i++) {
        // Ensure date object is valid before proceeding
        if (isNaN(currentDate.getTime())) {
            console.error("Invalid date encountered in generate4WeeklyDates for start:", startDateStr);
            break; // Stop if date becomes invalid
        }
        const formattedDay = currentDate.getDate().toString().padStart(2, '0');
        const formattedMonth = months[currentDate.getMonth()];
        dates.push(`${formattedDay} ${formattedMonth}`);
        currentDate.setDate(currentDate.getDate() + 28); // Add 4 weeks
    }
    return dates;
};


// --- Schedule Data ---
// Rebuilt schedule based on user's table (Apr 3 2025) with 4-weekly cycles.
// BA16/BS28 dates updated based on Apr 3/4 request.
// BA6/BA16 have entries here but are overridden by special Friday logic in useEffect.
const scheduleData = [
  // Group 1 NORTH (Mon-Fri)
  { postcodes: ['BS40', 'BS48', 'BS49', 'BS22', 'BS23', 'BS24', 'BS21'], area: 'Weston Backwell Blagdon Yatton Clevedon', dates: generate4WeeklyDates('20 Jan') }, // Mon Start
  { postcodes: ['BS25', 'BS29'], area: 'Banwell Winscombe', dates: generate4WeeklyDates('21 Jan') }, // Tue Start
  { postcodes: ['BS26'], area: 'Axbridge', dates: generate4WeeklyDates('22 Jan') }, // Wed Start
  { postcodes: ['BS26', 'BS27'], area: 'Axbridge / Cheddar', dates: generate4WeeklyDates('23 Jan') }, // Thu Start
  { postcodes: ['BS27'], area: 'Cheddar', dates: generate4WeeklyDates('24 Jan') }, // Fri Start

  // Group 2 EAST (Mon-Fri)
  { postcodes: ['BA7', 'BA9', 'BA10', 'BA11', 'BA8'], area: 'Wincanton Bruton Castle Cary Frome Templecombe', dates: generate4WeeklyDates('27 Jan') }, // Mon Start
  { postcodes: ['BS39', 'BA3', 'BA4'], area: 'Paulton Radstock Shepton', dates: generate4WeeklyDates('28 Jan') }, // Tue Start
  { postcodes: ['BA5', 'BA6'], area: 'Shepton Wells', dates: generate4WeeklyDates('01 Jan') }, // Wed Start (Includes BA6 non-Meare)
  { postcodes: ['BA5'], area: 'Wells', dates: generate4WeeklyDates('02 Jan') }, // Thu Start
  { postcodes: ['BA5'], area: 'Wells', dates: generate4WeeklyDates('03 Jan') }, // Fri Start

  // Group 3 SOUTH (Mon-Fri)
  { postcodes: ['TA18', 'TA19', 'TA20', 'BA22', 'TA17', 'TA12', 'TA13', 'TA14', 'DT9'], area: 'Yeovil Illminster Chard Crewkerne Ilchester Stoke-Sub-Hamdon Martock Sherbourne', dates: generate4WeeklyDates('06 Jan') }, // Mon Start
  { postcodes: ['TA10', 'TA11'], area: 'Langport Somerton', dates: generate4WeeklyDates('07 Jan') }, // Tue Start
  { postcodes: ['TA10', 'TA11'], area: 'Langport Somerton', dates: generate4WeeklyDates('08 Jan') }, // Wed Start
  { postcodes: ['BA6'], area: 'Glastonbury', dates: generate4WeeklyDates('09 Jan') }, // Thu Start (BA6 non-Meare) - Overridden by Friday Rule if postcode BA6 entered
  { postcodes: ['BA6'], area: 'Glastonbury', dates: generate4WeeklyDates('10 Jan') }, // Fri Start (BA6 non-Meare) - Overridden by Friday Rule if postcode BA6 entered

  // Group 4 WEST (Mon-Fri)
  { postcodes: ['TA7', 'TA6', 'TA2', 'TA3', 'TA9', 'TA8', 'TA1'], area: 'Bridgwater Taunton Mark Highbridge', dates: generate4WeeklyDates('13 Jan') }, // Mon Start
  // --- UPDATED BS28 (Consolidated Tue/Wed/Thu Cycle starting Apr 8/9/10) ---
  {
    postcodes: ['BS28'],
    area: 'Wedmore',
    // 4-weekly cycle starting Tue/Wed/Thu Apr 8/9/10, 2025
    dates: [
        // Tue Cycle (Start Apr 8)
        '08 Apr', '06 May', '03 Jun', '01 Jul', '29 Jul', '26 Aug', '23 Sep', '21 Oct', '18 Nov', '16 Dec', '13 Jan', '10 Feb', '10 Mar', '07 Apr', '05 May', '02 Jun', '30 Jun', '28 Jul', '25 Aug', '22 Sep',
        // Wed Cycle (Start Apr 9)
        '09 Apr', '07 May', '04 Jun', '02 Jul', '30 Jul', '27 Aug', '24 Sep', '22 Oct', '19 Nov', '17 Dec', '14 Jan', '11 Feb', '11 Mar', '08 Apr', '06 May', '03 Jun', '01 Jul', '29 Jul', '26 Aug', '23 Sep',
        // Thu Cycle (Start Apr 10)
        '10 Apr', '08 May', '05 Jun', '03 Jul', '31 Jul', '28 Aug', '25 Sep', '23 Oct', '20 Nov', '18 Dec', '15 Jan', '12 Feb', '12 Mar', '09 Apr', '07 May', '04 Jun', '02 Jul', '30 Jul', '27 Aug', '24 Sep' // 2025-2026
    ]
  },
  // --- BA6-MEARE (Separate, uses its own 4-weekly cycle from table) ---
  { postcodes: ['BA6-MEARE'], area: 'Wedmore Meare', dates: generate4WeeklyDates('16 Jan') }, // Thu Start
  // --- UPDATED BA16 (4-weekly cycle starting Apr 11) ---
  {
    postcodes: ['BA16'],
    area: 'Street',
    // 4-weekly cycle starting Fri, Apr 11, 2025 - Overridden by Friday Rule in useEffect
    dates: ['11 Apr', '09 May', '06 Jun', '04 Jul', '01 Aug', '29 Aug', '26 Sep', '24 Oct', '21 Nov', '19 Dec', '16 Jan', '13 Feb', '13 Mar', '10 Apr', '08 May', '05 Jun', '03 Jul', '31 Jul', '28 Aug', '25 Sep'] // 2025-2026
  }
];
// --- END Schedule Data ---


// --- Date/Holiday Helper Functions ---
/**
 * Checks if a given date is a UK bank holiday (basic implementation for 2024/2025/2026).
 * NOTE: This is a placeholder and should be replaced with a more robust solution
 * (e.g., using an API or a dedicated library) for production use.
 * Includes known 2025/2026 dates.
 * @param {Date} date - The date to check.
 * @returns {boolean} - True if the date is identified as a bank holiday, false otherwise.
 */
const isBankHoliday = (date) => {
    if (!date || isNaN(date.getTime())) return false; // Check for invalid date
    // Very basic placeholder - replace with accurate logic or library
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed
    const day = date.getDate();
    const monthDay = `${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`; // Format MM-DD

    // Fixed Dates (New Year's Day)
    if (monthDay === '01-01') return true;

    // 2024 Specific Dates
    if (year === 2024) {
        const holidays2024 = ['03-29', '04-01', '05-06', '05-27', '08-26', '12-25', '12-26'];
        if (holidays2024.includes(monthDay)) return true;
    }
    // 2025 Specific Dates (Verified UK Bank Holidays)
    if (year === 2025) {
        const holidays2025 = [
            '04-18', // Good Friday
            '04-21', // Easter Monday
            '05-05', // Early May bank holiday
            '05-26', // Spring bank holiday
            '08-25', // Summer bank holiday
            '12-25', // Christmas Day
            '12-26'  // Boxing Day
        ];
        if (holidays2025.includes(monthDay)) return true;
    }
     // 2026 Specific Dates (Verified UK Bank Holidays)
    if (year === 2026) {
        const holidays2026 = [
            '04-03', // Good Friday
            '04-06', // Easter Monday
            '05-04', // Early May bank holiday
            '05-25', // Spring bank holiday
            '08-31', // Summer bank holiday
            '12-25', // Christmas Day
            '12-28'  // Boxing Day (substitute day)
        ];
         if (holidays2026.includes(monthDay)) return true;
    }

    return false;
};

/**
 * Checks if a given date falls on a weekend (Saturday or Sunday).
 * @param {Date} date - The date to check.
 * @returns {boolean} - True if the date is a weekend, false otherwise.
 */
const isWeekend = (date) => {
    if (!date || isNaN(date.getTime())) return false; // Check for invalid date
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    return day === 0 || day === 6;
};

/**
 * Finds the next working day based on the target date, attempting specific Bank Holiday shifts.
 * - If target is Mon BH, returns Tue.
 * - If target is Fri BH, attempts to return previous Thu.
 * - Otherwise, increments day by day until a non-weekend, non-BH day is found.
 * @param {Date} date - The target scheduled date.
 * @returns {Date} - The calculated available working day.
 */
const findFirstWorkingDayFrom = (date) => {
    if (!date || isNaN(date.getTime())) {
        console.error("Invalid date passed to findFirstWorkingDayFrom:", date);
        return new Date(); // Return today or handle error appropriately
    }
    const originalDate = new Date(date); // Keep original date reference

    // Specific check: If the target date was a Friday Bank Holiday
    if (originalDate.getDay() === 5 && isBankHoliday(originalDate)) {
        const thursday = new Date(originalDate); // Create clone for Thursday check
        thursday.setDate(thursday.getDate() - 1);
        // Check if the preceding Thursday is a working day
        if (!isWeekend(thursday) && !isBankHoliday(thursday)) {
            return thursday; // Return preceding Thursday
        }
        // If Thursday is not viable, fall through to find the *next* working day using the loop
    }

    // Specific check: If the target date was a Monday Bank Holiday
    // (This is also handled by the loop below, but explicit check is fine for clarity)
    if (originalDate.getDay() === 1 && isBankHoliday(originalDate)) {
         const tuesday = new Date(originalDate); // Create clone for Tuesday check
         tuesday.setDate(tuesday.getDate() + 1);
         // Check if the next Tuesday is a working day
         if (!isWeekend(tuesday) && !isBankHoliday(tuesday)) {
             return tuesday; // Return next Tuesday
         }
         // If Tuesday is not viable, fall through to find the *next* working day using the loop
    }


    // General loop: Find the first working day on or after the target date
    const loopDate = new Date(originalDate); // Use a new clone for the loop
    while (isWeekend(loopDate) || isBankHoliday(loopDate)) {
        loopDate.setDate(loopDate.getDate() + 1); // Increment the day
        // Add safety break for infinite loops (e.g., if all days are BHs?)
        if (loopDate.getFullYear() > originalDate.getFullYear() + 2) {
             console.error("Potential infinite loop in findFirstWorkingDayFrom for date:", originalDate);
             return loopDate; // Return whatever date we reached
        }
    }
    return loopDate;
};


/**
 * Calculates the next occurrence of a specific date string (e.g., "20 Jan")
 * relative to today. Assumes dates in scheduleData are for 2025 or later.
 * @param {string} dateStr - The date string in "DD Mon" format (e.g., "20 Jan").
 * @returns {Date|null} - The Date object for the next occurrence, or null if parsing fails.
 */
const getNextOccurrence = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to the start of the day

    const parts = dateStr.split(' ');
    if (parts.length !== 2) return null; // Invalid format

    const day = parseInt(parts[0], 10);
    const monthIndex = months.findIndex(m => m.toLowerCase() === parts[1].toLowerCase());

    if (monthIndex === -1 || isNaN(day)) return null; // Invalid month or day

    let targetYear = 2025; // Assume schedule dates start in 2025
    const currentYear = today.getFullYear();

    // If today is already past 2025, start checking from today's year
    if (currentYear > targetYear) {
        targetYear = currentYear;
    }

    let targetDate = new Date(targetYear, monthIndex, day);
     // Check if targetDate is valid before normalizing
    if (isNaN(targetDate.getTime())) {
        console.error("Invalid date created in getNextOccurrence for:", dateStr, targetYear);
        return null;
    }
    targetDate.setHours(0, 0, 0, 0);

    // If the target date in the calculated year is before today, advance year by year until it's not
    while (targetDate < today) {
        targetYear++;
        targetDate = new Date(targetYear, monthIndex, day);
        if (isNaN(targetDate.getTime())) { // Check again after year increment
             console.error("Invalid date after year increment in getNextOccurrence for:", dateStr, targetYear);
             return null;
        }
        targetDate.setHours(0, 0, 0, 0); // Normalize again
    }

    return targetDate;
};


/**
 * Formats a Date object for display to the user.
 * Example: "Wed, 15 May 2024"
 * @param {Date} date - The date to format.
 * @returns {string} - The formatted date string.
 */
const formatDateForDisplay = (date) => {
    if (!date || isNaN(date.getTime())) return "Invalid Date";
    return date.toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Formats a Date object into Windsor-MM-DD format, suitable for storing or using as a value.
 * @param {Date} date - The date to format.
 * @returns {string} - The date string in Windsor-MM-DD format.
 */
const formatDateForStorage = (date) => {
     if (!date || isNaN(date.getTime())) return "";
     return date.toISOString().split('T')[0];
}
// --- END Date Helpers ---

// --- Commercial Service Options ---
const commercialFrequencyOptions = [
    { value: "asap", label: "ASAP (One-off)" }, { value: "2-weekly", label: "Every 2 Weeks" },
    { value: "4-weekly", label: "Every 4 Weeks" }, { value: "8-weekly", label: "Every 8 Weeks" },
    { value: "12-weekly", label: "Every 12 Weeks" }, { value: "6-monthly", label: "Every 6 Months" },
    { value: "12-monthly", label: "Every 12 Months" }, { value: "2-yearly", label: "Every 2 Years" },
];

// Initial state for commercial services selection
const initialCommercialServices = {
    exteriorWindowCleaning: { selected: false, frequency: '4-weekly' },
    interiorWindowCleaning: { selected: false, frequency: '4-weekly' },
    gutterClearing: { selected: false, frequency: '12-monthly' },
    fasciaClean: { selected: false, frequency: '12-monthly' },
    softWashing: { selected: false, frequency: 'asap' },
    pressureWashing: { selected: false, frequency: 'asap' },
    solarPanelCleaning: { selected: false, frequency: '6-monthly' }
};
// --- END Commercial Service Options ---

// --- Main Form Component ---
const WindowCleaningForm = () => {
    // State Variables
    const [step, setStep] = useState(1); // Current step in the multi-step form
    const [isSubmitted, setIsSubmitted] = useState(false); // Tracks if the form has been successfully submitted
    // --- ADDED isLoadingDates state ---
    const [isLoadingDates, setIsLoadingDates] = useState(false);
    const [formData, setFormData] = useState({ // Holds all form input data
        // Contact & Address
        firstName: '',
        lastName: '',
        businessName: '', // Added Business Name
        email: '', mobile: '', address: '', postcode: '', contactPreference: 'email', message: '',
        // Property Type (Residential)
        houseType: '', bedrooms: 3, isDetached: false,
        // Residential Options
        frequency: '4-weekly', selectedDate: '',
        hasConservatory: false,
        hasExtension: false,
        conservatoryRoof: false, // Checkbox state
        conservatoryRoofPanels: 6, // Re-added panel count
        solarPanels: false, solarPanelCount: 5, solarPanelFrequency: 'adhoc',
        gutterClearing: false,
        gutterFasciaClean: false,
        // Flags
        isCommercial: false,
        isCustomQuote: false,
        // Commercial Details
        commercialBuildingType: '', commercialServices: initialCommercialServices, commercialDesiredTiming: 'flexible', commercialNotes: ''
    });
    const [price, setPrice] = useState({ // Holds calculated price estimates
        windowCleaningBase: 0, frequencyAdjustment: 0, gutterClearing: 0, gutterFasciaClean: 0,
        conservatoryRoof: 0, // Will now hold calculated price or 0
        solarPanels: 0, total: 0, discount: 0
    });
    const [availableDates, setAvailableDates] = useState([]); // Stores calculated available dates (Date objects) based on postcode
    const [postcodeError, setPostcodeError] = useState(''); // Error message related to postcode lookup/availability
    const [dateSelectionError, setDateSelectionError] = useState(''); // Error message for date selection validation

    // --- Data Definitions ---
    // Residential house types with base pricing (for 4-weekly cleans)
    const houseOptions = [
        { id: 'semi-small', label: '1-2 Bed Semi-Detached', bedrooms: 2, isDetached: false, basePrice: 20 },
        { id: 'detached-small', label: '1-2 Bed Detached', bedrooms: 2, isDetached: true, basePrice: 25 },
        { id: 'semi-3', label: '3 Bed Semi-Detached', bedrooms: 3, isDetached: false, basePrice: 25 },
        { id: 'detached-3', label: '3 Bed Detached', bedrooms: 3, isDetached: true, basePrice: 30 },
        { id: 'semi-4', label: '4 Bed Semi-Detached', bedrooms: 4, isDetached: false, basePrice: 30 },
        { id: 'detached-4', label: '4 Bed Detached', bedrooms: 4, isDetached: true, basePrice: 35 },
        { id: 'semi-5', label: '5 Bed Semi-Detached', bedrooms: 5, isDetached: false, basePrice: 35 },
        { id: 'detached-5', label: '5 Bed Detached', bedrooms: 5, isDetached: true, basePrice: 40 },
        { id: 'bespoke', label: '6+ Beds / Bespoke', bedrooms: 6, isDetached: true, basePrice: 0 } // Requires custom quote
    ];

    /**
     * Formats a number into UK currency string.
     * @param {number} amount - The amount to format.
     * @returns {string} - Formatted currency string (e.g., "£25.00").
     */
    const formatCurrency = (amount) => `£${amount.toFixed(2)}`;

    // --- Effects ---
    // Effect to recalculate price whenever relevant form data changes
    useEffect(() => {
        const calculatePrice = () => {
            // Reset prices
            let windowCleaningBasePrice = 0, frequencyAdj = 0, conservatoryRoofPrice = 0, solarPanelPrice = 0;
            let baseGutterClearingPrice = 0, baseGutterFasciaPrice = 0, total = 0, discount = 0;

            // Find the selected house type definition
            const selectedHouse = formData.houseType ? houseOptions.find(option => option.id === formData.houseType) : null;

            // Calculate only for standard residential quotes
            if (selectedHouse && !formData.isCustomQuote && !formData.isCommercial) {
                // Base window cleaning price from house type
                windowCleaningBasePrice = selectedHouse.basePrice;
                // Add extra for conservatory windows
                if (formData.hasConservatory) windowCleaningBasePrice += 5;
                // --- ADDED: Add extra for extension windows ---
                if (formData.hasExtension) windowCleaningBasePrice += 5;

                // --- UPDATED Frequency Adjustment Logic ---
                if (formData.frequency === '8-weekly') frequencyAdj = 0; // Same price as 4-weekly
                else if (formData.frequency === '12-weekly') frequencyAdj = 5; // +£5 for 12-weekly
                else if (formData.frequency === 'adhoc') frequencyAdj = windowCleaningBasePrice; // Keep for doubling logic
                else frequencyAdj = 0; // Default for 4-weekly

                // Calculate current window cleaning price including frequency adjustment (but not doubling for adhoc yet)
                const currentWindowCleaningPrice = windowCleaningBasePrice + (formData.frequency === 'adhoc' ? 0 : frequencyAdj);

                // --- UPDATED: Calculate add-on prices ---
                if (formData.conservatoryRoof) conservatoryRoofPrice = formData.conservatoryRoofPanels * 10; // £10 per panel
                if (formData.solarPanels) solarPanelPrice = formData.solarPanelCount * 10; // £10 per panel (no minimum)

                // Calculate base gutter/fascia prices based on bedrooms
                const bedrooms = selectedHouse.bedrooms;
                baseGutterClearingPrice = bedrooms <= 2 ? 80 : bedrooms === 3 ? 100 : bedrooms === 4 ? 120 : 140;
                baseGutterFasciaPrice = bedrooms <= 2 ? 100 : bedrooms === 3 ? 120 : bedrooms === 4 ? 140 : 160;

                // Get actual costs based on selection
                const gutterClearingCost = formData.gutterClearing ? baseGutterClearingPrice : 0;
                const gutterFasciaCost = formData.gutterFasciaClean ? baseGutterFasciaPrice : 0;

                // Apply discount: Free window clean if both gutter services are selected on a regular plan
                if (formData.gutterClearing && formData.gutterFasciaClean && formData.frequency !== 'adhoc') {
                     // Discount the calculated window price *including* frequency adjustment
                    discount = currentWindowCleaningPrice;
                }

                // Calculate total price
                // Note: Adhoc window price is handled in renderPriceLine for display clarity
                total = currentWindowCleaningPrice + gutterClearingCost + gutterFasciaCost + conservatoryRoofPrice + solarPanelPrice - discount;

                // Update price state
                setPrice({
                    windowCleaningBase: windowCleaningBasePrice,
                    frequencyAdjustment: (formData.frequency === 'adhoc' ? 0 : frequencyAdj), // Store adjustment separately
                    gutterClearing: baseGutterClearingPrice, // Store base price for display
                    gutterFasciaClean: baseGutterFasciaPrice, // Store base price for display
                    conservatoryRoof: conservatoryRoofPrice, // Store calculated price
                    solarPanels: solarPanelPrice,
                    total: total,
                    discount: discount
                });
            } else {
                // Reset price if not a standard residential quote
                setPrice({ windowCleaningBase: 0, frequencyAdjustment: 0, gutterClearing: 0, gutterFasciaClean: 0, conservatoryRoof: 0, solarPanels: 0, total: 0, discount: 0 });
            }
        };
        calculatePrice();
    }, [formData]); // Dependency array: recalculate whenever formData changes

    // Effect to calculate available dates when postcode/address changes or user reaches step 3
    useEffect(() => {
        const calculateAvailableDates = () => {
            // Reset state before calculation
            setAvailableDates([]);
            setPostcodeError('');
            setFormData(prev => ({ ...prev, selectedDate: '' })); // Clear selected date if postcode changes

            const rawPostcode = formData.postcode.trim().toUpperCase();
            if (rawPostcode.length < 2) {
                setIsLoadingDates(false);
                return;
            }

            setIsLoadingDates(true);
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);
                const sixWeeksFromNow = new Date(today);
                sixWeeksFromNow.setDate(today.getDate() + 42); // 6 weeks = 42 days

                let datesToProcess = [];
                let scheduleEntry = null;
                const isMeare = rawPostcode.startsWith('BA6') && formData.address.toLowerCase().includes('meare');

                if ((rawPostcode.startsWith('BA6') && !isMeare) || rawPostcode.startsWith('BA16')) {
                    let currentCheckDate = new Date(tomorrow);
                    let fridaysFound = [];
                    while (currentCheckDate <= sixWeeksFromNow) {
                        if (currentCheckDate.getDay() === 5) {
                            let workingFriday = findFirstWorkingDayFrom(currentCheckDate);
                            if (workingFriday >= tomorrow && workingFriday <= sixWeeksFromNow) {
                                if (!fridaysFound.some(d => d.getTime() === workingFriday.getTime())) {
                                    fridaysFound.push(workingFriday);
                                }
                            }
                        }
                        currentCheckDate.setDate(currentCheckDate.getDate() + 1);
                    }
                    fridaysFound.sort((a, b) => a - b);
                    setAvailableDates(fridaysFound);
                    if (fridaysFound.length === 0) {
                        setPostcodeError('No available Fridays found in the next 6 weeks for your area.');
                    }
                } else {
                    if (isMeare) {
                        scheduleEntry = scheduleData.find(entry => entry.postcodes.includes('BA6-MEARE'));
                        if (scheduleEntry) {
                            datesToProcess = scheduleEntry.dates;
                        } else {
                            console.warn("BA6-MEARE entry not found in scheduleData");
                            scheduleEntry = scheduleData.find(entry => entry.postcodes.some(prefix => rawPostcode.startsWith(prefix) && prefix === 'BA6'));
                            if (scheduleEntry) datesToProcess = scheduleEntry.dates;
                        }
                    } else {
                        scheduleEntry = scheduleData.find(entry =>
                            entry.postcodes.some(prefix => rawPostcode.startsWith(prefix) && prefix !== 'BA6-MEARE')
                        );
                        if (scheduleEntry) datesToProcess = scheduleEntry.dates;
                    }

                    if (scheduleEntry) {
                        const validDates = [];
                        datesToProcess.forEach(dateStr => {
                            let nextOccurrence = getNextOccurrence(dateStr);
                            if (!nextOccurrence) return;

                            let adjustedDate = findFirstWorkingDayFrom(nextOccurrence);
                            if (adjustedDate >= tomorrow && adjustedDate <= sixWeeksFromNow) {
                                validDates.push(adjustedDate);
                            }
                        });

                        const uniqueSortedDates = [...new Set(validDates.map(d => d.getTime()))]
                            .map(time => new Date(time))
                            .sort((a, b) => a - b);

                        setAvailableDates(uniqueSortedDates);

                        if (uniqueSortedDates.length === 0 && !postcodeError) {
                            setPostcodeError('No available scheduled dates found in the next 6 weeks for your area.');
                        }
                    } else {
                        setPostcodeError('Sorry, schedule not found for your postcode area.');
                    }
                }
            } catch (error) {
                console.error("Error calculating dates:", error);
                setPostcodeError("An error occurred while calculating dates.");
            } finally {
                setIsLoadingDates(false);
            }
        };

        // Trigger calculation only on step 3 and if postcode is long enough and it's a standard residential quote
        if (step === 3 && formData.postcode.trim().length >= 2 && !formData.isCommercial && !formData.isCustomQuote) {
            // Use setTimeout to allow the loading state to render before blocking thread
            // Although calculations here are fast, this is good practice for potentially slower operations
             setTimeout(calculateAvailableDates, 0);
        } else {
            // Reset dates/errors if not applicable
            setAvailableDates([]);
            setPostcodeError('');
            setIsLoadingDates(false); // Ensure loading is off if not applicable
        }
        // Cleanup function not strictly necessary here as state updates handle it
    }, [formData.postcode, formData.address, step, formData.isCommercial, formData.isCustomQuote]); // Dependencies for date calculation

    // --- Event Handlers ---
    /**
     * Handles changes in form inputs (text, select, checkbox, radio).
     * Updates the formData state accordingly.
     * Special handling for nested commercialServices state.
     */
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Clear date selection error if user interacts with postcode or address (date selection handled separately)
        if (name === 'postcode' || name === 'address') {
            setDateSelectionError('');
        }

        // Handle nested commercial service state updates
        if (name.startsWith('commercialServices.')) {
            const parts = name.split('.'); // e.g., ['commercialServices', 'exteriorWindowCleaning', 'selected']
            const serviceName = parts[1];
            const propertyName = parts[2]; // 'selected' or 'frequency'
            setFormData(prev => ({
                ...prev,
                commercialServices: {
                    ...prev.commercialServices,
                    [serviceName]: {
                        ...prev.commercialServices[serviceName],
                        [propertyName]: type === 'checkbox' ? checked : value
                    }
                }
            }));
        // --- REMOVED specific handler for conservatoryRoof radio ---
        } else {
            // Handle standard form inputs
            const val = (name === 'conservatoryRoofPanels' || name === 'solarPanelCount') // Re-added conservatoryRoofPanels
                ? parseInt(value, 10) // Ensure sliders update with numbers
                : value;
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : val
            }));
        }
    };

     /**
     * Handles clicking on an available date button.
     * Updates the selectedDate in formData.
     */
    const handleDateSelect = (date) => {
        const dateValue = formatDateForStorage(date); // Get Windsor-MM-DD string
        setFormData(prev => ({ ...prev, selectedDate: dateValue }));
        setDateSelectionError(''); // Clear error on selection
    };


    /**
     * Handles selection of a residential house type.
     * Updates formData with details from the selected option.
     * Resets potentially irrelevant fields if switching to/from 'bespoke'.
     * Navigates to the appropriate next step.
     */
    const handleHouseSelect = (option) => {
        const isCustom = option.id === 'bespoke';
        setFormData(prev => ({
            ...prev,
            houseType: option.id,
            bedrooms: option.bedrooms,
            isDetached: option.isDetached,
            isCustomQuote: isCustom,
            isCommercial: false, // Ensure commercial is off
            // Reset options if switching to bespoke
            gutterClearing: isCustom ? false : prev.gutterClearing,
            gutterFasciaClean: isCustom ? false : prev.gutterFasciaClean,
            hasConservatory: isCustom ? false : prev.hasConservatory,
            conservatoryRoof: false, // Reset conservatory roof selection
            conservatoryRoofPanels: 6, // Reset panels
            hasExtension: isCustom ? false : prev.hasExtension, // Reset extension
            solarPanels: isCustom ? false : prev.solarPanels,
        }));
        goToStep(isCustom ? 3 : 2); // Skip options step for bespoke
    };

    /**
     * Handles toggling between Residential and Commercial quote types.
     * Resets form data relevant to the *other* type.
     * Resets the step back to 1.
     */
    const handleCommercialToggle = (isNowCommercial) => {
        setFormData(prev => ({
            ...prev,
            isCommercial: isNowCommercial,
            // Reset residential specifics if switching TO commercial
            houseType: isNowCommercial ? '' : prev.houseType,
            isCustomQuote: isNowCommercial ? false : prev.isCustomQuote,
            hasConservatory: isNowCommercial ? false : prev.hasConservatory,
            conservatoryRoof: false, // Reset conservatory roof selection
            conservatoryRoofPanels: 6, // Reset panels
            hasExtension: isNowCommercial ? false : prev.hasExtension, // Reset extension
            solarPanels: isNowCommercial ? false : prev.solarPanels,
            gutterClearing: isNowCommercial ? false : prev.gutterClearing,
            gutterFasciaClean: isNowCommercial ? false : prev.gutterFasciaClean,
            selectedDate: '', // Clear date when switching type
            // Reset commercial specifics if switching TO residential
            commercialBuildingType: !isNowCommercial ? '' : prev.commercialBuildingType,
            commercialServices: !isNowCommercial ? initialCommercialServices : prev.commercialServices,
            commercialNotes: !isNowCommercial ? '' : prev.commercialNotes,
            businessName: !isNowCommercial ? '' : prev.businessName, // Reset business name
        }));
        setStep(1); // Go back to the first step
        setDateSelectionError(''); // Clear potential errors
        setPostcodeError('');
    };

    /**
     * Handles the final form submission.
     * Performs validation (e.g., date selection).
     * Formats data for submission (e.g., commercial services, selected date).
     * Logs the data to the console (replace with actual submission logic).
     * Sets the `isSubmitted` flag to show the thank you screen.
     */
    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission
        setDateSelectionError(''); // Clear previous errors

        // Validation: Ensure a date is selected for standard residential bookings
        if (!formData.isCommercial && !formData.isCustomQuote && !formData.selectedDate) {
            setDateSelectionError('Please select an available date for your first clean.');
            // Try to scroll to the date selection area
            document.getElementById('date-selection-area')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return; // Stop submission
        }

        // --- Prepare data for submission ---
        const submissionData = { ...formData };
        // Remove fields not needed for submission if desired
        // delete submissionData.conservatoryRoofFrequency; // No longer exists


        // Simplify commercial services data - only include selected services and their frequency
        if (submissionData.isCommercial) {
            submissionData.commercialServices = Object.entries(submissionData.commercialServices)
                .filter(([_, value]) => value.selected) // Keep only selected services
                .reduce((acc, [key, value]) => {
                    acc[key] = value.frequency; // Store frequency only
                    return acc;
                }, {});
        } else {
             // Remove commercial specific fields if it's a residential submission
             delete submissionData.businessName;
             delete submissionData.commercialBuildingType;
             delete submissionData.commercialServices;
             delete submissionData.commercialNotes;
             delete submissionData.commercialDesiredTiming;
        }

        // Format the selected date for display/storage (it's already Windsor-MM-DD, find the object to format for display)
        if (submissionData.selectedDate) {
             // Find the original Date object to format it nicely for the submission log/summary
            const dateObj = availableDates.find(d => formatDateForStorage(d) === submissionData.selectedDate);
            // Keep selectedDate as Windsor-MM-DD for backend, but maybe log the display format
            const displayDate = dateObj ? formatDateForDisplay(dateObj) : submissionData.selectedDate;
            // Example: Add displayDate to submission if needed for confirmation emails etc.
            // submissionData.selectedDateDisplay = displayDate;
        }


        // --- Actual Submission ---
        // Replace console.log with your API call or submission logic
        console.log('Form submitted:', { ...submissionData, price });
        // TODO: Send data to backend (e.g., using fetch or axios)

        // --- Post Submission ---
        setIsSubmitted(true); // Show thank you screen
        window.scrollTo(0, 0); // Scroll to top
    };

    /**
     * Navigates to a specific step in the form and scrolls to the top.
     * @param {number} newStep - The step number to navigate to.
     */
    const goToStep = (newStep) => {
        setStep(newStep);
        window.scrollTo(0, 0); // Scroll to top on step change
    };

    // --- Styling Classes ---
    // Reusable Tailwind CSS class strings for consistency
    const inputClasses = "block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 p-2 border";
    const checkboxClasses = "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded";
    const labelClasses = "block text-sm font-medium text-gray-700";

    // --- Helper Rendering Functions ---
    /**
     * Renders a single line item in the price summary.
     * Handles conditional display (e.g., only show if value > 0), discount formatting,
     * and frequency adjustment labels.
     * Special handling for displaying the doubled 'adhoc' window cleaning rate.
     */
    const renderPriceLine = (label, value, isDiscount = false, isAdjustment = false, className = '') => {
        // Don't render lines with zero value unless it's a discount
        if (value <= 0 && !isDiscount) return null;
        if (value === 0 && isDiscount) return null; // Don't render zero discounts

        let displayValue = formatCurrency(value);
        let displayLabel = label;

        // Handle Frequency Adjustment Label/Display Logic
        if (isAdjustment) {
            if (formData.frequency === 'adhoc') {
                // Adhoc adjustment is handled by doubling the base price display, so don't show this line
                return null;
            } else if (formData.frequency !== '4-weekly' && formData.frequency !== '8-weekly') { // Only show label if adjustment > 0 (i.e. 12-weekly)
                displayLabel = `${label} (${formData.frequency})`;
            } else {
                // Don't show adjustment line if it's standard 4-weekly or 8-weekly (adjustment is 0)
                 return null;
            }
        }

        // Handle Window Cleaning Label/Display Logic for Adhoc
        if (label === "Window Cleaning" && formData.frequency === 'adhoc' && !formData.isCommercial) {
            displayLabel = `${label} (One-off Rate)`;
            // Ensure price.windowCleaningBase is calculated correctly before doubling
            const houseOption = houseOptions.find(o => o.id === formData.houseType);
            const basePrice = houseOption ? houseOption.basePrice : 0;
            const conservatoryPrice = formData.hasConservatory ? 5 : 0;
            const extensionPrice = formData.hasExtension ? 5 : 0;
            displayValue = formatCurrency((basePrice + conservatoryPrice + extensionPrice) * 2); // Double base including conservatory/extension additions
        }


        return (
            <div className={`flex justify-between items-center text-sm py-1 ${className}`}>
                <span className={isDiscount ? "text-green-600" : "text-gray-600"}>{displayLabel}:</span>
                <span className={`font-medium ${isDiscount ? "text-green-600" : isAdjustment ? "text-blue-600" : "text-gray-800"}`}>
                    {isDiscount ? `- ${displayValue}` : (isAdjustment ? `+ ${displayValue}` : displayValue)}
                </span>
            </div>
        );
    };

    // --- Conditional Rendering: Thank You Screen ---
    if (isSubmitted) {
        return (
            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg p-8 lg:p-12 mb-10 text-center">
                <CheckIcon className="w-16 h-16 md:w-20 md:h-20 text-green-500 mx-auto mb-5" />
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">Thank You For Your Enquiry!</h2>
                 {/* --- UPDATED Commercial/Residential Confirmation Text --- */}
                <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                    {formData.isCommercial ? (
                        "We've received your details and will be in touch shortly to discuss your requirements." // Simple text for commercial
                    ) : (
                        // Existing logic for residential (standard and bespoke)
                        <>
                            We've received your details and will be in touch via {formData.contactPreference === 'text' ? 'text message' : 'email'} shortly
                            {formData.isCustomQuote ? ' to discuss your requirements.' : ' to confirm pricing and scheduling.'}
                        </>
                    )}
                </p>

                {/* Direct Debit Section - Show only for regular residential bookings */}
                {!formData.isCommercial && formData.frequency !== 'adhoc' && !formData.isCustomQuote && (
                    <div className="mt-10 pt-8 border-t border-gray-200 bg-gradient-to-b from-blue-50 to-white p-6 md:p-8 rounded-lg text-left shadow-sm border border-blue-100">
                        <div className="flex flex-col sm:flex-row items-center mb-4">
                            <DirectDebitIcon />
                            {/* --- UK Spelling Correction --- */}
                            <h3 className="text-xl font-semibold text-blue-800 text-center sm:text-left ml-2">Easy Payments with GoCardless Direct Debit</h3>
                        </div>
                        <p className="text-sm text-gray-700 mb-4">Make paying for your regular window cleaning effortless! Set up a secure Direct Debit mandate with GoCardless, our trusted payment partner.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                            <div>
                                <h4 className="font-semibold text-gray-800 mb-1">Why Use Direct Debit?</h4>
                                <ul className="list-disc list-inside pl-2 space-y-1">
                                    <li><span className="font-medium">Convenient:</span> Automatic payments after each clean – no manual effort needed.</li>
                                     {/* --- UK Spelling Correction --- */}
                                    <li><span className="font-medium">Secure:</span> Payments processed by GoCardless, authorised by the Financial Conduct Authority.</li>
                                    <li><span className="font-medium">Transparent:</span> You'll always be notified by email before any payment is taken.</li>
                                    <li><span className="font-medium">Flexible:</span> You can cancel the mandate easily at any time.</li>
                                </ul>
                            </div>
                            <div className="flex items-center justify-center mt-4 md:mt-0">
                                {/* IMPORTANT: Replace with your actual GoCardless payment link */}
                                <a href="https://pay.gocardless.com/BRT0002EH17JGWX" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    Set Up Secure Direct Debit
                                </a>
                            </div>
                        </div>
                         {/* --- UK Spelling Correction --- */}
                        <p className="text-xs text-gray-500 mt-4 text-center">You are fully protected by the Direct Debit Guarantee.</p>
                    </div>
                )}

                {/* Button to start a new enquiry */}
                <button
                    type="button"
                    onClick={() => {
                        setIsSubmitted(false);
                        setStep(1);
                        // Optional: Reset formData to initial state if desired
                        // setFormData({ ...initial state... });
                    }}
                    className="mt-10 px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                    Make Another Enquiry
                </button>
            </div>
        );
    }
    // --- END Thank You Screen ---


    // --- Form Rendering ---
    // Assumes 'Inter' font is available via Tailwind config or global CSS
    return (
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg p-6 sm:p-8 mb-10 relative font-sans">
             {/* --- REMOVED Logo Placeholder --- */}

            {/* Header: Title and Commercial/Residential Toggle */}
            <div className="flex justify-between items-center mb-8">
                 <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 flex-1 text-center pr-4 md:pr-0">{/* Title centred on small screens, allow button space */}
                    {formData.isCommercial ? 'Commercial Cleaning Enquiry' : 'Window Cleaning Enquiry'}
                 </h2>
                {!formData.isCommercial && step === 1 && (
                     <button type="button" onClick={() => handleCommercialToggle(true)} className="flex-shrink-0 flex items-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-md shadow-sm hover:from-blue-700 hover:to-blue-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                        <BuildingIcon className="w-4 h-4 mr-1.5" /> Commercial Quote
                    </button>
                )}
                {formData.isCommercial && step === 1 && (
                    <button type="button" onClick={() => handleCommercialToggle(false)} className="flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
                        Back to Residential
                    </button>
                )}
            </div>

            {/* Step Indicator */}
            <div className="flex border-b border-gray-200 mb-8">
                {['Property Type', 'Options', 'Contact Details'].map((title, index) => (
                    <div
                        key={index}
                        // --- UPDATED: Disable clicking Step 2 if Commercial or Custom Quote ---
                        className={`flex-1 py-2 text-center border-b-4 transition-colors duration-300
                            ${step >= index + 1 ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}
                            ${(step > index + 1 && !((formData.isCommercial || formData.isCustomQuote) && index + 1 === 2))
                                ? 'cursor-pointer hover:text-gray-700 hover:border-blue-400'
                                : 'cursor-default'}`}
                        onClick={() => (step > index + 1 && !((formData.isCommercial || formData.isCustomQuote) && index + 1 === 2)) && goToStep(index + 1)}
                    >
                        <span className="text-sm font-medium">{`${index + 1}. ${title}`}</span>
                    </div>
                ))}
            </div>

            {/* Form Content - Renders based on current 'step' */}
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* --- STEP 1: Property Type --- */}
                {step === 1 && (
                    <div>
                        {formData.isCommercial ? (
                            // --- Commercial Property Details ---
                            <div className="border rounded-lg p-6 bg-gray-50">
                                <h4 className="text-lg font-semibold text-gray-800 mb-6 text-center flex items-center justify-center"><BuildingIcon className="w-5 h-5" /> <span className="ml-2">Commercial Property Details</span></h4>
                                {/* ... rest of commercial form ... */}
                                <div className="space-y-5">
                                    {/* Building Type Dropdown */}
                                    <div>
                                        <label htmlFor="commercialBuildingType" className={labelClasses}>Building Type</label>
                                        <select id="commercialBuildingType" name="commercialBuildingType" value={formData.commercialBuildingType} onChange={handleChange} className={inputClasses}>
                                            <option value="">Please Select...</option>
                                            <option value="office">Office Building</option>
                                            <option value="retail">Retail Store/Shop</option>
                                            <option value="restaurant">Restaurant/Café</option>
                                            <option value="industrial">Industrial Unit</option>
                                            <option value="warehouse">Warehouse</option>
                                            <option value="school">School/Educational</option>
                                            <option value="medical">Medical Facility</option>
                                            <option value="other">Other (specify below)</option>
                                        </select>
                                    </div>
                                    {/* Services Required & Frequency */}
                                    <div>
                                        <label className={`${labelClasses} mb-2`}>Services Required & Frequency</label>
                                        <div className="space-y-4">
                                            {Object.entries(formData.commercialServices).map(([key, serviceData]) => (
                                                <div key={key} className="p-3 border rounded bg-white shadow-sm">
                                                    <div className="flex items-start sm:items-center flex-col sm:flex-row">
                                                        {/* Service Checkbox */}
                                                        <label className="flex items-center flex-grow mb-2 sm:mb-0 cursor-pointer">
                                                            <input type="checkbox" name={`commercialServices.${key}.selected`} checked={serviceData.selected} onChange={handleChange} className={checkboxClasses}/>
                                                            <span className="ml-2 text-sm font-medium text-gray-700">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span> {/* Format key for display */}
                                                        </label>
                                                        {/* Frequency Dropdown (shown only if service is selected) */}
                                                        {serviceData.selected && (
                                                            <div className="w-full sm:w-auto sm:ml-4 flex-shrink-0">
                                                                <select
                                                                    name={`commercialServices.${key}.frequency`}
                                                                    value={serviceData.frequency}
                                                                    onChange={handleChange}
                                                                    className={`${inputClasses} mt-0 text-xs py-1`}
                                                                    aria-label={`Frequency for ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`}
                                                                >
                                                                    {commercialFrequencyOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                                                                </select>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Additional Notes */}
                                    <div>
                                        <label htmlFor="commercialNotes" className={labelClasses}>Additional Information / Specific Requirements</label>
                                        <textarea id="commercialNotes" name="commercialNotes" rows={4} value={formData.commercialNotes} onChange={handleChange} placeholder="e.g., Access restrictions, number of floors, specific areas..." className={inputClasses}></textarea>
                                    </div>
                                </div>
                                {/* Navigation */}
                                <div className="flex justify-end mt-8">
                                    {/* --- Enhanced Button Style --- */}
                                    <button type="button" onClick={() => goToStep(3)} className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-md shadow-sm hover:from-blue-700 hover:to-blue-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                                        Continue <ArrowRightIcon className="w-4 h-4 ml-1.5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // --- Residential Property Selection ---
                            <>
                                <div className="text-center mb-6"><p className="text-sm text-gray-600">Select the option that best describes your home.</p></div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {houseOptions.map(option => (
                                        <div
                                            key={option.id}
                                            onClick={() => handleHouseSelect(option)}
                                            className={`border rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ease-in-out shadow-sm hover:shadow-md hover:border-blue-400 ${formData.houseType === option.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 bg-white'}`}
                                        >
                                            <h4 className="font-medium text-sm sm:text-base text-gray-800">{option.label}</h4>
                                            {option.id === 'bespoke' ? (
                                                <p className="text-xs mt-2 text-blue-600 font-medium">Custom Quote</p>
                                            ) : (
                                                <p className="text-lg font-bold text-blue-600 mt-2">{formatCurrency(option.basePrice)}</p>
                                            )}
                                            {/* --- REMOVED Frequency Text --- */}
                                            {option.id === 'bespoke' && <p className="text-xs text-gray-500 mt-1">Site visit required</p>}
                                        </div>
                                    ))}
                                </div>
                                 {/* --- UPDATED Disclaimer Text --- */}
                                <p className="text-xs text-gray-500 italic text-center mt-4">Prices shown are base estimates for standard properties based on a regular (4 or 8 weekly) clean. Final quote may vary.</p>
                            </>
                        )}
                    </div>
                )}

                {/* --- STEP 2: Options (Residential Only, Not Bespoke) --- */}
                {step === 2 && !formData.isCommercial && !formData.isCustomQuote && (
                    <div className="space-y-8">
                        {/* --- SECTION 1: Window Cleaning Options --- */}
                        <div className="border border-gray-200 rounded-lg p-6 bg-slate-50 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Window Cleaning Options</h3>
                            {/* Display selected property type */}
                            <div className="bg-white p-3 rounded-md mb-5 text-sm border border-gray-200">Selected Property: <span className="font-medium">{houseOptions.find(o => o.id === formData.houseType)?.label}</span></div>
                            <div className="space-y-5">
                                {/* Cleaning Frequency Selection */}
                                <div>
                                    <label className={`${labelClasses} mb-2`}>Cleaning Frequency</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { value: '4-weekly', label: '4 Weekly', priceMod: '+£0.00' }, // Changed display
                                            { value: '8-weekly', label: '8 Weekly', priceMod: '+£0.00' }, // Changed display
                                            { value: '12-weekly', label: '12 Weekly', priceMod: '+£5.00' },
                                            { value: 'adhoc', label: 'One-off', priceMod: 'x2 Rate' }
                                        ].map(freq => (
                                            <label key={freq.value} className={`border rounded-lg p-3 text-center cursor-pointer transition-colors bg-white ${formData.frequency === freq.value ? 'border-blue-500 ring-1 ring-blue-300' : 'hover:bg-gray-50 border-gray-300'}`}>
                                                <input type="radio" name="frequency" value={freq.value} checked={formData.frequency === freq.value} onChange={handleChange} className="sr-only"/>
                                                <span className="block font-medium text-sm">{freq.label}</span>
                                                <span className="text-xs text-gray-500">{freq.priceMod}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Extension Option */}
                                <label className="flex items-center justify-between p-3 border bg-white rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <div className="flex items-center">
                                        <input type="checkbox" id="hasExtension" name="hasExtension" checked={formData.hasExtension} onChange={handleChange} className={checkboxClasses}/>
                                        <span className="ml-3 text-sm font-medium text-gray-700">Do you have an extension?</span>
                                    </div>
                                    <span className="text-sm font-semibold text-blue-600 ml-2 whitespace-nowrap">+ {formatCurrency(5)}</span>
                                </label>

                                {/* Conservatory Option */}
                                <label className="flex items-center justify-between p-3 border bg-white rounded-lg hover:bg-gray-50 cursor-pointer">
                                     <div className="flex items-center">
                                        <input type="checkbox" id="hasConservatory" name="hasConservatory" checked={formData.hasConservatory} onChange={handleChange} className={checkboxClasses}/>
                                        <span className="ml-3 text-sm font-medium text-gray-700">Do you have a conservatory?</span>
                                    </div>
                                    <span className="text-sm font-semibold text-blue-600 ml-2 whitespace-nowrap">+ {formatCurrency(5)}</span>
                                </label>
                            </div>
                        </div>

                        {/* --- SECTION 2: Conservatory Roof (Conditional) --- */}
                        {formData.hasConservatory && (
                            <div className="border border-gray-200 rounded-lg p-6 bg-slate-50 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Conservatory Roof</h3>
                                {/* Checkbox for Cleaning */}
                                <label className="flex items-center justify-between p-3 border bg-white rounded-lg hover:bg-gray-50 cursor-pointer mb-4">
                                    <div className="flex items-center flex-grow"> {/* Allow text to wrap */}
                                        <input type="checkbox" id="conservatoryRoof" name="conservatoryRoof" checked={formData.conservatoryRoof} onChange={handleChange} className={`${checkboxClasses} flex-shrink-0`}/>
                                        <div className='ml-3'>
                                            {/* Updated Wording */}
                                            <span className="text-sm font-medium text-gray-700">Would you like your conservatory roof cleaned?</span>
                                            {/* Added Price per panel text */}
                                            <p className="text-xs text-gray-500">£10 per panel</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-blue-600 ml-2 whitespace-nowrap flex-shrink-0">
                                        {/* Show calculated price if checked */}
                                        {formData.conservatoryRoof ? `+ ${formatCurrency(price.conservatoryRoof)}` : ''}
                                    </span>
                                </label>

                                {/* Panel Slider (shown only if roof cleaning checked) */}
                                {formData.conservatoryRoof && (
                                    <div className="ml-6 pl-4 py-4 border-l-2 border-blue-100 space-y-3 bg-blue-50/50 rounded-r-lg">
                                        <div>
                                            <label htmlFor="conservatoryRoofPanels" className={`${labelClasses} text-xs mb-1`}> Number of Roof Panels: <span className="font-semibold text-blue-600">{formData.conservatoryRoofPanels}</span> </label>
                                            <input type="range" id="conservatoryRoofPanels" name="conservatoryRoofPanels" value={formData.conservatoryRoofPanels} onChange={handleChange} min="1" max="30" step="1" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-thumb-blue"/>
                                            <div className="flex justify-between text-xs text-gray-500 px-1"><span>1</span><span>30</span></div>
                                            <p className="text-xs text-gray-500 mt-1"> Price: {formatCurrency(price.conservatoryRoof)} </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                         {/* --- SECTION 3: Solar Panels --- */}
                         <div className="border border-gray-200 rounded-lg p-6 bg-slate-50 shadow-sm">
                             <h3 className="text-lg font-semibold text-gray-800 mb-4">Solar Panels</h3>
                              {/* --- UPDATED Layout & Text --- */}
                             <label className="flex items-center justify-between p-3 border bg-white rounded-lg hover:bg-gray-50 cursor-pointer">
                                 <div className="flex items-center flex-grow"> {/* Allow text to wrap */}
                                     <input type="checkbox" id="solarPanels" name="solarPanels" checked={formData.solarPanels} onChange={handleChange} className={`${checkboxClasses} flex-shrink-0`}/>
                                     <div className="ml-3">
                                         {/* Updated Wording */}
                                         <span className="text-sm font-medium text-gray-700">Would you like your solar panels cleaned?</span>
                                         {/* Updated price text */}
                                         <p className="text-xs text-gray-500">£10 per panel</p>
                                     </div>
                                 </div>
                                 <span className="text-sm font-semibold text-blue-600 ml-2 whitespace-nowrap flex-shrink-0">
                                     {/* Show calculated price if checked */}
                                    {formData.solarPanels ? `+ ${formatCurrency(price.solarPanels)}` : ''}
                                 </span>
                             </label>
                             {/* Solar Panel Count & Frequency (if selected) */}
                             {formData.solarPanels && (
                                 <>
                                 <div className="ml-6 pl-4 py-4 border-l-2 border-blue-100 space-y-4 bg-blue-50/50 rounded-r-lg mt-4">
                                     <div>
                                         <label htmlFor="solarPanelCount" className={`${labelClasses} text-xs mb-1`}> Number of Solar Panels: <span className="font-semibold text-blue-600">{formData.solarPanelCount}</span> </label>
                                         <input type="range" id="solarPanelCount" name="solarPanelCount" value={formData.solarPanelCount} onChange={handleChange} min="1" max="40" step="1" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-thumb-blue"/>
                                         <div className="flex justify-between text-xs text-gray-500 px-1"><span>1</span><span>40</span></div>
                                         <p className="text-xs text-gray-500 mt-1"> Cost: {formatCurrency(price.solarPanels)} </p>
                                     </div>
                                     <div>
                                         <label htmlFor="solarPanelFrequency" className={`${labelClasses} text-xs mb-1`}>Schedule</label>
                                         <select name="solarPanelFrequency" id="solarPanelFrequency" value={formData.solarPanelFrequency} onChange={handleChange} className={`${inputClasses} text-xs py-1`}>
                                             <option value="adhoc">One-off clean</option>
                                             <option value="6-monthly">Every 6 months</option>
                                             <option value="annually">Once a year</option>
                                         </select>
                                         <p className="text-xs text-gray-500 mt-1 italic">Regular cleaning maintains efficiency.</p>
                                     </div>
                                 </div>
                                  {/* Access Note for Solar Panels */}
                                 <div className="ml-6 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                                     <p className="font-medium">Access Note:</p>
                                      {/* UK Spelling Correction */}
                                     <p className="mt-1">If lift access or other specialised equipment is required to safely reach your solar panels, any additional hire costs will be charged separately. We will always discuss and agree upon any extra charges with you before commencing work.</p>
                                 </div>
                                 </>
                             )}
                         </div>

                        {/* --- SECTION 4: Gutter Cleaning Services --- */}
                        <div className="border border-gray-200 rounded-lg p-6 bg-slate-50 shadow-sm">
                             {/* Updated Title */}
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Gutter Cleaning Services</h3>
                            {/* Special Offer Banner */}
                            {formData.frequency !== 'adhoc' && (
                                <div className="p-3 mb-5 bg-green-50 border border-green-200 rounded-md text-sm text-green-800 flex items-center">
                                    <span className="text-xl mr-2">🎁</span>
                                    <div><span className="font-medium">Special Offer:</span> Book both gutter services below on a regular plan and get your window cleaning FREE!</div>
                                </div>
                            )}
                            <div className="space-y-4">
                                {/* Internal Gutter Clearing */}
                                <div className={`p-4 border rounded-lg transition-colors bg-white ${formData.gutterClearing ? 'border-blue-300 ring-1 ring-blue-200' : 'hover:bg-gray-50 border-gray-200'}`}>
                                    <label className="flex items-center cursor-pointer">
                                        <input type="checkbox" id="gutterClearing" name="gutterClearing" checked={formData.gutterClearing} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"/>
                                        <div className="ml-3 flex-grow">
                                            <span className="font-medium text-gray-800">Internal Gutter Clearing</span>
                                            <p className="text-sm text-gray-600 mt-1">Thorough removal of leaves, moss, and debris from *inside* your gutters to prevent blockages and ensure proper water flow.</p>
                                        </div>
                                        <span className="text-blue-600 font-bold ml-4">{formatCurrency(price.gutterClearing)}</span>
                                    </label>
                                    {/* --- REMOVED Frequency Dropdown --- */}
                                </div>
                                {/* External Gutter & Fascia Clean */}
                                <div className={`p-4 border rounded-lg transition-colors bg-white ${formData.gutterFasciaClean ? 'border-blue-300 ring-1 ring-blue-200' : 'hover:bg-gray-50 border-gray-200'}`}>
                                    <label className="flex items-center cursor-pointer">
                                        <input type="checkbox" id="gutterFasciaClean" name="gutterFasciaClean" checked={formData.gutterFasciaClean} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"/>
                                        <div className="ml-3 flex-grow">
                                            <span className="font-medium text-gray-800">External Gutter & Fascia Clean</span>
                                            <p className="text-sm text-gray-600 mt-1">Cleaning of the *exterior surfaces* of gutters, fascia boards, and soffits to remove dirt, algae, and staining, restoring their appearance.</p>
                                        </div>
                                        <span className="text-blue-600 font-bold ml-4">{formatCurrency(price.gutterFasciaClean)}</span>
                                    </label>
                                     {/* --- REMOVED Frequency Dropdown --- */}
                                </div>
                            </div>
                        </div>

                        {/* Estimated Price Summary Box */}
                        <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
                            <h4 className="text-base font-semibold mb-3 text-gray-700">Estimated Price</h4>
                            <div className="space-y-1">
                                {renderPriceLine("Window Cleaning", price.windowCleaningBase)}
                                {/* --- UPDATED: Show conservatory/extension price addition --- */}
                                {(formData.hasConservatory || formData.hasExtension) && (
                                    <div className="pl-4 text-xs text-gray-500">
                                        Includes:
                                        {formData.hasExtension && <span> Extension (+{formatCurrency(5)})</span>}
                                        {formData.hasConservatory && <span> Conservatory (+{formatCurrency(5)})</span>}
                                    </div>
                                )}
                                {renderPriceLine("Frequency Adjustment", price.frequencyAdjustment, false, true)}
                                {renderPriceLine("Conservatory Roof", price.conservatoryRoof)} {/* Updated to show calculated price */}
                                {renderPriceLine("Solar Panels", formData.solarPanels ? price.solarPanels : 0)}
                                {renderPriceLine("Gutter Clearing", formData.gutterClearing ? price.gutterClearing : 0)}
                                {renderPriceLine("Gutter & Fascia Clean", formData.gutterFasciaClean ? price.gutterFasciaClean : 0)}
                                {renderPriceLine("Offer Discount", price.discount, true)}
                                {/* Total */}
                                <div className="pt-3 mt-2 border-t border-gray-300">
                                    <div className="flex justify-between items-center font-semibold text-lg">
                                        <span>Total Estimate:</span>
                                        <span className="text-blue-700 font-bold">{formatCurrency(price.total)}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Includes VAT. Subject to final confirmation.</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center pt-5">
                             {/* --- Secondary Button Style --- */}
                            <button type="button" onClick={() => goToStep(1)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">Back</button>
                             {/* --- Enhanced Button Style --- */}
                            <button type="button" onClick={() => goToStep(3)} className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-md shadow-sm hover:from-blue-700 hover:to-blue-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                                Continue <ArrowRightIcon className="w-4 h-4 ml-1.5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* --- STEP 3: Contact Details --- */}
                {step === 3 && (
                    <div className="space-y-6">
                        {/* Contextual Header for Step 3 */}
                        {formData.isCustomQuote ? (
                            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 text-center">
                                <h3 className="text-lg font-semibold text-blue-800 mb-3">Custom Quote Required</h3>
                                <p className="text-sm mb-4">For properties with 6+ bedrooms or unique designs, we require a site visit for an accurate quote.</p>
                                <p className="text-sm mb-4">Please provide your contact details below, and we'll be in touch to arrange a convenient time.</p>
                            </div>
                        ) : formData.isCommercial ? (
                            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200 text-center">
                                <h3 className="text-lg font-semibold text-indigo-800 mb-3">Commercial Enquiry</h3>
                                <p className="text-sm mb-4">Thank you for providing details about your requirements.</p>
                                <p className="text-sm mb-4">Please complete your contact information below, and we will contact you shortly to discuss pricing and scheduling.</p>
                            </div>
                        ) : (
                            <h3 className="text-xl font-semibold text-gray-800 mb-6">Your Contact & Address</h3>
                        )}

                        {/* Contact Info Inputs - UPDATED & REORDERED */}
                        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                            {/* Row 1: First Name, Last Name */}
                            <div>
                                <label htmlFor="firstName" className={labelClasses}>First Name *</label>
                                <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required className={inputClasses} />
                            </div>
                            <div>
                                <label htmlFor="lastName" className={labelClasses}>Last Name *</label>
                                <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required className={inputClasses} />
                            </div>
                             {/* --- ADDED: Business Name (Conditional) --- */}
                             {formData.isCommercial && (
                                <div className="sm:col-span-2">
                                    <label htmlFor="businessName" className={labelClasses}>Business Name (Optional)</label>
                                    <input type="text" id="businessName" name="businessName" value={formData.businessName} onChange={handleChange} className={inputClasses} />
                                </div>
                             )}
                             {/* Row 2 (or 3 for Commercial): Email, Mobile */}
                             <div>
                                <label htmlFor="email" className={labelClasses}>Email *</label>
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={inputClasses} />
                            </div>
                             <div>
                                <label htmlFor="mobile" className={labelClasses}>Mobile Number *</label>
                                <input type="tel" id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} required className={inputClasses} />
                            </div>
                             {/* Full Width Address Field */}
                             <div className="sm:col-span-2">
                                <label htmlFor="address" className={labelClasses}>Full Address *</label>
                                <textarea id="address" name="address" rows={3} value={formData.address} onChange={handleChange} required className={inputClasses}></textarea>
                            </div>
                             {/* Postcode Field Moved Below Address */}
                            <div className="sm:col-span-2"> {/* Make postcode full width or adjust as needed */}
                                <label htmlFor="postcode" className={labelClasses}>Postcode *</label>
                                <input type="text" id="postcode" name="postcode" value={formData.postcode} onChange={handleChange} required className={`${inputClasses} sm:max-w-xs`} maxLength={8} /> {/* Optional: Limit width */}
                            </div>
                        </div>


                        {/* --- Date Selection UI (Residential Only, Not Bespoke) --- */}
                        {!formData.isCommercial && !formData.isCustomQuote && (
                            <div id="date-selection-area"> {/* Added ID for scrolling */}
                                <label className={`${labelClasses} mb-2`}>Select Available Date for First Clean *</label>
                                <div className="mt-2">
                                    {/* Show message if postcode is too short */}
                                    {formData.postcode.trim().length < 2 ? (
                                      <p className="text-sm text-gray-500 p-3 border rounded-md bg-gray-50">Please enter your postcode above to see available dates.</p>
                                    ) : isLoadingDates ? (
                                      <div className="flex justify-center items-center p-4 border rounded-md bg-gray-50 text-gray-500">
                                        {/* spinner */}
                                        <span>Calculating available dates...</span>
                                      </div>
                                    ) : postcodeError ? (
                                      <p className="text-sm text-red-600 p-3 border border-red-200 rounded-md bg-red-50">{postcodeError}</p>
                                    ) : availableDates.length > 0 ? (
                                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {/* date buttons */}
                                      </div>
                                    ) : (
                                      <p className="text-gray-500">No available dates found for this postcode.</p>
                                    )}

                                    {/* --- NEW Loading Indicator --- */}
                                    {isLoadingDates && (
                                        <div className="flex justify-center items-center p-4 border rounded-md bg-gray-50 text-gray-500">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Calculating available dates...</span>
                                        </div>
                                    )}

                                    {/* --- Display Errors OR Dates (only when NOT loading) --- */}
                                    {!isLoadingDates && (
                                        <>
                                            {/* Error Message */}
                                            {formData.postcode.trim().length >= 2 && postcodeError && ( <p className="text-sm text-red-600 p-3 border border-red-200 rounded-md bg-red-50">{postcodeError}</p> )}

                                            {/* Date Buttons */}
                                            {formData.postcode.trim().length >= 2 && !postcodeError && availableDates.length > 0 && (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                                    {availableDates.map(date => {
                                                        const dateValue = formatDateForStorage(date); // Windsor-MM-DD
                                                        const isSelected = formData.selectedDate === dateValue;
                                                        return (
                                                            <button
                                                                type="button" // Prevent form submission on click
                                                                key={dateValue}
                                                                onClick={() => handleDateSelect(date)}
                                                                className={`p-3 border rounded-lg text-center cursor-pointer transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
                                                                    ${isSelected
                                                                        ? 'bg-blue-600 border-blue-700 text-white shadow-md ring-1 ring-blue-300'
                                                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-400'
                                                                    }`}
                                                            >
                                                                <span className={`block text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                                    {formatDateForDisplay(date)}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* No Dates Found Message (distinct from loading/error) */}
                                             {formData.postcode.trim().length >= 2 && !postcodeError && availableDates.length === 0 && (
                                                 <p className="text-sm text-gray-500 p-3 border rounded-md bg-gray-50">No available dates found in the next 4 weeks for this postcode.</p>
                                             )}

                                            {/* Date Selection Error */}
                                            {dateSelectionError && <p className="mt-2 text-xs text-red-600">{dateSelectionError}</p>}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* --- END Date Selection UI --- */}


                        {/* Preferred Contact Method */}
                        <div>
                            <label className={`${labelClasses} mb-2`}>Preferred Contact Method *</label>
                            <div className="flex space-x-4">
                                {['email', 'text'].map(method => (
                                    <label key={method} className="inline-flex items-center">
                                        <input type="radio" name="contactPreference" value={method} checked={formData.contactPreference === method} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"/>
                                        <span className="ml-2 text-sm text-gray-700 capitalize">{method === 'text' ? 'Text Message' : method}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Additional Information Textarea */}
                        <div>
                            <label htmlFor="message" className={labelClasses}>Additional Information (Optional)</label>
                            <textarea id="message" name="message" rows={3} value={formData.message} onChange={handleChange} placeholder="Any specific details, access instructions, or questions?" className={inputClasses}></textarea>
                        </div>

                        {/* Enquiry Summary Box */}
                        <div className="bg-gray-50 p-6 rounded-lg border mt-8">
                            <h4 className="text-lg font-semibold mb-4 text-gray-700">Enquiry Summary</h4>
                            {formData.isCommercial ? (
                                // --- Commercial Summary ---
                                <div className="text-sm space-y-2">
                                    <p><span className="font-medium text-gray-600">Type:</span> Commercial Property</p>
                                    <p><span className="font-medium text-gray-600">Building:</span> {formData.commercialBuildingType || 'Not specified'}</p>
                                    {formData.businessName && <p><span className="font-medium text-gray-600">Business:</span> {formData.businessName}</p>}
                                    <div className="mt-2 pt-2 border-t">
                                        <span className="font-medium text-gray-600 block mb-1">Selected Services & Frequency:</span>
                                        <ul className="list-disc list-inside pl-1 space-y-1">
                                            {Object.entries(formData.commercialServices).filter(([_, value]) => value.selected).map(([key, value]) => (
                                                <li key={key}>
                                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                                                    <span className="ml-1 font-medium">{commercialFrequencyOptions.find(opt => opt.value === value.frequency)?.label || value.frequency}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        {/* Show if no services were selected */}
                                        {Object.values(formData.commercialServices).every(s => !s.selected) && (
                                            <p className="text-gray-500 italic">No specific services selected.</p>
                                        )}
                                    </div>
                                    <p className="mt-3 text-gray-600 italic">We will contact you to discuss your requirements and provide a tailored quote.</p>
                                </div>
                            ) : formData.isCustomQuote ? (
                                // --- Bespoke Residential Summary ---
                                <div className="text-sm space-y-2">
                                    <p><span className="font-medium text-gray-600">Type:</span> Residential - Bespoke/Large Property</p>
                                    <p><span className="font-medium text-gray-600">Address:</span> {formData.address}, {formData.postcode}</p>
                                    <p className="mt-3 text-gray-600 italic">A site visit is required for an accurate quote. We will contact you to arrange this.</p>
                                </div>
                            ) : (
                                // --- Standard Residential Summary ---
                                <div className="space-y-3 text-sm">
                                    <p><span className="font-medium text-gray-600">Property:</span> {houseOptions.find(o => o.id === formData.houseType)?.label}</p>
                                    <p><span className="font-medium text-gray-600">Frequency:</span> {{ '4-weekly': 'Every 4 Weeks', '8-weekly': 'Every 8 Weeks', '12-weekly': 'Every 12 Weeks', 'adhoc': 'One-off Clean' }[formData.frequency]}</p>
                                    {/* Display selected date nicely */}
                                    {formData.selectedDate && (
                                        <p><span className="font-medium text-gray-600">Selected First Clean Date:</span> {
                                            availableDates.find(d => formatDateForStorage(d) === formData.selectedDate)
                                            ? formatDateForDisplay(availableDates.find(d => formatDateForStorage(d) === formData.selectedDate))
                                            : 'N/A' /* Fallback if date object not found */
                                        }</p>
                                    )}
                                    {/* Price Breakdown */}
                                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-1">
                                        {renderPriceLine("Window Cleaning", price.windowCleaningBase)}
                                         {/* --- UPDATED: Show conservatory/extension price addition --- */}
                                        {(formData.hasConservatory || formData.hasExtension) && (
                                            <div className="pl-4 text-xs text-gray-500">
                                                Includes:
                                                {formData.hasExtension && <span> Extension (+{formatCurrency(5)})</span>}
                                                {formData.hasConservatory && <span> Conservatory (+{formatCurrency(5)})</span>}
                                            </div>
                                        )}
                                        {renderPriceLine("Frequency Adjustment", price.frequencyAdjustment, false, true)}
                                        {renderPriceLine("Conservatory Roof", price.conservatoryRoof)} {/* Updated to show calculated price */}
                                        {renderPriceLine("Solar Panels", formData.solarPanels ? price.solarPanels : 0)}
                                        {renderPriceLine("Gutter Clearing", formData.gutterClearing ? price.gutterClearing : 0)}
                                        {renderPriceLine("Gutter & Fascia Clean", formData.gutterFasciaClean ? price.gutterFasciaClean : 0)}
                                        {renderPriceLine("Offer Discount", price.discount, true)}
                                        {/* Total */}
                                        <div className="pt-3 mt-2 border-t border-gray-300">
                                            <div className="flex justify-between items-center font-semibold text-lg">
                                                <span>Total Estimate:</span>
                                                <span className="text-blue-700 font-bold">{formatCurrency(price.total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* --- UPDATED Disclaimer --- */}
                                    <p className="text-sm text-gray-600 italic pt-3">
                                        Please note: Prices shown are estimates based on standard property sizes and typical workload. Properties requiring significant extra work or those differing substantially from standard layouts may incur additional charges. See <a href="https://somersetwindowcleaning.co.uk/faqs/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">FAQs</a> for more details.
                                    </p>
                                    {formData.solarPanels && (
                                        <p className="text-xs text-blue-600 italic pt-2">Solar Panel Access: Extra costs for specialist lift equipment (if required) will be quoted separately.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center pt-5">
                             {/* --- Secondary Button Style --- */}
                            <button type="button" onClick={() => goToStep(formData.isCommercial || formData.isCustomQuote ? 1 : 2)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">Back</button>
                             {/* --- Enhanced Button Style --- */}
                            <button type="submit" className="inline-flex items-center px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-md shadow-sm hover:from-blue-700 hover:to-blue-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                                {formData.isCommercial || formData.isCustomQuote ? 'Submit Enquiry' : 'Book Now'}
                            </button>
                        </div>
                    </div>
                )}
            </form>

            {/* Global Styles for Range Slider Thumb */}
            <style jsx global>{`
                .range-thumb-blue::-webkit-slider-thumb {
                  background: #2563EB; /* Tailwind blue-600 */
                  -webkit-appearance: none;
                  appearance: none;
                  width: 16px; /* Adjust size as needed */
                  height: 16px; /* Adjust size as needed */
                  border-radius: 50%;
                  cursor: pointer;
                }
                .range-thumb-blue::-moz-range-thumb {
                  background: #2563EB; /* Tailwind blue-600 */
                  width: 16px; /* Adjust size as needed */
                  height: 16px; /* Adjust size as needed */
                  border-radius: 50%;
                  cursor: pointer;
                  border: none; /* Reset default border */
                }
            `}</style>
        </div>
    );
};

export default WindowCleaningForm;