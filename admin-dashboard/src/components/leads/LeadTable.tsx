import React from 'react';
import { Link } from 'react-router-dom';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StatusBadge } from '../ui/StatusBadge';
import { PriorityBadge } from '../ui/PriorityBadge';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/formatters';
import { formatServicesRequested, formatFrequency, formatPropertyType, getBookingType } from '../../utils/serviceFormatters';

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
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
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

interface LeadTableProps {
  leads: Lead[];
  selectedLeads: number[];
  onSelectionChange: (selected: number[]) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string, order: 'asc' | 'desc') => void;
  canWrite: boolean;
  canDelete: boolean;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  selectedLeads,
  onSelectionChange,
  sortBy,
  sortOrder,
  onSort,
  canWrite,
  canDelete
}) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(leads.map(lead => lead.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedLeads, leadId]);
    } else {
      onSelectionChange(selectedLeads.filter(id => id !== leadId));
    }
  };

  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(field, newOrder);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? 
      <ChevronUpIcon className="h-4 w-4" /> : 
      <ChevronDownIcon className="h-4 w-4" />;
  };

  const isOverdue = (date?: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const allSelected = leads.length > 0 && selectedLeads.length === leads.length;
  const partiallySelected = selectedLeads.length > 0 && selectedLeads.length < leads.length;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-750">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={allSelected}
                ref={input => {
                  if (input) input.indeterminate = partiallySelected;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
              onClick={() => handleSort('bookingReference')}
            >
              <div className="flex items-center space-x-1">
                <span>Booking Ref</span>
                {getSortIcon('bookingReference')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
              onClick={() => handleSort('customerName')}
            >
              <div className="flex items-center space-x-1">
                <span>Customer</span>
                {getSortIcon('customerName')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Type & Frequency
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
              onClick={() => handleSort('estimatedPrice')}
            >
              <div className="flex items-center space-x-1">
                <span>Price</span>
                {getSortIcon('estimatedPrice')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center space-x-1">
                <span>Status</span>
                {getSortIcon('status')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Assigned To
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
              onClick={() => handleSort('nextFollowUp')}
            >
              <div className="flex items-center space-x-1">
                <span>Next Follow-up</span>
                {getSortIcon('nextFollowUp')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
              onClick={() => handleSort('submittedAt')}
            >
              <div className="flex items-center space-x-1">
                <span>Submitted</span>
                {getSortIcon('submittedAt')}
              </div>
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {leads.map((lead) => (
            <tr 
              key={lead.id} 
              className={`hover:bg-gray-750 transition-colors ${
                selectedLeads.includes(lead.id) ? 'bg-blue-900/20' : ''
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedLeads.includes(lead.id)}
                  onChange={(e) => handleSelectLead(lead.id, e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                />
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <Link 
                  to={`/leads/${lead.id}`}
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  {lead.bookingReference}
                </Link>
              </td>
              
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
                <div className="flex space-x-2">
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-gray-400 hover:text-blue-400"
                    title={lead.email}
                  >
                    <EnvelopeIcon className="h-4 w-4" />
                  </a>
                  <a
                    href={`tel:${lead.mobile}`}
                    className="text-gray-400 hover:text-green-400"
                    title={lead.mobile}
                  >
                    <PhoneIcon className="h-4 w-4" />
                  </a>
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm text-white">
                    {getBookingType(lead)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatFrequency(lead.frequency)}
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-green-400">
                  {lead.estimatedPrice ? formatCurrency(lead.estimatedPrice) : 'Quote Required'}
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge
                  status={lead.status.name}
                  color={lead.status.color}
                  label={lead.status.displayName}
                />
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <PriorityBadge priority={lead.priority?.toLowerCase() as any || 'normal'} />
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                {lead.assignedTo ? (
                  <div className="text-sm text-white">
                    {lead.assignedTo.firstName} {lead.assignedTo.lastName}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Unassigned</span>
                )}
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                {lead.activities && lead.activities[0]?.nextFollowUp ? (
                  <div className={`flex items-center space-x-1 ${
                    isOverdue(lead.activities[0].nextFollowUp) ? 'text-red-400' : 'text-gray-300'
                  }`}>
                    {isOverdue(lead.activities[0].nextFollowUp) && (
                      <ExclamationTriangleIcon className="h-4 w-4" />
                    )}
                    <span className="text-sm">
                      {formatRelativeTime(lead.activities[0].nextFollowUp)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">None scheduled</span>
                )}
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm text-gray-300">
                    {formatRelativeTime(lead.submittedAt)}
                  </div>
                  <div className="text-xs text-gray-400">
                    Website Form
                  </div>
                </div>
              </td>
              
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <Link
                    to={`/leads/${lead.id}`}
                    className="text-gray-400 hover:text-blue-400"
                    title="View details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Link>
                  {canWrite && (
                    <button
                      className="text-gray-400 hover:text-green-400"
                      title="Edit lead"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className="text-gray-400 hover:text-red-400"
                      title="Delete lead"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {leads.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">No leads found</div>
          <div className="text-gray-500 text-sm mt-1">
            Try adjusting your search criteria or filters
          </div>
        </div>
      )}
    </div>
  );
};