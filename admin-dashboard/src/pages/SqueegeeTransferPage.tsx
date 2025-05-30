import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CurrencyPoundIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { leadApi } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatusBadge } from '../components/ui/StatusBadge';
import { TransferPreview } from '../components/squeegee/TransferPreview';
import { TransferHistory } from '../components/squeegee/TransferHistory';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useHasPermission } from '../stores/authStore';
import toast from 'react-hot-toast';

interface ReadyLead {
  id: string;
  leadNumber: string;
  customerName: string;
  email: string;
  phone: string;
  fullAddress: string;
  postcode: string;
  propertyType: string;
  serviceType: string;
  serviceFrequency: string;
  estimatedMonthlyValue: number;
  estimatedAnnualValue: number;
  additionalServices: string[];
  preferredStartDate?: string;
  specialInstructions?: string;
  paymentMethod?: string;
  status: {
    name: string;
    displayName: string;
    color: string;
  };
  assignedTo?: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export const SqueegeeTransferPage: React.FC = () => {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [transferMethod, setTransferMethod] = useState<'manual' | 'batch'>('manual');

  const queryClient = useQueryClient();
  const canTransfer = useHasPermission('leads:transfer');

  // Fetch leads ready for Squeegee transfer (confirmed bookings)
  const { data: readyLeads, isLoading, refetch } = useQuery({
    queryKey: ['leads-ready-for-squeegee'],
    queryFn: () => leadApi.getLeads({
      status: 'Accepted',
      limit: 100,
      sortBy: 'submittedAt',
      sortOrder: 'desc'
    }),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch transfer history
  const { data: transferHistory } = useQuery({
    queryKey: ['squeegee-transfer-history'],
    queryFn: () => leadApi.getTransferHistory(),
  });

  // Transfer to Squeegee mutation
  const transferMutation = useMutation({
    mutationFn: (leadIds: string[]) => leadApi.transferToSqueegee(leadIds),
    onSuccess: (result) => {
      queryClient.invalidateQueries(['leads-ready-for-squeegee']);
      queryClient.invalidateQueries(['squeegee-transfer-history']);
      queryClient.invalidateQueries(['leads']);
      
      const { successful, failed, total } = result;
      
      if (failed === 0) {
        toast.success(`Successfully transferred ${successful} lead(s) to Squeegee`);
      } else {
        toast.error(`Transferred ${successful} lead(s), but ${failed} failed. Check transfer history for details.`);
      }
      
      setSelectedLeads([]);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to transfer leads to Squeegee');
    }
  });

  // Transform API leads to ReadyLead format
  const leads: ReadyLead[] = (readyLeads?.data || []).map((lead: any) => {
    const estimatedPrice = parseFloat(lead.estimatedPrice?.toString() || '0');
    const frequency = lead.frequency || 'monthly';
    
    // Calculate annual value using our helper function
    const calculateAnnualValue = (price: number, freq: string): number => {
      const multipliers: { [key: string]: number } = {
        'weekly': 52, '2weekly': 26, 'monthly': 12, '4weekly': 13,
        '6weekly': 8.67, '8weekly': 6.5, '12weekly': 4.33, 'quarterly': 4, 'onetime': 1
      };
      return price * (multipliers[freq] || 1);
    };
    
    const annualValue = calculateAnnualValue(estimatedPrice, frequency);
    
    return {
      id: lead.id.toString(),
      leadNumber: lead.bookingReference,
      customerName: lead.customerName,
      email: lead.email,
      phone: lead.mobile,
      fullAddress: `${lead.addressLine1}${lead.addressLine2 ? ', ' + lead.addressLine2 : ''}, ${lead.townCity}`,
      postcode: lead.postcode,
      propertyType: lead.propertyType || 'House',
      serviceType: 'Window Cleaning',
      serviceFrequency: frequency,
      estimatedMonthlyValue: estimatedPrice,
      estimatedAnnualValue: annualValue,
      additionalServices: Object.keys(lead.servicesRequested || {})
        .filter(key => lead.servicesRequested[key] && key !== 'windowCleaning')
        .map(key => key.replace(/([A-Z])/g, ' $1').trim()),
      preferredStartDate: lead.preferredDate,
      specialInstructions: lead.specialRequirements,
      paymentMethod: lead.preferredContactMethod,
      status: lead.status,
      assignedTo: lead.assignedTo,
      createdAt: lead.submittedAt
    };
  });
  
  const totalValue = leads.reduce((sum, lead) => sum + lead.estimatedMonthlyValue, 0);
  const totalAnnualValue = leads.reduce((sum, lead) => sum + lead.estimatedAnnualValue, 0);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(leads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      setSelectedLeads([...selectedLeads, leadId]);
    } else {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    }
  };

  const handleTransfer = () => {
    if (selectedLeads.length === 0) {
      toast.error('Please select leads to transfer');
      return;
    }

    if (transferMethod === 'manual') {
      setShowPreview(true);
    } else {
      // Direct batch transfer
      transferMutation.mutate(selectedLeads);
    }
  };

  const confirmTransfer = () => {
    transferMutation.mutate(selectedLeads);
    setShowPreview(false);
  };

  const generateTransferSheet = () => {
    if (selectedLeads.length === 0) {
      toast.error('Please select leads to generate transfer sheet');
      return;
    }

    const selectedLeadData = leads.filter(lead => selectedLeads.includes(lead.id));
    
    // Generate CSV content
    const headers = [
      'Lead Number',
      'Customer Name',
      'Email',
      'Phone',
      'Address',
      'Postcode',
      'Property Type',
      'Service Type',
      'Frequency',
      'Monthly Value',
      'Annual Value',
      'Additional Services',
      'Start Date',
      'Special Instructions',
      'Payment Method'
    ];

    const csvContent = [
      headers.join(','),
      ...selectedLeadData.map(lead => [
        lead.leadNumber,
        `"${lead.customerName}"`,
        lead.email,
        lead.phone,
        `"${lead.fullAddress}"`,
        lead.postcode,
        `"${lead.propertyType}"`,
        `"${lead.serviceType}"`,
        `"${lead.serviceFrequency}"`,
        lead.estimatedMonthlyValue,
        lead.estimatedAnnualValue,
        `"${lead.additionalServices.join('; ')}"`,
        lead.preferredStartDate || '',
        `"${lead.specialInstructions || ''}"`,
        lead.paymentMethod || ''
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `squeegee-transfer-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success('Transfer sheet downloaded successfully');
  };

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
          <h1 className="text-2xl font-bold text-white">Squeegee Transfer</h1>
          <p className="mt-1 text-sm text-gray-400">
            Transfer confirmed leads to your main Squeegee booking system
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 font-medium text-sm"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-400 mr-3" />
            <div>
              <div className="text-2xl font-bold text-white">{leads.length}</div>
              <div className="text-sm text-gray-400">Ready for Transfer</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-400 mr-3" />
            <div>
              <div className="text-2xl font-bold text-white">{selectedLeads.length}</div>
              <div className="text-sm text-gray-400">Selected</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center">
            <CurrencyPoundIcon className="h-8 w-8 text-green-400 mr-3" />
            <div>
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(totalValue)}
              </div>
              <div className="text-sm text-gray-400">Monthly Value</div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center">
            <CurrencyPoundIcon className="h-8 w-8 text-green-400 mr-3" />
            <div>
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(totalAnnualValue)}
              </div>
              <div className="text-sm text-gray-400">Annual Value</div>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer method selection */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Transfer Method</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={`relative flex cursor-pointer rounded-lg border p-4 transition-colors ${
            transferMethod === 'manual' 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-600 hover:border-gray-500'
          }`}>
            <input
              type="radio"
              value="manual"
              checked={transferMethod === 'manual'}
              onChange={(e) => setTransferMethod(e.target.value as 'manual')}
              className="sr-only"
            />
            <div>
              <div className="flex items-center">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-400 mr-3" />
                <span className="font-medium text-white">Manual Transfer</span>
              </div>
              <p className="mt-1 text-sm text-gray-400">
                Review and verify each lead before transferring to Squeegee. 
                Recommended for quality control.
              </p>
            </div>
          </label>
          
          <label className={`relative flex cursor-pointer rounded-lg border p-4 transition-colors ${
            transferMethod === 'batch' 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-600 hover:border-gray-500'
          }`}>
            <input
              type="radio"
              value="batch"
              checked={transferMethod === 'batch'}
              onChange={(e) => setTransferMethod(e.target.value as 'batch')}
              className="sr-only"
            />
            <div>
              <div className="flex items-center">
                <ArrowPathIcon className="h-6 w-6 text-green-400 mr-3" />
                <span className="font-medium text-white">Batch Transfer</span>
              </div>
              <p className="mt-1 text-sm text-gray-400">
                Transfer multiple leads at once directly to Squeegee. 
                Faster but with less review.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Action buttons */}
      {leads.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedLeads.length === leads.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-300">
                  Select all ({leads.length} leads)
                </span>
              </label>
              {selectedLeads.length > 0 && (
                <span className="text-sm text-blue-400">
                  {selectedLeads.length} selected
                </span>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={generateTransferSheet}
                disabled={selectedLeads.length === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Download Sheet
              </button>
              
              {canTransfer && (
                <button
                  onClick={handleTransfer}
                  disabled={selectedLeads.length === 0 || transferMutation.isLoading}
                  className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {transferMutation.isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                  )}
                  Transfer to Squeegee
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Information banner */}
      <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
        <div className="flex items-start">
          <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-200">
              Squeegee Integration
            </h3>
            <div className="mt-1 text-sm text-blue-300">
              <p>
                Leads shown here have status "Accepted" - meaning customers have confirmed their booking and accepted the quote. 
                These confirmed bookings are ready to be transferred to your main Squeegee CRM system for scheduling and service delivery.
              </p>
              <ul className="mt-2 list-disc list-inside space-y-1 text-xs">
                <li>Only "Accepted" status leads appear here (confirmed bookings)</li>
                <li>Manual transfer allows you to review each lead before adding to Squeegee</li>
                <li>Batch transfer processes multiple leads simultaneously</li>
                <li>Download sheets can be imported into Squeegee manually if needed</li>
                <li>All transfers are logged for audit purposes</li>
                <li>Once transferred, leads will be marked as "Scheduled" status</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Leads ready for transfer */}
      {leads.length > 0 ? (
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">
              Leads Ready for Transfer
            </h3>
          </div>
          <div className="divide-y divide-gray-700">
            {leads.map((lead) => (
              <div key={lead.id} className="p-6 hover:bg-gray-750 transition-colors">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead.id)}
                    onChange={(e) => handleSelectLead(lead.id, e.target.checked)}
                    className="mt-1 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-white">
                          {lead.customerName}
                        </h4>
                        <span className="text-sm text-gray-400">
                          {lead.leadNumber}
                        </span>
                        <StatusBadge
                          status={lead.status.name}
                          color={lead.status.color}
                          label={lead.status.displayName}
                        />
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-400">
                          {formatCurrency(lead.estimatedMonthlyValue)}/month
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatCurrency(lead.estimatedAnnualValue)} annual
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Contact</div>
                        <div className="text-white">{lead.email}</div>
                        <div className="text-gray-300">{lead.phone}</div>
                      </div>
                      
                      <div>
                        <div className="text-gray-400">Address</div>
                        <div className="text-white">{lead.fullAddress}</div>
                        <div className="text-gray-300">{lead.postcode}</div>
                      </div>
                      
                      <div>
                        <div className="text-gray-400">Service</div>
                        <div className="text-white">{lead.serviceType}</div>
                        <div className="text-gray-300">{lead.serviceFrequency}</div>
                      </div>
                      
                      <div>
                        <div className="text-gray-400">Property</div>
                        <div className="text-white">{lead.propertyType}</div>
                        <div className="text-gray-300">
                          Ready since {formatDate(lead.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    {lead.additionalServices.length > 0 && (
                      <div className="mt-3">
                        <div className="text-gray-400 text-sm">Additional Services</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {lead.additionalServices.map((service, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {lead.specialInstructions && (
                      <div className="mt-3">
                        <div className="text-gray-400 text-sm">Special Instructions</div>
                        <div className="text-gray-300">{lead.specialInstructions}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 text-center py-12">
          <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-400 text-lg">No confirmed bookings ready for transfer</div>
          <div className="text-gray-500 text-sm mt-1">
            Leads will appear here when customers accept quotes and status changes to "Accepted"
          </div>
        </div>
      )}

      {/* Transfer history */}
      <TransferHistory history={transferHistory} />

      {/* Transfer preview modal */}
      {showPreview && selectedLeads.length > 0 && (
        <TransferPreview
          leads={leads.filter(lead => selectedLeads.includes(lead.id))}
          onConfirm={confirmTransfer}
          onClose={() => setShowPreview(false)}
          isLoading={transferMutation.isLoading}
        />
      )}
    </motion.div>
  );
};