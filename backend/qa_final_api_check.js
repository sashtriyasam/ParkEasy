import axios from 'axios';

const API_URL = 'http://localhost:5006/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

async function test() {
  console.log('--- FINAL API SMART VERIFICATION ---');
  
  try {
    // 1. Login
    console.log('Step 1: Logging in...');
    
    const email = process.env.QA_EMAIL;
    const password = process.env.QA_PASSWORD;
    
    if (!email || !password) {
      throw new Error('Missing QA credentials. Set QA_EMAIL and QA_PASSWORD environment variables.');
    }

    const loginRes = await apiClient.post('/auth/login', { email, password });
    
    if (!loginRes || !loginRes.data || typeof loginRes.data.token !== 'string') {
      throw new Error('Invalid login response. No valid JWT bearer token provided.');
    }
    
    const token = loginRes.data.token;
    console.log('✅ Login Successful!');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Search Mumbai
    console.log('\nStep 2: Searching for facilities in Mumbai...');
    const searchRes = await apiClient.get('/customer/search?city=Mumbai&latitude=19.0760&longitude=72.8777', { headers });
    
    if (!searchRes?.data?.data) {
      throw new Error('Invalid or empty response from search API');
    }
    
    const facilities = searchRes.data.data.facilities || searchRes.data.data; 
    
    if (!Array.isArray(facilities)) {
       console.error('Search API did not return an array of facilities:', searchRes.data.data);
       throw new Error('Search API did not return an array of facilities');
    }
    
    const garage = facilities.find(f => f.name === 'LOCAL TEST GARAGE');
    if (garage) {
      console.log(`✅ Found: ${garage.name} (ID: ${garage.id})`);
      
      // 3. Get Slots
      console.log(`\nStep 3: Fetching slots for ${garage.name}...`);
      const slotsRes = await apiClient.get(`/customer/facility/${garage.id}/slots`, { headers });
      const slotsData = slotsRes.data.data;
      
      // The slots are grouped by floor in some models, or flat list
      console.log('✅ Slots fetched successfully.');
      console.log('Preview of Slot Data structure:', JSON.stringify(slotsData).substring(0, 200) + '...');
    } else {
      console.error('❌ LOCAL TEST GARAGE not found in Mumbai results.');
    }

  } catch (error) {
    console.error('❌ API Error:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

test();
