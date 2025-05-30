#!/usr/bin/env node

const API_BASE = 'https://window-cleaning-booking-system-6k15.vercel.app/api';

// Test data
const testBooking = {
  customerName: "John Smith Test",
  email: "john.test@example.com",
  mobile: "07777123456",
  addressLine1: "456 Test Road",
  addressLine2: "",
  townCity: "Bath",
  postcode: "BA1 2AB",
  propertyType: "semi-3",
  frequency: "4weekly",
  preferredDate: "2025-06-20",
  servicesRequested: {
    windowCleaning: true,
    gutterInternal: true
  },
  estimatedPrice: 25,
  preferredContactMethod: "phone",
  specialRequirements: "Please call before arriving",
  marketingConsent: true
};

async function submitBooking() {
  console.log('1. Submitting test booking...');
  try {
    const response = await fetch(`${API_BASE}/submit-booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testBooking)
    });

    const result = await response.json();
    if (result.success) {
      console.log('✓ Booking submitted successfully!');
      console.log(`  Reference: ${result.bookingReference}`);
      console.log(`  Lead ID: ${result.leadId}`);
      return result;
    } else {
      console.error('✗ Booking failed:', result);
      return null;
    }
  } catch (error) {
    console.error('✗ Error submitting booking:', error);
    return null;
  }
}

async function loginToAdmin() {
  console.log('\n2. Logging into admin dashboard...');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    const result = await response.json();
    if (result.success) {
      console.log('✓ Logged in successfully!');
      return result.accessToken;
    } else {
      console.error('✗ Login failed:', result);
      return null;
    }
  } catch (error) {
    console.error('✗ Error logging in:', error);
    return null;
  }
}

async function checkLeadsInAdmin(token, bookingRef) {
  console.log('\n3. Checking leads in admin dashboard...');
  try {
    const response = await fetch(`${API_BASE}/leads?limit=10&sortBy=submittedAt&sortOrder=desc`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    if (result.success) {
      console.log(`✓ Found ${result.data.length} leads`);
      
      // Look for our test booking
      const ourBooking = result.data.find(lead => 
        lead.bookingReference === bookingRef || 
        lead.customerName === testBooking.customerName
      );
      
      if (ourBooking) {
        console.log('✓ Test booking found in admin dashboard!');
        console.log('  Lead details:');
        console.log(`    - Name: ${ourBooking.customerName}`);
        console.log(`    - Email: ${ourBooking.email}`);
        console.log(`    - Phone: ${ourBooking.mobile}`);
        console.log(`    - Status: ${ourBooking.status.displayName}`);
        console.log(`    - Submitted: ${new Date(ourBooking.submittedAt).toLocaleString()}`);
        return true;
      } else {
        console.log('✗ Test booking not found in admin dashboard');
        console.log('Recent leads:');
        result.data.slice(0, 3).forEach(lead => {
          console.log(`  - ${lead.customerName} (${lead.bookingReference})`);
        });
        return false;
      }
    } else {
      console.error('✗ Failed to fetch leads:', result);
      return false;
    }
  } catch (error) {
    console.error('✗ Error fetching leads:', error);
    return false;
  }
}

async function runTest() {
  console.log('Starting booking flow test...\n');
  
  // Step 1: Submit booking
  const bookingResult = await submitBooking();
  if (!bookingResult) {
    console.log('\n❌ Test failed at booking submission');
    return;
  }

  // Wait 2 seconds for database to process
  console.log('\nWaiting 2 seconds for processing...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 2: Login to admin
  const token = await loginToAdmin();
  if (!token) {
    console.log('\n❌ Test failed at admin login');
    return;
  }

  // Step 3: Check if booking appears
  const found = await checkLeadsInAdmin(token, bookingResult.bookingReference);
  
  if (found) {
    console.log('\n✅ Test PASSED! Booking flow is working correctly.');
  } else {
    console.log('\n❌ Test FAILED! Booking was submitted but not visible in admin.');
  }
}

// Run the test
runTest();