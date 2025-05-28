import { scheduleData, generateScheduleDates, generateFridayOnlyDates, specialPostcodeRules, months } from './src/config/scheduleConfig.js';

// Helper function to format date
function formatDate(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const dayOfWeek = days[date.getDay()];
    return { 
        dateStr: `${day}/${month}`, 
        dayOfWeek, 
        fullDate: date,
        dayOfWeekShort: dayOfWeek.substring(0, 3)
    };
}

// Generate comprehensive schedule
function generateDetailedSchedule() {
    console.log('=== SOMERSET WINDOW CLEANING - 30 DAY SCHEDULE ===');
    console.log(`Generated on: ${new Date().toLocaleString()}`);
    console.log(`Today's date: ${formatDate(new Date()).dateStr}\n`);
    
    // Create a complete schedule map
    const scheduleMap = new Map();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 30);
    
    // Process regular schedule entries
    scheduleData.forEach(entry => {
        const dates = generateScheduleDates(entry.startDate);
        
        dates.forEach(dateInfo => {
            if (dateInfo.fullDate >= today && dateInfo.fullDate <= endDate) {
                const dateKey = dateInfo.fullDate.toISOString().split('T')[0];
                
                if (!scheduleMap.has(dateKey)) {
                    scheduleMap.set(dateKey, {
                        date: dateInfo.fullDate,
                        entries: []
                    });
                }
                
                scheduleMap.get(dateKey).entries.push({
                    postcodes: entry.postcodes,
                    area: entry.area,
                    capacity: entry.capacity,
                    type: 'Regular Schedule'
                });
            }
        });
    });
    
    // Add Friday-only services (BA6 and BA16)
    const fridayDates = generateFridayOnlyDates();
    fridayDates.forEach(dateInfo => {
        if (dateInfo.fullDate >= today && dateInfo.fullDate <= endDate) {
            const dateKey = dateInfo.fullDate.toISOString().split('T')[0];
            
            if (!scheduleMap.has(dateKey)) {
                scheduleMap.set(dateKey, {
                    date: dateInfo.fullDate,
                    entries: []
                });
            }
            
            // Add BA6 (Glastonbury) Friday service
            const ba6Entry = scheduleMap.get(dateKey).entries.find(e => 
                e.postcodes.includes('BA6')
            );
            if (!ba6Entry) {
                scheduleMap.get(dateKey).entries.push({
                    postcodes: ['BA6'],
                    area: 'Glastonbury',
                    capacity: 4,
                    type: 'Friday Service'
                });
            }
            
            // Add BA16 (Street) Friday service
            const ba16Entry = scheduleMap.get(dateKey).entries.find(e => 
                e.postcodes.includes('BA16')
            );
            if (!ba16Entry) {
                scheduleMap.get(dateKey).entries.push({
                    postcodes: ['BA16'],
                    area: 'Street',
                    capacity: 6,
                    type: 'Friday Service'
                });
            }
        }
    });
    
    // Sort and display
    const sortedDates = Array.from(scheduleMap.entries())
        .sort(([a], [b]) => new Date(a) - new Date(b));
    
    console.log('DATE       | DAY       | POSTCODES                        | AREA                                     | TYPE');
    console.log('-----------|-----------|----------------------------------|------------------------------------------|----------------');
    
    sortedDates.forEach(([dateKey, data]) => {
        const formatted = formatDate(data.date);
        
        data.entries.forEach((entry, index) => {
            const postcodeStr = entry.postcodes.join(', ').substring(0, 32).padEnd(32);
            const areaStr = entry.area.substring(0, 40).padEnd(40);
            
            if (index === 0) {
                console.log(`${formatted.dateStr} | ${formatted.dayOfWeek.padEnd(9)} | ${postcodeStr} | ${areaStr} | ${entry.type}`);
            } else {
                console.log(`           |           | ${postcodeStr} | ${areaStr} | ${entry.type}`);
            }
        });
    });
    
    // Summary by day of week
    console.log('\n=== SUMMARY BY DAY OF WEEK ===\n');
    const dayOfWeekMap = new Map();
    
    sortedDates.forEach(([_, data]) => {
        const dayName = formatDate(data.date).dayOfWeek;
        if (!dayOfWeekMap.has(dayName)) {
            dayOfWeekMap.set(dayName, new Set());
        }
        data.entries.forEach(entry => {
            dayOfWeekMap.get(dayName).add(entry.area);
        });
    });
    
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
        if (dayOfWeekMap.has(day)) {
            console.log(`${day}:`);
            Array.from(dayOfWeekMap.get(day)).forEach(area => {
                console.log(`  - ${area}`);
            });
            console.log('');
        }
    });
}

// Test the 4-week rotation pattern
function test4WeekRotation() {
    console.log('\n=== TESTING 4-WEEK ROTATION PATTERN ===\n');
    
    // Test a few key areas
    const testAreas = [
        { postcodes: ['BS40'], name: 'Weston-super-Mare', startDate: '13 May' },
        { postcodes: ['BS26'], name: 'Axbridge', startDate: '15 May' },
        { postcodes: ['BA5'], name: 'Wells', startDate: '22 May' },
        { postcodes: ['TA10'], name: 'Langport', startDate: '28 May' }
    ];
    
    testAreas.forEach(area => {
        console.log(`\n${area.name} (${area.startDate}):`);
        console.log('-'.repeat(50));
        
        const dates = generateScheduleDates(area.startDate);
        const relevantDates = dates.slice(0, 3); // Show first 3 occurrences
        
        relevantDates.forEach((dateInfo, index) => {
            const formatted = formatDate(dateInfo.fullDate);
            console.log(`  ${index + 1}. ${formatted.dateStr} (${formatted.dayOfWeek})`);
            
            if (index > 0) {
                const prevDate = relevantDates[index - 1].fullDate;
                const daysBetween = Math.round((dateInfo.fullDate - prevDate) / (1000 * 60 * 60 * 24));
                console.log(`     → ${daysBetween} days since previous visit`);
            }
        });
    });
}

// Test Friday services
function testFridayServices() {
    console.log('\n=== TESTING FRIDAY-ONLY SERVICES ===\n');
    
    const fridayDates = generateFridayOnlyDates();
    console.log('BA6 (Glastonbury) and BA16 (Street) - Every Friday:');
    console.log('-'.repeat(50));
    
    fridayDates.slice(0, 6).forEach((dateInfo, index) => {
        const formatted = formatDate(dateInfo.fullDate);
        console.log(`  ${index + 1}. ${formatted.dateStr} (${formatted.dayOfWeek})`);
    });
}

// Run all tests
generateDetailedSchedule();
test4WeekRotation();
testFridayServices();

// Check for conflicts or overlaps
console.log('\n=== CHECKING FOR SCHEDULING CONFLICTS ===\n');

const conflictMap = new Map();
scheduleData.forEach(entry => {
    const dates = generateScheduleDates(entry.startDate);
    dates.forEach(dateInfo => {
        const dateKey = dateInfo.fullDate.toISOString().split('T')[0];
        entry.postcodes.forEach(postcode => {
            const key = `${dateKey}-${postcode}`;
            if (conflictMap.has(key)) {
                console.log(`⚠️  CONFLICT: ${postcode} scheduled twice on ${dateInfo.date}:`);
                console.log(`   - ${conflictMap.get(key)}`);
                console.log(`   - ${entry.area}`);
            } else {
                conflictMap.set(key, entry.area);
            }
        });
    });
});