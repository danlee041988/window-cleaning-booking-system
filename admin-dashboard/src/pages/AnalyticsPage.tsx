import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leadApi } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ConversionFunnel } from '../components/analytics/ConversionFunnel';
import { LeadSourceChart } from '../components/analytics/LeadSourceChart';
import { PerformanceMetrics } from '../components/analytics/PerformanceMetrics';
import { formatCurrency } from '../utils/formatters';
import {
  CurrencyPoundIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// Helper function to calculate annual value
const calculateAnnualValue = (price: number, frequency: string): number => {
  if (!price || !frequency) return 0;
  
  const multipliers: { [key: string]: number } = {
    'weekly': 52, '2weekly': 26, 'monthly': 12, '4weekly': 13,
    '6weekly': 8.67, '8weekly': 6.5, '12weekly': 4.33, 'quarterly': 4, 'onetime': 1
  };
  
  return price * (multipliers[frequency] || 1);
};

export const AnalyticsPage: React.FC = () => {
  // Fetch all leads for comprehensive analytics
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['analytics-leads'],
    queryFn: () => leadApi.getLeads({ limit: 1000 }),
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    if (!leadsData?.data) return null;
    
    const leads = leadsData.data;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Status categorization
    const newLeads = leads.filter((lead: any) => lead.status.name === 'New');
    const contacted = leads.filter((lead: any) => lead.status.name === 'Contacted');
    const quotesSent = leads.filter((lead: any) => lead.status.name === 'Quote Sent');
    const quotesAccepted = leads.filter((lead: any) => lead.status.name === 'Accepted');
    const scheduled = leads.filter((lead: any) => lead.status.name === 'Scheduled');
    const completed = leads.filter((lead: any) => lead.status.name === 'Completed');
    const cancelled = leads.filter((lead: any) => lead.status.name === 'Cancelled');
    const lost = leads.filter((lead: any) => lead.status.name === 'Lost');
    
    // Time-based metrics
    const todaysLeads = leads.filter((lead: any) => 
      new Date(lead.submittedAt) >= today
    );
    const thisWeeksLeads = leads.filter((lead: any) => 
      new Date(lead.submittedAt) >= thisWeek
    );
    const thisMonthsLeads = leads.filter((lead: any) => 
      new Date(lead.submittedAt) >= thisMonth
    );
    
    // Conversion metrics
    const totalBookings = quotesAccepted.length + scheduled.length + completed.length;
    const conversionRate = leads.length > 0 ? (totalBookings / leads.length) * 100 : 0;
    
    // Revenue calculations
    const totalAnnualValue = [...quotesAccepted, ...scheduled, ...completed]
      .reduce((sum, lead) => {
        if (lead.estimatedPrice && lead.frequency) {
          return sum + calculateAnnualValue(parseFloat(lead.estimatedPrice.toString()), lead.frequency);
        }
        return sum;
      }, 0);
    
    const averageQuoteValue = leads
      .filter((lead: any) => lead.estimatedPrice)
      .reduce((sum, lead, _, arr) => sum + parseFloat(lead.estimatedPrice!.toString()) / arr.length, 0);
    
    // Property type breakdown
    const propertyTypes = leads.reduce((acc: any, lead: any) => {
      const type = lead.propertyType || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    // Frequency breakdown
    const frequencies = [...quotesAccepted, ...scheduled, ...completed].reduce((acc: any, lead: any) => {
      const freq = lead.frequency || 'Unknown';
      acc[freq] = (acc[freq] || 0) + 1;
      return acc;
    }, {});
    
    return {
      // Overview metrics
      totalLeads: leads.length,
      todaysLeads: todaysLeads.length,
      thisWeeksLeads: thisWeeksLeads.length,
      thisMonthsLeads: thisMonthsLeads.length,
      
      // Status breakdown
      newLeads: newLeads.length,
      contacted: contacted.length,
      quotesSent: quotesSent.length,
      quotesAccepted: quotesAccepted.length,
      scheduled: scheduled.length,
      completed: completed.length,
      cancelled: cancelled.length,
      lost: lost.length,
      
      // Performance metrics
      totalBookings,
      conversionRate,
      totalAnnualValue,
      averageQuoteValue,
      
      // Breakdowns
      propertyTypes,
      frequencies,
      
      // Conversion funnel
      funnelData: [
        { stage: 'Leads', count: leads.length, percentage: 100 },
        { stage: 'Contacted', count: contacted.length + quotesSent.length + quotesAccepted.length + scheduled.length + completed.length, percentage: leads.length > 0 ? ((contacted.length + quotesSent.length + quotesAccepted.length + scheduled.length + completed.length) / leads.length) * 100 : 0 },
        { stage: 'Quotes Sent', count: quotesSent.length + quotesAccepted.length + scheduled.length + completed.length, percentage: leads.length > 0 ? ((quotesSent.length + quotesAccepted.length + scheduled.length + completed.length) / leads.length) * 100 : 0 },
        { stage: 'Bookings', count: totalBookings, percentage: leads.length > 0 ? (totalBookings / leads.length) * 100 : 0 }
      ]
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
        <p className="text-gray-400">No data available for analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400">Business performance metrics and insights</p>
        </div>
        <div className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Annual Value</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(analytics.totalAnnualValue)}
              </p>
              <p className="text-sm mt-2 text-green-400">
                {analytics.totalBookings} confirmed bookings
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500 bg-opacity-20">
              <CurrencyPoundIcon className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Leads</p>
              <p className="text-2xl font-bold text-white mt-1">{analytics.totalLeads}</p>
              <p className="text-sm mt-2 text-blue-400">
                {analytics.thisMonthsLeads} this month
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500 bg-opacity-20">
              <UserGroupIcon className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Conversion Rate</p>
              <p className="text-2xl font-bold text-white mt-1">
                {analytics.conversionRate.toFixed(1)}%
              </p>
              <p className="text-sm mt-2 text-yellow-400">
                Avg quote: {formatCurrency(analytics.averageQuoteValue)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500 bg-opacity-20">
              <ArrowTrendingUpIcon className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Quotes Accepted</p>
              <p className="text-2xl font-bold text-white mt-1">{analytics.quotesAccepted}</p>
              <p className="text-sm mt-2 text-green-400">
                {analytics.completed} completed jobs
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500 bg-opacity-20">
              <CheckCircleIcon className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Lead Status Pipeline */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2" />
          Lead Status Pipeline
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{analytics.newLeads}</div>
            <div className="text-sm text-gray-400">New Leads</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{analytics.contacted}</div>
            <div className="text-sm text-gray-400">Contacted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{analytics.quotesSent}</div>
            <div className="text-sm text-gray-400">Quotes Sent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{analytics.quotesAccepted}</div>
            <div className="text-sm text-gray-400">Accepted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{analytics.scheduled}</div>
            <div className="text-sm text-gray-400">Scheduled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">{analytics.completed}</div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{analytics.cancelled}</div>
            <div className="text-sm text-gray-400">Cancelled</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">{analytics.lost}</div>
            <div className="text-sm text-gray-400">Lost</div>
          </div>
        </div>
      </div>

      {/* Conversion Funnel and Property Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Conversion Funnel</h2>
          <div className="space-y-3">
            {analytics.funnelData.map((stage, index) => (
              <div key={stage.stage} className="flex items-center">
                <div className="w-20 text-sm text-gray-400">{stage.stage}</div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-700 rounded-full h-6 relative">
                    <div 
                      className={`h-6 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-orange-500' :
                        index === 2 ? 'bg-purple-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${stage.percentage}%` }}
                    >
                      {stage.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="w-12 text-sm text-white font-medium text-right">
                  {stage.count}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Property Types</h2>
          <div className="space-y-3">
            {Object.entries(analytics.propertyTypes).map(([type, count], index) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-gray-300 capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ 
                        width: `${((count as number) / analytics.totalLeads) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-white font-medium w-8 text-right">{count as number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Frequencies */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4">Service Frequencies (Confirmed Bookings)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(analytics.frequencies).map(([frequency, count]) => (
            <div key={frequency} className="text-center">
              <div className="text-2xl font-bold text-green-400">{count as number}</div>
              <div className="text-sm text-gray-400 capitalize">
                {frequency.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time-based Analysis */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <CalendarDaysIcon className="h-5 w-5 mr-2" />
          Lead Activity Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{analytics.todaysLeads}</div>
            <div className="text-sm text-gray-400">Today's Leads</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">{analytics.thisWeeksLeads}</div>
            <div className="text-sm text-gray-400">This Week's Leads</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{analytics.thisMonthsLeads}</div>
            <div className="text-sm text-gray-400">This Month's Leads</div>
          </div>
        </div>
      </div>
    </div>
  );
};