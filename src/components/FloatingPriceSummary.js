// Floating price summary widget to show running total with breakdown
import React, { useState, useEffect } from 'react';

const FloatingPriceSummary = ({ 
  grandTotal, 
  windowPrice = 0,
  conservatorySurcharge = 0,
  extensionSurcharge = 0,
  additionalServices = {},
  gutterClearingPrice = 0,
  fasciaSoffitPrice = 0,
  discount = 0,
  isVisible = true, 
  currentStep 
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showWidget, setShowWidget] = useState(false);

  // Only show widget after step 1 when we have pricing
  useEffect(() => {
    setShowWidget(currentStep >= 2 && (grandTotal > 0 || windowPrice > 0));
  }, [currentStep, grandTotal, windowPrice]);

  if (!isVisible || !showWidget) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-40 transition-all duration-300 ${
      isMinimized ? 'w-16' : 'w-64'
    }`}>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-gray-900/50 border-b border-gray-700">
          <h3 className={`text-sm font-semibold text-gray-300 ${isMinimized ? 'hidden' : ''}`}>
            Current Total
          </h3>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label={isMinimized ? 'Expand price summary' : 'Minimize price summary'}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              {isMinimized ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
              )}
            </svg>
          </button>
        </div>

        {/* Price Display */}
        <div className={`${isMinimized ? 'hidden' : ''}`}>
          <div className="p-4">
            {/* Regular Window Cleaning Price */}
            <div className="text-center mb-3">
              <p className="text-2xl font-bold text-green-400">
                £{(windowPrice + conservatorySurcharge + extensionSurcharge - discount).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">
                per clean (regular window cleaning)
              </p>
            </div>
            
            {/* One-off Services Total */}
            {(gutterClearingPrice > 0 || fasciaSoffitPrice > 0) && (
              <div className="text-center border-t border-gray-700 pt-3">
                <p className="text-xl font-semibold text-blue-400">
                  +£{(gutterClearingPrice + fasciaSoffitPrice).toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">
                  one-off additional services
                </p>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="px-4 pb-4 border-t border-gray-700">
              <div className="mt-3 space-y-2 text-xs">
                {/* Regular Services Section */}
                <div className="text-xs font-semibold text-blue-300 mb-2">Regular Window Cleaning:</div>
                
                {/* Window Cleaning */}
                <div className="flex justify-between">
                  <span className="text-gray-400">Base window cleaning</span>
                  <span className="text-gray-300">£{windowPrice.toFixed(2)}</span>
                </div>
                
                {/* Conservatory Surcharge */}
                {conservatorySurcharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Conservatory</span>
                    <span className="text-gray-300">+£{conservatorySurcharge.toFixed(2)}</span>
                  </div>
                )}
                
                {/* Extension Surcharge */}
                {extensionSurcharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Extension</span>
                    <span className="text-gray-300">+£{extensionSurcharge.toFixed(2)}</span>
                  </div>
                )}
                
                {/* One-off Services Section */}
                {(gutterClearingPrice > 0 || fasciaSoffitPrice > 0) && (
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-yellow-300 mb-2">One-off Services (First clean only):</div>
                    
                    {/* Gutter Clearing */}
                    {additionalServices?.gutterClearing && gutterClearingPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Gutter Clearing</span>
                        <span className="text-gray-300">+£{gutterClearingPrice.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {/* Fascia/Soffit */}
                    {additionalServices?.fasciaSoffitGutter && fasciaSoffitPrice > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fascia & Soffit</span>
                        <span className="text-gray-300">+£{fasciaSoffitPrice.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Discount */}
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-£{discount.toFixed(2)}</span>
                  </div>
                )}
                
                {/* Total for First Clean */}
                <div className="flex justify-between pt-2 border-t border-gray-600 font-semibold">
                  <span className="text-gray-300">Total First Clean</span>
                  <span className="text-green-400">£{grandTotal.toFixed(2)}</span>
                </div>
                
                {/* Regular Clean Price */}
                {(gutterClearingPrice > 0 || fasciaSoffitPrice > 0) && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-400">Then £{(windowPrice + conservatorySurcharge + extensionSurcharge - discount).toFixed(2)} per regular clean</span>
                  </div>
                )}
              </div>
            </div>
        </div>

        {/* Minimized View */}
        {isMinimized && (
          <div className="p-3 text-center">
            <p className="text-lg font-bold text-green-400">
              £{grandTotal.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingPriceSummary;