import { getAvailableDatesWithCapacity } from './src/config/scheduleConfig.js';

// Test specific postcodes
const testCases = [
    { postcode: 'BA6 8BH', name: 'Glastonbury (should be every Friday)' },
    { postcode: 'BA16 0EG', name: 'Street (should be every Friday)' },
    { postcode: 'BS40 1AB', name: 'Weston-super-Mare (Week 1 - Tuesdays)' },
    { postcode: 'BS26 2EE', name: 'Axbridge (Week 1 - Wed/Thu)' },
    { postcode: 'BA5 1PZ', name: 'Wells (Week 2 - Thu/Fri)' },
    { postcode: 'TA10 9RH', name: 'Langport (Week 3 - Wed/Thu)' },
    { postcode: 'BS28 4UZ', name: 'Wedmore (Week 4 - Wed/Thu)' }
];

console.log('=== POSTCODE AVAILABILITY TESTING ===');
console.log(`Test Date: ${new Date().toLocaleString()}\n`);

testCases.forEach(test => {
    console.log(`\nTesting: ${test.postcode} - ${test.name}`);
    console.log('='.repeat(60));
    
    const dates = getAvailableDatesWithCapacity([test.postcode]);
    
    if (dates.length === 0) {
        console.log('❌ No dates available');
    } else {
        console.log(`✅ ${dates.length} dates available in next 6 weeks:\n`);
        
        // Show first 5 dates
        dates.slice(0, 5).forEach((dateInfo, index) => {
            const date = dateInfo.fullDate;
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayOfWeek = dayNames[date.getDay()];
            
            console.log(`   ${index + 1}. ${dateInfo.date} (${dayOfWeek}) - ${dateInfo.area}`);
            console.log(`      Capacity: ${dateInfo.remainingCapacity}/${dateInfo.capacity} available`);
            console.log(`      Status: ${dateInfo.status}`);
            
            if (dateInfo.specialRule) {
                console.log(`      Special: ${dateInfo.specialRule}`);
            }
            
            // Check if it's the expected day
            if (test.postcode.startsWith('BA6') || test.postcode.startsWith('BA16')) {
                if (dayOfWeek !== 'Fri') {
                    console.log(`      ⚠️  WARNING: Should only be on Fridays!`);
                }
            }
        });
        
        if (dates.length > 5) {
            console.log(`\n   ... and ${dates.length - 5} more dates`);
        }
        
        // Verify spacing for regular schedule
        if (dates.length >= 2 && !test.postcode.startsWith('BA6') && !test.postcode.startsWith('BA16')) {
            const firstDate = dates[0].fullDate;
            const secondDate = dates[1].fullDate;
            const daysBetween = Math.round((secondDate - firstDate) / (1000 * 60 * 60 * 24));
            console.log(`\n   📅 Days between visits: ${daysBetween} (should be 28 for 4-week cycle)`);
        }
        
        // Check Friday consistency for BA6/BA16
        if (test.postcode.startsWith('BA6') || test.postcode.startsWith('BA16')) {
            const nonFridays = dates.filter(d => d.fullDate.getDay() !== 5);
            if (nonFridays.length > 0) {
                console.log(`\n   ⚠️  ERROR: Found ${nonFridays.length} non-Friday dates!`);
            } else {
                console.log(`\n   ✅ All dates are Fridays as expected`);
            }
            
            // Check weekly spacing
            if (dates.length >= 2) {
                const daysBetween = Math.round((dates[1].fullDate - dates[0].fullDate) / (1000 * 60 * 60 * 24));
                console.log(`   📅 Days between Fridays: ${daysBetween} (should be 7)`);
            }
        }
    }
});

// Summary check
console.log('\n\n=== SUMMARY ===\n');
console.log('Friday-only postcodes (BA6, BA16):');
['BA6', 'BA16'].forEach(prefix => {
    const dates = getAvailableDatesWithCapacity([prefix + ' TEST']);
    const fridays = dates.filter(d => d.fullDate.getDay() === 5);
    console.log(`  ${prefix}: ${fridays.length} Fridays available out of ${dates.length} total dates`);
});

console.log('\nRegular schedule postcodes:');
['BS40', 'BS26', 'BA5', 'TA10', 'BS28'].forEach(prefix => {
    const dates = getAvailableDatesWithCapacity([prefix + ' TEST']);
    if (dates.length >= 2) {
        const daysBetween = Math.round((dates[1].fullDate - dates[0].fullDate) / (1000 * 60 * 60 * 24));
        console.log(`  ${prefix}: ${dates.length} dates, ${daysBetween} days between visits`);
    } else {
        console.log(`  ${prefix}: ${dates.length} dates available`);
    }
});