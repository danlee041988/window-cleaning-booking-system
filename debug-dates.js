// Debug script to test date generation
import { getAvailableDatesWithCapacity } from './src/config/scheduleConfig.js';

console.log('Testing getAvailableDatesWithCapacity...\n');

// Test with different postcodes
const testPostcodes = [
    'BS26',   // Axbridge
    'BA6',    // Glastonbury (Friday only)
    'BA16',   // Street (Friday only)
    'BS28'    // Wedmore
];

testPostcodes.forEach(postcode => {
    console.log(`\n=== Testing postcode: ${postcode} ===`);
    const dates = getAvailableDatesWithCapacity([postcode]);
    
    console.log(`Found ${dates.length} dates`);
    
    if (dates.length > 0) {
        console.log('\nFirst 3 dates:');
        dates.slice(0, 3).forEach(date => {
            console.log(`- ${date.date} ${date.year} (${date.fullDate.toDateString()}) - ${date.area} - Status: ${date.status}`);
        });
    }
});

// Test current date
console.log(`\n\nCurrent date: ${new Date().toDateString()}`);