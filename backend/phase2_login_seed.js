const axios = require('axios');

const BASE_URL = 'https://parkeasy-backend-uy3x.onrender.com/api/v1';

async function testLoginSeed() {
  console.log('--- TESTING LOGIN WITH SEED CREDENTIALS ---');

  // Login as Customer
  let customerTokens;
  try {
    const loginCust = await axios.post(`${BASE_URL}/auth/login`, {
      email: "customer@test.com",
      password: "customer123"
    });
    customerTokens = loginCust.data.data;
    console.log('CUSTOMER LOGIN SUCCESS:', loginCust.status);
    console.log('CUSTOMER_ACCESS_TOKEN=' + customerTokens.accessToken);
  } catch (error) {
    console.log('CUSTOMER LOGIN FAILED:', error.response?.status, error.response?.data?.message || error.message);
  }

  // Login as Provider
  try {
    const loginProv = await axios.post(`${BASE_URL}/auth/login`, {
      email: "provider@test.com",
      password: "provider123"
    });
    console.log('PROVIDER LOGIN SUCCESS:', loginProv.status);
    console.log('PROVIDER_ACCESS_TOKEN=' + loginProv.data.data.accessToken);
  } catch (error) {
    console.log('PROVIDER LOGIN FAILED:', error.response?.status, error.response?.data?.message || error.message);
  }
}

testLoginSeed();
