import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { leadApi } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';
import { formatFrequency, formatPropertyType, getBookingType } from '../utils/serviceFormatters';
import { useHasPermission } from '../stores/authStore';
import toast from 'react-hot-toast';

export const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canWrite = useHasPermission('leads:write');
  const canDelete = useHasPermission('leads:delete');

  const { data: leadData, isLoading, error } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadApi.getLeadById(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => leadApi.deleteLead(id!),
    onSuccess: () => {
      toast.success('Lead deleted successfully');
      navigate('/leads');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete lead');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !leadData?.data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Lead not found or failed to load</p>
        <button
          onClick={() => navigate('/leads')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Leads
        </button>
      </div>
    );
  }

  const lead = leadData.data;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const formatServicesDetails = (lead: any) => {
    const services = [];
    
    // Check for standard residential services
    if (lead.servicesRequested?.windowCleaning) {
      services.push({
        name: 'Window Cleaning',
        frequency: formatFrequency(lead.frequency),
        price: lead.estimatedPrice ? formatCurrency(lead.estimatedPrice) : 'TBD'
      });
    }
    
    // Check for additional services
    if (lead.additionalServices?.conservatoryRoof) {
      services.push({ name: 'Conservatory Roof Cleaning', frequency: 'As needed', price: 'Quote' });
    }
    if (lead.additionalServices?.gutterClearing) {
      services.push({ name: 'Gutter Clearing', frequency: 'Annual', price: formatCurrency(lead.gutterClearingServicePrice || 0) });
    }
    if (lead.additionalServices?.fasciaSoffitGutter) {
      services.push({ name: 'Fascia/Soffit/Gutter Cleaning', frequency: 'As needed', price: formatCurrency(lead.fasciaSoffitGutterServicePrice || 0) });
    }
    
    // Check for general enquiry services
    if (lead.generalEnquiryDetails?.requestedServices) {
      const genServices = lead.generalEnquiryDetails.requestedServices;
      Object.keys(genServices).forEach(key => {
        if (genServices[key] && key !== 'other') {
          services.push({
            name: key.replace(/([A-Z])/g, ' $1').trim(),
            frequency: formatFrequency(lead.generalEnquiryDetails.requestedFrequency),
            price: 'Quote Required'
          });
        }
      });
    }
    
    return services;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/leads"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Lead Details</h1>
            <span className="text-gray-400">#{lead.bookingReference}</span>
          </div>
          <div className="flex items-center space-x-3">
            {canWrite && (
              <button
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Lead
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </button>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Status:</span>
              <StatusBadge
                status={lead.status.name}
                color={lead.status.color}
                label={lead.status.displayName}
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Priority:</span>
              <PriorityBadge priority={lead.priority?.toLowerCase() || 'normal'} />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Type:</span>
              <span className="text-white font-medium">{getBookingType(lead)}</span>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            Submitted: {formatRelativeTime(lead.submittedAt)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            Customer Information
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400 text-sm">Name:</span>
              <p className="text-white font-medium">{lead.customerName}</p>
            </div>
            <div className="flex items-center space-x-2">
              <EnvelopeIcon className="h-4 w-4 text-gray-400" />
              <a href={`mailto:${lead.email}`} className="text-blue-400 hover:text-blue-300">
                {lead.email}
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <PhoneIcon className="h-4 w-4 text-gray-400" />
              <a href={`tel:${lead.mobile}`} className="text-blue-400 hover:text-blue-300">
                {lead.mobile}
              </a>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Preferred Contact:</span>
              <p className="text-white">{lead.preferredContactMethod || 'Phone'}</p>
              {lead.preferredContactTime && (
                <p className="text-sm text-gray-400">Best time: {lead.preferredContactTime}</p>
              )}
            </div>
            <div>
              <span className="text-gray-400 text-sm">Marketing Consent:</span>
              <p className="flex items-center">
                {lead.marketingConsent ? (
                  <><CheckCircleIcon className="h-4 w-4 text-green-400 mr-1" /> Yes</>
                ) : (
                  <><XCircleIcon className="h-4 w-4 text-red-400 mr-1" /> No</>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <MapPinIcon className="h-5 w-5 mr-2" />
            Property Details
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400 text-sm">Address:</span>
              <p className="text-white">
                {lead.addressLine1}<br />
                {lead.addressLine2 && <>{lead.addressLine2}<br /></>}
                {lead.townCity}<br />
                {lead.county && <>{lead.county}<br /></>}
                {lead.postcode}
              </p>
            </div>
            {lead.propertyType && (
              <div>
                <span className="text-gray-400 text-sm">Property Type:</span>
                <p className="text-white">{formatPropertyType(lead.propertyType, lead.propertySize)}</p>
              </div>
            )}
            {lead.accessDifficulty && (
              <div>
                <span className="text-gray-400 text-sm">Access Notes:</span>
                <p className="text-white">{lead.accessDifficulty}</p>
              </div>
            )}
          </div>
        </div>

        {/* Services & Pricing */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
            Services & Pricing
          </h2>
          <div className="space-y-4">
            <div>
              <span className="text-gray-400 text-sm">Services Requested:</span>
              <div className="mt-2 space-y-2">
                {formatServicesDetails(lead).map((service, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700">
                    <div>
                      <p className="text-white">{service.name}</p>
                      <p className="text-sm text-gray-400">{service.frequency}</p>
                    </div>
                    <span className="text-green-400 font-medium">{service.price}</span>
                  </div>
                ))}
              </div>
            </div>
            {lead.estimatedPrice && (
              <div className="pt-2 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Estimated Price:</span>
                  <span className="text-xl font-bold text-green-400">{formatCurrency(lead.estimatedPrice)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2" />
            Additional Information
          </h2>
          <div className="space-y-3">
            {lead.specialRequirements && (
              <div>
                <span className="text-gray-400 text-sm">Special Requirements:</span>
                <p className="text-white mt-1">{lead.specialRequirements}</p>
              </div>
            )}
            {lead.bookingNotes && (
              <div>
                <span className="text-gray-400 text-sm">Booking Notes:</span>
                <p className="text-white mt-1">{lead.bookingNotes}</p>
              </div>
            )}
            {lead.generalEnquiryDetails?.enquiryComments && (
              <div>
                <span className="text-gray-400 text-sm">Enquiry Comments:</span>
                <p className="text-white mt-1">{lead.generalEnquiryDetails.enquiryComments}</p>
              </div>
            )}
            {lead.customResidentialDetails?.otherNotes && (
              <div>
                <span className="text-gray-400 text-sm">Custom Quote Notes:</span>
                <p className="text-white mt-1">{lead.customResidentialDetails.otherNotes}</p>
              </div>
            )}
            {lead.commercialDetails?.specificRequirements && (
              <div>
                <span className="text-gray-400 text-sm">Commercial Requirements:</span>
                <p className="text-white mt-1">{lead.commercialDetails.specificRequirements}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Activity Timeline
        </h2>
        <div className="space-y-4">
          {lead.activities && lead.activities.length > 0 ? (
            lead.activities.map((activity: any, index: number) => (
              <div key={activity.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">{index + 1}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium">{activity.title}</h3>
                    <span className="text-sm text-gray-400">
                      {formatRelativeTime(activity.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{activity.description}</p>
                  {activity.user && (
                    <p className="text-sm text-gray-500 mt-1">
                      by {activity.user.firstName} {activity.user.lastName}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No activities recorded yet</p>
          )}
        </div>
      </div>
    </div>
  );
};