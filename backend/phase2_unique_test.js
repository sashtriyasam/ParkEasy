require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = process.env.BASE_URL || 'https://parkeasy-backend-uy3x.onrender.com/api/v1';

async function testAuthUnique() {
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  const email = `qatest_${randomSuffix}@parkeasy.in`;
  const phone = `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`;

  console.log(`--- TESTING REGISTRATION WITH UNIQUE DATA: ${email} ---`);

  let createdUserToken;
  try {
    const reg = await axios.post(`${BASE_URL}/auth/register`, {
      email: email,
      password: process.env.TEST_USER_PASSWORD || "QATest@1234",
      full_name: "QA Unique User",
      phone_number: phone,
      role: "CUSTOMER"
    });
    createdUserToken = reg.data.data.accessToken;
    console.log('REGISTRATION SUCCESS:', reg.status, reg.data.status);
  } catch (error) {
    console.error('REGISTRATION FAILED:', error.response?.status, error.response?.data?.message || error.message);
    if (error.response?.data?.error) {
        console.error('Full Error Details:', JSON.stringify(error.response.data.error, null, 2));
    }
    process.exit(1);
  } finally {
    if (createdUserToken) {
      try {
        await axios.delete(`${BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${createdUserToken}` }
        });
        console.log('CLEANUP: Test user deleted');
      } catch (err) {
        console.error('CLEANUP FAILED:', err.response?.status, err.response?.data?.message || err.message);
      }
    }
  }
}

testAuthUnique();
