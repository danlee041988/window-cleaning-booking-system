import React from 'react';

interface FollowUpSummaryProps {
  todayCount?: number;
  overdueCount?: number;
  upcomingCount?: number;
}

export const FollowUpSummary: React.FC<FollowUpSummaryProps> = ({ 
  todayCount = 0, 
  overdueCount = 0, 
  upcomingCount = 0 
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Follow-ups</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Today</span>
          <span className="text-white font-semibold">{todayCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Overdue</span>
          <span className="text-red-400 font-semibold">{overdueCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Upcoming</span>
          <span className="text-white font-semibold">{upcomingCount}</span>
        </div>
      </div>
    </div>
  );
};