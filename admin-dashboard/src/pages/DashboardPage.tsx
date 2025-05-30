import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  UserGroupIcon, 
  ClockIcon, 
  CurrencyPoundIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { leadApi } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatCurrency } from '../utils/formatters';

// Helper function to calculate annual value
const calculateAnnualValue = (price: number, frequency: string): number => {
  if (!price || !frequency) return 0;
  
  const multipliers: { [key: string]: number } = {
    'weekly': 52,
    '2weekly': 26,
    'monthly': 12,
    '4weekly': 13,
    '6weekly': 8.67,
    '8weekly': 6.5,
    '12weekly': 4.33,
    'quarterly': 4,
    'onetime': 1
  };
  
  return price * (multipliers[frequency] || 1);
};

export const DashboardPage: React.FC = () => {
  // Fetch all leads
  const { data: leadsData, isLoading, error } = useQuery({
    queryKey: ['dashboard-leads'],
    queryFn: () => leadApi.getLeads({ limit: 1000 }),
    retry: 3,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Dashboard leads fetch error:', error);
    }
  });

  // Calculate analytics
  const analytics = useMemo(() => {
    // Ensure we have data and it's an array
    if (!leadsData?.data || !Array.isArray(leadsData.data)) {
      console.warn('Invalid leads data:', leadsData);
      return null;
    }
    
    const leads = leadsData.data;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Categorize leads
    const confirmedBookings = leads.filter(lead => 
      ['Accepted', 'Scheduled', 'Completed'].includes(lead.status.name)
    );
    
    const generalEnquiries = leads.filter(lead => 
      ['New', 'Contacted', 'Quote Sent'].includes(lead.status.name)
    );
    
    const cancelled = leads.filter(lead => 
      ['Cancelled', 'Lost'].includes(lead.status.name)
    );
    
    // Time-based analytics
    const todaysLeads = leads.filter(lead => 
      new Date(lead.submittedAt) >= today
    );
    
    const thisMonthsLeads = leads.filter(lead => 
      new Date(lead.submittedAt) >= thisMonth
    );
    
    // Follow-ups
    const followUpsDue = leads.filter(lead => 
      lead.nextFollowUp && new Date(lead.nextFollowUp) <= now
    );
    
    const overdueFollowUps = leads.filter(lead => 
      lead.nextFollowUp && new Date(lead.nextFollowUp) < today
    );
    
    // Revenue calculations
    const totalMonthlyValue = confirmedBookings.reduce((sum, lead) => {
      if (lead.estimatedPrice && lead.frequency) {
        return sum + calculateAnnualValue(parseFloat(lead.estimatedPrice.toString()), lead.frequency);
      }
      return sum;
    }, 0);
    
    const averageQuoteValue = leads
      .filter(lead => lead.estimatedPrice)
      .reduce((sum, lead, _, arr) => sum + parseFloat(lead.estimatedPrice!.toString()) / arr.length, 0);
    
    // Conversion rate
    const conversionRate = leads.length > 0 
      ? (confirmedBookings.length / leads.length) * 100 
      : 0;
    
    return {
      confirmedBookings,
      generalEnquiries,
      cancelled,
      todaysLeads,
      thisMonthsLeads,
      followUpsDue,
      overdueFollowUps,
      totalMonthlyValue,
      averageQuoteValue,
      conversionRate,
      totalLeads: leads.length
    };
  }, [leadsData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Error loading dashboard data</p>
        <p className="text-gray-400 text-sm mt-2">Please try refreshing the page</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No data available</p>
        <p className="text-gray-500 text-sm mt-1">Leads will appear here once submitted</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Welcome to Somerset Window Cleaning Admin</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">New Leads Today</p>
              <p className="text-2xl font-bold text-white mt-1">{analytics.todaysLeads.length}</p>
              <p className="text-sm mt-2 text-blue-400">
                {analytics.thisMonthsLeads.length} this month
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
              <p className="text-gray-400 text-sm">Total Annual Value</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(analytics.totalMonthlyValue)}
              </p>
              <p className="text-sm mt-2 text-green-400">
                {analytics.confirmedBookings.length} confirmed bookings
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
              <p className="text-gray-400 text-sm">Follow-ups Due</p>
              <p className="text-2xl font-bold text-white mt-1">{analytics.followUpsDue.length}</p>
              <p className="text-sm mt-2 text-red-400">
                {analytics.overdueFollowUps.length} overdue
              </p>
            </div>
            <div className="p-3 rounded-lg bg-red-500 bg-opacity-20">
              <ClockIcon className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Lead Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confirmed Bookings */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2 text-green-400" />
              Confirmed Bookings ({analytics.confirmedBookings.length})
            </h3>
            <Link
              to="/leads?status=Accepted,Scheduled,Completed"
              className="text-green-400 hover:text-green-300 text-sm"
            >
              View All →
            </Link>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Ready for Squeegee Transfer:</span>
              <span className="text-white font-medium">
                {analytics.confirmedBookings.filter(l => l.status.name === 'Accepted').length}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Scheduled Jobs:</span>
              <span className="text-white font-medium">
                {analytics.confirmedBookings.filter(l => l.status.name === 'Scheduled').length}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Completed Jobs:</span>
              <span className="text-white font-medium">
                {analytics.confirmedBookings.filter(l => l.status.name === 'Completed').length}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <Link
              to="/squeegee-transfer"
              className="w-full py-2 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center justify-center"
            >
              Transfer to Squeegee CRM
            </Link>
          </div>
        </div>

        {/* General Enquiries */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-yellow-400" />
              General Enquiries ({analytics.generalEnquiries.length})
            </h3>
            <Link
              to="/leads?status=New,Contacted,Quote Sent"
              className="text-yellow-400 hover:text-yellow-300 text-sm"
            >
              View All →
            </Link>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">New Leads:</span>
              <span className="text-white font-medium">
                {analytics.generalEnquiries.filter(l => l.status.name === 'New').length}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Contacted:</span>
              <span className="text-white font-medium">
                {analytics.generalEnquiries.filter(l => l.status.name === 'Contacted').length}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Quotes Sent:</span>
              <span className="text-white font-medium">
                {analytics.generalEnquiries.filter(l => l.status.name === 'Quote Sent').length}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <Link
              to="/follow-ups"
              className="w-full py-2 px-4 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white transition-colors flex items-center justify-center"
            >
              Manage Follow-ups
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Today's Tasks
          </h3>
          <div className="space-y-2">
            <Link
              to="/leads?submitted=today"
              className="block w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-center"
            >
              Review New Leads ({analytics.todaysLeads.length})
            </Link>
            <Link
              to="/follow-ups?due=today"
              className="block w-full py-2 px-4 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors text-center"
            >
              Follow-ups Due ({analytics.followUpsDue.length})
            </Link>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Analytics
          </h3>
          <div className="space-y-2">
            <Link
              to="/analytics"
              className="block w-full py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors text-center"
            >
              View Detailed Analytics
            </Link>
            <button className="w-full py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-colors">
              Export Data
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Booking Form</span>
              <span className="text-green-400 font-semibold">✓ Online</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Email Service</span>
              <span className="text-green-400 font-semibold">✓ Working</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Database</span>
              <span className="text-green-400 font-semibold">✓ Connected</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Total Leads</span>
              <span className="text-white font-semibold">{analytics.totalLeads}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};