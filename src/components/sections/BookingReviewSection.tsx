/**
 * BookingReviewSection - Review booking details section
 * Extracted from PropertyDetailsAndReview for better modularity
 */

import React, { memo } from 'react';
import EmailTemplateService from '../../services/EmailTemplateService';
import type { FormData } from '../../types/booking';

interface BookingReviewSectionProps {
  values: FormData;
  isStandardResidential: boolean;
  isCommercial: boolean;
  isGeneralEnquiry: boolean;
  isCustomQuote: boolean;
}

const BookingReviewSection: React.FC<BookingReviewSectionProps> = ({ 
  values, 
  isStandardResidential, 
  isCommercial, 
  isGeneralEnquiry, 
  isCustomQuote 
}) => {
  const formatPrice = (price: number): string => {
    return price ? `£${price.toFixed(2)}` : '£0.00';
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-6">
        Review Your {EmailTemplateService.getBookingOrEnquiryText(values)}
      </h3>

      {/* Standard Residential Review */}
      {isStandardResidential && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-300 mb-2">Property Details</h4>
              <div className="text-white space-y-1">
                <p>Type: {values.propertyType || 'Not specified'}</p>
                <p>Bedrooms: {values.bedrooms || 'Not specified'}</p>
                <p>Frequency: {values.selectedFrequency || 'Not specified'}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-300 mb-2">Service</h4>
              <div className="text-white space-y-1">
                <p>{values.selectedWindowService?.name || 'Service not selected'}</p>
                {values.hasConservatory && <p>+ Conservatory</p>}
                {values.hasExtension && <p>+ Extension</p>}
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          {values.grandTotal > 0 && (
            <div className="border-t border-gray-600 pt-4">
              <h4 className="font-medium text-gray-300 mb-2">Pricing Summary</h4>
              <div className="space-y-2 text-white">
                <div className="flex justify-between">
                  <span>Window Cleaning:</span>
                  <span>{formatPrice(values.initialWindowPrice)}</span>
                </div>
                {values.conservatorySurcharge > 0 && (
                  <div className="flex justify-between">
                    <span>Conservatory Surcharge:</span>
                    <span>{formatPrice(values.conservatorySurcharge)}</span>
                  </div>
                )}
                {values.extensionSurcharge > 0 && (
                  <div className="flex justify-between">
                    <span>Extension Surcharge:</span>
                    <span>{formatPrice(values.extensionSurcharge)}</span>
                  </div>
                )}
                {values.windowCleaningDiscount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount:</span>
                    <span>-{formatPrice(values.windowCleaningDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t border-gray-600 pt-2">
                  <span>Total:</span>
                  <span>{formatPrice(values.grandTotal)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Commercial Review */}
      {isCommercial && (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Company Information</h4>
            <div className="text-white space-y-1">
              <p>Company: {values.commercialDetails?.companyName || 'Not specified'}</p>
              <p>Business Type: {values.commercialDetails?.businessType || 'Not specified'}</p>
              <p>Contact Person: {values.commercialDetails?.contactPerson || 'Not specified'}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Requested Services</h4>
            <div className="text-white">
              <p>{EmailTemplateService.getSelectedCommercialServices(values)}</p>
            </div>
          </div>
        </div>
      )}

      {/* General Enquiry Review */}
      {isGeneralEnquiry && (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Enquiry Details</h4>
            <div className="text-white space-y-1">
              <p>Services: {EmailTemplateService.getSelectedGeneralEnquiryServices(values)}</p>
              <p>Frequency: {values.generalEnquiryDetails?.requestedFrequency || 'Not specified'}</p>
              <p>Customer Status: {values.generalEnquiryDetails?.customerStatus || 'Not specified'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Quote Review */}
      {isCustomQuote && (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-300 mb-2">Quote Request</h4>
            <div className="text-white">
              <p>This is a custom quote request. Our team will assess your requirements and provide a personalized quote.</p>
            </div>
          </div>
        </div>
      )}

      {/* Important Notice */}
      <div className="mt-6 p-4 bg-blue-900/30 border border-blue-600 rounded-lg">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-blue-300 text-sm">
            <p className="font-medium mb-1">Please Note:</p>
            <p>
              {isStandardResidential && values.grandTotal > 0 
                ? "The price shown is an estimate. Final pricing may vary based on specific requirements and accessibility."
                : "We'll contact you within 24 hours to discuss your requirements and provide a detailed quote."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(BookingReviewSection);