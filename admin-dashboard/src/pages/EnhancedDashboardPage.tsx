import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leadApi } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  PhoneIcon,
  HomeIcon,
  CurrencyPoundIcon,
  UserGroupIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface MonthlyStats {
  month: string;
  year: number;
  newLeads: number;
  quotesProvided: number;
  quotesAccepted: number;
  quotesRejected: number;
  conversionRate: number;
  totalValue: number;
}

export const EnhancedDashboardPage: React.FC = () => {
  // Fetch all leads for comprehensive analytics
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['enhanced-dashboard-leads'],
    queryFn: () => leadApi.getLeads({ limit: 1000 }),
    refetchInterval: 60000, // Refresh every minute
  });

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    if (!leadsData?.data || !Array.isArray(leadsData.data)) {
      return null;
    }
    
    const leads = leadsData.data;
    const now = new Date();
    
    // Separate active vs completed leads
    const activeLeads = leads.filter((lead: any) => lead.status?.isActive !== false);
    const completedLeads = leads.filter((lead: any) => lead.status?.isActive === false);
    
    // Urgent actions needed
    const overdueFollowUps = activeLeads.filter((lead: any) => {
      if (!lead.nextFollowUp) return false;
      return new Date(lead.nextFollowUp) < now;
    });
    
    const siteVisitsDue = activeLeads.filter((lead: any) => 
      lead.status?.name === 'Site Visit Scheduled' && 
      lead.siteVisitDate && 
      new Date(lead.siteVisitDate) <= new Date(now.getTime() + 24 * 60 * 60 * 1000) // Next 24 hours
    );
    
    const quotesDue = activeLeads.filter((lead: any) => 
      lead.status?.name === 'Site Visit Completed' ||
      (lead.status?.name === 'Qualifying' && lead.createdAt && 
       new Date(lead.createdAt) < new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)) // 2+ days old
    );
    
    const newToday = leads.filter((lead: any) => {
      const submittedDate = new Date(lead.submittedAt);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return submittedDate >= today;
    });
    
    // Monthly breakdown (last 6 months)
    const monthlyStats: MonthlyStats[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthLeads = leads.filter((lead: any) => {
        const leadDate = new Date(lead.submittedAt);
        return leadDate >= monthDate && leadDate < nextMonth;
      });
      
      const quotesProvided = monthLeads.filter((lead: any) => 
        lead.quoteSentAt || 
        ['Quote Sent', 'Follow-up Required', 'Accepted', 'Rejected', 'Accepted - Squeegee'].includes(lead.status?.name)
      );
      
      const quotesAccepted = monthLeads.filter((lead: any) => 
        ['Accepted', 'Accepted - Squeegee', 'Scheduled', 'Completed'].includes(lead.status?.name)
      );
      
      const quotesRejected = monthLeads.filter((lead: any) => 
        lead.status?.name === 'Rejected'
      );
      
      const totalValue = quotesAccepted.reduce((sum: number, lead: any) => {
        return sum + (parseFloat(lead.estimatedPrice) || 0);
      }, 0);
      
      monthlyStats.push({
        month: monthDate.toLocaleDateString('en-GB', { month: 'short' }),
        year: monthDate.getFullYear(),
        newLeads: monthLeads.length,
        quotesProvided: quotesProvided.length,
        quotesAccepted: quotesAccepted.length,
        quotesRejected: quotesRejected.length,
        conversionRate: quotesProvided.length > 0 ? (quotesAccepted.length / quotesProvided.length) * 100 : 0,
        totalValue
      });
    }
    
    // Status breakdown
    const statusBreakdown = activeLeads.reduce((acc: any, lead: any) => {
      const status = lead.status?.name || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      activeLeads: activeLeads.length,
      completedLeads: completedLeads.length,
      overdueFollowUps: overdueFollowUps.length,
      siteVisitsDue: siteVisitsDue.length,
      quotesDue: quotesDue.length,
      newToday: newToday.length,
      monthlyStats,
      statusBreakdown,
      urgentActions: {
        overdue: overdueFollowUps,
        siteVisits: siteVisitsDue,
        quotes: quotesDue
      }
    };
  }, [leadsData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No data available for enhanced dashboard</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Enhanced Lead Management</h1>
        <p className="text-gray-400">Active leads requiring action vs completed leads</p>
      </div>

      {/* Urgent Actions Alert */}
      {(analytics.overdueFollowUps > 0 || analytics.siteVisitsDue > 0 || analytics.quotesDue > 0) && (
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-red-600 border border-red-500 rounded-lg p-4"
        >
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-white mr-3" />
            <div>
              <h3 className="text-white font-semibold">Urgent Actions Required</h3>
              <div className="text-red-100 text-sm mt-1">
                {analytics.overdueFollowUps > 0 && `${analytics.overdueFollowUps} overdue follow-ups • `}
                {analytics.siteVisitsDue > 0 && `${analytics.siteVisitsDue} site visits due • `}
                {analytics.quotesDue > 0 && `${analytics.quotesDue} quotes needed`}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Leads</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{analytics.activeLeads}</p>
              <p className="text-sm mt-2 text-green-400">Require action</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500 bg-opacity-20">
              <UserGroupIcon className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-green-400 mt-1">{analytics.completedLeads}</p>
              <p className="text-sm mt-2 text-gray-400">Archived</p>
            </div>
            <div className="p-3 rounded-lg bg-green-500 bg-opacity-20">
              <CheckCircleIcon className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">New Today</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{analytics.newToday}</p>
              <p className="text-sm mt-2 text-gray-400">Fresh leads</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500 bg-opacity-20">
              <CalendarDaysIcon className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Overdue Actions</p>
              <p className="text-2xl font-bold text-red-400 mt-1">
                {analytics.overdueFollowUps + analytics.siteVisitsDue + analytics.quotesDue}
              </p>
              <p className="text-sm mt-2 text-red-300">Need attention</p>
            </div>
            <div className="p-3 rounded-lg bg-red-500 bg-opacity-20">
              <ClockIcon className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Performance */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2" />
          Month-by-Month Performance
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-300 py-2">Month</th>
                <th className="text-right text-gray-300 py-2">New Leads</th>
                <th className="text-right text-gray-300 py-2">Quotes</th>
                <th className="text-right text-gray-300 py-2">Accepted</th>
                <th className="text-right text-gray-300 py-2">Rejected</th>
                <th className="text-right text-gray-300 py-2">Rate</th>
                <th className="text-right text-gray-300 py-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {analytics.monthlyStats.map((month, index) => (
                <tr key={index} className="border-b border-gray-700/50">
                  <td className="py-3 text-white">{month.month} {month.year}</td>
                  <td className="py-3 text-right text-blue-400">{month.newLeads}</td>
                  <td className="py-3 text-right text-purple-400">{month.quotesProvided}</td>
                  <td className="py-3 text-right text-green-400">{month.quotesAccepted}</td>
                  <td className="py-3 text-right text-red-400">{month.quotesRejected}</td>
                  <td className="py-3 text-right text-yellow-400">{month.conversionRate.toFixed(0)}%</td>
                  <td className="py-3 text-right text-green-400">{formatCurrency(month.totalValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Active Lead Status</h2>
          <div className="space-y-3">
            {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-gray-300">{status}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-20 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${Math.max(((count as number) / analytics.activeLeads) * 100, 5)}%` 
                      }}
                    />
                  </div>
                  <span className="text-white font-medium w-8 text-right">{count as number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link 
              to="/leads?filter=overdue"
              className="flex items-center justify-between p-3 bg-red-600/20 rounded-lg hover:bg-red-600/30 transition-colors"
            >
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3" />
                <span className="text-white">Overdue Follow-ups</span>
              </div>
              <span className="text-red-400 font-bold">{analytics.overdueFollowUps}</span>
            </Link>
            
            <Link 
              to="/leads?filter=site-visits"
              className="flex items-center justify-between p-3 bg-purple-600/20 rounded-lg hover:bg-purple-600/30 transition-colors"
            >
              <div className="flex items-center">
                <HomeIcon className="h-5 w-5 text-purple-400 mr-3" />
                <span className="text-white">Site Visits Due</span>
              </div>
              <span className="text-purple-400 font-bold">{analytics.siteVisitsDue}</span>
            </Link>
            
            <Link 
              to="/leads?filter=quotes-due"
              className="flex items-center justify-between p-3 bg-yellow-600/20 rounded-lg hover:bg-yellow-600/30 transition-colors"
            >
              <div className="flex items-center">
                <CurrencyPoundIcon className="h-5 w-5 text-yellow-400 mr-3" />
                <span className="text-white">Quotes Due</span>
              </div>
              <span className="text-yellow-400 font-bold">{analytics.quotesDue}</span>
            </Link>
            
            <Link 
              to="/leads?filter=new"
              className="flex items-center justify-between p-3 bg-blue-600/20 rounded-lg hover:bg-blue-600/30 transition-colors"
            >
              <div className="flex items-center">
                <UserGroupIcon className="h-5 w-5 text-blue-400 mr-3" />
                <span className="text-white">New Leads Today</span>
              </div>
              <span className="text-blue-400 font-bold">{analytics.newToday}</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};