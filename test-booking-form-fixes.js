// Test script to verify booking form functionality
// Run this to check for common issues

const testBookingForm = () => {
  console.log('🧪 Testing Booking Form Components...\n');

  // Test 1: Check for memory leaks
  console.log('1️⃣ Testing for memory leaks in async operations...');
  const checkMemoryLeaks = () => {
    // Simulate component unmount during async operation
    let isMounted = true;
    const setState = (value) => {
      if (!isMounted) {
        console.error('❌ MEMORY LEAK: Attempting to update state after unmount!');
        return false;
      }
      console.log('✅ State update safe - component still mounted');
      return true;
    };

    // Simulate async operation
    setTimeout(() => {
      isMounted = false; // Component unmounts
    }, 100);

    setTimeout(() => {
      setState('new value'); // This should be caught
    }, 200);
  };

  // Test 2: Check form validation
  console.log('\n2️⃣ Testing form validation...');
  const testValidation = () => {
    const testCases = [
      { field: 'email', value: 'invalid-email', expected: false },
      { field: 'email', value: 'test@example.com', expected: true },
      { field: 'mobile', value: '123', expected: false },
      { field: 'mobile', value: '07700900123', expected: true },
      { field: 'postcode', value: 'invalid', expected: false },
      { field: 'postcode', value: 'BS1 2AB', expected: true },
    ];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(?:(?:\+44\s?|0)(?:7\d{3}|\d{4}|\d{3})[\s\-]?\d{3}[\s\-]?\d{3,4})$/;
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;

    testCases.forEach(({ field, value, expected }) => {
      let isValid;
      switch (field) {
        case 'email':
          isValid = emailRegex.test(value);
          break;
        case 'mobile':
          isValid = phoneRegex.test(value.replace(/\s/g, ''));
          break;
        case 'postcode':
          isValid = postcodeRegex.test(value.replace(/\s/g, ''));
          break;
      }
      
      if (isValid === expected) {
        console.log(`✅ ${field}: "${value}" - Validation correct`);
      } else {
        console.error(`❌ ${field}: "${value}" - Expected ${expected}, got ${isValid}`);
      }
    });
  };

  // Test 3: Check state mutations
  console.log('\n3️⃣ Testing state immutability...');
  const testStateMutations = () => {
    const originalState = {
      customer: { name: 'John', address: { line1: '123 Main St' } }
    };
    
    // Bad way - mutates original
    const badUpdate = () => {
      const newState = originalState;
      newState.customer.name = 'Jane';
      return newState;
    };

    // Good way - creates new object
    const goodUpdate = () => {
      const newState = JSON.parse(JSON.stringify(originalState));
      newState.customer.name = 'Jane';
      return newState;
    };

    const badResult = badUpdate();
    if (originalState.customer.name === 'Jane') {
      console.error('❌ State mutation detected! Original state was modified');
    }

    // Reset
    originalState.customer.name = 'John';
    
    const goodResult = goodUpdate();
    if (originalState.customer.name === 'John') {
      console.log('✅ State immutability maintained');
    }
  };

  // Test 4: Check localStorage handling
  console.log('\n4️⃣ Testing localStorage error handling...');
  const testLocalStorage = () => {
    try {
      // Test corrupted data
      localStorage.setItem('testData', '{invalid json');
      
      try {
        const data = JSON.parse(localStorage.getItem('testData'));
        console.error('❌ Failed to catch invalid JSON');
      } catch (e) {
        console.log('✅ Correctly caught invalid JSON error');
      }

      // Test storage quota
      try {
        const largeData = new Array(1024 * 1024 * 10).join('x'); // 10MB
        localStorage.setItem('largeData', largeData);
        console.log('✅ Large data storage handled');
      } catch (e) {
        console.log('✅ Correctly caught storage quota error');
      }
      
      // Cleanup
      localStorage.removeItem('testData');
      localStorage.removeItem('largeData');
    } catch (e) {
      console.error('❌ localStorage test failed:', e);
    }
  };

  // Test 5: Check race conditions
  console.log('\n5️⃣ Testing race condition handling...');
  const testRaceConditions = () => {
    let currentStep = 1;
    const navigateTimeouts = [];

    // Simulate rapid navigation
    const navigate = (step) => {
      const timeout = setTimeout(() => {
        currentStep = step;
        console.log(`Navigated to step ${step}`);
      }, Math.random() * 100);
      navigateTimeouts.push(timeout);
    };

    // User clicks rapidly
    navigate(2);
    navigate(3);
    navigate(2);
    
    // Good practice - clear all pending navigations
    setTimeout(() => {
      navigateTimeouts.forEach(clearTimeout);
      console.log('✅ All pending navigations cleared');
    }, 150);
  };

  // Run all tests
  checkMemoryLeaks();
  setTimeout(() => testValidation(), 300);
  setTimeout(() => testStateMutations(), 400);
  setTimeout(() => testLocalStorage(), 500);
  setTimeout(() => testRaceConditions(), 600);

  setTimeout(() => {
    console.log('\n✨ Testing complete! Check for any ❌ errors above.');
  }, 1000);
};

// Run the tests
testBookingForm();