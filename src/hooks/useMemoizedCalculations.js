import { useMemo } from 'react';

/**
 * Custom hook for memoized pricing calculations
 * Prevents unnecessary recalculations on every render
 */
export function useMemoizedCalculations(formData) {
  // Memoize window cleaning price calculations
  const windowCleaningTotals = useMemo(() => {
    const basePrice = formData.initialWindowPrice || 0;
    const conservatorySurcharge = formData.hasConservatory ? (formData.conservatorySurcharge || 0) : 0;
    const extensionSurcharge = formData.hasExtension ? (formData.extensionSurcharge || 0) : 0;
    
    return {
      basePrice,
      conservatorySurcharge,
      extensionSurcharge,
      windowSubtotal: basePrice + conservatorySurcharge + extensionSurcharge
    };
  }, [
    formData.initialWindowPrice,
    formData.hasConservatory,
    formData.conservatorySurcharge,
    formData.hasExtension,
    formData.extensionSurcharge
  ]);

  // Memoize additional services calculations
  const additionalServicesTotals = useMemo(() => {
    const gutterClearing = formData.additionalServices?.gutterClearing 
      ? (formData.gutterClearingServicePrice || 0) 
      : 0;
    const fasciaSoffit = formData.additionalServices?.fasciaSoffitGutter
      ? (formData.fasciaSoffitGutterServicePrice || 0)
      : 0;
    
    return {
      gutterClearing,
      fasciaSoffit,
      servicesSubtotal: gutterClearing + fasciaSoffit
    };
  }, [
    formData.additionalServices,
    formData.gutterClearingServicePrice,
    formData.fasciaSoffitGutterServicePrice
  ]);

  // Memoize discount calculation
  const discount = useMemo(() => {
    // Apply discount if both gutter services selected and not adhoc
    if (formData.additionalServices?.gutterClearing && 
        formData.additionalServices?.fasciaSoffitGutter &&
        formData.selectedFrequency !== 'adhoc' &&
        windowCleaningTotals.basePrice > 0) {
      return windowCleaningTotals.basePrice;
    }
    return 0;
  }, [
    formData.additionalServices,
    formData.selectedFrequency,
    windowCleaningTotals.basePrice
  ]);

  // Memoize grand total calculation
  const grandTotal = useMemo(() => {
    const subtotal = windowCleaningTotals.windowSubtotal + additionalServicesTotals.servicesSubtotal;
    return subtotal - discount;
  }, [windowCleaningTotals.windowSubtotal, additionalServicesTotals.servicesSubtotal, discount]);

  return {
    windowCleaningTotals,
    additionalServicesTotals,
    discount,
    grandTotal,
    hasDiscount: discount > 0
  };
}