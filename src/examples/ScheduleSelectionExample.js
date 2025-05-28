import React, { useState } from 'react';
import ScheduleSelection from '../components/steps/ScheduleSelection';

/**
 * Example usage of the improved ScheduleSelection component
 * This demonstrates all the new features:
 * - Holiday exclusions
 * - Capacity limits
 * - Priority/Emergency bookings
 * - Calendar and list views
 * - Availability status indicators
 */
const ScheduleSelectionExample = () => {
    const [selectedDate, setSelectedDate] = useState('');
    const [postcode, setPostcode] = useState('BS40');

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        console.log('Selected date:', date);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Schedule Selection Example</h1>
                
                {/* Postcode Input */}
                <div className="mb-8">
                    <label className="block text-sm font-medium mb-2">
                        Enter Postcode (try BS40, BA5, BS28)
                    </label>
                    <input
                        type="text"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        placeholder="e.g., BS40"
                    />
                </div>

                {/* Schedule Selection Component */}
                <ScheduleSelection
                    postcode={postcode}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    isEmergency={false}
                    showCalendarView={true}
                />

                {/* Selected Date Display */}
                {selectedDate && (
                    <div className="mt-8 p-4 bg-gray-800 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Selected Date:</h3>
                        <p className="text-blue-300">{selectedDate}</p>
                    </div>
                )}

                {/* Feature Highlights */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4">New Features</h3>
                        <ul className="space-y-2 text-gray-300">
                            <li>✓ Bank holidays and Christmas period excluded</li>
                            <li>✓ Capacity limits shown for each date</li>
                            <li>✓ Priority and emergency booking options</li>
                            <li>✓ Calendar and list view toggles</li>
                            <li>✓ Visual indicators for availability status</li>
                            <li>✓ Leap year handling for all dates</li>
                            <li>✓ Works for future years (e.g., 2027)</li>
                        </ul>
                    </div>
                    
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-4">Booking Types</h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-gray-700 rounded">
                                <h4 className="font-semibold text-blue-300">Standard Booking</h4>
                                <p className="text-sm text-gray-400">Regular service, excludes holidays</p>
                            </div>
                            <div className="p-3 bg-gray-700 rounded">
                                <h4 className="font-semibold text-yellow-300">Priority Booking</h4>
                                <p className="text-sm text-gray-400">Faster service with 20% surcharge</p>
                            </div>
                            <div className="p-3 bg-gray-700 rounded">
                                <h4 className="font-semibold text-red-300">Emergency Service</h4>
                                <p className="text-sm text-gray-400">Available on holidays, 50% surcharge</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Usage Instructions */}
                <div className="mt-8 p-6 bg-blue-900/20 border border-blue-700 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">How to Use</h3>
                    <ol className="space-y-2 text-gray-300">
                        <li>1. Enter a postcode (BS40, BA5, BS28 are good examples)</li>
                        <li>2. Choose between Standard, Priority, or Emergency booking</li>
                        <li>3. Toggle between Calendar and List views</li>
                        <li>4. Select an available date (green = available, yellow = limited, red = full)</li>
                        <li>5. Or choose "Request First Clean ASAP" for urgent requests</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default ScheduleSelectionExample;