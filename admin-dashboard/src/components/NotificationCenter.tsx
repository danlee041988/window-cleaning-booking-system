import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface NotificationCenterProps {
  onClose?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  // Mock notifications for now
  const notifications = [
    { id: 1, message: 'New lead submitted', time: '5 minutes ago' },
    { id: 2, message: 'Quote accepted by customer', time: '1 hour ago' },
    { id: 3, message: 'Follow-up reminder', time: '2 hours ago' }
  ];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Notifications</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div key={notification.id} className="p-3 bg-gray-700 rounded-lg">
              <p className="text-white text-sm">{notification.message}</p>
              <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-4">No new notifications</p>
        )}
      </div>
    </div>
  );
};