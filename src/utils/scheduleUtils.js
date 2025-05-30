/**
 * Defines the bank holidays for a given year.
 * TODO: You must verify and update these for your specific region and year.
 */
const BANK_HOLIDAYS = {
    2024: [ // Example for reference
        "2024-01-01", // New Year's Day
        "2024-03-29", // Good Friday
        "2024-04-01", // Easter Monday
        "2024-05-06", // Early May bank holiday
        "2024-05-27", // Spring bank holiday
        "2024-08-26", // Summer bank holiday
        "2024-12-25", // Christmas Day
        "2024-12-26", // Boxing Day
    ],
    2025: [
        "2025-01-01", // New Year's Day
        "2025-04-18", // Good Friday
        "2025-04-21", // Easter Monday
        "2025-05-05", // Early May bank holiday
        "2025-05-26", // Spring bank holiday
        "2025-08-25", // Summer bank holiday
        "2025-12-25", // Christmas Day
        "2025-12-26", // Boxing Day
    ],
    // Add other years as needed
};

/**
 * The main data structure for your cleaning schedule.
 * Each entry maps postcode prefixes to specific recurring dates or day rules.
 *
 * EXAMPLE STRUCTURE - YOU MUST REPLACE THIS WITH YOUR ACTUAL DATA
 *
 * 'dates' can be:
 *  - An array of specific dates in "YYYY-MM-DD" format (for fixed, irregular schedules).
 *  - A rule string like "EVERY_FIRST_MONDAY", "EVERY_TUESDAY_OF_MONTH_WEEK_2_4" (you'd need to implement parsing for this).
 *  - For simplicity, the example below uses specific dates that getNextOccurrence would advance.
 *    A more robust system might define a start date and a recurrence pattern (e.g., "every 4 weeks starting 2024-01-15").
 *
 * The current logic in PropertyDetailsForm for BA6/BA16 (Fridays) is hardcoded there.
 * If you want BA5 or other areas to have a similar "any valid X day" logic,
 * you'd need to adjust PropertyDetailsForm or make this scheduleData more expressive.
 */
export const scheduleData = [
    // Data derived from your spreadsheet
    { postcodes: ["BS40", "BS48", "BS49", "BS22", "BS23", "BS24", "BS21"], dates: ["2024-03-18"], recurrence: "4_WEEKLY" },
    { postcodes: ["BS25", "BS29"], dates: ["2024-03-19"], recurrence: "4_WEEKLY" },
    { postcodes: ["BS26"], dates: ["2024-03-20"], recurrence: "4_WEEKLY" },
    { postcodes: ["BS26", "BS27"], dates: ["2024-03-21"], recurrence: "4_WEEKLY" },
    { postcodes: ["BS27"], dates: ["2024-03-22"], recurrence: "4_WEEKLY" },
    { postcodes: ["BA7", "BA9", "BA10", "BA11", "BA8"], dates: ["2024-03-25"], recurrence: "4_WEEKLY" },
    { postcodes: ["BS39", "BA3", "BA4"], dates: ["2024-03-26"], recurrence: "4_WEEKLY" },
    { postcodes: ["BA5", "BA4"], dates: ["2024-03-27"], recurrence: "4_WEEKLY" },
    { postcodes: ["BA5"], dates: ["2024-03-28"], recurrence: "4_WEEKLY" },
    { postcodes: ["BA5"], dates: ["2024-03-29"], recurrence: "4_WEEKLY" }, // Note: 2024-03-29 is Good Friday
    { postcodes: ["TA18", "TA19", "TA20", "BA22", "TA17", "TA12", "TA13", "TA14", "DT9"], dates: ["2024-04-01"], recurrence: "4_WEEKLY" }, // Note: 2024-04-01 is Easter Monday
    { postcodes: ["TA10", "TA11"], dates: ["2024-04-02"], recurrence: "4_WEEKLY" },
    { postcodes: ["TA10", "TA11"], dates: ["2024-04-03"], recurrence: "4_WEEKLY" },
    { postcodes: ["BA6"], dates: ["2024-04-04"], recurrence: "4_WEEKLY" }, // BA6 (non-Meare)
    { postcodes: ["BA6"], dates: ["2024-04-05"], recurrence: "4_WEEKLY" }, // BA6 (non-Meare)
    { postcodes: ["TA7", "TA6", "TA2", "TA3", "TA9", "TA8", "TA1"], dates: ["2024-04-08"], recurrence: "4_WEEKLY" },
    { postcodes: ["BS28"], dates: ["2024-04-09"], recurrence: "4_WEEKLY" },
    { postcodes: ["BS28"], dates: ["2024-04-10"], recurrence: "4_WEEKLY" },
    { postcodes: ["BS28", "BA6-MEARE"], dates: ["2024-04-11"], recurrence: "4_WEEKLY" }, // BA6 (Meare only) is "BA6-MEARE"
    { postcodes: ["BA16"], dates: ["2024-04-12"], recurrence: "4_WEEKLY" }
];

export const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

/**
 * Checks if a given date is a weekend.
 * @param {Date} date - The date to check.
 * @returns {boolean} - True if the date is a Saturday or Sunday.
 */
export const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 for Sunday, 6 for Saturday
};

/**
 * Checks if a given date is a bank holiday.
 * @param {Date} date - The date to check.
 * @returns {boolean} - True if the date is a bank holiday.
 */
export const isBankHoliday = (date) => {
    const year = date.getFullYear();
    const dateString = formatDateForStorage(date); // YYYY-MM-DD
    return BANK_HOLIDAYS[year]?.includes(dateString) || false;
};

/**
 * Finds the next occurrence of a scheduled date from today onwards.
 * 
 * @param {string} baseDateStr - A base date string "YYYY-MM-DD" from your scheduleData, representing a date in the cycle.
 * @param {string} recurrenceRule - A string describing recurrence, e.g., "4_WEEKLY".
 * @returns {Date | null} - The next occurrence as a Date object, or null.
 */
export const getNextOccurrence = (baseDateStr, recurrenceRule = "4_WEEKLY") => {
    if (!baseDateStr) {
        // console.warn("getNextOccurrence called with null or undefined baseDateStr");
        return null;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
        const [year, month, day] = baseDateStr.split('-').map(Number);
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            // console.error("Invalid date string format in getNextOccurrence:", baseDateStr);
            return null;
        }
        let candidateDate = new Date(year, month - 1, day); // This is a date from the cycle
        candidateDate.setHours(0,0,0,0);

        // If this cycle's date is in the past, advance it until it's today or in the future, according to its cycle.
        while (candidateDate < today) {
            if (recurrenceRule === "4_WEEKLY") {
                candidateDate.setDate(candidateDate.getDate() + 28);
            } else if (recurrenceRule === "MONTHLY_SAME_DAY") {
                // Simple month advance. Be cautious if baseDateStr is like Jan 31st, next month might not have 31 days.
                // Date object handles this by rolling over, e.g., Jan 31 + 1 month = Mar 2 or 3.
                candidateDate.setMonth(candidateDate.getMonth() + 1);
            } else {
                // Default or unknown rule: advance by 4 weeks as a fallback
                // console.warn(`Unknown recurrenceRule: ${recurrenceRule}, defaulting to 4-weekly.`);
                candidateDate.setDate(candidateDate.getDate() + 28); 
            }
        }
        // Now candidateDate is the first occurrence of this cycle's pattern that is >= today.
        return candidateDate;

    } catch (e) {
        console.error("Error in getNextOccurrence processing:", baseDateStr, recurrenceRule, e);
        return null;
    }
};

/**
 * Finds the first working day (Mon-Fri, not a bank holiday) from a given date.
 * If the given date is a working day, it returns the date itself.
 * Otherwise, it checks subsequent days.
 * @param {Date} date - The starting date.
 * @returns {Date} - The first working day.
 */
export const findFirstWorkingDayFrom = (date) => {
    if (!(date instanceof Date) || isNaN(date)) {
        // console.error("Invalid date passed to findFirstWorkingDayFrom:", date);
        // Decide on how to handle this - throw error, or return a default/null?
        // For now, let's assume getNextOccurrence returns a valid date or null.
        // If it's null, PropertyDetailsForm should handle it.
        // If it's an invalid Date object, this is a deeper issue.
        return new Date(); // Fallback, though ideally this path isn't hit with valid inputs
    }
    let currentDate = new Date(date.getTime()); // Clone the date
    currentDate.setHours(0, 0, 0, 0);
    while (isWeekend(currentDate) || isBankHoliday(currentDate)) {
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return currentDate;
};

/**
 * Formats a Date object for display (e.g., "Mon, 15 Jul").
 * @param {Date} date - The date to format.
 * @returns {string} - The formatted date string.
 */
export const formatDateForDisplay = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return 'Invalid Date';
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};

/**
 * Formats a Date object for storage (YYYY-MM-DD).
 * @param {Date} date - The date to format.
 * @returns {string} - The formatted date string.
 */
export const formatDateForStorage = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return 'N/A'; // Handle invalid date gracefully
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}; 