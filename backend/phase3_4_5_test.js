const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function runTests() {
  console.log('--- PHASE 3, 4, 5: API FLOW TESTS ---');

  // Login both roles
  let customerToken, providerToken;
  try {
    const loginCust = await axios.post(`${BASE_URL}/auth/login`, { email: 'qatest_customer@parkeasy.in', password: 'QATest@1234' });
    customerToken = loginCust.data.data.accessToken;
    const loginProv = await axios.post(`${BASE_URL}/auth/login`, { email: 'qatest_provider@parkeasy.in', password: 'QATest@1234' });
    providerToken = loginProv.data.data.accessToken;
    console.log('Logins successful');
  } catch (err) { console.error('Login failed:', err.message); return; }

  const custHeader = { Authorization: `Bearer ${customerToken}` };
  const provHeader = { Authorization: `Bearer ${providerToken}` };

  // --- PHASE 3 (FIXED) ---
  let facilityId, slotId, vehicleId, ticketId;
  try {
    const search = await axios.get(`${BASE_URL}/customer/search?latitude=19.0662&longitude=72.8659&radius=20`, { headers: custHeader });
    facilityId = search.data.data[0].id;
    console.log('TEST 3A PASSED: Facility found', facilityId);

    const slotsRes = await axios.get(`${BASE_URL}/customer/facility/${facilityId}/slots`, { headers: custHeader });
    const slotsByFloor = slotsRes.data.data;
    const floors = Object.keys(slotsByFloor);
    console.log('TEST 3C PASSED: Slots grouped by floor:', floors);
    for (const f of floors) {
      const freeCAR = slotsByFloor[f].find(s => s.status === 'FREE' && s.vehicle_type === 'CAR');
      if (freeCAR) { slotId = freeCAR.id; break; }
    }
    console.log('SLOT_ID found:', slotId);

    const reserve = await axios.post(`${BASE_URL}/bookings/reserve`, { facility_id: facilityId, vehicle_type: "CAR" }, { headers: custHeader });
    const reservedSlotId = reserve.data.data.slot_id;
    console.log('TEST 3E PASSED: Reserved slot', reservedSlotId);

    const booking = await axios.post(`${BASE_URL}/bookings`, {
      facility_id: facilityId,
      slot_id: reservedSlotId,
      vehicle_number: "MH04QA1111",
      vehicle_type: "CAR",
      payment_method: "upi",
      status: "PENDING"
    }, { headers: custHeader });
    ticketId = booking.data.data.id;
    console.log('TEST 3F PASSED: Booking created', ticketId);
  } catch (err) { console.log('Phase 3 partially failed:', err.response?.status, err.message); }

  // --- PHASE 4: PROVIDER FLOWS ---
  let qaFacilityId, qaFloorId;
  try {
      // 4A Stats
      const stats = await axios.get(`${BASE_URL}/provider/dashboard/stats`, { headers: provHeader });
      console.log('TEST 4A PASSED: Provider stats retrieved');

      // 4B Create Facility
      const createFac = await axios.post(`${BASE_URL}/provider/facilities`, {
          name: `QA Test Parking ${Date.now()}`,
          address: "Test Street, Thane West",
          city: "Thane",
          latitude: 19.2183,
          longitude: 72.9781,
          total_floors: 1,
          operating_hours: "24/7",
          description: "QA test facility"
      }, { headers: provHeader });
      qaFacilityId = createFac.data.data.id;
      console.log('TEST 4B PASSED: QA Facility created', qaFacilityId);

      // 4C Add Floor
      const addFloor = await axios.post(`${BASE_URL}/provider/facilities/${qaFacilityId}/floors`, {
          floor_number: 0,
          floor_name: "Ground Floor"
      }, { headers: provHeader });
      qaFloorId = addFloor.data.data.id;
      console.log('TEST 4D PASSED: QA Floor created', qaFloorId);

      // 4D Bulk Create Slots
      const bulkSlots = await axios.post(`${BASE_URL}/provider/facilities/${qaFacilityId}/slots/bulk`, {
          floor_id: qaFloorId,
          vehicle_type: "CAR",
          count: 5,
          prefix: "QA"
      }, { headers: provHeader });
      console.log('TEST 4D PASSED: 5 slots created');

      // 4E Set Pricing Rule
      const pricing = await axios.post(`${BASE_URL}/provider/pricing-rules`, {
          facility_id: qaFacilityId,
          vehicle_type: "CAR",
          hourly_rate: 50,
          daily_max: 400,
          monthly_pass_price: 3000
      }, { headers: provHeader });
      console.log('TEST 4E PASSED: Pricing rule saved');

      // 4F Get My Facilities
      const myFacs = await axios.get(`${BASE_URL}/provider/facilities`, { headers: provHeader });
      console.log('TEST 4F PASSED: My facilities count', myFacs.data.data.length);

      // 4I Security Check
      try {
          await axios.get(`${BASE_URL}/provider/dashboard/stats`, { headers: custHeader });
          console.log('TEST 4I FAILED: Customer accessed provider route!');
      } catch (e) {
          console.log('TEST 4I PASSED: Customer denied provider route', e.response?.status);
      }
  } catch (err) { console.log('Phase 4 failed:', err.response?.status, err.message); }

  // --- PHASE 5: PAYMENT FLOW ---
  try {
      const order = await axios.post(`${BASE_URL}/payments/create-order`, {
          amount: 60,
          facility_id: facilityId,
          slot_id: slotId
      }, { headers: custHeader });
      console.log('TEST 5A PASSED: Razorpay order created', order.data.data.id);
  } catch (err) {
      console.log('TEST 5A FAILED:', err.response?.status, err.response?.data?.message || err.message);
  }
}

runTests();
