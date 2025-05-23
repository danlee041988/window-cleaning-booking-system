// Step 2: Additional Services
import React, { useState, useEffect } from 'react';

// Helper function to calculate Gutter Clearing Price (used for NON-general enquiries)
const calculateGutterClearingPrice = (propertyType, bedrooms) => {
    let price = 80; // Default for 2-3 Bed Semi-Detached / Other / or if details unknown

    if (propertyType && bedrooms) {
        const isDetached = propertyType.toLowerCase().includes('detached');
        
        if (bedrooms === '2-3 Bed') {
            price = isDetached ? 100 : 80;
        } else if (bedrooms === '4 Bed') {
            price = isDetached ? 120 : 100; // 100/80 + 20
        } else if (bedrooms === '5 Bed') {
            price = isDetached ? 140 : 120; // 120/100 + 20
        }
        // For '6+ Beds' or other non-standard, it might require a custom quote or a different logic.
        // For now, if it doesn't match these, it defaults to the base £80.
        // Or, we could choose to not offer it/disable if propertyType/bedrooms are not set for standard paths.
    }
    return price;
};

// Define additional service options with their IDs and prices
// Gutter Clearing is now handled separately due to dynamic pricing
// Fascia Soffit Gutter is also now dynamic
const addonServiceDefinitions = [
    // Empty for now, as both gutter-related services are dynamic
    // { id: 'conservatoryRoof', label: 'Conservatory Roof Cleaning', price: 75 }, 
];

// --- Reusable Components (can be moved to a separate file if used elsewhere) ---
const GeneralServiceCheckbox = ({ label, id, checked, onChange }) => (
    <label htmlFor={id} className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
        <input type="checkbox" id={id} checked={checked} onChange={onChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
        <span className="ml-3 text-sm font-medium text-gray-800">{label}</span>
    </label>
);

const TextArea = ({ label, id, value, onChange, placeholder, rows = 3 }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
    </div>
);

const SelectDropdown = ({ label, id, value, onChange, options }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select
            id={id}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
            <option value="">-- Select Frequency --</option>
            {options.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
        </select>
    </div>
);
// --- End of Reusable Components ---

// For the standard (non-general enquiry) path
const ServiceCheckbox = ({ label, name, checked, onChange, price, id, disabled = false, showPrice = true }) => (
    <label htmlFor={id} className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'border-gray-300 hover:bg-gray-50 cursor-pointer'}`}>
        <div className="flex items-center">
            <input type="checkbox" name={name} id={id} checked={checked} onChange={onChange} disabled={disabled} className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
            <span className={`ml-3 text-sm font-medium ${disabled ? 'text-gray-500' : 'text-gray-800'}`}>{label}</span>
        </div>
        {showPrice && !disabled && <span className="text-sm font-semibold text-indigo-600">+ £{price.toFixed(2)}</span>}
        {showPrice && disabled && <span className="text-sm font-semibold text-gray-500">N/A</span>}
    </label>
);

// Options for General Enquiry
const generalServiceOptionsList = [
    { id: 'windowCleaning', label: 'Window Cleaning' },
    { id: 'conservatoryWindows', label: 'Conservatory Windows Only' },
    { id: 'conservatoryRoof', label: 'Conservatory Roof Cleaning' },
    { id: 'gutterClearing', label: 'Gutter Clearing (Interior)' },
    { id: 'fasciaSoffitGutter', label: 'Fascia, Soffit & Gutter Exterior Clean' },
    { id: 'solarPanels', label: 'Solar Panel Cleaning' },
    { id: 'other', label: 'Other (Please specify below)' },
];

const enquiryFrequencyOptionsList = [
    { id: 'oneOff', label: 'One-off' },
    { id: '4weekly', label: '4 Weekly' },
    { id: '8weekly', label: '8 Weekly' },
    { id: '12weekly', label: '12 Weekly' },
    { id: 'asRequired', label: 'As Required / Not Sure' },
];

const AdditionalServicesForm = ({ nextStep, prevStep, values, setFormData, conservatorySurchargeAmount, extensionSurchargeAmount }) => {
    const { 
        initialWindowPrice, 
        additionalServices: currentSelectedAddons, 
        hasConservatory: initialHasConservatory,    
        hasExtension: initialHasExtension,
        propertyType, bedrooms, selectedFrequency, 
        isGeneralEnquiry,
        generalEnquiryDetails: initialGeneralEnquiryDetails 
    } = values;

    // --- State for Standard Path ---
    const [hasCons, setHasCons] = useState(initialHasConservatory || false);
    const [hasExt, setHasExt] = useState(initialHasExtension || false);
    const [selectedAddons, setSelectedAddons] = useState(currentSelectedAddons || { gutterClearing: false, fasciaSoffitGutter: false });
    const [currentWindowPriceWithSurcharges, setCurrentWindowPriceWithSurcharges] = useState(0);
    const [addonServicesTotalPrice, setAddonServicesTotalPrice] = useState(0);
    const [calculatedDiscount, setCalculatedDiscount] = useState(0);
    const [finalGrandTotal, setFinalGrandTotal] = useState(0);
    
    // --- State for General Enquiry Path ---
    const [genEnqServices, setGenEnqServices] = useState(initialGeneralEnquiryDetails?.requestedServices || {
        windowCleaning: false, conservatoryWindows: false, conservatoryRoof: false, gutterClearing: false,
        fasciaSoffitGutter: false, solarPanels: false, other: false,
    });
    const [genEnqOtherText, setGenEnqOtherText] = useState(initialGeneralEnquiryDetails?.otherServiceText || '');
    const [genEnqFrequency, setGenEnqFrequency] = useState(initialGeneralEnquiryDetails?.requestedFrequency || '');
    const [genEnqComments, setGenEnqComments] = useState(initialGeneralEnquiryDetails?.enquiryComments || '');

    // Dynamic prices for standard path
    const gutterClearingPrice = !isGeneralEnquiry ? calculateGutterClearingPrice(propertyType, bedrooms) : 0;
    const fasciaSoffitGutterPrice = !isGeneralEnquiry ? gutterClearingPrice + 20 : 0;
    const canOfferGutterServices = !isGeneralEnquiry && (values.isResidential || initialWindowPrice === 0);

    useEffect(() => {
        if (!isGeneralEnquiry) {
            let basePrice = initialWindowPrice || 0;
            let currentConservatorySurcharge = 0;
            let currentExtensionSurcharge = 0;

            if (hasCons) {
                currentConservatorySurcharge = conservatorySurchargeAmount;
            }
            if (hasExt) {
                currentExtensionSurcharge = extensionSurchargeAmount;
            }

            const windowPriceWithAllSurcharges = basePrice + currentConservatorySurcharge + currentExtensionSurcharge;
            setCurrentWindowPriceWithSurcharges(windowPriceWithAllSurcharges);

            let currentAddonsPrice = 0;
            if (selectedAddons.gutterClearing && canOfferGutterServices) currentAddonsPrice += gutterClearingPrice;
            if (selectedAddons.fasciaSoffitGutter && canOfferGutterServices) currentAddonsPrice += fasciaSoffitGutterPrice;
            addonServiceDefinitions.forEach(service => {
                if (selectedAddons[service.id]) currentAddonsPrice += service.price;
            });
            setAddonServicesTotalPrice(currentAddonsPrice);

            const gutterClearSelected = !!selectedAddons.gutterClearing && canOfferGutterServices;
            const fasciaSoffitSelected = !!selectedAddons.fasciaSoffitGutter && canOfferGutterServices;
            let discount = 0;
            if (gutterClearSelected && fasciaSoffitSelected && windowPriceWithAllSurcharges > 0 && selectedFrequency !== 'adhoc') {
                discount = basePrice;
            }
            setCalculatedDiscount(discount);
            
            const total = windowPriceWithAllSurcharges + currentAddonsPrice - discount;
            setFinalGrandTotal(total);
        }
    }, [
        isGeneralEnquiry, initialWindowPrice, hasCons, hasExt, selectedAddons, conservatorySurchargeAmount, extensionSurchargeAmount, 
        gutterClearingPrice, fasciaSoffitGutterPrice, canOfferGutterServices, selectedFrequency
    ]);

    // --- Handlers for Standard Path ---
    const handleExtensionToggle = () => setHasExt(!hasExt);
    const handleStandardAddonToggle = (serviceId) => {
        if (!canOfferGutterServices && (serviceId === 'gutterClearing' || serviceId === 'fasciaSoffitGutter')) return;
        setSelectedAddons(prev => ({ ...prev, [serviceId]: !prev[serviceId] }));
    };

    // --- Handlers for General Enquiry Path ---
    const handleGenEnqServiceToggle = (serviceId) => {
        setGenEnqServices(prevServices => {
            const newServices = { ...prevServices, [serviceId]: !prevServices[serviceId] };
            // If window cleaning is deselected, reset its frequency
            if (serviceId === 'windowCleaning' && !newServices.windowCleaning) {
                setGenEnqFrequency(''); // Reset frequency state
            }
            return newServices;
        });
    };

    const continueStep = (e) => {
        e.preventDefault();
        if (isGeneralEnquiry) {
            const finalGenEnqFrequency = genEnqServices.windowCleaning ? genEnqFrequency : '';
            setFormData(prevData => ({
                ...prevData,
                generalEnquiryDetails: {
                    requestedServices: genEnqServices,
                    otherServiceText: genEnqOtherText,
                    requestedFrequency: finalGenEnqFrequency,
                    enquiryComments: genEnqComments,
                },
                // Reset standard path fields to avoid data confusion
                hasConservatory: false,
                hasExtension: false,
                additionalServices: { gutterClearing: false, fasciaSoffitGutter: false, conservatoryRoof: false }, // Ensure conservatoryRoof is also reset
                gutterClearingServicePrice: 0, // Reset
                fasciaSoffitGutterServicePrice: 0, // Reset
                windowCleaningDiscount: 0, 
                subTotalBeforeDiscount: 0, 
                grandTotal: 0, 
                initialWindowPrice: 0 
            }));
        } else {
            const finalSelectedAddons = { ...selectedAddons };
            if (!canOfferGutterServices) {
                finalSelectedAddons.gutterClearing = false;
                finalSelectedAddons.fasciaSoffitGutter = false;
            }

            setFormData(prevData => ({
                ...prevData,
                hasConservatory: hasCons,
                hasExtension: hasExt,
                conservatorySurcharge: hasCons ? conservatorySurchargeAmount : 0,
                extensionSurcharge: hasExt ? extensionSurchargeAmount : 0,
                additionalServices: finalSelectedAddons, 
                gutterClearingServicePrice: (finalSelectedAddons.gutterClearing && canOfferGutterServices) ? gutterClearingPrice : 0,
                fasciaSoffitGutterServicePrice: (finalSelectedAddons.fasciaSoffitGutter && canOfferGutterServices) ? fasciaSoffitGutterPrice : 0,
                windowCleaningDiscount: calculatedDiscount,
                subTotalBeforeDiscount: currentWindowPriceWithSurcharges + addonServicesTotalPrice, 
                grandTotal: finalGrandTotal,
                initialWindowPrice: initialWindowPrice || 0 
            }));
        }
        nextStep();
    };

    if (isGeneralEnquiry) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
                <div className="container mx-auto px-6 py-12">
                    <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl p-8 border border-gray-700">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-white mb-4">Tell Us What You Need</h2>
                            <p className="text-blue-300 text-lg mb-6">
                                Select the services you're interested in and we'll provide a tailored quote
                            </p>
                            
                            {/* Decorative divider */}
                            <div className="flex items-center justify-center">
                                <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent w-32"></div>
                                <div className="mx-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent w-32"></div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Services Selection */}
                            <div>
                                <h3 className="text-2xl font-semibold text-gray-200 mb-6">Which services interest you?</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {generalServiceOptionsList.map(service => (
                                        <label 
                                            key={service.id}
                                            htmlFor={`gen-enq-${service.id}`} 
                                            className="flex items-center p-4 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 hover:border-blue-500 cursor-pointer transition-all duration-200 group"
                                        >
                                            <input 
                                                type="checkbox" 
                                                id={`gen-enq-${service.id}`} 
                                                checked={genEnqServices[service.id] || false} 
                                                onChange={() => handleGenEnqServiceToggle(service.id)} 
                                                className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 transition duration-150 ease-in-out" 
                                            />
                                            <span className="ml-3 text-gray-200 font-medium group-hover:text-blue-300 transition-colors">{service.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Other Service Details */}
                            {genEnqServices.other && (
                                <div>
                                    <label htmlFor="gen-enq-other-text" className="block text-lg font-semibold text-gray-200 mb-3">Please specify 'Other' service details:</label>
                                    <textarea
                                        id="gen-enq-other-text"
                                        value={genEnqOtherText}
                                        onChange={(e) => setGenEnqOtherText(e.target.value)}
                                        placeholder="e.g., Solar panel cleaning, pressure washing, specific area cleaning..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500 resize-vertical"
                                    />
                                </div>
                            )}

                            {/* Frequency Selection */}
                            {genEnqServices.windowCleaning && (
                                <div>
                                    <label htmlFor="gen-enq-frequency" className="block text-lg font-semibold text-gray-200 mb-3">Preferred Window Cleaning Frequency:</label>
                                    <select
                                        id="gen-enq-frequency"
                                        value={genEnqFrequency}
                                        onChange={(e) => setGenEnqFrequency(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500"
                                    >
                                        <option value="">-- Select Frequency --</option>
                                        {enquiryFrequencyOptionsList.map(opt => (
                                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Enhanced Comments Section */}
                            <div>
                                <label htmlFor="genEnqComments" className="block text-lg font-semibold text-gray-200 mb-3">
                                    Tell us more about your requirements (Optional)
                                </label>
                                <p className="text-sm text-gray-400 mb-4">
                                    The more details you provide, the better we can tailor our response to your needs:
                                </p>
                                
                                <div className="mb-4 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                                    <p className="text-sm text-blue-300 font-semibold mb-3">💡 Helpful information to include:</p>
                                    <ul className="text-sm text-blue-200 space-y-2">
                                        <li>• Property details (type, size, number of windows)</li>
                                        <li>• Access arrangements (gates, parking, keys)</li>
                                        <li>• Preferred contact method</li>
                                        <li>• Any urgent requirements or deadlines</li>
                                        <li>• Previous cleaning experiences or preferences</li>
                                        <li>• Budget considerations or price expectations</li>
                                    </ul>
                                </div>

                                <textarea
                                    id="genEnqComments"
                                    value={genEnqComments}
                                    onChange={(e) => setGenEnqComments(e.target.value)}
                                    placeholder="Example: I have a 3-bedroom semi-detached house on a main road, so windows get quite dirty. Interested in regular window cleaning every 6-8 weeks and one-off gutter clearing. Property has side access but gate is locked - happy to provide key. Best contacted via mobile during weekday evenings."
                                    rows={5}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-500 resize-vertical"
                                    style={{ minHeight: '120px' }}
                                />
                                
                                <p className="text-sm text-gray-400 mt-3">
                                    This helps us provide the best service response possible.
                                </p>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="mt-12 flex justify-between items-center">
                            <button 
                                onClick={prevStep} 
                                className="px-8 py-3 border-2 border-gray-600 rounded-lg text-sm font-semibold text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            >
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                    Back
                                </span>
                            </button>
                            <button 
                                onClick={continueStep} 
                                className="px-8 py-3 border-2 border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                            >
                                <span className="flex items-center">
                                    Next: Your Contact Details
                                    <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Standard Path (Non-General Enquiry)
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
            <div className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl p-8 border border-gray-700">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-white mb-4">Enhance Your Service</h2>
                        <p className="text-blue-300 text-lg mb-6">
                            Add extra services and save with our exclusive bundle offers
                        </p>
                        
                        {/* Decorative divider */}
                        <div className="flex items-center justify-center">
                            <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent w-32"></div>
                            <div className="mx-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent w-32"></div>
                        </div>
                    </div>

                    {/* Selected Service Summary */}
                    {propertyType && bedrooms && initialWindowPrice > 0 && ( 
                        <div className="mb-8 p-6 border-2 border-blue-600 rounded-lg bg-gradient-to-r from-blue-900/30 to-blue-800/30">
                            <div className="flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <h3 className="text-xl font-semibold text-blue-300">Your Selected Window Cleaning Service</h3>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-200 text-lg">
                                    <strong className="text-white">{`${propertyType} - ${bedrooms}`}</strong>
                                </p>
                                <p className="text-blue-300 font-semibold text-xl">
                                    {selectedFrequency} cleaning: <span className="text-green-400">£{(initialWindowPrice || 0).toFixed(2)}</span>
                                </p>
                            </div>
                        </div>
                    )}
                    
                    {initialWindowPrice === 0 && values.selectedWindowService === null && (
                         <div className="mb-8 p-6 border border-yellow-600 rounded-lg bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 text-center">
                            <p className="text-yellow-200">
                                You can select additional services below. If you also want window cleaning, please go 
                                <button type="button" onClick={prevStep} className="text-yellow-400 underline hover:text-yellow-300 mx-1 font-semibold">
                                    back
                                </button> 
                                to select a property type.
                            </p>
                        </div>
                    )}

                    <div className="space-y-6 mb-10">
                        {/* Property Features */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Conservatory Question */}
                            <div className="bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-blue-300 mb-2">
                                    Do you have a conservatory?
                                </h3>
                                <p className="text-sm text-gray-400 mb-4">We charge an additional £5 to clean conservatory windows as part of your window cleaning service</p>
                                <div className="flex items-center space-x-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setHasCons(true)} 
                                        className={`px-6 py-3 rounded-lg text-sm font-semibold border-2 transition-all duration-200 ${hasCons ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg' : 'bg-gray-800 text-gray-200 border-gray-600 hover:border-blue-500 hover:text-blue-300'}`}
                                    >
                                        Yes
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setHasCons(false)} 
                                        className={`px-6 py-3 rounded-lg text-sm font-semibold border-2 transition-all duration-200 ${!hasCons ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg' : 'bg-gray-800 text-gray-200 border-gray-600 hover:border-blue-500 hover:text-blue-300'}`}
                                    >
                                        No
                                    </button>
                                </div>
                                {hasCons && (
                                    <div className="mt-3 p-3 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-600 rounded-lg">
                                        <p className="text-yellow-300 text-sm font-medium">
                                            +£{conservatorySurchargeAmount.toFixed(2)} surcharge for conservatory window cleaning
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Extension Question */}
                            <div className="bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-blue-300 mb-2">Property Extension?</h3>
                                <p className="text-sm text-gray-400 mb-4">Additional charge for properties with extensions due to extra windows</p>
                                <div className="flex items-center space-x-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setHasExt(true)} 
                                        className={`px-6 py-3 rounded-lg text-sm font-semibold border-2 transition-all duration-200 ${hasExt ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg' : 'bg-gray-800 text-gray-200 border-gray-600 hover:border-blue-500 hover:text-blue-300'}`}
                                    >
                                        Yes
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setHasExt(false)} 
                                        className={`px-6 py-3 rounded-lg text-sm font-semibold border-2 transition-all duration-200 ${!hasExt ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg' : 'bg-gray-800 text-gray-200 border-gray-600 hover:border-blue-500 hover:text-blue-300'}`}
                                    >
                                        No
                                    </button>
                                </div>
                                {hasExt && (
                                    <div className="mt-3 p-3 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-600 rounded-lg">
                                        <p className="text-yellow-300 text-sm font-medium">
                                            +£{extensionSurchargeAmount.toFixed(2)} surcharge for extension properties
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Services */}
                        <div className="bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 rounded-lg p-6">
                            <div className="flex items-center mb-6">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                                <h3 className="text-2xl font-semibold text-blue-300">Additional Services</h3>
                            </div>

                            {/* Special Offer Notice */}
                            {( (initialWindowPrice > 0 || (hasCons && conservatorySurchargeAmount > 0)) && canOfferGutterServices ) && (
                                <div className="mb-6 p-5 bg-gradient-to-r from-yellow-500 via-red-500 to-pink-500 border-2 border-white rounded-lg shadow-2xl">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center mb-3">
                                            {/* Using a gift icon for "FREE" */}
                                            <svg className="w-8 h-8 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4l7 7 7-7M5 12h14"></path>
                                            </svg>
                                            <span className="text-2xl font-bold text-white drop-shadow-md">🎉 FREE WINDOW CLEAN OFFER 🎉</span>
                                        </div>
                                        <p className="text-white text-md font-semibold">
                                            Select <strong>both</strong> Gutter Clearing (Internal) and Gutter, Fascia & Soffit Cleaning (External) below,
                                        </p>
                                        <p className="text-white text-md font-semibold">
                                            and get your <strong className="underline">entire window cleaning service absolutely FREE!</strong>
                                        </p>
                                        <p className="text-yellow-200 text-sm mt-2">
                                            (This includes your standard window clean, plus any conservatory and extension surcharges!)
                                        </p>
                                    </div>
                                </div>
                            )}
                                
                            {/* Service Options */}
                            <div className="space-y-6">
                                {/* Gutter Clearing */}
                                <label className={`block p-6 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                                    selectedAddons.gutterClearing && canOfferGutterServices
                                        ? 'bg-green-700 border-green-500 shadow-lg transform scale-105' 
                                        : canOfferGutterServices 
                                            ? 'bg-gray-700 border-gray-600 hover:border-green-500 hover:bg-green-800/20' 
                                            : 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input 
                                                type="checkbox" 
                                                id="addon-gutterClearing"
                                                checked={!!selectedAddons.gutterClearing && canOfferGutterServices}
                                                onChange={() => handleStandardAddonToggle('gutterClearing')}
                                                disabled={!canOfferGutterServices}
                                                className="h-5 w-5 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2" 
                                            />
                                            <div className="ml-4">
                                                <span className="text-lg font-semibold text-white">Gutter Clearing (Internal)</span>
                                                <p className="text-sm text-gray-300 mt-1">Removes leaves, moss, and debris from inside your gutters, ensuring proper water drainage.</p>
                                            </div>
                                        </div>
                                        {canOfferGutterServices ? (
                                            <span className="text-2xl font-bold text-green-400">£{gutterClearingPrice.toFixed(2)}</span>
                                        ) : (
                                            <span className="text-sm text-gray-500">N/A</span>
                                        )}
                                    </div>
                                    {!canOfferGutterServices && (
                                        <p className="text-sm text-gray-500 mt-2">Requires property details from Step 1 for pricing</p>
                                    )}
                                </label>

                                {/* Fascia Soffit Gutter */}
                                <label className={`block p-6 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                                    selectedAddons.fasciaSoffitGutter && canOfferGutterServices
                                        ? 'bg-green-700 border-green-500 shadow-lg transform scale-105' 
                                        : canOfferGutterServices 
                                            ? 'bg-gray-700 border-gray-600 hover:border-green-500 hover:bg-green-800/20' 
                                            : 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input 
                                                type="checkbox" 
                                                id="addon-fasciaSoffitGutter"
                                                checked={!!selectedAddons.fasciaSoffitGutter && canOfferGutterServices}
                                                onChange={() => handleStandardAddonToggle('fasciaSoffitGutter')}
                                                disabled={!canOfferGutterServices}
                                                className="h-5 w-5 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2" 
                                            />
                                            <div className="ml-4">
                                                <span className="text-lg font-semibold text-white">Gutter, Fascia & Soffit Cleaning (External)</span>
                                                <p className="text-sm text-gray-300 mt-1">Professional cleaning of the external surfaces of gutters, fascia, and soffits, enhancing the visual appearance of your home from the ground.</p>
                                            </div>
                                        </div>
                                        {canOfferGutterServices ? (
                                            <span className="text-2xl font-bold text-green-400">£{fasciaSoffitGutterPrice.toFixed(2)}</span>
                                        ) : (
                                            <span className="text-sm text-gray-500">N/A</span>
                                        )}
                                    </div>
                                    {!canOfferGutterServices && (
                                        <p className="text-sm text-gray-500 mt-2">Linked to property details from Step 1</p>
                                    )}
                                </label>
                            </div>
                        </div>

                        {/* Quote Request Services */}
                        <div className="bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 rounded-lg p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                <h3 className="text-xl font-semibold text-purple-300">Request Physical Quote</h3>
                            </div>
                            <p className="text-gray-400 text-sm mb-6">
                                The following services require an in-person assessment for accurate pricing. We'll include a quote for any selected services in our response.
                            </p>
                            
                            <div className="space-y-4">
                                {/* Solar Panel Cleaning Quote */}
                                <label className="flex items-start p-4 bg-gray-700/50 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700/70 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        className="h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2 mt-0.5" 
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            quoteRequests: {
                                                ...prev.quoteRequests,
                                                solarPanelCleaning: e.target.checked
                                            }
                                        }))}
                                        checked={values.quoteRequests?.solarPanelCleaning || false}
                                    />
                                    <div className="ml-3">
                                        <span className="text-white font-medium">Solar Panel Cleaning</span>
                                        <p className="text-gray-400 text-sm mt-1">Professional cleaning to maintain optimal solar panel efficiency</p>
                                    </div>
                                </label>

                                {/* Conservatory Roof Cleaning Quote */}
                                <label className="flex items-start p-4 bg-gray-700/50 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700/70 transition-colors">
                                    <input 
                                        type="checkbox" 
                                        className="h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2 mt-0.5" 
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            quoteRequests: {
                                                ...prev.quoteRequests,
                                                conservatoryRoofCleaning: e.target.checked
                                            }
                                        }))}
                                        checked={values.quoteRequests?.conservatoryRoofCleaning || false}
                                    />
                                    <div className="ml-3">
                                        <span className="text-white font-medium">Conservatory Roof Cleaning</span>
                                        <p className="text-gray-400 text-sm mt-1">Exterior cleaning of glass or polycarbonate conservatory roofing</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
            
                    {/* ENHANCED PRICE CALCULATION */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 rounded-lg">
                        <h3 className="text-2xl font-semibold text-white mb-6 text-center">
                            <span className="flex items-center justify-center">
                                <svg className="w-6 h-6 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                                </svg>
                                Price Breakdown
                            </span>
                        </h3>
                        
                        <div className="space-y-3">
                            {(initialWindowPrice > 0 || hasCons) && ( 
                                <>
                                    <div className="flex justify-between text-gray-200 text-lg">
                                        <span>Window Cleaning ({selectedFrequency || 'N/A'}):</span>
                                        <span className="text-blue-300 font-semibold">£{(initialWindowPrice || 0).toFixed(2)}</span>
                                    </div>
                                    {hasCons && (
                                        <div className="flex justify-between text-gray-200">
                                            <span>Conservatory Surcharge:</span>
                                            <span className="text-yellow-300 font-semibold">+ £{conservatorySurchargeAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {hasExt && (
                                        <div className="flex justify-between text-gray-200">
                                            <span>Extension Surcharge:</span>
                                            <span className="text-yellow-300 font-semibold">+ £{extensionSurchargeAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-semibold border-b border-gray-500 pb-2 mb-3">
                                        <span className="text-blue-300">Sub-total (Windows):</span>
                                        <span className="text-blue-300">£{currentWindowPriceWithSurcharges.toFixed(2)}</span>
                                    </div>
                                </>
                            )}

                            {(selectedAddons.gutterClearing && canOfferGutterServices) && (
                                <div className="flex justify-between text-gray-200">
                                    <span>Gutter Clearing (Internal):</span>
                                    <span className="text-green-300 font-semibold">+ £{gutterClearingPrice.toFixed(2)}</span>
                                </div>
                            )}
                            {(selectedAddons.fasciaSoffitGutter && canOfferGutterServices) && (
                                <div className="flex justify-between text-gray-200">
                                    <span>Gutter, Fascia & Soffit Cleaning (External):</span>
                                    <span className="text-green-300 font-semibold">+ £{fasciaSoffitGutterPrice.toFixed(2)}</span>
                                </div>
                            )}
                            {addonServiceDefinitions.map(service => selectedAddons[service.id] && (
                                <div key={`summary-${service.id}`} className="flex justify-between text-gray-200">
                                    <span>{service.label}:</span>
                                    <span className="text-green-300 font-semibold">+ £{service.price.toFixed(2)}</span>
                                </div>
                            ))}
                            
                            {addonServicesTotalPrice > 0 && (
                                 <div className="flex justify-between text-lg font-semibold border-b border-gray-500 pb-2 mb-3">
                                    <span className="text-green-300">Sub-total (Add-ons):</span>
                                    <span className="text-green-300">£{addonServicesTotalPrice.toFixed(2)}</span>
                                </div>
                            )}

                            {calculatedDiscount > 0 && (
                                <div className="flex justify-between text-lg font-bold text-green-400 bg-green-900/30 border border-green-600 rounded p-3">
                                    <span>🎉 Gutter Bundle Discount (Free Window Cleaning):</span>
                                    <span>- £{calculatedDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            
                            <div className="flex justify-between text-2xl font-bold pt-4 border-t-2 border-blue-500">
                                <span className="text-white">Total Estimated Price:</span>
                                <span className="text-green-400">£{finalGrandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-12 flex justify-between items-center">
                        <button 
                            onClick={prevStep} 
                            className="px-8 py-3 border-2 border-gray-600 rounded-lg text-sm font-semibold text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        >
                            <span className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                                Back
                            </span>
                        </button>
                        <button 
                            onClick={continueStep} 
                            className="px-8 py-3 border-2 border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                        >
                            <span className="flex items-center">
                                Next: Your Details
                                <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </span>
                        </button>
                    </div>

                    {/* Professional Footer Note */}
                    <div className="mt-8 pt-6 border-t border-gray-600 text-center">
                        <p className="text-sm text-gray-400 leading-relaxed">
                            All prices shown are based on standard property sizes and conditions. If your property is significantly larger than average for its type, we will let you know of any price increase before we start any work.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdditionalServicesForm;
