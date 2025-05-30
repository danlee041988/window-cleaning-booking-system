import React from 'react';
import { 
  UserGroupIcon, 
  ClockIcon, 
  CurrencyPoundIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Welcome to Somerset Window Cleaning Admin</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">New Leads Today</p>
              <p className="text-2xl font-bold text-white mt-1">8</p>
              <p className="text-sm mt-2 text-green-400">+12% from yesterday</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500 bg-opacity-20">
              <UserGroupIcon className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white mt-1">£2,450</p>
              <p className="text-sm mt-2 text-green-400">+8% this month</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500 bg-opacity-20">
              <CurrencyPoundIcon className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Conversion Rate</p>
              <p className="text-2xl font-bold text-white mt-1">24%</p>
              <p className="text-sm mt-2 text-yellow-400">+3% this week</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500 bg-opacity-20">
              <ArrowTrendingUpIcon className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Follow-ups Due</p>
              <p className="text-2xl font-bold text-white mt-1">12</p>
              <p className="text-sm mt-2 text-red-400">3 overdue</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500 bg-opacity-20">
              <ClockIcon className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors">
              View New Leads
            </button>
            <button className="w-full py-2 px-4 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white transition-colors">
              Today's Follow-ups
            </button>
            <button className="w-full py-2 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors">
              Export Data
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="text-sm text-gray-300 pb-2 border-b border-gray-700">
              New lead: John Smith - SW1A 1AA
            </div>
            <div className="text-sm text-gray-300 pb-2 border-b border-gray-700">
              Quote sent: £85 window cleaning
            </div>
            <div className="text-sm text-gray-300 pb-2 border-b border-gray-700">
              Follow-up completed: Mary Johnson
            </div>
            <div className="text-sm text-gray-300">
              Lead converted: £120 monthly service
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Booking Form</span>
            <span className="text-green-400 font-semibold">✓ Online</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Email Service</span>
            <span className="text-green-400 font-semibold">✓ Working</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Database</span>
            <span className="text-green-400 font-semibold">✓ Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};