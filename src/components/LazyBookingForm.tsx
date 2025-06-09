/**
 * LazyBookingForm - Code-split main booking form with loading state
 * This component implements lazy loading for better performance
 */

import React, { Suspense, lazy } from 'react';

// Lazy load the main booking form component
const BookingFormContainer = lazy(() => import('./BookingFormContainer'));

// Loading component
const BookingFormLoader: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-white mb-2">Loading Booking Form</h2>
      <p className="text-gray-300">Please wait while we prepare your booking experience...</p>
    </div>
  </div>
);

// Error fallback component
const BookingFormError: React.FC<{ error?: Error }> = ({ error }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
    <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
      <div className="text-red-400 mb-4">
        <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Unable to Load Booking Form</h2>
      <p className="text-gray-300 mb-4">There was an error loading the booking system.</p>
      {error && (
        <details className="text-sm text-gray-400 mb-4">
          <summary className="cursor-pointer">Error Details</summary>
          <pre className="mt-2 text-left overflow-auto">{error.message}</pre>
        </details>
      )}
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Reload Page
      </button>
    </div>
  </div>
);

// Error boundary for lazy loaded component
class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <BookingFormError error={this.state.error} />;
    }

    return this.props.children;
  }
}

const LazyBookingForm: React.FC = () => {
  return (
    <LazyErrorBoundary>
      <Suspense fallback={<BookingFormLoader />}>
        <BookingFormContainer />
      </Suspense>
    </LazyErrorBoundary>
  );
};

export default LazyBookingForm;