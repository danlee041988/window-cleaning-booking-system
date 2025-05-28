import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  UserGroupIcon, 
  ClockIcon, 
  CurrencyPoundIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { analyticsApi, followUpApi } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatCard } from '../components/dashboard/StatCard';
import { ConversionChart } from '../components/dashboard/ConversionChart';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { FollowUpSummary } from '../components/dashboard/FollowUpSummary';
import { QuickActions } from '../components/dashboard/QuickActions';
import { formatCurrency, formatPercentage } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  // Fetch dashboard metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: analyticsApi.getDashboardMetrics,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Fetch today's follow-ups
  const { data: todaysFollowUps, isLoading: followUpsLoading } = useQuery({
    queryKey: ['todays-follow-ups'],
    queryFn: followUpApi.getTodaysFollowUps,
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });

  // Fetch overdue follow-ups
  const { data: overdueFollowUps } = useQuery({
    queryKey: ['overdue-follow-ups'],
    queryFn: followUpApi.getOverdueFollowUps,
    refetchInterval: 2 * 60 * 1000,
  });

  if (metricsLoading || followUpsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      name: 'New Leads Today',
      value: metrics?.newLeadsToday || 0,
      change: metrics?.newLeadsTodayChange || 0,
      icon: UserGroupIcon,
      color: 'blue',
    },
    {
      name: 'Follow-ups Due',
      value: todaysFollowUps?.length || 0,
      urgentCount: overdueFollowUps?.length || 0,
      icon: ClockIcon,
      color: todaysFollowUps?.length > 0 ? 'orange' : 'green',
    },
    {
      name: 'Pipeline Value',
      value: formatCurrency(metrics?.totalPipelineValue || 0),
      change: metrics?.pipelineValueChange || 0,
      icon: CurrencyPoundIcon,
      color: 'green',
    },
    {
      name: 'Conversion Rate',
      value: formatPercentage(metrics?.conversionRate || 0),
      change: metrics?.conversionRateChange || 0,
      icon: ArrowTrendingUpIcon,
      color: 'purple',
    },
    {
      name: 'Ready for Squeegee',
      value: metrics?.readyForSqueegee || 0,
      totalValue: formatCurrency(metrics?.readyForSqueegeeValue || 0),
      icon: ArrowPathIcon,
      color: 'cyan',
    },
    {
      name: 'Bookings This Month',
      value: metrics?.bookingsThisMonth || 0,
      change: metrics?.bookingsChange || 0,
      icon: CheckCircleIcon,
      color: 'emerald',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page header */}
      <motion.div variants={itemVariants}>
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Overview of your lead management and business performance
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <QuickActions />
          </div>
        </div>
      </motion.div>

      {/* Alert banner for overdue follow-ups */}
      {overdueFollowUps?.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="bg-red-900/50 border border-red-600 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-200">
                  Overdue Follow-ups
                </h3>
                <p className="text-sm text-red-300">
                  You have {overdueFollowUps.length} overdue follow-up{overdueFollowUps.length !== 1 ? 's' : ''} that need immediate attention.
                </p>
              </div>
              <button className="ml-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                View All
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.name}
              {...stat}
              delay={index * 0.1}
            />
          ))}
        </div>
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion chart - takes up 2 columns */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                Lead Conversion Funnel
              </h3>
              <select className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-1.5">
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
            <ConversionChart />
          </div>
        </motion.div>

        {/* Follow-up summary */}
        <motion.div variants={itemVariants}>
          <FollowUpSummary 
            todaysFollowUps={todaysFollowUps}
            overdueFollowUps={overdueFollowUps}
          />
        </motion.div>
      </div>

      {/* Recent activity */}
      <motion.div variants={itemVariants}>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">
              Recent Activity
            </h3>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
              View all activity
            </button>
          </div>
          <RecentActivity />
        </div>
      </motion.div>

      {/* Performance insights */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Top performing areas */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-white mb-4">
              Top Performing Areas
            </h4>
            <div className="space-y-3">
              {metrics?.topPostcodeAreas?.map((area: any) => (
                <div key={area.postcode} className="flex items-center justify-between">
                  <span className="text-gray-300">{area.postcode}</span>
                  <div className="text-right">
                    <div className="text-white font-medium">
                      {formatPercentage(area.conversionRate)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {area.leadCount} leads
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-gray-400 text-center py-4">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Lead sources */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-white mb-4">
              Lead Sources
            </h4>
            <div className="space-y-3">
              {metrics?.leadSources?.map((source: any) => (
                <div key={source.source} className="flex items-center justify-between">
                  <span className="text-gray-300 capitalize">{source.source}</span>
                  <div className="text-right">
                    <div className="text-white font-medium">
                      {source.count}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatPercentage(source.percentage)}
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-gray-400 text-center py-4">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Team performance */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-white mb-4">
              Team Performance
            </h4>
            <div className="space-y-3">
              {metrics?.teamPerformance?.map((member: any) => (
                <div key={member.userId} className="flex items-center justify-between">
                  <span className="text-gray-300">{member.name}</span>
                  <div className="text-right">
                    <div className="text-white font-medium">
                      {member.conversions}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatPercentage(member.conversionRate)}
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-gray-400 text-center py-4">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};