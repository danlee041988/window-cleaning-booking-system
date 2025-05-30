import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

export const NotificationCenter: React.FC = () => {
  return (
    <div className="relative">
      <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
        <BellIcon className="h-6 w-6 text-gray-400" />
      </button>
    </div>
  );
};