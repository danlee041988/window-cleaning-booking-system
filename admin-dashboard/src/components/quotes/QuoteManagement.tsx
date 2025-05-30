import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DocumentTextIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  ArrowPathIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { leadApi } from '../../services/api';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

interface Quote {
  id: string;
  version: number;
  type: 'instant' | 'phone' | 'formal' | 'site_visit';
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  totalAmount: number;
  validUntil: string;
  sentAt?: string;
  viewedAt?: string;
  responseAt?: string;
  services: Array<{
    name: string;
    frequency: string;
    price: number;
  }>;
  notes?: string;
  createdAt: string;
}

interface QuoteManagementProps {
  lead: any;
  className?: string;
}

export const QuoteManagement: React.FC<QuoteManagementProps> = ({ lead, className = '' }) => {
  const [showNewQuoteForm, setShowNewQuoteForm] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const queryClient = useQueryClient();

  // Mock quote data - in real implementation, this would come from API
  const quotes: Quote[] = [
    {
      id: '1',
      version: 1,
      type: 'instant',
      status: lead.status?.name === 'Quote Sent' ? 'sent' : 'draft',
      totalAmount: parseFloat(lead.estimatedPrice?.toString() || '0'),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      sentAt: lead.status?.name === 'Quote Sent' ? lead.updatedAt : undefined,
      services: [
        {
          name: 'Window Cleaning',
          frequency: lead.frequency || 'Monthly',
          price: parseFloat(lead.estimatedPrice?.toString() || '0')
        }
      ],
      notes: lead.specialRequirements,
      createdAt: lead.createdAt
    }
  ];

  const currentQuote = quotes[quotes.length - 1]; // Latest quote

  const sendQuoteMutation = useMutation({
    mutationFn: (quoteId: string) => {
      return leadApi.updateLead(lead.id, {
        statusId: 'Quote Sent', // Will need to map to actual status ID
        quoteSentAt: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', lead.id] });
      toast.success('Quote sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send quote');
    }
  });

  const updateQuoteStatusMutation = useMutation({
    mutationFn: ({ status, notes }: { status: string; notes?: string }) => {
      let newLeadStatus = '';
      if (status === 'accepted') {
        newLeadStatus = 'Accepted - Squeegee';
      } else if (status === 'rejected') {
        newLeadStatus = 'Rejected';
      }
      
      return leadApi.updateLead(lead.id, {
        statusId: newLeadStatus,
        followUpNotes: notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', lead.id] });
      toast.success('Quote status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update quote status');
    }
  });

  const getQuoteStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'draft': return 'text-gray-400 bg-gray-900/50';
      case 'sent': return 'text-blue-400 bg-blue-900/50';
      case 'viewed': return 'text-purple-400 bg-purple-900/50';
      case 'accepted': return 'text-green-400 bg-green-900/50';
      case 'rejected': return 'text-red-400 bg-red-900/50';
      case 'expired': return 'text-orange-400 bg-orange-900/50';
      default: return 'text-gray-400 bg-gray-900/50';
    }
  };

  const getQuoteTypeLabel = (type: Quote['type']) => {
    switch (type) {
      case 'instant': return 'Instant Quote';
      case 'phone': return 'Phone Quote';
      case 'formal': return 'Formal Quote';
      case 'site_visit': return 'Site Visit Quote';
      default: return 'Quote';
    }
  };

  const getQuoteIcon = (type: Quote['type']) => {
    switch (type) {
      case 'instant': return <ClockIcon className="h-4 w-4" />;
      case 'phone': return <DocumentTextIcon className="h-4 w-4" />;
      case 'formal': return <DocumentTextIcon className="h-4 w-4" />;
      case 'site_visit': return <CalendarDaysIcon className="h-4 w-4" />;
      default: return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          Quote Management
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNewQuoteForm(true)}
            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            New Quote
          </button>
        </div>
      </div>

      {/* Current Quote Summary */}
      {currentQuote && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${getQuoteStatusColor(currentQuote.status)}`}>
                {getQuoteIcon(currentQuote.type)}
              </div>
              <div>
                <h3 className="text-white font-medium">
                  {getQuoteTypeLabel(currentQuote.type)} v{currentQuote.version}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getQuoteStatusColor(currentQuote.status)}`}>
                    {currentQuote.status.charAt(0).toUpperCase() + currentQuote.status.slice(1)}
                  </span>
                  <span>•</span>
                  <span>Valid until {formatDate(currentQuote.validUntil)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(currentQuote.totalAmount)}
              </div>
              <div className="text-sm text-gray-400">
                {currentQuote.sentAt ? `Sent ${formatRelativeTime(currentQuote.sentAt)}` : 'Not sent'}
              </div>
            </div>
          </div>

          {/* Quote Actions */}
          <div className="flex items-center space-x-2 mb-4">
            {currentQuote.status === 'draft' && (
              <button
                onClick={() => sendQuoteMutation.mutate(currentQuote.id)}
                disabled={sendQuoteMutation.isPending}
                className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <PaperAirplaneIcon className="h-4 w-4 mr-1" />
                Send Quote
              </button>
            )}
            {currentQuote.status === 'sent' && (
              <>
                <button
                  onClick={() => updateQuoteStatusMutation.mutate({ status: 'accepted' })}
                  disabled={updateQuoteStatusMutation.isPending}
                  className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Mark Accepted
                </button>
                <button
                  onClick={() => updateQuoteStatusMutation.mutate({ status: 'rejected' })}
                  disabled={updateQuoteStatusMutation.isPending}
                  className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  Mark Rejected
                </button>
              </>
            )}
            <button
              onClick={() => setSelectedQuote(currentQuote)}
              className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              View Details
            </button>
            <button
              className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </button>
          </div>

          {/* Services Breakdown */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Services Included</h4>
            <div className="space-y-2">
              {currentQuote.services.map((service, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                  <div>
                    <div className="text-white">{service.name}</div>
                    <div className="text-sm text-gray-400">{service.frequency}</div>
                  </div>
                  <div className="text-green-400 font-medium">
                    {formatCurrency(service.price)}
                  </div>
                </div>
              ))}
            </div>
            {currentQuote.notes && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="text-sm text-gray-400">Notes</div>
                <div className="text-gray-300 mt-1">{currentQuote.notes}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quote History */}
      {quotes.length > 1 && (
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">Quote History</h3>
          <div className="space-y-2">
            {quotes.slice(0, -1).reverse().map((quote) => (
              <div key={quote.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-1.5 rounded ${getQuoteStatusColor(quote.status)}`}>
                    {getQuoteIcon(quote.type)}
                  </div>
                  <div>
                    <div className="text-white text-sm">
                      {getQuoteTypeLabel(quote.type)} v{quote.version}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatRelativeTime(quote.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-green-400 font-medium">
                    {formatCurrency(quote.totalAmount)}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getQuoteStatusColor(quote.status)}`}>
                    {quote.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Status */}
      {currentQuote?.status === 'accepted' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-green-900/20 border border-green-700 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <span className="text-green-400 font-medium">Quote Accepted</span>
          </div>
          <div className="text-sm text-gray-300 mt-1">
            This lead is ready to be transferred to Squeegee for job scheduling.
          </div>
          <button className="mt-2 inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Transfer to Squeegee
          </button>
        </motion.div>
      )}
    </div>
  );
};