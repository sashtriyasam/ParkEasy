require('dotenv').config();
const axios = require('axios');
const api = axios.create({ timeout: 10000 });

const BASE_URL = process.env.API_URL || 'https://parkeasy-backend-uy3x.onrender.com/api/v1';

async function runTests() {
  const results = {
    passing: [],
    failing: [],
    warnings: []
  };

  const baseEmailPrefix = process.env.TEST_USER_EMAIL_PREFIX || 'qatest';
  const testPassword = process.env.TEST_USER_PASSWORD || 'QATest@1234';
  const timestamp = Date.now();
  const customerEmail = `${baseEmailPrefix}_cust_${timestamp}@parkeasy.in`;
  const providerEmail = `${baseEmailPrefix}_prov_${timestamp}@parkeasy.in`;

  let CUSTOMER_TOKEN;
  let PROVIDER_TOKEN;
  let FACILITY_ID;

  console.log('--- STARTING ParkEasy E2E API TESTS ---');

  // PHASE 2 - AUTH
  
  // 2A - Register Customer
  try {
    const res = await api.post(`${BASE_URL}/auth/register`, {
      email: customerEmail,
      password: testPassword,
      full_name: "QA Customer",
      phone_number: `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      role: "CUSTOMER"
    });
    CUSTOMER_TOKEN = res.data.data.accessToken;
    console.log('TEST 2A PASSED: Customer Registered');
    results.passing.push('TEST 2A');
  } catch (err) {
    console.error('TEST 2A FAILED:', err.response?.data?.message || err.message);
    results.failing.push({ id: 'TEST 2A', actual: err.response?.status, error: err.response?.data?.message });
  }

  // 2B - Register Provider
  try {
    const res = await api.post(`${BASE_URL}/auth/register`, {
      email: providerEmail,
      password: testPassword,
      full_name: "QA Provider",
      phone_number: `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      role: "PROVIDER"
    });
    PROVIDER_TOKEN = res.data.data.accessToken;
    console.log('TEST 2B PASSED: Provider Registered');
    results.passing.push('TEST 2B');
  } catch (err) {
    console.error('TEST 2B FAILED:', err.response?.data?.message || err.message);
    results.failing.push({ id: 'TEST 2B', actual: err.response?.status, error: err.response?.data?.message });
  }

  // 2C - Login Customer (Verify account works)
  if (CUSTOMER_TOKEN) {
    try {
      const res = await api.post(`${BASE_URL}/auth/login`, {
        email: customerEmail,
        password: testPassword
      });
      console.log('TEST 2C PASSED: Customer Login Verified');
      results.passing.push('TEST 2C');
    } catch (err) {
      console.error('TEST 2C FAILED');
      results.failing.push({ id: 'TEST 2C', error: err.message });
    }
  }

  // 2F - Login Provider (Verify account works)
  if (PROVIDER_TOKEN) {
    try {
      const res = await api.post(`${BASE_URL}/auth/login`, {
        email: providerEmail,
        password: testPassword
      });
      console.log('TEST 2F PASSED: Provider Login Verified');
      results.passing.push('TEST 2F');
    } catch (err) {
      console.error('TEST 2F FAILED: Provider login failed', err.response?.data?.message || err.message);
      results.failing.push({ id: 'TEST 2F', actual: err.response?.status, error: err.response?.data?.message });
    }
  }

  // 2D - Validation Guard
  try {
    await api.post(`${BASE_URL}/auth/register`, { email: "bademail", password: "short", role: "ADMIN" });
    results.failing.push({ id: 'TEST 2D', actual: '201', error: 'Validation broken - accepted invalid data' });
  } catch (err) {
    const status = err.response?.status;
    if (status === 400 || status === 422) {
      console.log('TEST 2D PASSED: Validation Guard Active');
      results.passing.push('TEST 2D');
    } else {
      console.error(`TEST 2D FAILED: Unexpected status ${status || 'N/A'}`);
      results.failing.push({ 
        id: 'TEST 2D', 
        actual: status, 
        error: err.response?.data?.message || err.message || 'Expected validation rejection (400/422)' 
      });
    }
  }

  // 2E - Get Me
  if (CUSTOMER_TOKEN) {
    try {
      const res = await api.get(`${BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${CUSTOMER_TOKEN}` } });
      if (res.data.data.user.role === 'CUSTOMER') {
        console.log('TEST 2E PASSED: Get Me returns correct user info');
        results.passing.push('TEST 2E');
      } else {
        results.failing.push({ id: 'TEST 2E', actual: res.data.data.user.role, error: 'Incorrect role returned' });
      }
    } catch (err) {
      console.error('TEST 2E FAILED:', err.message);
      results.failing.push({ id: 'TEST 2E', error: err.message });
    }
  } else {
    console.warn('SKIPPING TEST 2E: Missing CUSTOMER_TOKEN - prerequisite test failed');
    results.failing.push({ id: 'TEST 2E', error: 'Missing CUSTOMER_TOKEN - prerequisite test failed' });
  }

  // --- TEARDOWN ---
  console.log('--- STARTING TEARDOWN (Cleanup) ---');
  
  if (CUSTOMER_TOKEN) {
    try {
      await api.delete(`${BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${CUSTOMER_TOKEN}` } });
      console.log('TEARDOWN: Test Customer Deleted');
    } catch (err) {
      console.error('TEARDOWN FAILED: Could not delete customers', err.message);
    }
  }

  if (PROVIDER_TOKEN) {
    try {
      await api.delete(`${BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${PROVIDER_TOKEN}` } });
      console.log('TEARDOWN: Test Provider Deleted');
    } catch (err) {
      console.error('TEARDOWN FAILED: Could not delete provider', err.message);
    }
  }
  
  console.log('--- API E2E SUMMARY ---');
  console.log(JSON.stringify(results, null, 2));
  
  if (results.failing.length > 0) process.exit(1);
}

runTests();
