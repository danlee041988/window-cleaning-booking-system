import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { systemApi } from '../services/api';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface SystemConfig {
  business_info: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  pricing_config: {
    baseRates: {
      house: { small: number; medium: number; large: number };
      flat: { small: number; medium: number; large: number };
    };
    multipliers: {
      difficult_access: number;
      solar_panels: number;
      conservatory: number;
    };
    quoteValidityDays: number;
  };
  notification_settings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    newLeadAlert: boolean;
    followUpReminders: boolean;
  };
  lead_assignment: {
    autoAssign: boolean;
    roundRobin: boolean;
    defaultAssignee: number | null;
  };
  follow_up_defaults: {
    initialFollowUpHours: number;
    reminderIntervals: number[];
  };
}

interface LeadStatus {
  id: number;
  name: string;
  description: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean;
}

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'business' | 'pricing' | 'notifications' | 'workflow' | 'statuses'>('business');
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [leadStatuses, setLeadStatuses] = useState<LeadStatus[]>([]);

  const queryClient = useQueryClient();

  // Fetch system configuration
  const { data: configData, isLoading: configLoading } = useQuery({
    queryKey: ['system-config'],
    queryFn: systemApi.getSystemConfig,
  });

  // Fetch lead statuses
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['lead-statuses'],
    queryFn: systemApi.getLeadStatuses,
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: systemApi.updateSystemConfig,
    onSuccess: () => {
      toast.success('Configuration updated successfully');
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update configuration');
    },
  });

  // Update lead status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeadStatus> }) =>
      systemApi.updateLeadStatus(id, data),
    onSuccess: () => {
      toast.success('Lead status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['lead-statuses'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update lead status');
    },
  });

  useEffect(() => {
    if (configData?.data) {
      setConfig(configData.data);
    }
  }, [configData]);

  useEffect(() => {
    if (statusData?.data) {
      setLeadStatuses(statusData.data);
    }
  }, [statusData]);

  const handleConfigUpdate = (section: keyof SystemConfig, updates: any) => {
    if (!config) return;
    
    const updatedConfig = {
      ...config,
      [section]: { ...config[section], ...updates }
    };
    
    setConfig(updatedConfig);
    updateConfigMutation.mutate({ [section]: updatedConfig[section] });
  };

  const handleStatusUpdate = (statusId: number, updates: Partial<LeadStatus>) => {
    const updatedStatuses = leadStatuses.map(status =>
      status.id === statusId ? { ...status, ...updates } : status
    );
    setLeadStatuses(updatedStatuses);
    updateStatusMutation.mutate({ id: statusId.toString(), data: updates });
  };

  if (configLoading || statusLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Failed to load system configuration</p>
      </div>
    );
  }

  const tabs = [
    { id: 'business', name: 'Business Info', icon: '🏢' },
    { id: 'pricing', name: 'Pricing', icon: '💷' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'workflow', name: 'Workflow', icon: '⚡' },
    { id: 'statuses', name: 'Lead Statuses', icon: '📊' },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <p className="text-gray-400">Configure your lead management system</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800 rounded-lg p-6">
        {activeTab === 'business' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Business Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={config.business_info.name}
                  onChange={(e) => handleConfigUpdate('business_info', { name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={config.business_info.phone}
                  onChange={(e) => handleConfigUpdate('business_info', { phone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={config.business_info.email}
                  onChange={(e) => handleConfigUpdate('business_info', { email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Address
                </label>
                <textarea
                  value={config.business_info.address}
                  onChange={(e) => handleConfigUpdate('business_info', { address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Pricing Configuration</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Base Rates</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-300 mb-3">House Rates</h4>
                    <div className="space-y-3">
                      {(['small', 'medium', 'large'] as const).map((size) => (
                        <div key={size} className="flex items-center space-x-3">
                          <label className="w-20 text-sm text-gray-400 capitalize">{size}</label>
                          <span className="text-gray-400">£</span>
                          <input
                            type="number"
                            value={config.pricing_config.baseRates.house[size]}
                            onChange={(e) => handleConfigUpdate('pricing_config', {
                              baseRates: {
                                ...config.pricing_config.baseRates,
                                house: {
                                  ...config.pricing_config.baseRates.house,
                                  [size]: parseFloat(e.target.value) || 0
                                }
                              }
                            })}
                            className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-300 mb-3">Flat Rates</h4>
                    <div className="space-y-3">
                      {(['small', 'medium', 'large'] as const).map((size) => (
                        <div key={size} className="flex items-center space-x-3">
                          <label className="w-20 text-sm text-gray-400 capitalize">{size}</label>
                          <span className="text-gray-400">£</span>
                          <input
                            type="number"
                            value={config.pricing_config.baseRates.flat[size]}
                            onChange={(e) => handleConfigUpdate('pricing_config', {
                              baseRates: {
                                ...config.pricing_config.baseRates,
                                flat: {
                                  ...config.pricing_config.baseRates.flat,
                                  [size]: parseFloat(e.target.value) || 0
                                }
                              }
                            })}
                            className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4">Service Multipliers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(config.pricing_config.multipliers).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-3">
                      <label className="text-sm text-gray-400 capitalize">
                        {key.replace(/_/g, ' ')}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={value}
                        onChange={(e) => handleConfigUpdate('pricing_config', {
                          multipliers: {
                            ...config.pricing_config.multipliers,
                            [key]: parseFloat(e.target.value) || 1
                          }
                        })}
                        className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                      />
                      <span className="text-gray-400">x</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quote Validity (Days)
                </label>
                <input
                  type="number"
                  value={config.pricing_config.quoteValidityDays}
                  onChange={(e) => handleConfigUpdate('pricing_config', {
                    quoteValidityDays: parseInt(e.target.value) || 30
                  })}
                  className="w-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Notification Settings</h2>
            
            <div className="space-y-4">
              {Object.entries(config.notification_settings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleConfigUpdate('notification_settings', {
                        [key]: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'workflow' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Workflow Settings</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Lead Assignment</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Auto Assign Leads</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.lead_assignment.autoAssign}
                        onChange={(e) => handleConfigUpdate('lead_assignment', {
                          autoAssign: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Round Robin Assignment</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.lead_assignment.roundRobin}
                        onChange={(e) => handleConfigUpdate('lead_assignment', {
                          roundRobin: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-4">Follow-up Defaults</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Initial Follow-up (Hours)
                    </label>
                    <input
                      type="number"
                      value={config.follow_up_defaults.initialFollowUpHours}
                      onChange={(e) => handleConfigUpdate('follow_up_defaults', {
                        initialFollowUpHours: parseInt(e.target.value) || 24
                      })}
                      className="w-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Reminder Intervals (Days)
                    </label>
                    <input
                      type="text"
                      value={config.follow_up_defaults.reminderIntervals.join(', ')}
                      onChange={(e) => handleConfigUpdate('follow_up_defaults', {
                        reminderIntervals: e.target.value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))
                      })}
                      placeholder="1, 3, 7"
                      className="w-48 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">Comma-separated list of days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'statuses' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Lead Status Management</h2>
            
            <div className="space-y-4">
              {leadStatuses.map((status) => (
                <div key={status.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={status.name}
                        onChange={(e) => handleStatusUpdate(status.id, { name: e.target.value })}
                        className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Color</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={status.color}
                          onChange={(e) => handleStatusUpdate(status.id, { color: e.target.value })}
                          className="w-8 h-8 rounded border border-gray-500"
                        />
                        <input
                          type="text"
                          value={status.color}
                          onChange={(e) => handleStatusUpdate(status.id, { color: e.target.value })}
                          className="flex-1 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Sort Order</label>
                      <input
                        type="number"
                        value={status.sortOrder}
                        onChange={(e) => handleStatusUpdate(status.id, { sortOrder: parseInt(e.target.value) })}
                        className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={status.isActive}
                          onChange={(e) => handleStatusUpdate(status.id, { isActive: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-xs text-gray-400">Active</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={status.isDefault}
                          onChange={(e) => handleStatusUpdate(status.id, { isDefault: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-xs text-gray-400">Default</span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                    <input
                      type="text"
                      value={status.description}
                      onChange={(e) => handleStatusUpdate(status.id, { description: e.target.value })}
                      className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};