import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const AnalyticsPage: React.FC = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: analyticsApi.getDashboardMetrics,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const dashboardData = metrics?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400">Performance metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-500 bg-opacity-20 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Leads</p>
              <p className="text-2xl font-bold text-white">
                {dashboardData?.totalLeads || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-500 bg-opacity-20 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-white">
                {dashboardData?.monthlyLeads || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-500 bg-opacity-20 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">This Week</p>
              <p className="text-2xl font-bold text-white">
                {dashboardData?.weeklyLeads || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-500 bg-opacity-20 rounded-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Conversion Rate</p>
              <p className="text-2xl font-bold text-white">
                {dashboardData?.conversionRate || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      {dashboardData?.statusBreakdown && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Lead Status Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData.statusBreakdown.map((status: any) => (
              <div key={status.statusId} className="text-center">
                <div className="text-2xl font-bold text-white">
                  {status._count}
                </div>
                <div className="text-sm text-gray-400">
                  Status ID: {status.statusId}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Placeholder for Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Lead Sources</h2>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Chart placeholder - Lead source distribution
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Conversion Funnel</h2>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Chart placeholder - Conversion funnel
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Lead Activity Over Time</h2>
        <div className="h-80 flex items-center justify-center text-gray-400">
          Chart placeholder - Lead activity timeline
        </div>
      </div>
    </div>
  );
};