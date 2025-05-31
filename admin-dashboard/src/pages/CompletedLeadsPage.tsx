import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leadApi } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatCurrency, formatDate, formatRelativeTime } from '../utils/formatters';
import {
  CheckCircleIcon,
  XMarkIcon,
  EyeSlashIcon,
  ArchiveBoxIcon,
  FunnelIcon,
  CalendarDaysIcon,
  CurrencyPoundIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

type CompletedFilter = 'all' | 'accepted' | 'rejected' | 'no-response' | 'not-viable';
type TimeFilter = 'month' | 'quarter' | 'year' | 'all-time';

export const CompletedLeadsPage: React.FC = () => {
  const [completedFilter, setCompletedFilter] = useState<CompletedFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');

  // Fetch all leads
  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['completed-leads'],
    queryFn: () => leadApi.getLeads({ limit: 1000 }),
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Filter and process completed leads
  const processedData = useMemo(() => {
    if (!leadsData?.data || !Array.isArray(leadsData.data)) {
      return { leads: [], stats: null };
    }
    
    const allLeads = leadsData.data;
    const now = new Date();
    
    // Get date range based on filter
    let startDate: Date;
    switch (timeFilter) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0); // All time
    }
    
    // Filter completed leads
    const completedLeads = allLeads.filter((lead: any) => {
      // Check if lead is completed (based on status)
      const isCompleted = lead.status?.category === 'completed' || 
                         ['Accepted - Squeegee', 'Rejected', 'No Response', 'Not Viable', 'Converted Other', 'Scheduled', 'Completed', 'Cancelled', 'Lost'].includes(lead.status?.name);
      
      if (!isCompleted) return false;
      
      // Check time filter
      const leadDate = new Date(lead.submittedAt);
      if (leadDate < startDate) return false;
      
      // Check completion type filter
      if (completedFilter !== 'all') {
        switch (completedFilter) {
          case 'accepted':
            return ['Accepted - Squeegee', 'Scheduled', 'Completed', 'Converted Other'].includes(lead.status?.name);
          case 'rejected':
            return lead.status?.name === 'Rejected';
          case 'no-response':
            return ['No Response', 'Lost'].includes(lead.status?.name);
          case 'not-viable':
            return ['Not Viable', 'Cancelled'].includes(lead.status?.name);
          default:
            return true;
        }
      }
      
      return true;
    });
    
    // Calculate statistics
    const acceptedLeads = completedLeads.filter((lead: any) => 
      ['Accepted - Squeegee', 'Scheduled', 'Completed', 'Converted Other'].includes(lead.status?.name)
    );
    
    const rejectedLeads = completedLeads.filter((lead: any) => 
      lead.status?.name === 'Rejected'
    );
    
    const noResponseLeads = completedLeads.filter((lead: any) => 
      ['No Response', 'Lost'].includes(lead.status?.name)
    );
    
    const notViableLeads = completedLeads.filter((lead: any) => 
      ['Not Viable', 'Cancelled'].includes(lead.status?.name)
    );
    
    const totalValue = acceptedLeads.reduce((sum: number, lead: any) => {
      return sum + (parseFloat(lead.estimatedPrice) || 0);
    }, 0);
    
    const lostValue = [...rejectedLeads, ...noResponseLeads].reduce((sum: number, lead: any) => {
      return sum + (parseFloat(lead.estimatedPrice) || 0);
    }, 0);
    
    const winRate = completedLeads.length > 0 ? (acceptedLeads.length / completedLeads.length) * 100 : 0;
    
    return {
      leads: completedLeads,
      stats: {
        total: completedLeads.length,
        accepted: acceptedLeads.length,
        rejected: rejectedLeads.length,
        noResponse: noResponseLeads.length,
        notViable: notViableLeads.length,
        totalValue,
        lostValue,
        winRate
      }
    };
  }, [leadsData, completedFilter, timeFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const { leads, stats } = processedData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Completed Leads Archive</h1>
          <p className="text-gray-400">Accepted quotes, rejections, and archived leads</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all-time">All Time</option>
          </select>
        </div>
      </div>

      {/* Summary Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Completed</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <ArchiveBoxIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Accepted</p>
                <p className="text-2xl font-bold text-green-400 mt-1">{stats.accepted}</p>
                <p className="text-xs text-green-300 mt-1">{formatCurrency(stats.totalValue)}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{stats.rejected}</p>
              </div>
              <XMarkIcon className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">No Response</p>
                <p className="text-2xl font-bold text-gray-400 mt-1">{stats.noResponse}</p>
              </div>
              <EyeSlashIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Win Rate</p>
                <p className="text-2xl font-bold text-blue-400 mt-1">{stats.winRate.toFixed(0)}%</p>
                <p className="text-xs text-red-300 mt-1">Lost: {formatCurrency(stats.lostValue)}</p>
              </div>
              <CurrencyPoundIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <div className="flex space-x-2">
            {([
              { key: 'all', label: 'All Completed' },
              { key: 'accepted', label: 'Accepted' },
              { key: 'rejected', label: 'Rejected' },
              { key: 'no-response', label: 'No Response' },
              { key: 'not-viable', label: 'Not Viable' }
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setCompletedFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  completedFilter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Completed Leads Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-750">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Quote Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Outcome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Lead Source
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {leads.map((lead: any) => (
                <tr key={lead.id} className="hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {lead.customerName}
                      </div>
                      <div className="text-sm text-gray-400">
                        {lead.townCity} • {lead.postcode}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-400">
                      {lead.estimatedPrice ? formatCurrency(parseFloat(lead.estimatedPrice)) : 'Quote Required'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {lead.frequency || 'One-time'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge
                      status={lead.status?.name}
                      color={lead.status?.color}
                      label={lead.status?.displayName || lead.status?.name}
                    />
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {formatRelativeTime(lead.updatedAt)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(lead.updatedAt)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300 capitalize">
                      {lead.leadType?.replace('_', ' ') || lead.source}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/leads/${lead.id}`}
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                      title="View details"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {leads.length === 0 && (
          <div className="text-center py-12">
            <ArchiveBoxIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-400 text-lg">No completed leads found</div>
            <div className="text-gray-500 text-sm mt-1">
              Try adjusting your filters or time range
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};