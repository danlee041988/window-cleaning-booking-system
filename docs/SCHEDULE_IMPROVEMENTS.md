# Schedule System Improvements

## Overview

The postcode-based date scheduling system has been significantly enhanced with the following improvements:

## 1. Holiday Exclusions

### Bank Holidays
- UK bank holidays are now excluded from standard bookings
- Includes Christmas Day, Boxing Day, New Year's Day, Easter, and all UK bank holidays
- Bank holidays defined for years 2024-2027 (easily extendable)

### Holiday Periods
- Christmas period (Dec 23 - Jan 3) is excluded from standard bookings
- Emergency bookings can still be made during holidays

## 2. Capacity Management

### Per-Area Capacity Limits
```javascript
// Default capacity: 8 bookings per date
// Area-specific overrides:
'BS40': 10,  // High demand area
'BS26': 6,   // Limited crew availability
'BA5': 4,    // Friday-only area with limited slots
```

### Visual Capacity Indicators
- **Green (Available)**: More than 2 slots remaining
- **Yellow (Limited)**: 2 or fewer slots remaining
- **Red (Full)**: No slots available

## 3. Flexible Booking Options

### Three Booking Types
1. **Standard Booking**
   - Regular 4-weekly schedule
   - Excludes weekends and holidays
   - Standard pricing

2. **Priority Booking**
   - Faster service guarantee
   - 20% surcharge
   - Limited availability

3. **Emergency Service**
   - Available on holidays and weekends
   - 50% surcharge
   - Subject to crew availability

## 4. Enhanced UI Features

### Dual View Modes
- **Calendar View**: Monthly calendar with visual availability
- **List View**: Grouped by month with detailed capacity info

### Visual Enhancements
- Color-coded availability status
- Animated transitions
- Clear holiday/weekend indicators
- Capacity counters (e.g., "3/8 slots remaining")

## 5. Leap Year Handling

- Explicit leap year detection
- Correct day calculation for February in leap years
- Works correctly for years like 2024, 2028, etc.

## 6. Future Year Support

- Bank holidays defined through 2027
- Automatic date generation for any future year
- Handles substitute days (e.g., when Christmas falls on weekend)

## Usage Example

```javascript
import ScheduleSelection from './components/steps/ScheduleSelection';

<ScheduleSelection
    postcode="BS40"
    selectedDate={selectedDate}
    onDateSelect={handleDateSelect}
    isEmergency={false}
    showCalendarView={true}
/>
```

## Configuration

### Adding New Bank Holidays
Edit `src/config/scheduleConfig.js`:
```javascript
export const bankHolidays = {
    2028: [
        '2028-01-01', // New Year's Day
        // Add more holidays...
    ]
};
```

### Adjusting Capacity Limits
```javascript
export const areaCapacityLimits = {
    'NEW_AREA': 12, // Add new area with custom capacity
};
```

### Modifying Holiday Periods
```javascript
export const holidayExclusionPeriods = [
    { start: 12, startDay: 23, end: 1, endDay: 3 }, // Christmas period
    { start: 7, startDay: 1, end: 7, endDay: 14 }   // Summer shutdown
];
```

## Testing

Run the test suite to verify functionality:
```javascript
import { runScheduleTests } from './tests/scheduleConfig.test';
runScheduleTests();
```

## Backward Compatibility

- Existing postcode-based logic is preserved
- Legacy date format support maintained
- No breaking changes to existing bookings

## Migration Notes

1. The component now expects dates in ISO format (YYYY-MM-DD)
2. Old date selection UI is replaced but functionality is preserved
3. ASAP option remains available and unchanged

## Performance Considerations

- Dates are generated on-demand based on postcode
- Capacity checks are mocked but ready for database integration
- Calendar view efficiently renders only visible month