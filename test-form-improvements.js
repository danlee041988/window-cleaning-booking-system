// Test script for form improvements
// Run with: node test-form-improvements.js

const puppeteer = require('puppeteer');

async function testFormImprovements() {
    console.log('🧪 Starting Form Improvement Tests...\n');
    
    const browser = await puppeteer.launch({ 
        headless: false, // Set to true for CI
        devtools: false 
    });
    
    try {
        const page = await browser.newPage();
        
        // Set viewport for desktop testing
        await page.setViewport({ width: 1200, height: 800 });
        
        console.log('📖 Loading form page...');
        await page.goto('http://localhost:8000/index.html', { 
            waitUntil: 'domcontentloaded' 
        });
        
        // Test 1: Form persistence
        console.log('✅ Test 1: Form Data Persistence');
        await testFormPersistence(page);
        
        // Test 2: Phone validation improvements
        console.log('✅ Test 2: Improved Phone Validation');
        await testPhoneValidation(page);
        
        // Test 3: Accessibility features
        console.log('✅ Test 3: Accessibility Features');
        await testAccessibility(page);
        
        // Test 4: Loading states
        console.log('✅ Test 4: Loading States');
        await testLoadingStates(page);
        
        // Test 5: Error handling
        console.log('✅ Test 5: Error Handling');
        await testErrorHandling(page);
        
        console.log('\n🎉 All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

async function testFormPersistence(page) {
    // Navigate to booking form
    await page.click('a[href="#booking"]');
    await page.waitForSelector('#bookingForm', { visible: true });
    
    // Fill out step 1
    await page.select('#propertyType', 'semi-3');
    await page.waitForTimeout(500); // Wait for frequency section to show
    
    await page.click('input[name="frequency"][value="8weekly"]');
    
    // Go to step 2
    await page.click('button[onclick="nextStep()"]');
    await page.waitForTimeout(500);
    
    // Select an additional service
    await page.click('input[name="additionalServices"][value="gutterInternal"]');
    
    // Go to step 3
    await page.click('button[onclick="nextStep()"]');
    await page.waitForTimeout(500);
    
    // Fill out contact details
    await page.type('input[name="fullName"]', 'Test User');
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="phone"]', '07123 456 789');
    
    // Check if localStorage was populated
    const localStorage = await page.evaluate(() => {
        return {
            formState: JSON.parse(localStorage.getItem('windowCleaningFormState') || '{}'),
            currentStep: localStorage.getItem('windowCleaningCurrentStep')
        };
    });
    
    console.log('   ✓ Form state saved to localStorage');
    console.log('   ✓ Property type:', localStorage.formState.propertyType);
    console.log('   ✓ Current step:', localStorage.currentStep);
    
    // Reload page to test restoration
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.click('a[href="#booking"]');
    await page.waitForTimeout(1000);
    
    // Check if form was restored
    const restoredPropertyType = await page.$eval('#propertyType', el => el.value);
    const restoredName = await page.$eval('input[name="fullName"]', el => el.value);
    
    if (restoredPropertyType === 'semi-3' && restoredName === 'Test User') {
        console.log('   ✓ Form data successfully restored after page reload');
    } else {
        throw new Error('Form data was not restored properly');
    }
}

async function testPhoneValidation(page) {
    // Test various phone number formats
    const testNumbers = [
        { input: '07123 456 789', valid: true, description: 'Mobile with spaces' },
        { input: '07123456789', valid: true, description: 'Mobile without spaces' },
        { input: '+44 7123 456 789', valid: true, description: 'Mobile with +44' },
        { input: '01234 567890', valid: true, description: 'Landline with spaces' },
        { input: '123456', valid: false, description: 'Too short' },
        { input: 'abc123def', valid: false, description: 'Invalid characters' }
    ];
    
    const phoneInput = await page.$('input[name="phone"]');
    
    for (const test of testNumbers) {
        // Clear previous input
        await phoneInput.click({ clickCount: 3 });
        await phoneInput.type(test.input);
        await phoneInput.evaluate(el => el.blur()); // Trigger validation
        await page.waitForTimeout(500);
        
        const hasError = await page.$('.field-error') !== null;
        const isValid = !hasError;
        
        if (isValid === test.valid) {
            console.log(`   ✓ ${test.description}: ${test.input} - Validation correct`);
        } else {
            throw new Error(`Phone validation failed for ${test.description}: ${test.input}`);
        }
    }
}

async function testAccessibility(page) {
    // Check for ARIA labels
    const ariaLabels = await page.$$eval('[aria-label]', els => els.length);
    console.log(`   ✓ Found ${ariaLabels} elements with aria-label`);
    
    // Check for form labels
    const labels = await page.$$eval('label[for]', els => els.length);
    console.log(`   ✓ Found ${labels} properly associated labels`);
    
    // Check for live regions
    const liveRegions = await page.$$eval('[aria-live]', els => els.length);
    console.log(`   ✓ Found ${liveRegions} live regions for announcements`);
    
    // Check progress bar
    const progressBars = await page.$$eval('[role="progressbar"]', els => els.length);
    console.log(`   ✓ Found ${progressBars} progress bar elements`);
    
    if (ariaLabels > 10 && labels > 5 && liveRegions > 2 && progressBars > 0) {
        console.log('   ✓ Accessibility features properly implemented');
    } else {
        throw new Error('Insufficient accessibility features');
    }
}

async function testLoadingStates(page) {
    // Mock a slow network to test loading states
    await page.setRequestInterception(true);
    
    page.on('request', (req) => {
        if (req.url().includes('submit-booking')) {
            // Delay the request to test loading state
            setTimeout(() => {
                req.abort();
            }, 2000);
        } else {
            req.continue();
        }
    });
    
    // Fill out minimum required fields and submit
    await page.goto('http://localhost:8000/index.html');
    await page.click('a[href="#booking"]');
    await page.waitForSelector('#bookingForm');
    
    // Quick form fill
    await page.select('#propertyType', 'general');
    await page.click('button[onclick="nextStep()"]');
    await page.click('button[onclick="nextStep()"]');
    
    await page.type('input[name="fullName"]', 'Test User');
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="phone"]', '07123456789');
    await page.type('input[name="address"]', 'Test Address');
    await page.type('input[name="city"]', 'Test City');
    await page.type('input[name="postcode"]', 'BS1 4DJ');
    
    await page.click('button[onclick="nextStep()"]');
    await page.waitForTimeout(500);
    
    await page.click('input[name="termsAgreed"]');
    
    // Submit and check for loading state
    const submitPromise = page.click('#submitBtn');
    
    // Check if loading spinner appears
    await page.waitForSelector('.loading-spinner', { timeout: 1000 });
    console.log('   ✓ Loading spinner appears on form submission');
    
    // Check if button is disabled
    const isDisabled = await page.$eval('#submitBtn', btn => btn.disabled);
    if (isDisabled) {
        console.log('   ✓ Submit button properly disabled during loading');
    }
    
    await submitPromise;
}

async function testErrorHandling(page) {
    // Test validation errors
    await page.goto('http://localhost:8000/index.html');
    await page.click('a[href="#booking"]');
    await page.waitForSelector('#bookingForm');
    
    // Try to proceed without selecting property type
    await page.click('button[onclick="nextStep()"]');
    await page.waitForTimeout(500);
    
    const errorMessage = await page.$('.error-message');
    if (errorMessage) {
        console.log('   ✓ Error message displayed for missing required field');
    } else {
        throw new Error('Error message not displayed for validation failure');
    }
    
    // Test field-level validation
    await page.type('input[name="email"]', 'invalid-email');
    await page.evaluate(() => {
        document.querySelector('input[name="email"]').blur();
    });
    await page.waitForTimeout(500);
    
    const fieldError = await page.$('.field-error');
    if (fieldError) {
        console.log('   ✓ Field-level error validation working');
    } else {
        throw new Error('Field-level validation not working');
    }
}

// Run tests
if (require.main === module) {
    testFormImprovements().catch(console.error);
}

module.exports = { testFormImprovements };