import React from 'react';

interface RecentActivityProps {
  activities?: any[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities = [] }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-gray-400">No recent activity</p>
        ) : (
          activities.map((activity, index) => (
            <div key={index} className="text-sm text-gray-300 pb-2 border-b border-gray-700">
              {activity.description}
            </div>
          ))
        )}
      </div>
    </div>
  );
};