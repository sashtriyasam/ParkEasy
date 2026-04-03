const axios = require('axios');
const crypto = require('crypto');

const BASE_URL = 'https://parkeasy-backend-uy3x.onrender.com/api/v1';

async function testAuthUnique() {
  const randomSuffix = crypto.randomBytes(4).toString('hex');
  const email = `qatest_${randomSuffix}@parkeasy.in`;
  const phone = `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`;

  console.log(`--- TESTING REGISTRATION WITH UNIQUE DATA: ${email} ---`);

  try {
    const reg = await axios.post(`${BASE_URL}/auth/register`, {
      email: email,
      password: "QATest@1234",
      full_name: "QA Unique User",
      phone_number: phone,
      role: "CUSTOMER"
    });
    console.log('REGISTRATION SUCCESS:', reg.status, reg.data.status);
  } catch (error) {
    console.log('REGISTRATION FAILED:', error.response?.status, error.response?.data?.message || error.message);
    if (error.response?.data?.error) {
        console.log('Full Error Details:', JSON.stringify(error.response.data.error, null, 2));
    }
  }
}

testAuthUnique();
