// Schedule configuration for window cleaning service areas
// Last updated: 2024

export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Helper function to generate dates for the next 12 months
export const generateScheduleDates = (startDateStr) => {
    const dates = [];
    const parts = startDateStr.split(' ');
    if (parts.length !== 2) return dates;
    
    const day = parseInt(parts[0], 10);
    const monthIndex = months.findIndex(m => m.toLowerCase() === parts[1].toLowerCase());
    if (monthIndex === -1 || isNaN(day)) return dates;
    
    const today = new Date();
    let currentDate = new Date(today.getFullYear(), monthIndex, day);
    
    // If the date is in the past, move to next occurrence
    while (currentDate < today) {
        currentDate.setDate(currentDate.getDate() + 28);
    }
    
    // Generate dates for the next 12 months
    const endDate = new Date(today);
    endDate.setMonth(endDate.getMonth() + 12);
    
    while (currentDate <= endDate) {
        dates.push(`${currentDate.getDate().toString().padStart(2, '0')} ${months[currentDate.getMonth()]}`);
        currentDate.setDate(currentDate.getDate() + 28);
    }
    
    return dates;
};

// Schedule data for different areas
export const scheduleData = [
    {
        postcodes: ['BS40', 'BS48', 'BS49', 'BS22', 'BS23', 'BS24', 'BS21'],
        area: 'Weston Backwell Blagdon Yatton Clevedon',
        dates: generateScheduleDates('13 May')
    },
    {
        postcodes: ['BS25', 'BS29'],
        area: 'Banwell Winscombe',
        dates: generateScheduleDates('14 May')
    },
    {
        postcodes: ['BS26'],
        area: 'Axbridge',
        dates: generateScheduleDates('15 May')
    },
    {
        postcodes: ['BS26', 'BS27'],
        area: 'Axbridge / Cheddar',
        dates: generateScheduleDates('16 May')
    },
    {
        postcodes: ['BS27'],
        area: 'Cheddar',
        dates: generateScheduleDates('17 May')
    },
    {
        postcodes: ['BA7', 'BA9', 'BA10', 'BA11', 'BA8'],
        area: 'Wincanton Bruton Castle Cary Frome Templecombe',
        dates: generateScheduleDates('20 May')
    },
    {
        postcodes: ['BS39', 'BA3', 'BA4'],
        area: 'Paulton Radstock Shepton',
        dates: generateScheduleDates('21 May')
    },
    {
        postcodes: ['BA5'],
        area: 'Wells',
        dates: generateScheduleDates('24 May')
    },
    {
        postcodes: ['TA18', 'TA19', 'TA20', 'BA22', 'TA17', 'TA12', 'TA13', 'TA14', 'DT9'],
        area: 'Yeovil Illminster Chard Crewkerne etc',
        dates: generateScheduleDates('27 May')
    },
    {
        postcodes: ['TA10', 'TA11'],
        area: 'Langport Somerton',
        dates: generateScheduleDates('28 May')
    },
    {
        postcodes: ['TA10', 'TA11'],
        area: 'Langport Somerton',
        dates: generateScheduleDates('29 May')
    },
    {
        postcodes: ['BA6'],
        area: 'Glastonbury (non-Meare)',
        dates: generateScheduleDates('30 May')
    },
    {
        postcodes: ['BA6'],
        area: 'Glastonbury (non-Meare)',
        dates: generateScheduleDates('31 May')
    },
    {
        postcodes: ['TA7', 'TA6', 'TA2', 'TA3', 'TA9', 'TA8', 'TA1'],
        area: 'Bridgwater Taunton Mark Highbridge',
        dates: generateScheduleDates('03 Jun')
    },
    {
        postcodes: ['BS28'],
        area: 'Wedmore',
        dates: generateScheduleDates('04 Jun')
    },
    {
        postcodes: ['BS28'],
        area: 'Wedmore',
        dates: generateScheduleDates('05 Jun')
    },
    {
        postcodes: ['BS28', 'BA6-MEARE'],
        area: 'Wedmore / Meare',
        dates: generateScheduleDates('06 Jun')
    },
    {
        postcodes: ['BA16'],
        area: 'Street',
        dates: generateScheduleDates('07 Jun')
    }
];

// Special handling for certain postcodes
export const specialPostcodeRules = {
    // BA5, BA6, BA16 areas are only serviced on Fridays
    fridayOnly: ['BA5', 'BA6', 'BA16']
}; 