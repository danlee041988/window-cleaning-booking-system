import React, { useState } from 'react';

// Updated to Semi-Detached and Detached only, with new pricing for Detached
const windowCleaningOptions = [
  // Priced Residential
  // 2-3 Bed
  { id: 'sdh23', type: 'Semi-Detached House', bedrooms: '2-3 Bed', basePrice: 20 },
  { id: 'dh23',  type: 'Detached House',      bedrooms: '2-3 Bed', basePrice: 25 },
  // 4 Bed
  { id: 'sdh4',  type: 'Semi-Detached House', bedrooms: '4 Bed',   basePrice: 25 },
  { id: 'dh4',   type: 'Detached House',      bedrooms: '4 Bed',   basePrice: 35 },
  // 5 Bed
  { id: 'sdh5',  type: 'Semi-Detached House', bedrooms: '5 Bed',   basePrice: 30 },
  { id: 'dh5',   type: 'Detached House',      bedrooms: '5 Bed',   basePrice: 40 },
  // Information Gathering / Custom Quotes
  { id: 'custom6plus', type: 'Properties', bedrooms: '6+ Beds & Bespoke', basePrice: 0, isCustomQuote: true, isResidential: true },
  { id: 'commercial',  type: 'Commercial Property', bedrooms: 'All Types', basePrice: 0, isCommercialQuote: true }
];

// New "Other Services" option for the main grid
const otherServicesOption = {
  id: 'other_services_enquiry',
  type: 'General Enquiry',
  bedrooms: 'Other Services', // Or a more descriptive title like "Gutter, Fascia, etc."
  description: 'Interested in gutter cleaning, fascia & soffit cleaning, conservatory roofs, or other exterior cleaning? Let us know what you need.',
  isGeneralEnquiryCard: true // Special flag for this card type
};

const frequencyOptionsDefinition = [
  { id: '4-weekly', label: '4 Weekly', adjustment: (price) => price, fullLabel: '4 Weekly' },
  { id: '8-weekly', label: '8 Weekly', adjustment: (price) => price + 3, fullLabel: '8 Weekly' },
  { id: '12-weekly', label: '12 Weekly', adjustment: (price) => price + 5, fullLabel: '12 Weekly' },
  { id: 'adhoc', label: 'One-off', adjustment: (price) => price + 20, fullLabel: 'One-off' },
];

const WindowCleaningPricing = ({ goToStep, onFormChange, values }) => {
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
      selectedFrequencyId = isCommercial ? 'commercial_enquiry' : 'custom_quote';
      selectedFrequencyDetails = { 
        fullLabel: isCommercial ? 'Commercial Enquiry' : 'Custom Quote', 
        id: selectedFrequencyId 
      };
      calculatedInitialPrice = clickedOption.basePrice; // Typically 0 for quotes
    } else {
      calculatedInitialPrice = calculatePriceForFrequency(clickedOption.basePrice, selectedFrequencyId);
    }

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
        // Reset fields that might be set if user goes back and changes path
        hasConservatory: false,
        additionalServices: { conservatoryRoof: false, fasciaSoffitGutter: false, gutterClearing: false },
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
        hasConservatory: false,
        additionalServices: { conservatoryRoof: false, fasciaSoffitGutter: false, gutterClearing: false },
        windowCleaningDiscount: 0,
        grandTotal: 0,
        subTotalBeforeDiscount: 0,
        selectedDate: null,
    }));
    goToStep(2); 
  };

  // Dynamically adjust grid columns based on number of options
  // For 8 options: xl:grid-cols-4, lg:grid-cols-3 (will wrap a bit on lg, might need adjustment or keep as 4)
  // Let's try to keep it balanced. If 8 items, 4 columns is good for xl.
  // For smaller screens, it will wrap. md:grid-cols-2 ensures at least two.
  const allDisplayOptions = [...windowCleaningOptions, otherServicesOption];
  const numOptions = allDisplayOptions.length;
  let gridColsClass = 'md:grid-cols-2 lg:grid-cols-3'; // Default
  if (numOptions > 6) { // e.g., for 7 or 8 options, try for 4 on xl
    gridColsClass = 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="container mx-auto p-6">
        {/* Hero Header Section */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-bold mb-4 text-white">
            Professional Window Cleaning
          </h1>
          <h2 className="text-2xl font-semibold mb-6 text-blue-400">
            Instant Quote & Book Online
          </h2>
          <p className="mb-8 text-gray-300 md:text-lg max-w-2xl mx-auto leading-relaxed">
            Select your property type for transparent pricing, or start a commercial enquiry. 
            <span className="text-blue-300 font-medium"> Professional service, guaranteed results.</span>
          </p>
          
          {/* Decorative divider */}
          <div className="flex items-center justify-center mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent w-32"></div>
            <div className="mx-4 w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent w-32"></div>
          </div>
        </div>

      <div className={`grid ${gridColsClass} gap-x-6 gap-y-8`}>
        {allDisplayOptions.map((option) => {
          if (option.isGeneralEnquiryCard) {
            return (
              <div 
                key={option.id} 
                className="group relative bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 p-6 rounded-2xl shadow-xl flex flex-col text-center transition-all duration-500 hover:shadow-2xl hover:scale-105 h-full overflow-hidden"
              >
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 transform rotate-45 translate-x-8 -translate-y-8 transition-transform duration-500 group-hover:scale-110"></div>
                
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 mx-auto">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 h-12">
                    {option.type}
                  </h3>
                  <p className="mb-8 flex-grow text-gray-600 leading-relaxed">
                    {option.description}
                  </p>
                  <button 
                    type="button"
                    onClick={handleOtherServices}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 mt-auto text-lg transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                      </svg>
                      Enquire About Other Services
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
                className={`group relative bg-gradient-to-br from-gray-50 to-white border-2 p-6 rounded-2xl shadow-xl flex flex-col text-center transition-all duration-500 hover:shadow-2xl hover:scale-105 h-full overflow-hidden
                            ${isCommercialCard ? 'border-gray-700 hover:border-blue-500' : 'border-gray-300 hover:border-blue-400'}`}
              >
                {/* Premium badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold 
                                ${isCommercialCard ? 'bg-black text-white' : 'bg-blue-600 text-white'}`}>
                  {isCommercialCard ? 'COMMERCIAL' : 'PREMIUM'}
                </div>
                
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto
                                ${isCommercialCard ? 'bg-gradient-to-br from-gray-700 to-black' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
                  {isCommercialCard ? (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2H8a2 2 0 01-2-2v-2z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-gray-800 h-12">
                  {option.bedrooms === 'All Types' ? option.type : `${option.bedrooms} - ${option.type}`}
                </h3>
                <p className="mb-8 flex-grow text-gray-600 leading-relaxed">
                  {isCommercialCard 
                    ? 'For businesses and commercial properties, please proceed to detail your requirements.'
                    : 'For larger properties or unique requirements, we provide a tailored quote to ensure accurate pricing.'
                  }
                </p>
                <button 
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={`w-full text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 mt-auto text-lg transform hover:scale-105 shadow-lg hover:shadow-xl
                              ${isCommercialCard 
                                ? 'bg-gradient-to-r from-gray-700 to-black hover:from-gray-800 hover:to-gray-900' 
                                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'}`}
                >
                  <span className="flex items-center justify-center">
                    {isCommercialCard ? (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                    )}
                    {isCommercialCard ? 'Commercial Enquiry' : 'Get a Custom Quote'}
                  </span>
                </button>
              </div>
            );
          }

          // Standard priced option card
          return (
            <div 
              key={option.id} 
              className={`group relative bg-white border-2 p-6 rounded-2xl shadow-xl flex flex-col text-center transition-all duration-500 hover:shadow-2xl hover:scale-105 h-full
                          ${globalSelection.optionId === option.id ? 'border-blue-500 ring-4 ring-blue-200 bg-gradient-to-br from-blue-50 to-white' : 'border-gray-300 hover:border-blue-300'}`}
            >
              {/* Property type header with icon */}
              <div className="mb-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto transition-all duration-300
                                ${globalSelection.optionId === option.id ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-gray-600 to-gray-800'}`}>
                  {/* Dynamic icons based on bedroom count */}
                  {option.bedrooms === '2-3 Bed' ? (
                    <div className="flex space-x-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                      </svg>
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                      </svg>
                      <svg className="w-4 h-4 text-white opacity-60" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                      </svg>
                    </div>
                  ) : option.bedrooms === '4 Bed' ? (
                    <div className="grid grid-cols-2 gap-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                      </svg>
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                      </svg>
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                      </svg>
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                      </svg>
                    </div>
                  ) : option.bedrooms === '5 Bed' ? (
                    <div className="flex flex-col space-y-1">
                      <div className="flex space-x-1 justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                        </svg>
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                        </svg>
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                        </svg>
                      </div>
                      <div className="flex space-x-1 justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                        </svg>
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                        </svg>
                      </div>
                    </div>
                  ) : option.bedrooms === '6+ Beds & Bespoke' ? (
                    <div className="flex flex-col items-center">
                      <div className="grid grid-cols-3 gap-1 mb-1">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                        </svg>
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                        </svg>
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                        </svg>
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                        </svg>
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                        </svg>
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                        </svg>
                      </div>
                      <span className="text-white text-lg font-bold">+</span>
                    </div>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                    </svg>
                  )}
                </div>
                <h3 className={`text-2xl font-bold mb-2 h-12 transition-colors duration-300
                                ${globalSelection.optionId === option.id ? 'text-blue-700' : 'text-gray-800'}`}>
                  {`${option.bedrooms} ${option.type}`}
                </h3>
              </div>
              
              {/* Frequency selection grid */}
              <div className="grid grid-cols-2 gap-3 mb-8">
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
                      className={`w-full py-4 px-2 text-sm font-bold rounded-lg border-2 transition-all duration-300 transform hover:scale-105
                                  ${isSelected 
                                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg ring-2 ring-blue-300'
                                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600'}`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wide opacity-75 mb-1">{freq.label}</span>
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
                    className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-300 mt-auto text-lg transform shadow-lg
                                ${isActive 
                                    ? 'bg-gradient-to-r from-black to-gray-800 text-white hover:from-gray-800 hover:to-gray-900 hover:scale-105 hover:shadow-xl' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                    <span className="flex items-center justify-center">
                      {isActive && (
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                      {isActive ? 'Select & Continue' : 'Choose Frequency Above'}
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
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent w-32"></div>
            <div className="mx-4 w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent w-32"></div>
          </div>
          <p className="text-gray-400 text-sm">
            Professional window cleaning services • Fully insured • Satisfaction guaranteed
          </p>
        </div>
      </div>
    </div>
  );
};

export default WindowCleaningPricing; 