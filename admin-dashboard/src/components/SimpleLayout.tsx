import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowPathIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../stores/authStore';

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Leads', href: '/leads', icon: UserGroupIcon },
  { name: 'Follow-ups', href: '/follow-ups', icon: ClockIcon },
  { name: 'Squeegee Transfer', href: '/squeegee-transfer', icon: ArrowPathIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export const SimpleLayout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Simple header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-white">Somerset Window Cleaning Admin</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user?.username || 'Admin'}</span>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-white flex items-center"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 px-6 py-2 border-b border-gray-700">
        <div className="flex space-x-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isCurrent = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-lg
                  ${isCurrent
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                <Icon className="mr-2 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main content */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};