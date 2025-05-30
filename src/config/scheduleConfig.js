// Schedule configuration for window cleaning service areas
// Last updated: May 2025 // Effective for current year operations

export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// UK Bank Holidays - Update these annually
export const bankHolidays = {
    2024: [
        '2024-01-01', // New Year's Day
        '2024-03-29', // Good Friday
        '2024-04-01', // Easter Monday
        '2024-05-06', // Early May bank holiday
        '2024-05-27', // Spring bank holiday
        '2024-08-26', // Summer bank holiday
        '2024-12-25', // Christmas Day
        '2024-12-26', // Boxing Day
    ],
    2025: [
        '2025-01-01', // New Year's Day
        '2025-04-18', // Good Friday
        '2025-04-21', // Easter Monday
        '2025-05-05', // Early May bank holiday
        '2025-05-26', // Spring bank holiday
        '2025-08-25', // Summer bank holiday
        '2025-12-25', // Christmas Day
        '2025-12-26', // Boxing Day
    ],
    2026: [
        '2026-01-01', // New Year's Day
        '2026-04-03', // Good Friday
        '2026-04-06', // Easter Monday
        '2026-05-04', // Early May bank holiday
        '2026-05-25', // Spring bank holiday
        '2026-08-31', // Summer bank holiday
        '2026-12-25', // Christmas Day
        '2026-12-28', // Boxing Day (substitute)
    ],
    2027: [
        '2027-01-01', // New Year's Day
        '2027-03-26', // Good Friday
        '2027-03-29', // Easter Monday
        '2027-05-03', // Early May bank holiday
        '2027-05-31', // Spring bank holiday
        '2027-08-30', // Summer bank holiday
        '2027-12-27', // Christmas Day (substitute)
        '2027-12-28', // Boxing Day (substitute)
    ]
};

// Additional holiday periods to exclude (e.g., Christmas period)
export const holidayExclusionPeriods = [
    { start: 12, startDay: 23, end: 1, endDay: 3 } // Dec 23 - Jan 3
];

// Capacity limits per area (can be adjusted based on business needs)
export const areaCapacityLimits = {
    default: 8, // Default capacity per area per date
    highDemand: 10, // For areas with more crew availability
    limited: 4, // For areas with limited crew
    // Area-specific overrides
    'BS40': 10, // Weston-super-Mare (high demand)
    'BS26': 6,  // Axbridge
    'BS27': 6,  // Cheddar
    'BA5': 4,   // Wells
    'BA6': 4,   // Glastonbury (also every Friday)
    'BA16': 6,  // Street (every Friday)
    'BS28': 6   // Wedmore
};

// Helper function to check if a date is a bank holiday
export const isBankHoliday = (date) => {
    const year = date.getFullYear();
    const dateStr = date.toISOString().split('T')[0];
    return bankHolidays[year]?.includes(dateStr) || false;
};

// Helper function to check if a date is in holiday exclusion period
export const isInHolidayPeriod = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    for (const period of holidayExclusionPeriods) {
        // Handle periods that cross year boundaries
        if (period.start > period.end) {
            // Period crosses year boundary (e.g., Dec-Jan)
            if ((month === period.start && day >= period.startDay) || 
                (month === period.end && day <= period.endDay) ||
                (month > period.start || month < period.end)) {
                return true;
            }
        } else {
            // Period within same year
            if ((month === period.start && day >= period.startDay) ||
                (month === period.end && day <= period.endDay) ||
                (month > period.start && month < period.end)) {
                return true;
            }
        }
    }
    return false;
};

// Helper function to check if date is a leap year
export const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

// Helper function to get days in month (handles leap years)
export const getDaysInMonth = (year, month) => {
    if (month === 2 && isLeapYear(year)) {
        return 29;
    }
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return daysInMonth[month - 1];
};

// Helper function to generate Friday-only dates for special postcodes
export const generateFridayOnlyDates = (options = {}) => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find next Friday from today
    let currentDate = new Date(today);
    const daysUntilFriday = (5 - currentDate.getDay() + 7) % 7;
    if (daysUntilFriday === 0 && currentDate <= today) {
        currentDate.setDate(currentDate.getDate() + 7); // Next Friday if today is Friday
    } else {
        currentDate.setDate(currentDate.getDate() + daysUntilFriday);
    }
    
    // Generate Friday dates for the next 6 weeks
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + (6 * 7));
    
    while (currentDate <= endDate) {
        // Skip bank holidays unless emergency booking
        if (!options.includeHolidays) {
            if (!isBankHoliday(currentDate) && !isInHolidayPeriod(currentDate)) {
                dates.push({
                    date: `${currentDate.getDate().toString().padStart(2, '0')} ${months[currentDate.getMonth()]}`,
                    fullDate: new Date(currentDate),
                    year: currentDate.getFullYear()
                });
            }
        } else {
            // Include all Friday dates for emergency bookings
            dates.push({
                date: `${currentDate.getDate().toString().padStart(2, '0')} ${months[currentDate.getMonth()]}`,
                fullDate: new Date(currentDate),
                year: currentDate.getFullYear()
            });
        }
        
        // Move to next Friday (7 days later)
        currentDate.setDate(currentDate.getDate() + 7);
    }
    
    return dates;
};

// Helper function to generate dates for the next 12 months with holiday exclusions
export const generateScheduleDates = (startDateStr, targetDayOfWeek, options = {}) => {
    const dates = [];
    const parts = startDateStr.split(' ');
    if (parts.length !== 2) return dates;
    
    const day = parseInt(parts[0], 10);
    const monthIndex = months.findIndex(m => m.toLowerCase() === parts[1].toLowerCase());
    if (monthIndex === -1 || isNaN(day)) return dates;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentDate = new Date(today.getFullYear(), monthIndex, day);
    currentDate.setHours(0, 0, 0, 0);
    
    // If the date is in the past, move to next occurrence
    while (currentDate < today) {
        currentDate.setDate(currentDate.getDate() + 28);
    }
    
    // Generate dates for the next 6 weeks
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + (6 * 7));
    
    while (currentDate <= endDate) {
        let suitableDate = false;
        if (currentDate.getDay() === targetDayOfWeek) {
            if (options.includeHolidays) { // For emergency bookings, skip holiday checks
                suitableDate = true;
            } else { // For standard/priority bookings, check holidays
                if (!isBankHoliday(currentDate) && !isInHolidayPeriod(currentDate)) {
                    suitableDate = true;
                }
            }
        }

        if (suitableDate) {
            dates.push({
                date: `${currentDate.getDate().toString().padStart(2, '0')} ${months[currentDate.getMonth()]}`,
                fullDate: new Date(currentDate),
                year: currentDate.getFullYear()
            });
        }
        
        // Move to next occurrence (28 days later for 4-weekly schedule)
        currentDate.setDate(currentDate.getDate() + 28);
    }
    
    return dates;
};

// Schedule data for different areas - matches exact business schedule
export const scheduleData = [
    // NORTH - Week 1
    {
        postcodes: ['BS40', 'BS48', 'BS49', 'BS22', 'BS23', 'BS24', 'BS21'],
        area: 'Weston Backwell Blagdon Yatton Clevedon',
        startDate: '06 Jan', // Monday (corresponds to Jan 6, 2025)
        targetDayOfWeek: 1, // Monday
        capacity: areaCapacityLimits['BS40'] || areaCapacityLimits.default
    },
    {
        postcodes: ['BS25', 'BS29'],
        area: 'Banwell Winscombe',
        startDate: '07 Jan', // Tuesday (corresponds to Jan 7, 2025)
        targetDayOfWeek: 2, // Tuesday
        capacity: areaCapacityLimits.default
    },
    {
        postcodes: ['BS26'],
        area: 'Axbridge',
        startDate: '08 Jan', // Wednesday (corresponds to Jan 8, 2025)
        targetDayOfWeek: 3, // Wednesday
        capacity: areaCapacityLimits['BS26'] || areaCapacityLimits.default
    },
    {
        postcodes: ['BS26', 'BS27'],
        area: 'Axbridge / Cheddar',
        startDate: '09 Jan', // Thursday (corresponds to Jan 9, 2025)
        targetDayOfWeek: 4, // Thursday
        capacity: areaCapacityLimits['BS26'] || areaCapacityLimits.default
    },
    {
        postcodes: ['BS27'],
        area: 'Cheddar',
        startDate: '10 Jan', // Friday (corresponds to Jan 10, 2025)
        targetDayOfWeek: 5, // Friday
        capacity: areaCapacityLimits['BS27'] || areaCapacityLimits.default
    },
    
    // EAST - Week 2
    {
        postcodes: ['BA7', 'BA9', 'BA10', 'BA11', 'BA8'],
        area: 'Wincanton Bruton Castle Cary Frome Templecombe',
        startDate: '13 Jan', // Monday (corresponds to Jan 13, 2025)
        targetDayOfWeek: 1, // Monday
        capacity: areaCapacityLimits.default
    },
    {
        postcodes: ['BS39', 'BA3', 'BA4'],
        area: 'Paulton Radstock Shepton',
        startDate: '14 Jan', // Tuesday (corresponds to Jan 14, 2025)
        targetDayOfWeek: 2, // Tuesday
        capacity: areaCapacityLimits.default
    },
    {
        postcodes: ['BA5', 'BA4'],
        area: 'Shepton Wells',
        startDate: '15 Jan', // Wednesday (corresponds to Jan 15, 2025)
        targetDayOfWeek: 3, // Wednesday
        capacity: areaCapacityLimits['BA5'] || areaCapacityLimits.default
    },
    {
        postcodes: ['BA5'],
        area: 'Wells',
        startDate: '16 Jan', // Thursday (corresponds to Jan 16, 2025)
        targetDayOfWeek: 4, // Thursday
        capacity: areaCapacityLimits['BA5'] || areaCapacityLimits.default
    },
    {
        postcodes: ['BA5'],
        area: 'Wells',
        startDate: '17 Jan', // Friday (corresponds to Jan 17, 2025)
        targetDayOfWeek: 5, // Friday
        capacity: areaCapacityLimits['BA5'] || areaCapacityLimits.default
    },
    
    // SOUTH - Week 3
    {
        postcodes: ['TA18', 'TA19', 'TA20', 'BA22', 'TA17', 'TA12', 'TA13', 'TA14', 'DT9'],
        area: 'Yeovil Illminster Chard Crewkerne Ilchester Stoke-Sub-Hamdon Martock Sherbourne',
        startDate: '20 Jan', // Monday (corresponds to Jan 20, 2025)
        targetDayOfWeek: 1, // Monday
        capacity: areaCapacityLimits.default
    },
    {
        postcodes: ['TA10', 'TA11'],
        area: 'Langport Somerton',
        startDate: '21 Jan', // Tuesday (corresponds to Jan 21, 2025)
        targetDayOfWeek: 2, // Tuesday
        capacity: areaCapacityLimits.default
    },
    {
        postcodes: ['TA10', 'TA11'],
        area: 'Langport Somerton',
        startDate: '22 Jan', // Wednesday (corresponds to Jan 22, 2025)
        targetDayOfWeek: 3, // Wednesday
        capacity: areaCapacityLimits.default
    },
    {
        postcodes: ['BA6'],
        area: 'Glastonbury',
        startDate: '23 Jan', // Thursday (corresponds to Jan 23, 2025)
        targetDayOfWeek: 4, // Thursday
        capacity: areaCapacityLimits['BA6'] || areaCapacityLimits.default
    },
    {
        postcodes: ['BA6'],
        area: 'Glastonbury',
        startDate: '24 Jan', // Friday (corresponds to Jan 24, 2025)
        targetDayOfWeek: 5, // Friday
        capacity: areaCapacityLimits['BA6'] || areaCapacityLimits.default
    },
    
    // WEST - Week 4
    {
        postcodes: ['TA7', 'TA6', 'TA2', 'TA3', 'TA9', 'TA8', 'TA1'],
        area: 'Bridgwater Taunton Mark Highbridge',
        startDate: '27 Jan', // Monday (corresponds to Jan 27, 2025)
        targetDayOfWeek: 1, // Monday
        capacity: areaCapacityLimits.default
    },
    {
        postcodes: ['BS28'],
        area: 'Wedmore',
        startDate: '28 Jan', // Tuesday (corresponds to Jan 28, 2025)
        targetDayOfWeek: 2, // Tuesday
        capacity: areaCapacityLimits['BS28'] || areaCapacityLimits.default
    },
    {
        postcodes: ['BS28'],
        area: 'Wedmore',
        startDate: '29 Jan', // Wednesday (corresponds to Jan 29, 2025)
        targetDayOfWeek: 3, // Wednesday
        capacity: areaCapacityLimits['BS28'] || areaCapacityLimits.default
    },
    {
        postcodes: ['BS28', 'BA6-MEARE'],
        area: 'Wedmore Meare',
        startDate: '30 Jan', // Thursday (corresponds to Jan 30, 2025)
        targetDayOfWeek: 4, // Thursday
        capacity: areaCapacityLimits['BS28'] || areaCapacityLimits.default
    },
    {
        postcodes: ['BA16'],
        area: 'Street',
        startDate: '31 Jan', // Friday (corresponds to Jan 31, 2025)
        targetDayOfWeek: 5, // Friday
        capacity: areaCapacityLimits['BA16'] || areaCapacityLimits.default
    }
];

// Special handling for certain postcodes
export const specialPostcodeRules = {
    // BA6 and BA16 are available every Friday (in addition to their scheduled days)
    fridayOnly: ['BA6', 'BA16']
};

// Booking types
export const bookingTypes = {
    STANDARD: 'standard',
    PRIORITY: 'priority',
    EMERGENCY: 'emergency'
};

// Get available dates (simplified - no capacity tracking)
export const getAvailableDatesWithCapacity = (postcodes, bookingType = bookingTypes.STANDARD) => {
    const results = [];
    const includeHolidays = bookingType === bookingTypes.EMERGENCY;
    
    // Check if any postcode requires Friday-only scheduling
    const hasFridayOnlyPostcode = postcodes.some(pc => 
        specialPostcodeRules.fridayOnly.some(fridayPC => pc.startsWith(fridayPC))
    );
    
    if (hasFridayOnlyPostcode) {
        // Generate Friday-only dates for BA6 and BA16
        const fridayDates = generateFridayOnlyDates({ includeHolidays });
        
        // Find the relevant area info
        const matchingEntry = scheduleData.find(entry =>
            entry.postcodes.some(pc => postcodes.some(userPc => userPc.startsWith(pc)))
        );
        
        const area = matchingEntry ? matchingEntry.area : 'Friday Service Area';
        
        fridayDates.forEach(dateInfo => {
            results.push({
                ...dateInfo,
                area,
                bookingType,
                specialRule: 'Friday Only'
            });
        });
    } else {
        // Regular scheduling for other postcodes
        const matchingEntries = scheduleData.filter(entry =>
            entry.postcodes.some(pc => postcodes.some(userPc => userPc.startsWith(pc)))
        );
        
        matchingEntries.forEach(entry => {
            const dates = generateScheduleDates(entry.startDate, entry.targetDayOfWeek, { includeHolidays });
            dates.forEach(dateInfo => {
                results.push({
                    ...dateInfo,
                    area: entry.area,
                    bookingType
                });
            });
        });
    }
    
    // Sort by date
    results.sort((a, b) => a.fullDate - b.fullDate);
    
    return results;
}; 