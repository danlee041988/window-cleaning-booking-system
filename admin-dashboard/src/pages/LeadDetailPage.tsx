import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { leadApi } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

export const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: leadData, isLoading, error } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadApi.getLeadById(id!),
    enabled: !!id,
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

  const formatPrice = (price: number | null) => {
    return price ? `£${price.toFixed(2)}` : 'N/A';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/leads')}
            className="text-blue-400 hover:text-blue-300 mb-2"
          >
            ← Back to Leads
          </button>
          <h1 className="text-2xl font-bold text-white">
            {lead.customerName}
          </h1>
          <p className="text-gray-400">
            Booking Reference: {lead.bookingReference}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: lead.status.color + '20',
              color: lead.status.color,
              border: `1px solid ${lead.status.color}40`
            }}
          >
            {lead.status.name}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            lead.priority === 'HIGH' ? 'bg-red-900 text-red-200' :
            lead.priority === 'MEDIUM' ? 'bg-yellow-900 text-yellow-200' :
            'bg-gray-700 text-gray-300'
          }`}>
            {lead.priority}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Email</label>
                <p className="text-white">{lead.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Mobile</label>
                <p className="text-white">{lead.mobile}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Preferred Contact</label>
                <p className="text-white capitalize">{lead.preferredContactMethod}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Preferred Time</label>
                <p className="text-white">{lead.preferredContactTime || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Property Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Address</label>
                <p className="text-white">
                  {lead.addressLine1}
                  {lead.addressLine2 && <><br />{lead.addressLine2}</>}
                  <br />
                  {lead.townCity}
                  {lead.county && `, ${lead.county}`}
                  <br />
                  {lead.postcode}
                </p>
              </div>
              
              {lead.propertyType && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Property Type</label>
                    <p className="text-white capitalize">{lead.propertyType}</p>
                  </div>
                  {lead.propertySize && (
                    <div>
                      <label className="text-sm text-gray-400">Property Size</label>
                      <p className="text-white capitalize">{lead.propertySize}</p>
                    </div>
                  )}
                  {lead.accessDifficulty && (
                    <div>
                      <label className="text-sm text-gray-400">Access Difficulty</label>
                      <p className="text-white capitalize">{lead.accessDifficulty}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Services Requested */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Services Requested</h2>
            <div className="space-y-4">
              {Object.keys(lead.servicesRequested || {}).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(lead.servicesRequested as Record<string, any>).map(([service, selected]) => (
                    selected && (
                      <div key={service} className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-white capitalize">{service.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No specific services listed</p>
              )}

              {lead.frequency && (
                <div>
                  <label className="text-sm text-gray-400">Frequency</label>
                  <p className="text-white capitalize">{lead.frequency}</p>
                </div>
              )}

              {lead.specialRequirements && (
                <div>
                  <label className="text-sm text-gray-400">Special Requirements</label>
                  <p className="text-white">{lead.specialRequirements}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quote Requests */}
          {Object.keys(lead.quoteRequests || {}).length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Quote Requests</h2>
              <div className="space-y-2">
                {Object.entries(lead.quoteRequests as Record<string, any>).map(([quote, requested]) => (
                  requested && (
                    <div key={quote} className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span className="text-white capitalize">{quote.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Lead Summary */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Lead Summary</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Submitted</label>
                <p className="text-white text-sm">
                  {formatDate(lead.submittedAt)}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(lead.submittedAt), { addSuffix: true })}
                </p>
              </div>

              {lead.estimatedPrice && (
                <div>
                  <label className="text-sm text-gray-400">Estimated Price</label>
                  <p className="text-white text-lg font-semibold">
                    {formatPrice(lead.estimatedPrice)}
                  </p>
                </div>
              )}

              {lead.assignedTo && (
                <div>
                  <label className="text-sm text-gray-400">Assigned To</label>
                  <p className="text-white">
                    {lead.assignedTo.firstName} {lead.assignedTo.lastName}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-400">Source</label>
                <p className="text-white capitalize">{lead.source}</p>
              </div>

              {lead.nextFollowUp && (
                <div>
                  <label className="text-sm text-gray-400">Next Follow-up</label>
                  <p className="text-white text-sm">
                    {formatDate(lead.nextFollowUp)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          {lead.priceBreakdown && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Price Breakdown</h2>
              <div className="space-y-2 text-sm">
                {Object.entries(lead.priceBreakdown as Record<string, any>).map(([item, price]) => (
                  <div key={item} className="flex justify-between">
                    <span className="text-gray-400 capitalize">
                      {item.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-white">
                      {typeof price === 'number' ? formatPrice(price) : price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activities Timeline */}
      {lead.activities && lead.activities.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Activity Timeline</h2>
          <div className="space-y-4">
            {lead.activities.map((activity: any) => (
              <div key={activity.id} className="border-l-2 border-gray-600 pl-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium">{activity.title}</h3>
                  <span className="text-xs text-gray-400">
                    {formatDate(activity.createdAt)}
                  </span>
                </div>
                {activity.description && (
                  <p className="text-gray-400 text-sm mt-1">{activity.description}</p>
                )}
                {activity.user && (
                  <p className="text-xs text-gray-500 mt-1">
                    by {activity.user.firstName} {activity.user.lastName}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};