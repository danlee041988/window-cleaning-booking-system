import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { followUpApi, leadApi } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { CompleteFollowUpModal } from '../components/follow-ups/CompleteFollowUpModal';
import { RescheduleModal } from '../components/follow-ups/RescheduleModal';
import { formatRelativeTime, formatDate, formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

interface FollowUpActivity {
  id: string;
  leadId: string;
  activityType: string;
  subject: string;
  description: string;
  scheduledFor: string;
  outcome?: string;
  notes?: string;
  assignedTo: {
    id: string;
    firstName: string;
    lastName: string;
  };
  lead: {
    id: string;
    leadNumber: string;
    customerName: string;
    phone: string;
    email: string;
    postcodeArea: string;
    estimatedMonthlyValue: number;
    status: {
      name: string;
      displayName: string;
      color: string;
    };
    priority: string;
  };
}

type TabType = 'today' | 'overdue' | 'upcoming' | 'completed';

export const FollowUpPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [selectedActivity, setSelectedActivity] = useState<FollowUpActivity | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const queryClient = useQueryClient();

  // Fetch follow-up data based on active tab
  const { data: followUps, isLoading, refetch } = useQuery({
    queryKey: ['follow-ups', activeTab],
    queryFn: () => {
      switch (activeTab) {
        case 'today':
          return followUpApi.getTodaysFollowUps();
        case 'overdue':
          return followUpApi.getOverdueFollowUps();
        case 'upcoming':
          return followUpApi.getUpcomingFollowUps(7);
        case 'completed':
          return followUpApi.getUpcomingFollowUps(30); // Last 30 days of completed
        default:
          return followUpApi.getTodaysFollowUps();
      }
    },
    refetchInterval: 60000, // Refresh every minute
  });

  // Complete follow-up mutation
  const completeFollowUpMutation = useMutation({
    mutationFn: ({ activityId, outcome, notes }: {
      activityId: string;
      outcome: string;
      notes?: string;
    }) => followUpApi.completeFollowUp(activityId, outcome, notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['follow-ups']);
      queryClient.invalidateQueries(['leads']);
      toast.success('Follow-up completed successfully');
      setShowCompleteModal(false);
      setSelectedActivity(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to complete follow-up');
    }
  });

  // Reschedule follow-up mutation
  const rescheduleFollowUpMutation = useMutation({
    mutationFn: ({ activityId, newDate, reason }: {
      activityId: string;
      newDate: string;
      reason?: string;
    }) => followUpApi.rescheduleFollowUp(activityId, newDate, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['follow-ups']);
      queryClient.invalidateQueries(['leads']);
      toast.success('Follow-up rescheduled successfully');
      setShowRescheduleModal(false);
      setSelectedActivity(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reschedule follow-up');
    }
  });

  const handleCompleteFollowUp = (activity: FollowUpActivity) => {
    setSelectedActivity(activity);
    setShowCompleteModal(true);
  };

  const handleRescheduleFollowUp = (activity: FollowUpActivity) => {
    setSelectedActivity(activity);
    setShowRescheduleModal(true);
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'call':
        return <PhoneIcon className="h-5 w-5" />;
      case 'email':
        return <EnvelopeIcon className="h-5 w-5" />;
      case 'meeting':
        return <UserIcon className="h-5 w-5" />;
      default:
        return <ChatBubbleLeftIcon className="h-5 w-5" />;
    }
  };

  const getTabColor = (tab: TabType) => {
    switch (tab) {
      case 'overdue':
        return 'text-red-400 border-red-400';
      case 'today':
        return 'text-orange-400 border-orange-400';
      case 'upcoming':
        return 'text-blue-400 border-blue-400';
      case 'completed':
        return 'text-green-400 border-green-400';
      default:
        return 'text-gray-400 border-gray-400';
    }
  };

  const tabs = [
    { 
      id: 'today' as TabType, 
      name: 'Today', 
      count: followUps?.filter((f: FollowUpActivity) => {
        const today = new Date().toDateString();
        return new Date(f.scheduledFor).toDateString() === today;
      }).length || 0
    },
    { 
      id: 'overdue' as TabType, 
      name: 'Overdue', 
      count: followUps?.filter((f: FollowUpActivity) => {
        return new Date(f.scheduledFor) < new Date() && !f.outcome;
      }).length || 0
    },
    { 
      id: 'upcoming' as TabType, 
      name: 'Upcoming', 
      count: followUps?.filter((f: FollowUpActivity) => {
        return new Date(f.scheduledFor) > new Date() && !f.outcome;
      }).length || 0
    },
    { 
      id: 'completed' as TabType, 
      name: 'Completed', 
      count: followUps?.filter((f: FollowUpActivity) => f.outcome).length || 0
    }
  ];

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
          <h1 className="text-2xl font-bold text-white">Follow-ups</h1>
          <p className="mt-1 text-sm text-gray-400">
            Manage and track your customer follow-up activities
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
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
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`bg-gray-800 rounded-lg p-4 border border-gray-700 cursor-pointer transition-colors ${
              activeTab === tab.id ? 'ring-2 ring-blue-500' : 'hover:border-gray-600'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <div className={`text-2xl font-bold ${getTabColor(tab.id).split(' ')[0]}`}>
              {tab.count}
            </div>
            <div className="text-sm text-gray-400">{tab.name}</div>
          </div>
        ))}
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? `${getTabColor(tab.id)} border-current`
                  : 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-current text-gray-900' : 'bg-gray-700 text-gray-300'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Follow-up list */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        {followUps && followUps.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {followUps.map((activity: FollowUpActivity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-750 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Activity icon */}
                    <div className={`p-2 rounded-lg ${
                      activity.outcome 
                        ? 'bg-green-900/50 text-green-400' 
                        : new Date(activity.scheduledFor) < new Date()
                        ? 'bg-red-900/50 text-red-400'
                        : 'bg-blue-900/50 text-blue-400'
                    }`}>
                      {activity.outcome ? (
                        <CheckCircleIcon className="h-5 w-5" />
                      ) : (
                        getActivityIcon(activity.activityType)
                      )}
                    </div>

                    {/* Activity details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-white">
                          {activity.subject || `${activity.activityType} follow-up`}
                        </h3>
                        <StatusBadge
                          status={activity.lead.status.name}
                          color={activity.lead.status.color}
                          label={activity.lead.status.displayName}
                        />
                        <PriorityBadge priority={activity.lead.priority} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-400">Customer</div>
                          <div className="text-white font-medium">
                            {activity.lead.customerName}
                          </div>
                          <div className="text-gray-400">
                            {activity.lead.leadNumber} • {activity.lead.postcodeArea}
                          </div>
                        </div>

                        <div>
                          <div className="text-gray-400">Scheduled</div>
                          <div className={`font-medium ${
                            new Date(activity.scheduledFor) < new Date() && !activity.outcome
                              ? 'text-red-400'
                              : 'text-white'
                          }`}>
                            {formatDate(activity.scheduledFor)}
                          </div>
                          <div className="text-gray-400">
                            {formatRelativeTime(activity.scheduledFor)}
                          </div>
                        </div>

                        <div>
                          <div className="text-gray-400">Assigned to</div>
                          <div className="text-white">
                            {activity.assignedTo.firstName} {activity.assignedTo.lastName}
                          </div>
                        </div>

                        <div>
                          <div className="text-gray-400">Lead Value</div>
                          <div className="text-green-400 font-medium">
                            {formatCurrency(activity.lead.estimatedMonthlyValue)}/month
                          </div>
                        </div>
                      </div>

                      {activity.description && (
                        <div className="mt-3">
                          <div className="text-gray-400 text-sm">Description</div>
                          <div className="text-gray-300">{activity.description}</div>
                        </div>
                      )}

                      {activity.outcome && (
                        <div className="mt-3">
                          <div className="text-gray-400 text-sm">Outcome</div>
                          <div className="text-green-400 capitalize">{activity.outcome}</div>
                          {activity.notes && (
                            <div className="text-gray-300 mt-1">{activity.notes}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {!activity.outcome && (
                    <div className="flex items-center space-x-2 ml-4">
                      <div className="flex space-x-1">
                        <a
                          href={`tel:${activity.lead.phone}`}
                          className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Call customer"
                        >
                          <PhoneIcon className="h-4 w-4" />
                        </a>
                        <a
                          href={`mailto:${activity.lead.email}`}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Email customer"
                        >
                          <EnvelopeIcon className="h-4 w-4" />
                        </a>
                      </div>
                      <div className="w-px h-6 bg-gray-600" />
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleCompleteFollowUp(activity)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleRescheduleFollowUp(activity)}
                          className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Reschedule
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-400 text-lg">No follow-ups for {activeTab}</div>
            <div className="text-gray-500 text-sm mt-1">
              {activeTab === 'today' && "You're all caught up for today!"}
              {activeTab === 'overdue' && "Great job staying on top of your follow-ups!"}
              {activeTab === 'upcoming' && "No upcoming follow-ups scheduled."}
              {activeTab === 'completed' && "No completed follow-ups to show."}
            </div>
          </div>
        )}
      </div>

      {/* Complete follow-up modal */}
      {showCompleteModal && selectedActivity && (
        <CompleteFollowUpModal
          activity={selectedActivity}
          onComplete={(outcome, notes) => {
            completeFollowUpMutation.mutate({
              activityId: selectedActivity.id,
              outcome,
              notes
            });
          }}
          onClose={() => {
            setShowCompleteModal(false);
            setSelectedActivity(null);
          }}
          isLoading={completeFollowUpMutation.isLoading}
        />
      )}

      {/* Reschedule modal */}
      {showRescheduleModal && selectedActivity && (
        <RescheduleModal
          activity={selectedActivity}
          onReschedule={(newDate, reason) => {
            rescheduleFollowUpMutation.mutate({
              activityId: selectedActivity.id,
              newDate,
              reason
            });
          }}
          onClose={() => {
            setShowRescheduleModal(false);
            setSelectedActivity(null);
          }}
          isLoading={rescheduleFollowUpMutation.isLoading}
        />
      )}
    </motion.div>
  );
};