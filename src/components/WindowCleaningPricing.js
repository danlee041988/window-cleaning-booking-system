import React, { useState, useEffect } from 'react';

// Updated to Semi-Detached and Detached only, with new pricing for Detached
const windowCleaningOptions = [
  // Priced Residential
  // 2-3 Bed
  { id: 'sdh23', type: 'Semi-Detached House', bedrooms: '2-3 Bed', basePrice: 20 },
  { id: 'dh23',  type: 'Detached House',      bedrooms: '2-3 Bed', basePrice: 25 },
  // 4 Bed
  { id: 'sdh4',  type: 'Semi-Detached House', bedrooms: '4 Bed',   basePrice: 25 },
  { id: 'dh4',   type: 'Detached House',      bedrooms: '4 Bed',   basePrice: 30 },
  // 5 Bed
  { id: 'sdh5',  type: 'Semi-Detached House', bedrooms: '5 Bed',   basePrice: 30 },
  { id: 'dh5',   type: 'Detached House',      bedrooms: '5 Bed',   basePrice: 35 },
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
    const defaultFrequency = frequencyOptionsDefinition.find(f => f.id === '8-weekly');
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
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-3 text-center text-blue-700">Instant Window Cleaning Quote & Book Online</h2>
      <p className="mb-8 text-center text-gray-600 md:text-lg">
        Select your property type, or start a commercial enquiry.
      </p>

      <div className={`grid ${gridColsClass} gap-x-6 gap-y-8`}>
        {allDisplayOptions.map((option) => {
          if (option.isGeneralEnquiryCard) {
            return (
              <div 
                key={option.id} 
                className="border p-5 rounded-xl shadow-lg flex flex-col text-center transition-all duration-300 hover:shadow-2xl bg-teal-50 border-teal-300 hover:border-teal-400 h-full"
              >
                <h3 className="text-xl font-semibold mb-4 text-teal-700 h-12">
                  {option.type}
                </h3>
                <p className="mb-6 flex-grow text-gray-700">
                  {option.description}
                </p>
                <button 
                  type="button"
                  onClick={handleOtherServices}
                  className="w-full text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 mt-auto text-lg bg-teal-500 hover:bg-teal-600"
                >
                  Enquire About Other Services
                </button>
              </div>
            );
          }
          if (option.isCustomQuote || option.isCommercialQuote) {
            const isCommercialCard = !!option.isCommercialQuote;
            return (
              <div 
                key={option.id} 
                className={`border p-5 rounded-xl shadow-lg flex flex-col text-center transition-all duration-300 hover:shadow-2xl h-full
                            ${isCommercialCard ? 'bg-indigo-50 border-indigo-300 hover:border-indigo-400' : 'bg-blue-50 border-blue-300 hover:border-blue-400'}`}
              >
                <h3 className={`text-xl font-semibold mb-4 ${isCommercialCard ? 'text-indigo-700' : 'text-blue-700'} h-12`}>
                  {option.bedrooms === 'All Types' ? option.type : `${option.bedrooms} - ${option.type}`}
                </h3>
                <p className={`mb-6 flex-grow ${isCommercialCard ? 'text-indigo-600' : 'text-gray-700'}`}>
                  {isCommercialCard 
                    ? 'For businesses and commercial properties, please proceed to detail your requirements.'
                    : 'For larger properties or unique requirements, we provide a tailored quote to ensure accurate pricing.'
                  }
                </p>
                <button 
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 mt-auto text-lg 
                              ${isCommercialCard ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                  {isCommercialCard ? 'Commercial Enquiry' : 'Get a Custom Quote'}
                </button>
              </div>
            );
          }

          // Standard priced option card
          return (
            <div 
              key={option.id} 
              className={`border p-5 rounded-xl shadow-lg bg-white flex flex-col text-center transition-all duration-300 hover:shadow-2xl h-full
                          ${globalSelection.optionId === option.id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'}`}
            >
              <h3 className="text-xl font-semibold text-blue-600 mb-4 h-12">{`${option.bedrooms} - ${option.type}`}</h3>
              
              <div className="grid grid-cols-2 gap-2 mb-5">
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
                      className={`w-full py-3 px-1 text-sm font-semibold rounded-md border transition-all duration-150 
                                  ${isSelected 
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-400 ring-offset-1'
                                      : 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 hover:border-gray-400'}`}
                    >
                      {`${freq.label} - £${priceForThisFreqButton}`}
                    </button>
                  );
                })}
              </div>
              
              {(() => {
                const isActive = globalSelection.optionId === option.id && globalSelection.frequencyId !== null;
                return (
                  <button 
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    disabled={!isActive}
                    className={`w-full font-bold py-3 px-4 rounded-lg transition-colors duration-300 mt-auto text-lg 
                                ${isActive 
                                    ? 'bg-green-500 text-white hover:bg-green-600' 
                                    : 'bg-green-200 text-green-400 cursor-not-allowed'}`}
                  >
                    Select & Continue
                  </button>
                );
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WindowCleaningPricing; 