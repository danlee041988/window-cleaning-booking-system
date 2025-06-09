/**
 * ThemeToggle - Theme switcher component with smooth transitions
 * Allows users to switch between light, dark, and system themes
 */

import React, { memo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, effectiveTheme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        );
      case 'dark':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        );
      case 'system':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Light mode';
      case 'dark': return 'Dark mode';
      case 'system': return 'System theme';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-lg transition-all duration-200 ease-in-out
        hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
        ${effectiveTheme === 'dark'
          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 focus:ring-blue-500 focus:ring-offset-gray-900'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-blue-500 focus:ring-offset-white'
        }
      `}
      aria-label={`Switch theme. Currently using ${getThemeLabel()}`}
      title={getThemeLabel()}
    >
      <div className="relative">
        {/* Icon container with rotation animation */}
        <div className="transform transition-transform duration-300 ease-in-out hover:rotate-12">
          {getThemeIcon()}
        </div>
        
        {/* Theme indicator dot */}
        <div className={`
          absolute -top-1 -right-1 w-2 h-2 rounded-full transition-all duration-200
          ${theme === 'system' ? 'bg-purple-500' : effectiveTheme === 'dark' ? 'bg-blue-500' : 'bg-yellow-500'}
        `} />
      </div>
    </button>
  );
};

export default memo(ThemeToggle);