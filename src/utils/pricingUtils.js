/**
 * Calculates the price for gutter clearing based on property type and bedrooms.
 * @param {string} propertyType - The type of the property (e.g., 'Semi-Detached House', 'Detached House').
 * @param {string} bedrooms - The number of bedrooms (e.g., '2-3 Bed', '4 Bed', '5 Bed').
 * @returns {number} The calculated price for gutter clearing.
 */
export const calculateGutterClearingPrice = (propertyType, bedrooms) => {
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
    }
    return price;
}; 