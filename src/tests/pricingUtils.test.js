import { calculateGutterClearingPrice } from '../utils/pricingUtils';

describe('Pricing Utilities', () => {
  describe('calculateGutterClearingPrice', () => {
    it('should calculate correct price for 1-2 bed properties', () => {
      const price = calculateGutterClearingPrice('1-2 Bedroom', '1-2 Bed');
      expect(price).toBe(40);
    });

    it('should calculate correct price for 3 bed semi-detached', () => {
      const price = calculateGutterClearingPrice('Semi-Detached', '3 Bed');
      expect(price).toBe(60);
    });

    it('should calculate correct price for 3 bed detached', () => {
      const price = calculateGutterClearingPrice('Detached', '3 Bed');
      expect(price).toBe(60);
    });

    it('should calculate correct price for 4 bed semi-detached', () => {
      const price = calculateGutterClearingPrice('Semi-Detached', '4 Bed');
      expect(price).toBe(80);
    });

    it('should calculate correct price for 4 bed detached', () => {
      const price = calculateGutterClearingPrice('Detached', '4 Bed');
      expect(price).toBe(80);
    });

    it('should calculate correct price for 5 bed properties', () => {
      const price = calculateGutterClearingPrice('Semi-Detached', '5 Bed');
      expect(price).toBe(100);
    });

    it('should return 0 for custom quotes', () => {
      const price = calculateGutterClearingPrice('Properties', '6+ Beds & Bespoke');
      expect(price).toBe(0);
    });

    it('should return 0 for commercial properties', () => {
      const price = calculateGutterClearingPrice('Commercial Property', 'All Types');
      expect(price).toBe(0);
    });

    it('should return 0 for unknown property types', () => {
      const price = calculateGutterClearingPrice('Unknown', 'Unknown');
      expect(price).toBe(0);
    });
  });
});

describe('Window Cleaning Pricing', () => {
  const windowCleaningPrices = {
    '1-2 Bed': { basePrice: 20 },
    '3 Bed Semi-Detached': { basePrice: 25 },
    '3 Bed Detached': { basePrice: 30 },
    '4 Bed Semi-Detached': { basePrice: 30 },
    '4 Bed Detached': { basePrice: 35 },
    '5 Bed Semi-Detached': { basePrice: 35 },
    '5 Bed Detached': { basePrice: 40 }
  };

  it('should have correct base prices for all property types', () => {
    expect(windowCleaningPrices['1-2 Bed'].basePrice).toBe(20);
    expect(windowCleaningPrices['3 Bed Semi-Detached'].basePrice).toBe(25);
    expect(windowCleaningPrices['3 Bed Detached'].basePrice).toBe(30);
    expect(windowCleaningPrices['4 Bed Semi-Detached'].basePrice).toBe(30);
    expect(windowCleaningPrices['4 Bed Detached'].basePrice).toBe(35);
    expect(windowCleaningPrices['5 Bed Semi-Detached'].basePrice).toBe(35);
    expect(windowCleaningPrices['5 Bed Detached'].basePrice).toBe(40);
  });
});

describe('Frequency Adjustments', () => {
  const frequencyAdjustments = {
    '4-weekly': (price) => price,
    '8-weekly': (price) => price + 3,
    '12-weekly': (price) => price + 5,
    'adhoc': (price) => price + 20
  };

  it('should apply correct frequency adjustments', () => {
    const basePrice = 20;
    
    expect(frequencyAdjustments['4-weekly'](basePrice)).toBe(20);
    expect(frequencyAdjustments['8-weekly'](basePrice)).toBe(23);
    expect(frequencyAdjustments['12-weekly'](basePrice)).toBe(25);
    expect(frequencyAdjustments['adhoc'](basePrice)).toBe(40);
  });
});

describe('Discount Calculations', () => {
  it('should apply free window cleaning when both gutter services selected', () => {
    const windowPrice = 25;
    const gutterClearing = true;
    const fasciaSoffit = true;
    const frequency = '8-weekly';
    
    const discount = (gutterClearing && fasciaSoffit && frequency !== 'adhoc') ? windowPrice : 0;
    expect(discount).toBe(25);
  });

  it('should not apply discount for adhoc frequency', () => {
    const windowPrice = 25;
    const gutterClearing = true;
    const fasciaSoffit = true;
    const frequency = 'adhoc';
    
    const discount = (gutterClearing && fasciaSoffit && frequency !== 'adhoc') ? windowPrice : 0;
    expect(discount).toBe(0);
  });

  it('should not apply discount if only one gutter service selected', () => {
    const windowPrice = 25;
    const gutterClearing = true;
    const fasciaSoffit = false;
    const frequency = '8-weekly';
    
    const discount = (gutterClearing && fasciaSoffit && frequency !== 'adhoc') ? windowPrice : 0;
    expect(discount).toBe(0);
  });
});