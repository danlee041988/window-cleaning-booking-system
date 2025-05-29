import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'sales' | 'viewer';
  permissions: string[];
  lastLogin?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaRequired: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  verifyMFA: (token: string) => Promise<boolean>;
  logout: () => void;
  refreshAuth: () => Promise<boolean>;
  clearTokens: () => void;
  setLoading: (loading: boolean) => void;
}

interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResult {
  success: boolean;
  mfaRequired?: boolean;
  error?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      mfaRequired: false,

      login: async (credentials: LoginCredentials): Promise<LoginResult> => {
        set({ isLoading: true, mfaRequired: false });

        try {
          const response = await authApi.login(credentials);

          if (response.mfaRequired) {
            set({ 
              isLoading: false, 
              mfaRequired: true,
              // Store temporary tokens for MFA verification
              accessToken: response.tempToken 
            });
            return { success: true, mfaRequired: true };
          }

          // Standard login success
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            mfaRequired: false,
          });

          return { success: true };

        } catch (error: any) {
          set({ isLoading: false, mfaRequired: false });
          
          return {
            success: false,
            error: error.response?.data?.message || 'Login failed'
          };
        }
      },

      verifyMFA: async (token: string): Promise<boolean> => {
        set({ isLoading: true });

        try {
          const response = await authApi.verifyMFA(token);

          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            mfaRequired: false,
          });

          return true;

        } catch (error) {
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => {
        // Clear tokens from API client
        authApi.clearTokens();
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          mfaRequired: false,
        });
      },

      refreshAuth: async (): Promise<boolean> => {
        const { refreshToken } = get();
        
        if (!refreshToken) {
          set({ isLoading: false });
          return false;
        }

        try {
          const response = await authApi.refresh(refreshToken);

          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;

        } catch (error) {
          // Refresh failed, clear everything
          get().logout();
          return false;
        }
      },

      clearTokens: () => {
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist tokens and user info, not loading states
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // When storage is rehydrated, check if we need to refresh
        if (state?.refreshToken && state?.isAuthenticated) {
          state.refreshAuth().catch(() => {
            state.logout();
          });
        } else {
          // No tokens or not authenticated, stop loading
          state?.setLoading(false);
        }
      },
    }
  )
);

// Failsafe: Ensure loading is set to false after 3 seconds maximum
setTimeout(() => {
  const state = useAuthStore.getState();
  if (state.isLoading && !state.refreshToken) {
    state.setLoading(false);
  }
}, 3000);

// Helper functions for checking permissions
export const useHasPermission = (permission: string): boolean => {
  const user = useAuthStore((state) => state.user);
  
  if (!user) return false;
  if (user.permissions.includes('*')) return true;
  
  return user.permissions.includes(permission);
};

export const useIsRole = (role: string | string[]): boolean => {
  const user = useAuthStore((state) => state.user);
  
  if (!user) return false;
  
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  
  return user.role === role;
};