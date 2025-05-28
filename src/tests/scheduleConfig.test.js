// Test file for schedule configuration improvements
import { 
    isBankHoliday, 
    isInHolidayPeriod, 
    isLeapYear,
    getDaysInMonth,
    generateScheduleDates,
    getAvailableDatesWithCapacity,
    bookingTypes 
} from '../config/scheduleConfig';

// Test bank holiday detection
const testBankHolidays = () => {
    console.log('Testing bank holiday detection...');
    
    // Test known bank holidays
    const christmas2025 = new Date('2025-12-25');
    const boxing2025 = new Date('2025-12-26');
    const newYear2025 = new Date('2025-01-01');
    const random2025 = new Date('2025-06-15');
    
    console.log('Christmas 2025 is bank holiday:', isBankHoliday(christmas2025)); // Should be true
    console.log('Boxing Day 2025 is bank holiday:', isBankHoliday(boxing2025)); // Should be true
    console.log('New Year 2025 is bank holiday:', isBankHoliday(newYear2025)); // Should be true
    console.log('Random date 2025 is bank holiday:', isBankHoliday(random2025)); // Should be false
};

// Test holiday period detection
const testHolidayPeriods = () => {
    console.log('\nTesting holiday period detection...');
    
    const dec23 = new Date('2025-12-23');
    const dec24 = new Date('2025-12-24');
    const jan2 = new Date('2026-01-02');
    const jan3 = new Date('2026-01-03');
    const jan4 = new Date('2026-01-04');
    
    console.log('Dec 23 in holiday period:', isInHolidayPeriod(dec23)); // Should be true
    console.log('Dec 24 in holiday period:', isInHolidayPeriod(dec24)); // Should be true
    console.log('Jan 2 in holiday period:', isInHolidayPeriod(jan2)); // Should be true
    console.log('Jan 3 in holiday period:', isInHolidayPeriod(jan3)); // Should be true
    console.log('Jan 4 in holiday period:', isInHolidayPeriod(jan4)); // Should be false
};

// Test leap year detection
const testLeapYears = () => {
    console.log('\nTesting leap year detection...');
    
    console.log('2024 is leap year:', isLeapYear(2024)); // Should be true
    console.log('2025 is leap year:', isLeapYear(2025)); // Should be false
    console.log('2026 is leap year:', isLeapYear(2026)); // Should be false
    console.log('2027 is leap year:', isLeapYear(2027)); // Should be false
    console.log('2028 is leap year:', isLeapYear(2028)); // Should be true
    console.log('2000 is leap year:', isLeapYear(2000)); // Should be true
    console.log('1900 is leap year:', isLeapYear(1900)); // Should be false
};

// Test days in month
const testDaysInMonth = () => {
    console.log('\nTesting days in month...');
    
    console.log('Days in Feb 2024 (leap):', getDaysInMonth(2024, 2)); // Should be 29
    console.log('Days in Feb 2025:', getDaysInMonth(2025, 2)); // Should be 28
    console.log('Days in Jan 2025:', getDaysInMonth(2025, 1)); // Should be 31
    console.log('Days in Apr 2025:', getDaysInMonth(2025, 4)); // Should be 30
};

// Test schedule generation
const testScheduleGeneration = () => {
    console.log('\nTesting schedule generation...');
    
    // Test standard dates (excludes holidays)
    const standardDates = generateScheduleDates('25 Dec', { includeHolidays: false });
    console.log('Standard dates starting Dec 25:', standardDates.length);
    console.log('First few dates:', standardDates.slice(0, 3).map(d => d.date));
    
    // Test emergency dates (includes holidays)
    const emergencyDates = generateScheduleDates('25 Dec', { includeHolidays: true });
    console.log('\nEmergency dates starting Dec 25:', emergencyDates.length);
    console.log('First few dates:', emergencyDates.slice(0, 3).map(d => d.date));
};

// Test capacity system
const testCapacitySystem = () => {
    console.log('\nTesting capacity system...');
    
    // Test for BS40 postcode (high demand area)
    const bs40Dates = getAvailableDatesWithCapacity(['BS40'], bookingTypes.STANDARD);
    console.log('BS40 available dates:', bs40Dates.length);
    if (bs40Dates.length > 0) {
        const firstDate = bs40Dates[0];
        console.log('First date:', {
            date: firstDate.date,
            capacity: firstDate.capacity,
            remainingCapacity: firstDate.remainingCapacity,
            status: firstDate.status
        });
    }
    
    // Test emergency booking
    const emergencyDates = getAvailableDatesWithCapacity(['BA5'], bookingTypes.EMERGENCY);
    console.log('\nBA5 emergency dates:', emergencyDates.length);
    if (emergencyDates.length > 0) {
        console.log('Emergency booking includes holidays:', 
            emergencyDates.some(d => isBankHoliday(d.fullDate))
        );
    }
};

// Test for future year (2027)
const testFutureYear = () => {
    console.log('\nTesting future year (2027)...');
    
    const futureDate = new Date('2027-12-25');
    console.log('Christmas 2027 is bank holiday:', isBankHoliday(futureDate)); // Should be false (substitute day)
    
    const substituteDay = new Date('2027-12-27');
    console.log('Dec 27 2027 is bank holiday (substitute):', isBankHoliday(substituteDay)); // Should be true
};

// Run all tests
export const runScheduleTests = () => {
    console.log('=== Running Schedule Configuration Tests ===\n');
    
    testBankHolidays();
    testHolidayPeriods();
    testLeapYears();
    testDaysInMonth();
    testScheduleGeneration();
    testCapacitySystem();
    testFutureYear();
    
    console.log('\n=== Tests Complete ===');
};

// Uncomment to run tests
// runScheduleTests();