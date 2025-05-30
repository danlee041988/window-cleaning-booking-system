import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  ViewColumnsIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { leadApi, systemApi } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { LeadFilters } from '../components/leads/LeadFilters';
import { LeadKanban } from '../components/leads/LeadKanban';
import { LeadTable } from '../components/leads/LeadTable';
import { CreateLeadModal } from '../components/leads/CreateLeadModal';
import { BulkActionsBar } from '../components/leads/BulkActionsBar';
import { useHasPermission } from '../stores/authStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

type ViewMode = 'table' | 'kanban';

interface Lead {
  id: number;
  bookingReference: string;
  customerName: string;
  email: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  townCity: string;
  county?: string;
  postcode: string;
  postcodeArea?: string;
  propertyType?: string;
  propertySize?: string;
  accessDifficulty?: string;
  frequency?: string;
  servicesRequested?: any;
  estimatedPrice?: number;
  priceBreakdown?: any;
  quoteRequests?: any;
  specialRequirements?: string;
  preferredContactMethod?: string;
  preferredContactTime?: string;
  marketingConsent: boolean;
  status: {
    id: number;
    name: string;
    displayName: string;
    color: string;
    isDefault?: boolean;
  };
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  assignedTo?: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
  submittedAt: string;
  firstContactedAt?: string;
  lastContactedAt?: string;
  convertedAt?: string;
  followUpNotes?: string;
  submissionIp?: string;
  userAgent?: string;
  activities?: any[];
}

export const LeadsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    assignedTo: '',
    postcodeArea: '',
    priority: '',
    source: '',
    dateRange: { start: '', end: '' }
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  const queryClient = useQueryClient();
  const canWrite = useHasPermission('leads:write');
  const canDelete = useHasPermission('leads:delete');
  const canTransfer = useHasPermission('leads:transfer');

  // Fetch leads
  const { data: leadsData, isLoading, refetch } = useQuery({
    queryKey: ['leads', filters, pagination],
    queryFn: () => leadApi.getLeads({
      ...filters,
      ...pagination,
      searchTerm: filters.search
    }),
    keepPreviousData: true
  });

  // Fetch lead statuses for filters
  const { data: statuses } = useQuery({
    queryKey: ['lead-statuses'],
    queryFn: systemApi.getLeadStatuses
  });

  // Fetch users for assignment
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: systemApi.getUsers
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ leadIds, updates }: { leadIds: number[]; updates: any }) => {
      const promises = leadIds.map(id => leadApi.updateLead(id.toString(), updates));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      setSelectedLeads([]);
      toast.success('Leads updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update leads');
    }
  });

  // Delete leads mutation
  const deleteMutation = useMutation({
    mutationFn: async (leadIds: number[]) => {
      const promises = leadIds.map(id => leadApi.deleteLead(id.toString()));
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      setSelectedLeads([]);
      toast.success('Leads deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete leads');
    }
  });

  // Export leads mutation
  const exportMutation = useMutation({
    mutationFn: () => leadApi.exportLeads({ ...filters, ...pagination }),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Export downloaded successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to export leads');
    }
  });

  const leads = leadsData?.data || [];
  const totalCount = leadsData?.pagination?.total || 0;
  const totalPages = Math.ceil(totalCount / pagination.limit);

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // Handle sorting
  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setPagination(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle bulk actions
  const handleBulkAction = (action: string, data?: any) => {
    if (selectedLeads.length === 0) {
      toast.error('Please select leads first');
      return;
    }

    switch (action) {
      case 'updateStatus':
        bulkUpdateMutation.mutate({
          leadIds: selectedLeads,
          updates: { statusId: data.statusId }
        });
        break;
      case 'assign':
        bulkUpdateMutation.mutate({
          leadIds: selectedLeads,
          updates: { assignedTo: data.userId }
        });
        break;
      case 'updatePriority':
        bulkUpdateMutation.mutate({
          leadIds: selectedLeads,
          updates: { priority: data.priority }
        });
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedLeads.length} lead(s)?`)) {
          deleteMutation.mutate(selectedLeads);
        }
        break;
      case 'transfer':
        // Handle transfer to Squeegee
        console.log('Transfer to Squeegee:', selectedLeads);
        break;
    }
  };

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!leads.length) return null;

    const totalValue = leads.reduce((sum, lead) => sum + (lead.estimatedPrice || 0), 0);
    const overdueCount = leads.filter(lead => 
      lead.activities?.some(activity => activity.nextFollowUp && new Date(activity.nextFollowUp) < new Date())
    ).length;
    const highPriorityCount = leads.filter(lead => 
      lead.priority === 'high' || lead.priority === 'urgent'
    ).length;

    return { totalValue, overdueCount, highPriorityCount };
  }, [leads]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage and track your customer leads through the sales process
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            {exportMutation.isLoading ? 'Exporting...' : 'Export'}
          </button>
          {canWrite && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Lead
            </button>
          )}
        </div>
      </div>

      {/* Summary stats */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-white">{totalCount}</div>
            <div className="text-sm text-gray-400">Total Leads</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(summaryStats.totalValue)}
            </div>
            <div className="text-sm text-gray-400">Pipeline Value</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-orange-400">
              {summaryStats.overdueCount}
            </div>
            <div className="text-sm text-gray-400">Overdue Follow-ups</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-2xl font-bold text-red-400">
              {summaryStats.highPriorityCount}
            </div>
            <div className="text-sm text-gray-400">High Priority</div>
          </div>
        </div>
      )}

      {/* Filters and controls */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={filters.search}
              onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
              className="pl-10 pr-4 py-2 w-full bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Kanban
              </button>
            </div>
            <button
              onClick={() => refetch()}
              className="p-2 text-gray-400 hover:text-white"
              title="Refresh"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Advanced filters */}
        <LeadFilters
          filters={filters}
          onChange={handleFilterChange}
          statuses={statuses}
          users={users}
        />
      </div>

      {/* Bulk actions */}
      {selectedLeads.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedLeads.length}
          onAction={handleBulkAction}
          canWrite={canWrite}
          canDelete={canDelete}
          canTransfer={canTransfer}
          statuses={statuses}
          users={users}
        />
      )}

      {/* Main content */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        {viewMode === 'table' ? (
          <LeadTable
            leads={leads}
            selectedLeads={selectedLeads}
            onSelectionChange={setSelectedLeads}
            sortBy={pagination.sortBy}
            sortOrder={pagination.sortOrder}
            onSort={handleSort}
            canWrite={canWrite}
            canDelete={canDelete}
          />
        ) : (
          <LeadKanban
            leads={leads}
            statuses={statuses}
            onLeadUpdate={(leadId, updates) => {
              bulkUpdateMutation.mutate({
                leadIds: [leadId],
                updates
              });
            }}
            canWrite={canWrite}
          />
        )}

        {/* Pagination */}
        {viewMode === 'table' && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, totalCount)} of{' '}
                {totalCount} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-600"
                >
                  Previous
                </button>
                <span className="text-gray-400">
                  Page {pagination.page} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === totalPages}
                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-600"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create lead modal */}
      {showCreateModal && (
        <CreateLeadModal
          onClose={() => setShowCreateModal(false)}
          statuses={statuses}
          users={users}
        />
      )}
    </motion.div>
  );
};