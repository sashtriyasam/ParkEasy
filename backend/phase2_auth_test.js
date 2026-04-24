const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testAuth() {
  console.log('--- PHASE 2: AUTH FLOW TEST ---');

  // TEST 2A - Register Customer
  try {
    const regCust = await axios.post(`${BASE_URL}/auth/register`, {
      email: "qatest_customer@parkeasy.in",
      password: "QATest@1234",
      full_name: "QA Customer",
      phone_number: "+919999999901",
      role: "CUSTOMER"
    });
    console.log('TEST 2A PASSED: 201', regCust.data.status);
  } catch (error) {
    console.log('TEST 2A Potentially FAILED or User Exists:', error.response?.status, error.response?.data?.message || error.message);
  }

  // TEST 2B - Register Provider
  try {
    const regProv = await axios.post(`${BASE_URL}/auth/register`, {
      email: "qatest_provider@parkeasy.in",
      password: "QATest@1234",
      full_name: "QA Provider",
      phone_number: "+919999999902",
      role: "PROVIDER"
    });
    console.log('TEST 2B PASSED: 201', regProv.data.status);
  } catch (error) {
    console.log('TEST 2B Potentially FAILED or User Exists:', error.response?.status, error.response?.data?.message || error.message);
  }

  // TEST 2C - Login as Customer
  let customerTokens;
  try {
    const loginCust = await axios.post(`${BASE_URL}/auth/login`, {
      email: "qatest_customer@parkeasy.in",
      password: "QATest@1234"
    });
    customerTokens = loginCust.data.data;
    console.log('TEST 2C PASSED: 200 CUSTOMER_TOKEN saved');
    console.log('CUSTOMER_ACCESS_TOKEN=' + customerTokens.accessToken);
    console.log('CUSTOMER_REFRESH_TOKEN=' + customerTokens.refreshToken);
  } catch (error) {
    console.log('TEST 2C FAILED:', error.response?.status, error.response?.data?.message || error.message);
  }

  // TEST 2D - Validation Guard
  try {
    const badReg = await axios.post(`${BASE_URL}/auth/register`, {
      email: "bademail",
      password: "short",
      role: "ADMIN"
    });
    console.log('TEST 2D FAILED (Expected 400, got 201/200):', badReg.status);
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('TEST 2D PASSED (Validation Guard): 400');
    } else {
      console.log('TEST 2D FAILED: unexpected status', error.response?.status, error.response?.data?.message || error.message);
    }
  }

  // TEST 2E - Get Me
  if (customerTokens) {
    try {
      const getMe = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${customerTokens.accessToken}` }
      });
      console.log('TEST 2E PASSED: 200', getMe.data.data.email, getMe.data.data.role);
    } catch (error) {
      console.log('TEST 2E FAILED:', error.response?.status, error.response?.data?.message || error.message);
    }
  }

  // TEST 2F - Token Refresh
  if (customerTokens) {
    try {
      const refresh = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken: customerTokens.refreshToken
      });
      console.log('TEST 2F PASSED: 200 New Access Token received');
    } catch (error) {
      console.log('TEST 2F FAILED:', error.response?.status, error.response?.data?.message || error.message);
    }
  }
}

testAuth().catch(err => {
  console.error('FATAL TEST ERROR:', err.message);
  process.exit(1);
});
