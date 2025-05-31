import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { leadApi } from '../../services/api';
import { formatDate, formatTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

interface SiteVisitSchedulerProps {
  lead: any;
  onComplete?: () => void;
}

export const SiteVisitScheduler: React.FC<SiteVisitSchedulerProps> = ({ lead, onComplete }) => {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('60'); // minutes
  
  const queryClient = useQueryClient();

  const scheduleSiteVisitMutation = useMutation({
    mutationFn: (visitData: any) => {
      const visitDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      
      return leadApi.updateLead(lead.id, {
        statusId: 'Site Visit Scheduled',
        siteVisitRequired: true,
        siteVisitDate: visitDateTime.toISOString(),
        followUpNotes: notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', lead.id] });
      toast.success('Site visit scheduled successfully');
      onComplete?.();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to schedule site visit');
    }
  });

  const markVisitCompleteMutation = useMutation({
    mutationFn: () => {
      return leadApi.updateLead(lead.id, {
        statusId: 'Site Visit Completed'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', lead.id] });
      toast.success('Site visit marked as completed');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update site visit status');
    }
  });

  const handleSchedule = () => {
    if (!scheduledDate || !scheduledTime) {
      toast.error('Please select both date and time');
      return;
    }

    scheduleSiteVisitMutation.mutate({
      date: scheduledDate,
      time: scheduledTime,
      notes,
      duration: parseInt(estimatedDuration)
    });
  };

  const isVisitScheduled = lead.status?.name === 'Site Visit Scheduled' && lead.siteVisitDate;
  const isVisitCompleted = lead.status?.name === 'Site Visit Completed';

  if (isVisitCompleted) {
    return (
      <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <CheckCircleIcon className="h-5 w-5 text-green-400" />
          <span className="text-green-400 font-medium">Site Visit Completed</span>
        </div>
        <div className="text-sm text-gray-300 mt-1">
          Site assessment has been completed. Ready to prepare formal quote.
        </div>
      </div>
    );
  }

  if (isVisitScheduled) {
    return (
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <CalendarDaysIcon className="h-5 w-5 text-blue-400" />
            <span className="text-blue-400 font-medium">Site Visit Scheduled</span>
          </div>
          <button
            onClick={() => markVisitCompleteMutation.mutate()}
            disabled={markVisitCompleteMutation.isPending}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
          >
            Mark Complete
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-300">
              {formatDate(lead.siteVisitDate)} at {formatTime(lead.siteVisitDate)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPinIcon className="h-4 w-4 text-gray-400" />
            <span className="text-gray-300">{lead.postcodeArea || lead.postcode}</span>
          </div>
        </div>
        
        {lead.followUpNotes && (
          <div className="mt-3">
            <span className="text-gray-400 text-sm">Notes:</span>
            <p className="text-gray-300 mt-1">{lead.followUpNotes}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 rounded-lg p-4">
      <h4 className="text-lg font-medium text-white mb-4 flex items-center">
        <CalendarDaysIcon className="h-5 w-5 mr-2" />
        Schedule Site Visit
      </h4>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time
            </label>
            <select
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select time</option>
              <option value="09:00">9:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="13:00">1:00 PM</option>
              <option value="14:00">2:00 PM</option>
              <option value="15:00">3:00 PM</option>
              <option value="16:00">4:00 PM</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Estimated Duration (minutes)
          </label>
          <select
            value={estimatedDuration}
            onChange={(e) => setEstimatedDuration(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="90">1.5 hours</option>
            <option value="120">2 hours</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Visit Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any specific requirements or notes for the site visit..."
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-gray-400">
            <MapPinIcon className="h-4 w-4 inline mr-1" />
            {lead.addressLine1}, {lead.postcode}
          </div>
          <button
            onClick={handleSchedule}
            disabled={scheduleSiteVisitMutation.isPending || !scheduledDate || !scheduledTime}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scheduleSiteVisitMutation.isPending ? 'Scheduling...' : 'Schedule Visit'}
          </button>
        </div>
      </div>
    </div>
  );
};