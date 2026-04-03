const axios = require('axios');

const BASE_URL = 'https://parkeasy-backend-uy3x.onrender.com/api/v1';

async function runTests() {
  const results = {
    passing: [],
    failing: [],
    warnings: []
  };

  let CUSTOMER_TOKEN;
  let PROVIDER_TOKEN;
  let FACILITY_ID;
  let SLOT_ID;
  let VEHICLE_ID;
  let RESERVED_SLOT_ID;
  let TICKET_ID;
  let QA_FACILITY_ID;
  let QA_FLOOR_ID;

  console.log('--- STARTING ParkEasy E2E API TESTS ---');

  // PHASE 2 - AUTH
  
  // 2A - Register Customer
  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      email: "qatest_customer_new@parkeasy.in", // Added _new to avoid unique constraint if already exists
      password: "QATest@1234",
      full_name: "QA Customer",
      phone_number: "+919999999901",
      role: "CUSTOMER"
    });
    console.log('TEST 2A PASSED');
    results.passing.push('TEST 2A');
  } catch (err) {
    console.log('TEST 2A FAILED:', err.response?.data?.message || err.message);
    results.failing.push({ id: 'TEST 2A', actual: err.response?.status, error: err.response?.data?.message });
  }

  // 2B - Register Provider
  try {
    const res = await axios.post(`${BASE_URL}/auth/register`, {
      email: "qatest_provider_new@parkeasy.in",
      password: "QATest@1234",
      full_name: "QA Provider",
      phone_number: "+919999999902",
      role: "PROVIDER"
    });
    console.log('TEST 2B PASSED');
    results.passing.push('TEST 2B');
  } catch (err) {
    console.log('TEST 2B FAILED:', err.response?.data?.message || err.message);
    results.failing.push({ id: 'TEST 2B', actual: err.response?.status, error: err.response?.data?.message });
  }

  // 2C - Login Customer
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: "qatest_customer_new@parkeasy.in",
      password: "QATest@1234"
    });
    CUSTOMER_TOKEN = res.data.data.accessToken;
    console.log('TEST 2C PASSED');
    results.passing.push('TEST 2C');
  } catch (err) {
    console.log('TEST 2C FAILED');
    results.failing.push({ id: 'TEST 2C', error: err.message });
  }

  // Login Provider for Phase 4
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: "qatest_provider_new@parkeasy.in",
      password: "QATest@1234"
    });
    PROVIDER_TOKEN = res.data.data.accessToken;
  } catch (err) {}

  // 2D - Validation Guard
  try {
    await axios.post(`${BASE_URL}/auth/register`, { email: "bademail", password: "short", role: "ADMIN" });
    results.failing.push({ id: 'TEST 2D', actual: '201', error: 'Validation broken - accepted invalid data' });
  } catch (err) {
    console.log('TEST 2D PASSED');
    results.passing.push('TEST 2D');
  }

  // 2E - Get Me
  try {
    const res = await axios.get(`${BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${CUSTOMER_TOKEN}` } });
    if (res.data.data.role === 'CUSTOMER') {
      console.log('TEST 2E PASSED');
      results.passing.push('TEST 2E');
    } else {
      results.failing.push({ id: 'TEST 2E', actual: res.data.data.role, error: 'Incorrect role returned' });
    }
  } catch (err) {
    results.failing.push({ id: 'TEST 2E', error: err.message });
  }

  // 2F - Refresh Token omitted for brevity in this script but can be added if needed

  // PHASE 3 - CUSTOMER FLOWS
  try {
    const res = await axios.get(`${BASE_URL}/customer/search?latitude=19.0662&longitude=72.8659&radius=20`, { headers: { Authorization: `Bearer ${CUSTOMER_TOKEN}` } });
    if (res.data.data.length >= 1) {
      FACILITY_ID = res.data.data[0].id;
      console.log('TEST 3A PASSED');
      results.passing.push('TEST 3A');
    } else {
        results.failing.push({ id: 'TEST 3A', actual: '0 facilities', error: 'No Mumbai facilities found' });
    }
  } catch (err) {
    results.failing.push({ id: 'TEST 3A', error: err.message });
  }

  // More tests here...
  // I will write the full script to a file and run it.
  
  console.log('--- API E2E PARTIAL SUMMARY ---');
  console.log(JSON.stringify(results, null, 2));
}

runTests();
