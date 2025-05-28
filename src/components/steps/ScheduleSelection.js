import React, { useState, useEffect } from 'react';
import { 
    getAvailableDatesWithCapacity, 
    bookingTypes,
    months as monthNames,
    isBankHoliday,
    isInHolidayPeriod 
} from '../../config/scheduleConfig';

const ScheduleSelection = ({ 
    postcode, 
    selectedDate, 
    onDateSelect, 
    isEmergency = false,
    showCalendarView = true 
}) => {
    const [availableDates, setAvailableDates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState(showCalendarView ? 'calendar' : 'list');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [bookingType, setBookingType] = useState(isEmergency ? bookingTypes.EMERGENCY : bookingTypes.STANDARD);

    useEffect(() => {
        if (postcode && postcode.length >= 3) {
            loadAvailableDates();
        }
    }, [postcode, bookingType]);

    const loadAvailableDates = async () => {
        setIsLoading(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const dates = getAvailableDatesWithCapacity([postcode], bookingType);
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
                return 'bg-yellow-600 hover:bg-yellow-700 text-white';
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

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const changeMonth = (direction) => {
        if (direction === 'next') {
            if (selectedMonth === 11) {
                setSelectedMonth(0);
                setSelectedYear(selectedYear + 1);
            } else {
                setSelectedMonth(selectedMonth + 1);
            }
        } else {
            if (selectedMonth === 0) {
                setSelectedMonth(11);
                setSelectedYear(selectedYear - 1);
            } else {
                setSelectedMonth(selectedMonth - 1);
            }
        }
    };

    const renderCalendarView = () => {
        const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
        const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
        const days = [];
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="p-2"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(selectedYear, selectedMonth, day);
            const dateStr = currentDate.toISOString().split('T')[0];
            
            // Find if this date is available
            const availableDate = availableDates.find(ad => 
                ad.fullDate.toISOString().split('T')[0] === dateStr
            );

            const isHoliday = isBankHoliday(currentDate) || isInHolidayPeriod(currentDate);
            const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
            const isPast = currentDate < new Date().setHours(0, 0, 0, 0);

            let cellClass = 'p-2 border border-gray-700 rounded-lg min-h-[80px] relative transition-all duration-200 ';
            let content = null;

            if (availableDate) {
                const isSelected = selectedDate === dateStr;
                cellClass += isSelected 
                    ? 'ring-2 ring-blue-500 ' + getStatusColor(availableDate.status)
                    : getStatusColor(availableDate.status) + ' cursor-pointer hover:scale-105';
                
                content = (
                    <button
                        type="button"
                        onClick={() => availableDate.status !== 'full' && onDateSelect(dateStr)}
                        disabled={availableDate.status === 'full'}
                        className="w-full h-full flex flex-col items-center justify-center"
                    >
                        <span className="font-bold text-lg">{day}</span>
                        <span className="text-xs mt-1">{getStatusIcon(availableDate.status)}</span>
                        <span className="text-xs">
                            {availableDate.remainingCapacity}/{availableDate.capacity}
                        </span>
                    </button>
                );
            } else {
                cellClass += isPast ? 'bg-gray-800 text-gray-600' :
                            isHoliday ? 'bg-red-900/20 text-red-400' :
                            isWeekend ? 'bg-gray-800 text-gray-500' :
                            'bg-gray-800 text-gray-400';
                
                content = (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <span className="text-lg">{day}</span>
                        {isHoliday && <span className="text-xs mt-1">Holiday</span>}
                    </div>
                );
            }

            days.push(
                <div key={day} className={cellClass}>
                    {content}
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Month Navigation */}
                <div className="flex justify-between items-center mb-4">
                    <button
                        type="button"
                        onClick={() => changeMonth('prev')}
                        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h3 className="text-xl font-semibold text-white">
                        {monthNames[selectedMonth]} {selectedYear}
                    </h3>
                    <button
                        type="button"
                        onClick={() => changeMonth('next')}
                        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-sm font-semibold text-gray-400">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                    {days}
                </div>

                {/* Legend */}
                <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Legend:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
                            <span className="text-gray-300">Available</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-yellow-600 rounded mr-2"></div>
                            <span className="text-gray-300">Limited Spots</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
                            <span className="text-gray-300">Fully Booked</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-red-900/20 rounded mr-2"></div>
                            <span className="text-gray-300">Holiday</span>
                        </div>
                    </div>
                </div>
            </div>
        );
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
            {/* Booking Type Selection */}
            <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-200 mb-3">Booking Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={() => setBookingType(bookingTypes.STANDARD)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                            bookingType === bookingTypes.STANDARD 
                                ? 'border-blue-500 bg-blue-600 text-white' 
                                : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        <div className="font-semibold">Standard Booking</div>
                        <div className="text-sm mt-1">Regular scheduled service</div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setBookingType(bookingTypes.PRIORITY)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                            bookingType === bookingTypes.PRIORITY 
                                ? 'border-yellow-500 bg-yellow-600 text-white' 
                                : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        <div className="font-semibold">Priority Booking</div>
                        <div className="text-sm mt-1">Faster service (+20%)</div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setBookingType(bookingTypes.EMERGENCY)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                            bookingType === bookingTypes.EMERGENCY 
                                ? 'border-red-500 bg-red-600 text-white' 
                                : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        <div className="font-semibold">Emergency Service</div>
                        <div className="text-sm mt-1">Including holidays (+50%)</div>
                    </button>
                </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-200">Available Dates</h3>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setViewMode('calendar')}
                        className={`px-4 py-2 rounded-lg transition-all ${
                            viewMode === 'calendar' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Calendar
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded-lg transition-all ${
                            viewMode === 'list' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        List
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-300">Loading available dates...</span>
                </div>
            )}

            {/* Date Selection */}
            {!isLoading && availableDates.length > 0 && (
                viewMode === 'calendar' ? renderCalendarView() : renderListView()
            )}

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