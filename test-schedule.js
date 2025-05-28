import { scheduleData, getAvailableDatesWithCapacity, specialPostcodeRules } from './src/config/scheduleConfig.js';

// Test postcodes from different areas
const testPostcodes = [
    { postcode: 'BS40 1AB', area: 'Weston-super-Mare' },
    { postcode: 'BS26 2EE', area: 'Axbridge' },
    { postcode: 'BS27 3QH', area: 'Cheddar' },
    { postcode: 'BA5 1PZ', area: 'Wells' },
    { postcode: 'BA6 8BH', area: 'Glastonbury (Friday-only)' },
    { postcode: 'BA16 0EG', area: 'Street (Friday-only)' },
    { postcode: 'BS28 4UZ', area: 'Wedmore' },
    { postcode: 'TA10 9RH', area: 'Langport' }
];

// Helper function to format date
function formatDate(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const dayOfWeek = days[date.getDay()];
    return { dateStr: `${day}/${month}`, dayOfWeek, fullDate: date };
}

// Generate schedule for next 30 days
function generateFullSchedule() {
    console.log('=== Window Cleaning Schedule - Next 30 Days ===');
    console.log(`Generated on: ${new Date().toLocaleString()}\n`);
    
    // Create a map to store all dates and their associated postcodes
    const scheduleMap = new Map();
    
    // Process each schedule entry
    scheduleData.forEach(entry => {
        // Generate dates for this entry
        const dates = getAvailableDatesWithCapacity(entry.postcodes);
        
        dates.forEach(dateInfo => {
            const dateKey = dateInfo.fullDate.toISOString().split('T')[0];
            
            if (!scheduleMap.has(dateKey)) {
                scheduleMap.set(dateKey, {
                    date: dateInfo.fullDate,
                    areas: []
                });
            }
            
            scheduleMap.get(dateKey).areas.push({
                postcodes: entry.postcodes,
                area: entry.area,
                capacity: dateInfo.capacity
            });
        });
    });
    
    // Process Friday-only postcodes
    ['BA6', 'BA16'].forEach(postcode => {
        const dates = getAvailableDatesWithCapacity([postcode]);
        
        dates.forEach(dateInfo => {
            const dateKey = dateInfo.fullDate.toISOString().split('T')[0];
            
            if (!scheduleMap.has(dateKey)) {
                scheduleMap.set(dateKey, {
                    date: dateInfo.fullDate,
                    areas: []
                });
            }
            
            // Check if this postcode is already in the schedule for this date
            const existingArea = scheduleMap.get(dateKey).areas.find(area => 
                area.postcodes.includes(postcode)
            );
            
            if (!existingArea) {
                scheduleMap.get(dateKey).areas.push({
                    postcodes: [postcode],
                    area: postcode === 'BA6' ? 'Glastonbury (Friday Service)' : 'Street (Friday Service)',
                    capacity: dateInfo.capacity,
                    specialRule: 'Friday Only'
                });
            }
        });
    });
    
    // Sort dates and filter to next 30 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 30);
    
    const sortedDates = Array.from(scheduleMap.entries())
        .filter(([_, data]) => data.date >= today && data.date <= endDate)
        .sort(([a], [b]) => new Date(a) - new Date(b));
    
    // Display in table format
    console.log('Date       | Day | Postcodes                           | Areas');
    console.log('-----------|-----|-------------------------------------|----------------------------------------');
    
    sortedDates.forEach(([dateKey, data]) => {
        const formatted = formatDate(data.date);
        
        data.areas.forEach((area, index) => {
            const postcodeStr = area.postcodes.join(', ').padEnd(35);
            const areaStr = area.specialRule ? `${area.area} *` : area.area;
            
            if (index === 0) {
                console.log(`${formatted.dateStr} | ${formatted.dayOfWeek} | ${postcodeStr} | ${areaStr}`);
            } else {
                console.log(`           |     | ${postcodeStr} | ${areaStr}`);
            }
        });
    });
    
    console.log('\n* = Special Friday-only service\n');
}

// Test individual postcodes
function testIndividualPostcodes() {
    console.log('=== Testing Individual Postcodes ===\n');
    
    testPostcodes.forEach(test => {
        console.log(`\nTesting ${test.postcode} (${test.area}):`);
        console.log('-'.repeat(50));
        
        const dates = getAvailableDatesWithCapacity([test.postcode]);
        
        if (dates.length === 0) {
            console.log('No dates available');
        } else {
            dates.slice(0, 5).forEach(dateInfo => {
                const formatted = formatDate(dateInfo.fullDate);
                console.log(`${formatted.dateStr} (${formatted.dayOfWeek}) - ${dateInfo.area} - Capacity: ${dateInfo.remainingCapacity}/${dateInfo.capacity}`);
            });
            
            if (dates.length > 5) {
                console.log(`... and ${dates.length - 5} more dates`);
            }
        }
    });
}

// Run the tests
generateFullSchedule();
console.log('\n' + '='.repeat(80) + '\n');
testIndividualPostcodes();

// Verify 4-week rotation
console.log('\n=== Verifying 4-Week Rotation ===\n');

const rotationTest = scheduleData.slice(0, 3); // Test first 3 entries
rotationTest.forEach(entry => {
    console.log(`\nChecking ${entry.area} (${entry.startDate}):`);
    const dates = getAvailableDatesWithCapacity(entry.postcodes);
    
    if (dates.length >= 2) {
        const firstDate = dates[0].fullDate;
        const secondDate = dates[1].fullDate;
        const daysBetween = Math.round((secondDate - firstDate) / (1000 * 60 * 60 * 24));
        console.log(`First date: ${formatDate(firstDate).dateStr}`);
        console.log(`Second date: ${formatDate(secondDate).dateStr}`);
        console.log(`Days between: ${daysBetween} (should be 28 for 4-week cycle)`);
    }
});