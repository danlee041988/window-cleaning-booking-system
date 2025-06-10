import React, { useState } from 'react';
import * as FORM_CONSTANTS from '../constants/formConstants'; // Import constants

// Updated property options with new structure and pricing
const windowCleaningOptions = [
  // 1-2 Bed Properties (no type distinction)
  { id: FORM_CONSTANTS.SERVICE_ID_1_2_BED, type: '1-2 Bedroom', bedrooms: '1-2 Bed', basePrice: 20 },
  // 3 Bed Properties
  { id: FORM_CONSTANTS.SERVICE_ID_SDH_2_3_BED, type: 'Semi-Detached', bedrooms: '3 Bed', basePrice: 25 },
  { id: FORM_CONSTANTS.SERVICE_ID_DH_2_3_BED,  type: 'Detached',      bedrooms: '3 Bed', basePrice: 30 },
  // 4 Bed Properties  
  { id: FORM_CONSTANTS.SERVICE_ID_SDH_4_BED,  type: 'Semi-Detached', bedrooms: '4 Bed',   basePrice: 30 },
  { id: FORM_CONSTANTS.SERVICE_ID_DH_4_BED,   type: 'Detached',      bedrooms: '4 Bed',   basePrice: 35 },
  // 5 Bed Properties
  { id: FORM_CONSTANTS.SERVICE_ID_SDH_5_BED,  type: 'Semi-Detached', bedrooms: '5 Bed',   basePrice: 35 },
  { id: FORM_CONSTANTS.SERVICE_ID_DH_5_BED,   type: 'Detached',      bedrooms: '5 Bed',   basePrice: 40 },
  // Information Gathering / Custom Quotes
  { id: FORM_CONSTANTS.SERVICE_ID_CUSTOM_6_PLUS_BEDS, type: 'Properties', bedrooms: '6+ Beds & Bespoke', basePrice: 0, isCustomQuote: true, isResidential: true },
  { id: FORM_CONSTANTS.SERVICE_ID_COMMERCIAL,  type: 'Commercial Property', bedrooms: 'All Types', basePrice: 0, isCommercialQuote: true }
];

// New "Other Services" option for the main grid
const otherServicesOption = {
  id: FORM_CONSTANTS.SERVICE_ID_OTHER_SERVICES_ENQUIRY,
  type: 'General Enquiry',
  bedrooms: 'Other Services', // Or a more descriptive title like "Gutter, Fascia, etc."
  description: 'Interested in gutter cleaning, fascia & soffit cleaning, conservatory roofs, or other exterior cleaning? Let us know what you need.',
  isGeneralEnquiryCard: true // Special flag for this card type
};

const frequencyOptionsDefinition = [
  { id: FORM_CONSTANTS.FREQUENCY_ID_4_WEEKLY, label: '4 Weekly', adjustment: (price) => price, fullLabel: '4 Weekly' },
  { id: FORM_CONSTANTS.FREQUENCY_ID_8_WEEKLY, label: '8 Weekly', adjustment: (price) => price + 3, fullLabel: '8 Weekly' },
  { id: FORM_CONSTANTS.FREQUENCY_ID_12_WEEKLY, label: '12 Weekly', adjustment: (price) => price + 5, fullLabel: '12 Weekly' },
  { id: FORM_CONSTANTS.FREQUENCY_ID_ADHOC, label: 'One-off', adjustment: (price) => price + 20, fullLabel: 'One-off' },
];

const WindowCleaningPricing = ({ goToStep, onFormChange }) => {
  const [globalSelection, setGlobalSelection] = useState({
    optionId: null,
    frequencyId: null,
  });

  const calculatePriceForFrequency = (basePrice, frequencyId) => {
    const freq = frequencyOptionsDefinition.find(f => f.id === frequencyId);
    return freq ? freq.adjustment(basePrice) : basePrice;
  };

  const handleFrequencySelection = (optionId, frequencyId) => {
    setGlobalSelection({ optionId, frequencyId });
  };

  const handleSelectOption = (clickedOption) => {
    let calculatedInitialPrice = 0;
    let selectedFrequencyId = globalSelection.frequencyId;
    let selectedFrequencyDetails = frequencyOptionsDefinition.find(f => f.id === selectedFrequencyId);
    let isCustom = !!clickedOption.isCustomQuote;
    let isCommercial = !!clickedOption.isCommercialQuote;
    let isStandardResidential = !isCustom && !isCommercial;

    if (isCustom || isCommercial) {
      selectedFrequencyId = isCommercial ? FORM_CONSTANTS.FREQUENCY_ID_BUSINESS_ENQUIRY : FORM_CONSTANTS.FREQUENCY_ID_CUSTOM_QUOTE;
      selectedFrequencyDetails = { 
        fullLabel: isCommercial ? 'Business Enquiry' : 'Custom Quote', 
        id: selectedFrequencyId 
      };
      calculatedInitialPrice = clickedOption.basePrice; // Typically 0 for quotes
    } else {
      calculatedInitialPrice = calculatePriceForFrequency(clickedOption.basePrice, selectedFrequencyId);
    }

    // Reset fields that might be set if user goes back and changes path
    // Ensure keys in additionalServices match those in initialFormData
    const resetAdditionalServices = {
        [FORM_CONSTANTS.ADDON_CONSERVATORY_ROOF]: false,
        [FORM_CONSTANTS.ADDON_FASCIA_SOFFIT_GUTTER]: false,
        [FORM_CONSTANTS.ADDON_GUTTER_CLEARING]: false,
    };

    onFormChange(prevFormData => ({
        ...prevFormData,
        selectedWindowService: { ...clickedOption, calculatedPrice: calculatedInitialPrice, frequency: selectedFrequencyDetails?.fullLabel || selectedFrequencyId, frequencyId: selectedFrequencyId, isCustomQuote: isCustom, isCommercial: isCommercial },
        propertyType: clickedOption.type,
        bedrooms: clickedOption.bedrooms,
        initialWindowPrice: calculatedInitialPrice, // Use new field name
        selectedFrequency: selectedFrequencyDetails?.fullLabel || selectedFrequencyId,
        isCustomQuote: isCustom,
        isCommercial: isCommercial,
        isResidential: clickedOption.isResidential !== undefined ? !!clickedOption.isResidential : isStandardResidential,
        isGeneralEnquiry: false, // Ensure this is false for standard residential path
        additionalServices: resetAdditionalServices,
        windowCleaningDiscount: 0,
        grandTotal: isStandardResidential ? calculatedInitialPrice : 0, // For standard, grandTotal starts as initialWindowPrice
        subTotalBeforeDiscount: isStandardResidential ? calculatedInitialPrice : 0,
        selectedDate: null, // Reset date if selection changes
    }));

    if (isStandardResidential) {
        goToStep(2); // Go to AdditionalServicesForm
    } else {
        goToStep(3); // Go to PropertyDetailsForm for quotes
    }
  };

  const handleOtherServices = () => {
    const resetAdditionalServices = {
        [FORM_CONSTANTS.ADDON_CONSERVATORY_ROOF]: false,
        [FORM_CONSTANTS.ADDON_FASCIA_SOFFIT_GUTTER]: false,
        [FORM_CONSTANTS.ADDON_GUTTER_CLEARING]: false,
    };
    onFormChange(prevFormData => ({
        ...prevFormData,
        selectedWindowService: null,
        propertyType: '',
        bedrooms: '',
        initialWindowPrice: 0,
        selectedFrequency: '', // Clear frequency for general enquiry
        isCustomQuote: false,
        isCommercial: false,
        isResidential: false, 
        isGeneralEnquiry: true, // Set the new flag
        additionalServices: resetAdditionalServices,
        windowCleaningDiscount: 0,
        grandTotal: 0,
        subTotalBeforeDiscount: 0,
        selectedDate: null,
    }));
    goToStep(2); 
  };

  // All display options for the grid
  const allDisplayOptions = [...windowCleaningOptions, otherServicesOption];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-blue-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Hero Header Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16 pt-6 sm:pt-8 lg:pt-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">
            Professional Window Cleaning
          </h1>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6 text-blue-300">
            Instant Quote & Book Online
          </h2>
          <p className="mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed px-4">
            Select your property type for instant transparent pricing, or start a business enquiry. 
            <span className="text-blue-200 font-medium"> Professional service, guaranteed results</span>
          </p>
          
          {/* Decorative divider */}
          <div className="flex items-center justify-center mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent w-32"></div>
            <div className="mx-4 w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent w-32"></div>
          </div>
        </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8`}>
        {allDisplayOptions.map((option) => {
          if (option.isGeneralEnquiryCard) {
            return (
              <div 
                key={option.id} 
                className="group relative bg-gradient-to-br from-white to-emerald-50 border-2 border-emerald-200 p-3 rounded-2xl shadow-xl flex flex-col text-center transition-all duration-500 hover:shadow-2xl hover:scale-105 h-full overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-2 mx-auto shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2 text-gray-800">
                    {option.type}
                  </h3>
                  <p className="mb-4 flex-grow text-gray-600 text-sm leading-relaxed">
                    {option.description}
                  </p>
                  <button 
                    type="button"
                    onClick={handleOtherServices}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 mt-auto text-base transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-emerald-400"
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                      <span className="font-black">
                        Enquire About Other Services
                      </span>
                    </span>
                  </button>
                </div>
              </div>
            );
          }
          if (option.isCustomQuote || option.isCommercialQuote) {
            const isCommercialCard = !!option.isCommercialQuote;
            return (
              <div 
                key={option.id} 
                className={`group relative p-3 rounded-2xl shadow-xl flex flex-col text-center transition-all duration-500 hover:shadow-2xl hover:scale-105 h-full overflow-hidden
                            ${isCommercialCard 
                              ? 'bg-gradient-to-br from-white to-gray-50 border-2 border-gray-300 hover:border-gray-500' 
                              : 'bg-gradient-to-br from-white to-amber-50 border-2 border-amber-200 hover:border-amber-400'}`}
              >
                
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-2 mx-auto shadow-lg
                                ${isCommercialCard 
                                  ? 'bg-gradient-to-br from-gray-600 to-gray-800' 
                                  : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}>
                  {isCommercialCard ? (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v2h2v-2h2v2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2z"/>
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                  )}
                </div>
                
                <h3 className="text-lg font-bold mb-2 text-gray-800">
                  {option.bedrooms === 'All Types' ? option.type : `${option.bedrooms} - ${option.type}`}
                </h3>
                <p className="mb-4 flex-grow text-gray-600 text-sm leading-relaxed">
                  {isCommercialCard 
                    ? 'Offices, shops, restaurants, and all business premises. Professional service with flexible scheduling to suit your business needs.'
                    : 'For larger properties or unique requirements, we provide a tailored quote to ensure accurate pricing.'
                  }
                </p>
                <button 
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={`w-full text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 mt-auto text-base transform hover:scale-105 shadow-lg hover:shadow-xl border-2
                              ${isCommercialCard 
                                ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 border-gray-500' 
                                : 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 border-amber-500'}`}
                >
                  <span className="flex items-center justify-center">
                    {isCommercialCard ? (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    )}
                    <span className="font-black">
                      {isCommercialCard ? 'Get Commercial Quotation' : 'Get a Custom Quote'}
                    </span>
                  </span>
                </button>
              </div>
            );
          }

          // Standard priced option card
          return (
            <div 
              key={option.id} 
              className={`group relative bg-white border-2 p-3 rounded-2xl shadow-xl flex flex-col text-center transition-all duration-500 hover:shadow-2xl hover:scale-105 h-full
                          ${globalSelection.optionId === option.id ? 'border-blue-500 ring-4 ring-blue-200 bg-gradient-to-br from-blue-50 to-white' : 'border-gray-300 hover:border-blue-300'}`}
            >
              {/* Property type header with icon */}
              <div className="mb-3">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-2 mx-auto transition-all duration-300 shadow-lg
                                ${globalSelection.optionId === option.id ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-slate-600 to-slate-800'}`}>
                  {/* Simple bed icons showing bedroom count */}
                  {option.bedrooms === '1-2 Bed' ? (
                    <div className="flex items-center justify-center">
                      {/* Simple house icon for 1-2 beds */}
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                      </svg>
                    </div>
                  ) : option.bedrooms === '3 Bed' ? (
                    <div className="flex items-center justify-center">
                      {/* House with number 3 */}
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                        <text x="12" y="16" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="bold">3</text>
                      </svg>
                    </div>
                  ) : option.bedrooms === '4 Bed' ? (
                    <div className="flex items-center justify-center">
                      {/* House with number 4 */}
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                        <text x="12" y="16" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="bold">4</text>
                      </svg>
                    </div>
                  ) : option.bedrooms === '5 Bed' ? (
                    <div className="flex items-center justify-center">
                      {/* House with number 5 */}
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                        <text x="12" y="16" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="bold">5</text>
                      </svg>
                    </div>
                  ) : option.bedrooms === '6+ Beds & Bespoke' ? (
                    <div className="flex items-center justify-center">
                      {/* Star icon for premium properties */}
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      {/* Default: house icon */}
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Bedroom count indicator */}
                <div className="flex items-center justify-center mb-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold transition-colors duration-300
                                  ${globalSelection.optionId === option.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {option.bedrooms}
                  </div>
                </div>
                <h3 className={`text-lg font-bold mb-2 transition-colors duration-300
                                ${globalSelection.optionId === option.id ? 'text-blue-700' : 'text-gray-800'}`}>
                  {option.bedrooms === '1-2 Bed' ? '1-2 Bedroom Property' : `${option.bedrooms} ${option.type}`}
                </h3>
              </div>
              
              {/* Frequency selection grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {frequencyOptionsDefinition.map((freq) => {
                  const priceForThisFreqButton = calculatePriceForFrequency(option.basePrice, freq.id);
                  const isSelected = globalSelection.optionId === option.id && globalSelection.frequencyId === freq.id;
                  return (
                    <button
                      key={freq.id}
                      type="button"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleFrequencySelection(option.id, freq.id);
                      }}
                      className={`w-full py-2 px-2 text-sm font-bold rounded-xl border-2 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg
                                  ${isSelected 
                                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-500 shadow-lg ring-2 ring-blue-200'
                                      : 'bg-gradient-to-r from-white to-gray-50 text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:shadow-xl'}`}
                    >
                      <div className="flex flex-col">
                        <span className={`text-xs uppercase tracking-wide mb-1 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                          {freq.label}
                        </span>
                        <span className={`text-lg font-black ${isSelected ? 'text-white' : 'text-blue-600'}`}>
                          £{priceForThisFreqButton}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Select button */}
              {(() => {
                const isActive = globalSelection.optionId === option.id && globalSelection.frequencyId !== null;
                return (
                  <button 
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    disabled={!isActive}
                    className={`w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 mt-auto text-base transform shadow-lg
                                ${isActive 
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-105 hover:shadow-xl border-2 border-blue-500' 
                                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400 cursor-not-allowed border-2 border-gray-300'}`}
                  >
                    <span className="flex items-center justify-center">
                      {isActive && (
                        <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                        </svg>
                      )}
                      <span className="font-black">
                        {isActive ? 'Select & Continue' : 'Choose Frequency Above'}
                      </span>
                    </span>
                  </button>
                );
              })()}
            </div>
          );
        })}
        </div>
        
        {/* Bottom section with decorative elements */}
        <div className="text-center mt-16 pb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent w-32"></div>
            <div className="mx-4 w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent w-32"></div>
          </div>
          <p className="text-gray-300 text-sm">
            Professional window cleaning services • Fully insured • Satisfaction guaranteed
          </p>
        </div>
      </div>
    </div>
  );
};

export default WindowCleaningPricing; 