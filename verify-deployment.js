#!/usr/bin/env node

/**
 * Somerset Window Cleaning - Deployment Verification Script
 * This script tests all critical endpoints and data flow
 */

const https = require('https');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to make HTTP requests
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    
    req.end();
  });
}

// Test functions
async function testAPIHealth(apiUrl) {
  console.log('\n📋 Testing API Health...');
  
  try {
    const url = new URL(`${apiUrl}/api/health`);
    const result = await makeRequest({
      hostname: url.hostname,
      path: url.pathname,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (result.status === 200 && result.data.status === 'ok') {
      console.log(`${colors.green}✅ API Health Check: PASSED${colors.reset}`);
      console.log(`   Environment: ${result.data.environment}`);
      testResults.passed++;
      return true;
    } else {
      console.log(`${colors.red}❌ API Health Check: FAILED${colors.reset}`);
      testResults.failed++;
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ API Health Check: ERROR - ${error.message}${colors.reset}`);
    testResults.failed++;
    return false;
  }
}

async function testBookingSubmission(apiUrl) {
  console.log('\n📋 Testing Booking Submission...');
  
  const testBooking = {
    customerName: 'Test Customer',
    email: 'test@example.com',
    mobile: '07700900123',
    addressLine1: '123 Test Street',
    townCity: 'Test Town',
    postcode: 'TA1 1AA',
    propertyType: 'house',
    frequency: 'monthly',
    preferredContactMethod: 'phone',
    marketingConsent: false
  };
  
  try {
    const url = new URL(`${apiUrl}/api/submit-booking`);
    const result = await makeRequest({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(testBooking))
      }
    }, testBooking);
    
    if (result.status === 200 && result.data.success && result.data.bookingReference) {
      console.log(`${colors.green}✅ Booking Submission: PASSED${colors.reset}`);
      console.log(`   Booking Reference: ${result.data.bookingReference}`);
      console.log(`   Lead ID: ${result.data.leadId}`);
      testResults.passed++;
      return result.data;
    } else {
      console.log(`${colors.red}❌ Booking Submission: FAILED${colors.reset}`);
      console.log(`   Response: ${JSON.stringify(result.data)}`);
      testResults.failed++;
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Booking Submission: ERROR - ${error.message}${colors.reset}`);
    testResults.failed++;
    return null;
  }
}

async function testAdminAuth(apiUrl, username, password) {
  console.log('\n📋 Testing Admin Authentication...');
  
  try {
    const url = new URL(`${apiUrl}/api/auth/login`);
    const result = await makeRequest({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, { username, password });
    
    if (result.status === 200 && result.data.success && result.data.accessToken) {
      console.log(`${colors.green}✅ Admin Authentication: PASSED${colors.reset}`);
      console.log(`   User: ${result.data.user.username} (${result.data.user.role})`);
      testResults.passed++;
      return result.data.accessToken;
    } else {
      console.log(`${colors.red}❌ Admin Authentication: FAILED${colors.reset}`);
      console.log(`   Response: ${JSON.stringify(result.data)}`);
      testResults.failed++;
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Admin Authentication: ERROR - ${error.message}${colors.reset}`);
    testResults.failed++;
    return null;
  }
}

async function testLeadRetrieval(apiUrl, token) {
  console.log('\n📋 Testing Lead Retrieval...');
  
  if (!token) {
    console.log(`${colors.yellow}⚠️  Skipping: No auth token available${colors.reset}`);
    return;
  }
  
  try {
    const url = new URL(`${apiUrl}/api/leads?limit=5`);
    const result = await makeRequest({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (result.status === 200 && result.data.success) {
      console.log(`${colors.green}✅ Lead Retrieval: PASSED${colors.reset}`);
      console.log(`   Total Leads: ${result.data.pagination.total}`);
      console.log(`   Retrieved: ${result.data.data.length} leads`);
      testResults.passed++;
      
      // Check if our test booking is there
      if (result.data.data.length > 0) {
        const latestLead = result.data.data[0];
        console.log(`\n   Latest Lead Details:`);
        console.log(`   - Reference: ${latestLead.bookingReference}`);
        console.log(`   - Customer: ${latestLead.customerName}`);
        console.log(`   - Status: ${latestLead.status.name}`);
        console.log(`   - Submitted: ${new Date(latestLead.submittedAt).toLocaleString()}`);
      }
    } else {
      console.log(`${colors.red}❌ Lead Retrieval: FAILED${colors.reset}`);
      console.log(`   Response: ${JSON.stringify(result.data)}`);
      testResults.failed++;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Lead Retrieval: ERROR - ${error.message}${colors.reset}`);
    testResults.failed++;
  }
}

async function testCORS(apiUrl, frontendUrl) {
  console.log('\n📋 Testing CORS Configuration...');
  
  try {
    const url = new URL(`${apiUrl}/api/health`);
    const result = await makeRequest({
      hostname: url.hostname,
      path: url.pathname,
      method: 'OPTIONS',
      headers: {
        'Origin': frontendUrl,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    // Check for CORS headers in response
    console.log(`${colors.yellow}ℹ️  CORS test requires manual verification${colors.reset}`);
    console.log(`   Test CORS from browser console:`);
    console.log(`   fetch('${apiUrl}/api/health').then(r => r.json()).then(console.log)`);
  } catch (error) {
    console.log(`${colors.yellow}⚠️  CORS test inconclusive${colors.reset}`);
  }
}

// Main test runner
async function runTests() {
  console.log(`${colors.blue}🔧 Somerset Window Cleaning - Deployment Verification${colors.reset}`);
  console.log('==================================================\n');
  
  // Get API URL
  const apiUrl = await new Promise(resolve => {
    rl.question('Enter your deployed API URL (e.g., https://somerset-api.vercel.app): ', resolve);
  });
  
  // Run basic tests
  const healthOk = await testAPIHealth(apiUrl);
  
  if (!healthOk) {
    console.log(`\n${colors.red}⚠️  API not responding. Please check your deployment.${colors.reset}`);
  } else {
    // Test booking submission
    const bookingResult = await testBookingSubmission(apiUrl);
    
    // Test admin authentication
    console.log('\n📋 Admin Authentication Test (optional)');
    const testAuth = await new Promise(resolve => {
      rl.question('Test admin login? (y/n): ', answer => resolve(answer.toLowerCase() === 'y'));
    });
    
    let authToken = null;
    if (testAuth) {
      const username = await new Promise(resolve => {
        rl.question('Admin username: ', resolve);
      });
      const password = await new Promise(resolve => {
        rl.question('Admin password: ', answer => {
          resolve(answer);
        });
      });
      
      authToken = await testAdminAuth(apiUrl, username, password);
      
      if (authToken) {
        await testLeadRetrieval(apiUrl, authToken);
      }
    }
    
    // Test CORS
    const frontendUrl = await new Promise(resolve => {
      rl.question('\nEnter frontend URL (default: https://window-cleaning-booking-system.vercel.app): ', 
        answer => resolve(answer || 'https://window-cleaning-booking-system.vercel.app'));
    });
    await testCORS(apiUrl, frontendUrl);
  }
  
  // Summary
  console.log(`\n${colors.blue}📊 Test Summary${colors.reset}`);
  console.log('================');
  console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
  
  if (testResults.failed === 0) {
    console.log(`\n${colors.green}✅ All tests passed! Your deployment appears to be working correctly.${colors.reset}`);
  } else {
    console.log(`\n${colors.red}❌ Some tests failed. Please review the errors above.${colors.reset}`);
  }
  
  console.log('\n📋 Manual Verification Checklist:');
  console.log('[ ] Submit a real booking through the form');
  console.log('[ ] Check email notifications are received');
  console.log('[ ] Login to admin dashboard');
  console.log('[ ] Verify all booking data is displayed');
  console.log('[ ] Test lead status updates');
  console.log('[ ] Check filtering and search');
  console.log('[ ] Test on mobile devices');
  
  rl.close();
}

// Run the tests
runTests().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  rl.close();
  process.exit(1);
});