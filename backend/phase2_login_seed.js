require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'https://parkeasy-backend-uy3x.onrender.com/api/v1';

async function testLoginSeed() {
  console.log('--- TESTING LOGIN WITH SEED CREDENTIALS ---');

  const customerEmail = process.env.CUSTOMER_EMAIL;
  const customerPassword = process.env.CUSTOMER_PASSWORD;
  const providerEmail = process.env.PROVIDER_EMAIL;
  const providerPassword = process.env.PROVIDER_PASSWORD;

  if (!customerEmail || !customerPassword || !providerEmail || !providerPassword) {
    console.error('Infrastructure Failure: Missing required environment variables (CUSTOMER_EMAIL, CUSTOMER_PASSWORD, PROVIDER_EMAIL, PROVIDER_PASSWORD).');
    process.exit(1);
  }

  // Login as Customer
  let customerTokens;
  try {
    const loginCust = await axios.post(`${BASE_URL}/auth/login`, {
      email: customerEmail,
      password: customerPassword
    });
    customerTokens = loginCust.data.data;
    console.log('CUSTOMER LOGIN SUCCESS:', loginCust.status);
    const maskedCustToken = `${customerTokens.accessToken.substring(0, 10)}...${customerTokens.accessToken.slice(-10)}`;
    console.log(`CUSTOMER_ACCESS_TOKEN_MASKED=${maskedCustToken}`);
  } catch (error) {
    console.log('CUSTOMER LOGIN FAILED:', error.response?.status, error.response?.data?.message || error.message);
  }

  // Login as Provider
  try {
    const loginProv = await axios.post(`${BASE_URL}/auth/login`, {
      email: providerEmail,
      password: providerPassword
    });
    console.log('PROVIDER LOGIN SUCCESS:', loginProv.status);
    const maskedProvToken = `${loginProv.data.data.accessToken.substring(0, 10)}...${loginProv.data.data.accessToken.slice(-10)}`;
    console.log(`PROVIDER_ACCESS_TOKEN_MASKED=${maskedProvToken}`);
  } catch (error) {
    console.log('PROVIDER LOGIN FAILED:', error.response?.status, error.response?.data?.message || error.message);
  }
}

if (require.main === module) {
  testLoginSeed();
}
