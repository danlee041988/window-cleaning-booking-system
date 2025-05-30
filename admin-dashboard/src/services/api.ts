import axios, { AxiosInstance } from 'axios';

// API Configuration
const API_BASE_URL = 'https://window-cleaning-booking-system-6k15.vercel.app/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await apiClient.post('/auth/login', credentials);
    
    // Set token for future requests
    if (response.data.accessToken) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
    }
    
    return response.data;
  },

  verifyMFA: async (token: string) => {
    const response = await apiClient.post('/auth/verify-mfa', { token });
    
    // Set token for future requests
    if (response.data.accessToken) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
    }
    
    return response.data;
  },

  refresh: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    
    // Update authorization header
    if (response.data.accessToken) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
    }
    
    return response.data;
  },

  logout: async () => {
    await apiClient.post('/auth/logout');
    delete apiClient.defaults.headers.common['Authorization'];
  },

  clearTokens: () => {
    delete apiClient.defaults.headers.common['Authorization'];
  },

  setupInterceptors: (
    onTokenRefresh: (newToken: string) => void,
    onAuthFailure: () => void
  ) => {
    // Request interceptor to add auth token
    apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh
    apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await authApi.refresh(refreshToken);
              onTokenRefresh(response.accessToken);
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
              return apiClient(originalRequest);
            }
          } catch (refreshError) {
            onAuthFailure();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  },
};

// Lead API
export const leadApi = {
  getLeads: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    assignedTo?: string;
    postcodeArea?: string;
    priority?: string;
    searchTerm?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await apiClient.get('/leads', { params });
    return response.data;
  },

  getLeadById: async (id: string) => {
    const response = await apiClient.get(`/leads/${id}`);
    return response.data;
  },

  createLead: async (leadData: any) => {
    const response = await apiClient.post('/leads', leadData);
    return response.data;
  },

  updateLead: async (id: string, updateData: any) => {
    const response = await apiClient.put(`/leads/${id}`, updateData);
    return response.data;
  },

  updateLeadStatus: async (id: string, statusData: {
    statusId: string;
    notes?: string;
    nextFollowUp?: string;
  }) => {
    const response = await apiClient.put(`/leads/${id}/status`, statusData);
    return response.data;
  },

  deleteLead: async (id: string) => {
    const response = await apiClient.delete(`/leads/${id}`);
    return response.data;
  },

  addActivity: async (leadId: string, activityData: any) => {
    const response = await apiClient.post(`/leads/${leadId}/activities`, activityData);
    return response.data;
  },

  getLeadActivities: async (leadId: string) => {
    const response = await apiClient.get(`/leads/${leadId}/activities`);
    return response.data;
  },

  transferToSqueegee: async (leadIds: string[]) => {
    const response = await apiClient.post('/leads/transfer-to-squeegee', { leadIds });
    return response.data;
  },

  exportLeads: async (params: any) => {
    const response = await apiClient.get('/leads/export', { 
      params,
      responseType: 'blob' 
    });
    return response.data;
  },

  getTransferHistory: async () => {
    const response = await apiClient.get('/leads/transfer-history');
    return response.data;
  },
};

// Analytics API
export const analyticsApi = {
  getDashboardMetrics: async () => {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data;
  },

  getConversionFunnel: async (dateRange?: { start: string; end: string }) => {
    const response = await apiClient.get('/analytics/conversion-funnel', {
      params: dateRange,
    });
    return response.data;
  },

  getPerformanceMetrics: async (params: {
    period?: 'week' | 'month' | 'quarter' | 'year';
    groupBy?: 'day' | 'week' | 'month';
    staffId?: string;
  }) => {
    const response = await apiClient.get('/analytics/performance', { params });
    return response.data;
  },

  getLeadSourceAnalysis: async () => {
    const response = await apiClient.get('/analytics/lead-sources');
    return response.data;
  },

  getPostcodeAnalysis: async () => {
    const response = await apiClient.get('/analytics/postcode-analysis');
    return response.data;
  },
};

// System API
export const systemApi = {
  getLeadStatuses: async () => {
    const response = await apiClient.get('/system/lead-statuses');
    return response.data;
  },

  updateLeadStatus: async (id: string, statusData: any) => {
    const response = await apiClient.put(`/system/lead-statuses/${id}`, statusData);
    return response.data;
  },

  getUsers: async () => {
    const response = await apiClient.get('/system/users');
    return response.data;
  },

  createUser: async (userData: any) => {
    const response = await apiClient.post('/system/users', userData);
    return response.data;
  },

  updateUser: async (id: string, userData: any) => {
    const response = await apiClient.put(`/system/users/${id}`, userData);
    return response.data;
  },

  getSystemConfig: async () => {
    const response = await apiClient.get('/system/config');
    return response.data;
  },

  updateSystemConfig: async (config: any) => {
    const response = await apiClient.put('/system/config', config);
    return response.data;
  },

  getAuditLog: async (params: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    dateRange?: { start: string; end: string };
  }) => {
    const response = await apiClient.get('/system/audit-log', { params });
    return response.data;
  },
};

// Follow-up API
export const followUpApi = {
  getTodaysFollowUps: async () => {
    const response = await apiClient.get('/follow-ups/today');
    return response.data;
  },

  getOverdueFollowUps: async () => {
    const response = await apiClient.get('/follow-ups/overdue');
    return response.data;
  },

  getUpcomingFollowUps: async (days: number = 7) => {
    const response = await apiClient.get(`/follow-ups/upcoming?days=${days}`);
    return response.data;
  },

  completeFollowUp: async (activityId: string, outcome: string, notes?: string) => {
    const response = await apiClient.put(`/follow-ups/${activityId}/complete`, {
      outcome,
      notes,
    });
    return response.data;
  },

  rescheduleFollowUp: async (activityId: string, newDate: string, reason?: string) => {
    const response = await apiClient.put(`/follow-ups/${activityId}/reschedule`, {
      newDate,
      reason,
    });
    return response.data;
  },
};

// Generic API error handler
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'You are not authorized to perform this action.';
      case 403:
        return 'You do not have permission to access this resource.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'A server error occurred. Please try again.';
      default:
        return 'An unexpected error occurred.';
    }
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return 'Network error. Please check your internet connection.';
  }
  
  return 'An unexpected error occurred.';
};

// Export the configured axios instance for direct use if needed
export default apiClient;