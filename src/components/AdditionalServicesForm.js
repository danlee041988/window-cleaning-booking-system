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

const AdditionalServicesForm = ({ nextStep, prevStep, values, setFormData, conservatorySurcharge }) => {
    const { 
        initialWindowPrice, 
        additionalServices: currentSelectedAddons, // Used for standard path
        hasConservatory: initialHasConservatory,    // Used for standard path
        propertyType, bedrooms, selectedFrequency, 
        isGeneralEnquiry,
        generalEnquiryDetails: initialGeneralEnquiryDetails // New
    } = values;

    // --- State for Standard Path ---
    const [hasCons, setHasCons] = useState(initialHasConservatory || false);
    const [selectedAddons, setSelectedAddons] = useState(currentSelectedAddons || { gutterClearing: false, fasciaSoffitGutter: false });
    const [currentWindowPriceWithSurcharge, setCurrentWindowPriceWithSurcharge] = useState(0);
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
            const windowPriceWithSurcharge = (initialWindowPrice || 0) + (hasCons ? conservatorySurcharge : 0);
            setCurrentWindowPriceWithSurcharge(windowPriceWithSurcharge);

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
            if (gutterClearSelected && fasciaSoffitSelected && windowPriceWithSurcharge > 0) {
                discount = windowPriceWithSurcharge;
            }
            setCalculatedDiscount(discount);
            
            const total = windowPriceWithSurcharge + currentAddonsPrice - discount;
            setFinalGrandTotal(total);
        }
    }, [
        isGeneralEnquiry, initialWindowPrice, hasCons, selectedAddons, conservatorySurcharge, 
        gutterClearingPrice, fasciaSoffitGutterPrice, canOfferGutterServices
    ]);

    // --- Handlers for Standard Path ---
    const handleConservatoryToggle = () => setHasCons(!hasCons);
    const handleStandardAddonToggle = (serviceId) => { // Renamed to avoid clash
        if (!canOfferGutterServices && (serviceId === 'gutterClearing' || serviceId === 'fasciaSoffitGutter')) return;
        setSelectedAddons(prev => ({ ...prev, [serviceId]: !prev[serviceId] }));
    };

    // --- Handlers for General Enquiry Path ---
    const handleGenEnqServiceToggle = (serviceId) => {
        setGenEnqServices(prev => ({ ...prev, [serviceId]: !prev[serviceId] }));
    };

    const continueStep = (e) => {
        e.preventDefault();
        if (isGeneralEnquiry) {
            setFormData(prevData => ({
                ...prevData,
                generalEnquiryDetails: {
                    requestedServices: genEnqServices,
                    otherServiceText: genEnqOtherText,
                    requestedFrequency: genEnqFrequency,
                    enquiryComments: genEnqComments,
                },
                // Reset standard path fields to avoid data confusion
                hasConservatory: false,
                additionalServices: { gutterClearing: false, fasciaSoffitGutter: false },
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
                additionalServices: finalSelectedAddons, 
                windowCleaningDiscount: calculatedDiscount,
                subTotalBeforeDiscount: currentWindowPriceWithSurcharge + addonServicesTotalPrice, 
                grandTotal: finalGrandTotal,
                initialWindowPrice: initialWindowPrice || 0 
            }));
        }
        nextStep();
    };

    if (isGeneralEnquiry) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-2xl bg-white shadow-xl rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Services You're Interested In</h2>
                <p className="text-sm text-gray-600 mb-6 text-center">
                    Please let us know which services you'd like a quote for, your preferred frequency, and any other details. We'll be in touch to discuss your needs.
                </p>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Select Services:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {generalServiceOptionsList.map(service => (
                                <GeneralServiceCheckbox
                                    key={service.id}
                                    id={`gen-enq-${service.id}`}
                                    label={service.label}
                                    checked={genEnqServices[service.id] || false}
                                    onChange={() => handleGenEnqServiceToggle(service.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {genEnqServices.other && (
                        <TextArea
                            label="Please specify other service(s):"
                            id="genEnqOtherText"
                            value={genEnqOtherText}
                            onChange={(e) => setGenEnqOtherText(e.target.value)}
                            placeholder="e.g., Patio cleaning, Driveway jet washing"
                        />
                    )}

                    <SelectDropdown
                        label="Preferred Frequency:"
                        id="genEnqFrequency"
                        value={genEnqFrequency}
                        onChange={(e) => setGenEnqFrequency(e.target.value)}
                        options={enquiryFrequencyOptionsList}
                    />

                    <TextArea
                        label="Additional Details / Comments:"
                        id="genEnqComments"
                        value={genEnqComments}
                        onChange={(e) => setGenEnqComments(e.target.value)}
                        placeholder="Any specific requirements, access notes, or questions?"
                        rows={4}
                    />
                </div>

                <div className="mt-10 flex justify-between">
                    <button onClick={prevStep} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Back</button>
                    <button onClick={continueStep} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Next: Your Contact Details</button>
                </div>
            </div>
        );
    }

    // Standard Path (Non-General Enquiry)
    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl bg-white shadow-xl rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">Step 2: Add Optional Services</h2>
            
            {propertyType && bedrooms && initialWindowPrice > 0 && ( 
                <div className="mb-6 p-3 border border-indigo-100 rounded-md bg-indigo-50 text-sm">
                    <p>Selected Window Cleaning: <strong>{`${propertyType} - ${bedrooms}`}</strong></p>
                    <p>Base Price (for {selectedFrequency}): <strong>£{(initialWindowPrice || 0).toFixed(2)}</strong></p>
                </div>
            )}
            {initialWindowPrice === 0 && values.selectedWindowService === null && (
                 <div className="mb-6 p-3 border border-blue-100 rounded-md bg-blue-50 text-sm text-center">
                    <p>You can select additional services below. If you also want window cleaning, please go <button type="button" onClick={prevStep} className="text-blue-600 underline hover:text-blue-800">back</button> to select a property type.</p>
                </div>
            )}

            <div className="space-y-5 mb-8">
                <label htmlFor="hasConservatoryCheckbox" className="flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center">
                        <input type="checkbox" id="hasConservatoryCheckbox" name="hasConservatory" checked={hasCons} onChange={handleConservatoryToggle} className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                        <span className="ml-3 text-sm font-medium text-gray-800">Property has a conservatory? 
                            <span className="text-xs text-gray-500">(windows included in main clean)</span>
                        </span>
                    </div>
                    <span className="text-sm font-semibold text-indigo-600">+ £{conservatorySurcharge.toFixed(2)}</span>
                </label>

                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-1">Gutter Related Services</h3>
                    {( (initialWindowPrice > 0 || (hasCons && conservatorySurcharge > 0)) && canOfferGutterServices ) && 
                        <p className="text-xs text-green-600 bg-green-50 p-2 rounded-md mb-3">
                            <strong>OFFER:</strong> Select Gutter Clearing & Fascia/Soffit Clean and get your window cleaning (incl. conservatory surcharge) <strong>FREE!</strong>
                        </p>
                    }
                    
                    <div className="mt-3">
                        <ServiceCheckbox
                            id="addon-gutterClearing"
                            label="Gutter Clearing (Interior)"
                            name="additionalServices.gutterClearing"
                            checked={!!selectedAddons.gutterClearing && canOfferGutterServices}
                            onChange={() => handleStandardAddonToggle('gutterClearing')}
                            price={gutterClearingPrice}
                            disabled={!canOfferGutterServices}
                            showPrice={true}
                        />
                        <p className="text-xs text-gray-500 mt-1 ml-8 pr-2">Clears all leaves, moss, and debris from the inside of your gutters, ensuring proper water flow and preventing blockages.</p>
                         {!canOfferGutterServices && <p className="text-xs text-gray-500 mt-1 ml-1">Gutter service pricing requires property details from Step 1 for an accurate price.</p>}
                    </div>

                    <div className="mt-3">
                        <ServiceCheckbox
                            id="addon-fasciaSoffitGutter"
                            label="Fascia, Soffit & Gutter Exterior Clean"
                            name="additionalServices.fasciaSoffitGutter"
                            checked={!!selectedAddons.fasciaSoffitGutter && canOfferGutterServices}
                            onChange={() => handleStandardAddonToggle('fasciaSoffitGutter')}
                            price={fasciaSoffitGutterPrice}
                            disabled={!canOfferGutterServices}
                            showPrice={true}
                        />
                        <p className="text-xs text-gray-500 mt-1 ml-8 pr-2">Restores the external appearance of your UPVC fascias, soffits, and guttering by cleaning away dirt, grime, and algae, enhancing your home's curb appeal.</p>
                        {!canOfferGutterServices && <p className="text-xs text-gray-500 mt-1 ml-1">Fascia/soffit cleaning pricing is linked to property details from Step 1.</p>}
                    </div>
                </div>
            </div>
            
            <div className="mt-6 p-4 border-t border-gray-200 space-y-2">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Price Calculation:</h3>
                {(initialWindowPrice > 0 || hasCons) && ( 
                    <>
                        <div className="flex justify-between text-sm">
                            <span>Window Cleaning ({selectedFrequency || 'N/A'}):</span>
                            <span>£{(initialWindowPrice || 0).toFixed(2)}</span>
                        </div>
                        {hasCons && (
                            <div className="flex justify-between text-sm">
                                <span>Conservatory Surcharge:</span>
                                <span>+ £{conservatorySurcharge.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm font-medium border-b pb-1 mb-1">
                            <span>Sub-total (Windows):</span>
                            <span>£{currentWindowPriceWithSurcharge.toFixed(2)}</span>
                        </div>
                    </>
                )}

                { (selectedAddons.gutterClearing && canOfferGutterServices) && (
                    <div className="flex justify-between text-sm">
                        <span>Gutter Clearing (Interior):</span>
                        <span>+ £{gutterClearingPrice.toFixed(2)}</span>
                    </div>
                )}
                { (selectedAddons.fasciaSoffitGutter && canOfferGutterServices) && (
                    <div className="flex justify-between text-sm">
                        <span>Fascia, Soffit & Gutter Exterior Clean:</span>
                        <span>+ £{fasciaSoffitGutterPrice.toFixed(2)}</span>
                    </div>
                )}
                {addonServiceDefinitions.map(service => selectedAddons[service.id] && (
                    <div key={`summary-${service.id}`} className="flex justify-between text-sm">
                        <span>{service.label}:</span>
                        <span>+ £{service.price.toFixed(2)}</span>
                    </div>
                ))}
                
                {addonServicesTotalPrice > 0 && (
                     <div className="flex justify-between text-sm font-medium border-b pb-1 mb-1">
                        <span>Sub-total (Add-ons):</span>
                        <span>£{addonServicesTotalPrice.toFixed(2)}</span>
                    </div>
                )}

                {calculatedDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-semibold">
                        <span>Gutter Bundle Discount (Free Window Cleaning):</span>
                        <span>- £{calculatedDiscount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between text-xl font-bold text-indigo-600 pt-2 border-t mt-2">
                    <span>Total Estimated Price:</span>
                    <span>£{finalGrandTotal.toFixed(2)}</span>
                </div>
            </div>

            <div className="mt-8 flex justify-between">
                <button onClick={prevStep} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Back</button>
                <button onClick={continueStep} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Next: Your Details</button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                    All prices shown are based on standard property sizes and conditions. For properties with unusual access, extensive dirt/build-up, or significantly larger than average sizes for their type, we may need to adjust the quote. Any potential changes will be discussed and agreed with you before any work commences.
                </p>
            </div>
        </div>
    );
}

export default AdditionalServicesForm;
