/**
 * BookingConfirmation - Confirmation page component (TypeScript)
 * Migrated from JavaScript for better type safety
 */

import React from 'react';
import EmailTemplateService from '../services/EmailTemplateService';
import { FormData } from '../types/booking';

interface BookingConfirmationProps {
  formData: FormData;
  onStartNewBooking: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ 
  formData, 
  onStartNewBooking 
}) => {
  const isError = !formData.isSubmitted;
  const bookingText = EmailTemplateService.getBookingOrEnquiryText(formData);

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl p-8 border border-gray-700 text-center">
            {/* Error State */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-full mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-red-400 mb-4">Submission Failed</h2>
            <p className="text-gray-300 mb-8 text-lg leading-relaxed">
              We're sorry, but there was an issue submitting your request. Please try again.
            </p>
            <button
              onClick={onStartNewBooking}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl p-8 border border-gray-700 text-center">
          {/* Success State */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-6">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-green-400 mb-4">
            Thank You!
          </h2>
          
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">
            Your {bookingText} has been submitted successfully. We'll get back to you as soon as possible.
          </p>

          {/* Booking Reference */}
          {formData.bookingReference && (
            <div className="p-4 bg-blue-900/30 border border-blue-600 rounded-lg mb-8">
              <p className="text-blue-300 text-sm mb-1">Booking Reference</p>
              <p className="text-blue-100 font-mono text-lg">{formData.bookingReference}</p>
            </div>
          )}

          {/* Contact Information */}
          <div className="text-left bg-gray-800/50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">What happens next?</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                We'll review your {bookingText} within 24 hours
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                You'll receive a confirmation call or email
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                We'll arrange a convenient time for your service
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="text-center">
            <p className="text-gray-400 mb-4">
              Need to make changes or have questions?
            </p>
            <div className="space-y-2 text-gray-300">
              <p>📞 Call us: <span className="text-blue-400">01234 567890</span></p>
              <p>✉️ Email: <span className="text-blue-400">info@somersetwindowcleaning.co.uk</span></p>
            </div>
          </div>

          {/* New Booking Button */}
          <div className="mt-8">
            <button
              onClick={onStartNewBooking}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Make Another Booking
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-gray-500 text-sm">
              Somerset Window Cleaning - Professional cleaning services across Somerset
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;