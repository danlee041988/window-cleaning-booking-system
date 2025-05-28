import React, { useState, useEffect } from 'react';
import { 
    getAvailableDatesWithCapacity, 
    months as monthNames
} from '../../config/scheduleConfig';

const ScheduleSelection = ({ 
    postcode, 
    selectedDate, 
    onDateSelect
}) => {
    const [availableDates, setAvailableDates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    // Always use list view only

    useEffect(() => {
        if (postcode && postcode.length >= 3) {
            loadAvailableDates();
        }
    }, [postcode]);

    const loadAvailableDates = async () => {
        setIsLoading(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const dates = getAvailableDatesWithCapacity([postcode]);
            setAvailableDates(dates);
        } catch (error) {
            console.error('Error loading dates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available':
                return 'bg-green-600 hover:bg-green-700 text-white';
            case 'limited':
                return 'bg-blue-600 hover:bg-blue-700 text-white';
            case 'full':
                return 'bg-red-600 text-white cursor-not-allowed opacity-60';
            default:
                return 'bg-gray-600 text-gray-300';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'available':
                return '✓';
            case 'limited':
                return '!';
            case 'full':
                return '✗';
            default:
                return '';
        }
    };

    const formatDateForDisplay = (date) => {
        return date.toLocaleDateString('en-GB', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short',
            year: 'numeric'
        });
    };



    const renderListView = () => {
        // Group dates by month
        const datesByMonth = {};
        availableDates.forEach(date => {
            const monthKey = `${monthNames[date.fullDate.getMonth()]} ${date.fullDate.getFullYear()}`;
            if (!datesByMonth[monthKey]) {
                datesByMonth[monthKey] = [];
            }
            datesByMonth[monthKey].push(date);
        });

        return (
            <div className="space-y-6">
                {Object.entries(datesByMonth).map(([month, dates]) => (
                    <div key={month}>
                        <h3 className="text-lg font-semibold text-gray-200 mb-3">{month}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {dates.map(date => {
                                const dateStr = date.fullDate.toISOString().split('T')[0];
                                const isSelected = selectedDate === dateStr;
                                
                                return (
                                    <button
                                        key={dateStr}
                                        type="button"
                                        onClick={() => date.status !== 'full' && onDateSelect(dateStr)}
                                        disabled={date.status === 'full'}
                                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                            isSelected 
                                                ? 'border-blue-500 ring-2 ring-blue-500 ' + getStatusColor(date.status)
                                                : 'border-gray-600 ' + getStatusColor(date.status)
                                        } ${date.status !== 'full' ? 'hover:scale-105' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold">
                                                {formatDateForDisplay(date.fullDate)}
                                            </span>
                                            <span className="text-2xl">{getStatusIcon(date.status)}</span>
                                        </div>
                                        <div className="text-sm">
                                            <div className="flex justify-between">
                                                <span>Capacity:</span>
                                                <span>{date.remainingCapacity}/{date.capacity}</span>
                                            </div>
                                            {date.status === 'limited' && (
                                                <div className="mt-1 text-yellow-200">
                                                    Only {date.remainingCapacity} spots left!
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">

            {/* Available Dates Header */}
            <div>
                <h3 className="text-xl font-semibold text-gray-200">Available Dates (Next 6 Weeks)</h3>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-300">Loading available dates...</span>
                </div>
            )}

            {/* Date Selection */}
            {!isLoading && availableDates.length > 0 && renderListView()}

            {/* No Dates Available */}
            {!isLoading && availableDates.length === 0 && (
                <div className="text-center p-8 bg-gray-800 rounded-lg">
                    <p className="text-gray-300">No dates available for your postcode area.</p>
                    <p className="text-sm text-gray-400 mt-2">Please try a different booking type or contact us directly.</p>
                </div>
            )}

            {/* ASAP Option */}
            <div className="mt-6">
                <button
                    type="button"
                    onClick={() => onDateSelect('ASAP')}
                    className={`w-full p-6 border-2 rounded-lg transition-all ${
                        selectedDate === 'ASAP'
                            ? 'border-green-500 bg-green-600 text-white'
                            : 'border-green-500 bg-gray-700 text-gray-200 hover:bg-green-800/20'
                    }`}
                >
                    <div className="flex items-center justify-center">
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <div>
                            <span className="block text-lg font-semibold">Request First Clean ASAP</span>
                            <span className="block text-sm mt-1">We'll contact you to arrange the earliest available date</span>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default ScheduleSelection;