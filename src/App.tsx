import React, { Component, ReactNode, ErrorInfo } from 'react';
import './App.css';
// Use the refactored container for better maintainability
import BookingFormTest from './components/BookingFormTest';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error boundary component
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Booking form error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
          <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
            <div className="text-red-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
            <p className="text-gray-300 mb-4">We're sorry, but there was an error loading the booking form.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      {/* Skip to main content link for keyboard navigation */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
        {/* Live region for screen reader announcements */}
        <div 
          aria-live="polite" 
          aria-atomic="true" 
          className="sr-only"
          id="live-region"
        >
          {/* Dynamic content will be announced here */}
        </div>
        
        <main id="main-content" className="w-full" role="main">
          <BookingFormTest />
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;
