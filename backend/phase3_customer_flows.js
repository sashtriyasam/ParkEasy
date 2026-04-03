const axios = require('axios');

const BASE_URL = 'https://parkeasy-backend-uy3x.onrender.com/api/v1';
const CUSTOMER_EMAIL = 'customer@test.com';
const CUSTOMER_PASS = 'customer123';

async function testCustomerFlows() {
  console.log('--- PHASE 3: CUSTOMER API FLOWS ---');

  // Login to get token (since previous one might have expired or wasn't saved to file)
  let token;
  try {
    const login = await axios.post(`${BASE_URL}/auth/login`, {
      email: CUSTOMER_EMAIL,
      password: CUSTOMER_PASS
    });
    token = login.data.data.accessToken;
    console.log('LOGIN SUCCESS');
  } catch (err) {
    console.error('LOGIN FAILED', err.message);
    return;
  }

  const authHeader = { Authorization: `Bearer ${token}` };

  // TEST 3A - Search Parking
  let facilityId;
  try {
    const search = await axios.get(`${BASE_URL}/customer/search?latitude=19.0662&longitude=72.8659&radius=20`, { headers: authHeader });
    const facilities = search.data.data;
    console.log('TEST 3A PASSED:', search.status, 'Facilities found:', facilities.length);
    facilities.forEach(f => console.log(`  - ID: ${f.id}, Name: ${f.name}`));
    facilityId = facilities[0].id;
    console.log('FACILITY_ID set to:', facilityId);
  } catch (err) {
    console.log('TEST 3A FAILED:', err.response?.status, err.response?.data?.message || err.message);
  }

  // TEST 3B - Facility Details
  if (facilityId) {
    try {
      const details = await axios.get(`${BASE_URL}/customer/facility/${facilityId}`, { headers: authHeader });
      console.log('TEST 3B PASSED:', details.status, 'Floors:', details.data.data.floors?.length);
      // console.log('Details:', JSON.stringify(details.data.data, null, 2));
    } catch (err) {
      console.log('TEST 3B FAILED:', err.response?.status, err.response?.data?.message || err.message);
    }
  }

  // TEST 3C - Available Slots
  let slotId;
  if (facilityId) {
    try {
      const slotsRes = await axios.get(`${BASE_URL}/customer/facility/${facilityId}/slots`, { headers: authHeader });
      const floors = slotsRes.data.data;
      console.log('TEST 3C PASSED:', slotsRes.status, 'Floors with slots:', floors.length);
      
      // Find a FREE CAR slot
      for (const floor of floors) {
          const freeSlot = floor.slots.find(s => s.status === 'FREE' && s.vehicle_type === 'CAR');
          if (freeSlot) {
              slotId = freeSlot.id;
              console.log('SLOT_ID found:', slotId);
              break;
          }
      }
    } catch (err) {
      console.log('TEST 3C FAILED:', err.response?.status, err.response?.data?.message || err.message);
    }
  }

  // TEST 3D - Add Vehicle
  let vehicleId;
  try {
    const addVehicle = await axios.post(`${BASE_URL}/customer/vehicles`, {
      vehicle_number: "MH04QA0001",
      vehicle_type: "CAR",
      nickname: "QA Car"
    }, { headers: authHeader });
    vehicleId = addVehicle.data.data.id;
    console.log('TEST 3D PASSED:', addVehicle.status, 'VEHICLE_ID:', vehicleId);
  } catch (err) {
    console.log('TEST 3D Potentially FAILED or Vehicle Exists:', err.response?.status, err.response?.data?.message || err.message);
  }

  // TEST 3E - Reserve Slot
  let reservedSlotId;
  if (facilityId) {
    try {
      const reserve = await axios.post(`${BASE_URL}/bookings/reserve`, {
        facility_id: facilityId,
        vehicle_type: "CAR"
      }, { headers: authHeader });
      reservedSlotId = reserve.data.data.slot_id;
      console.log('TEST 3E PASSED:', reserve.status, 'RESERVED_SLOT_ID:', reservedSlotId);
    } catch (err) {
      console.log('TEST 3E FAILED:', err.response?.status, err.response?.data?.message || err.message);
    }
  }

  // TEST 3F - Create Booking
  let ticketId;
  if (facilityId && reservedSlotId) {
    try {
      const booking = await axios.post(`${BASE_URL}/bookings`, {
        facility_id: facilityId,
        slot_id: reservedSlotId,
        vehicle_number: "MH04QA0001",
        vehicle_type: "CAR",
        payment_method: "upi",
        status: "PENDING"
      }, { headers: authHeader });
      ticketId = booking.data.data.id;
      console.log('TEST 3F PASSED:', booking.status, 'TICKET_ID:', ticketId);
    } catch (err) {
      console.log('TEST 3F FAILED:', err.response?.status, err.response?.data?.message || err.message);
    }
  }

  // TEST 3G - Active Tickets
  try {
    const active = await axios.get(`${BASE_URL}/customer/tickets/active`, { headers: authHeader });
    console.log('TEST 3G PASSED:', active.status, 'Active count:', active.data.data.length);
  } catch (err) {
    console.log('TEST 3G FAILED:', err.response?.status, err.response?.data?.message || err.message);
  }

  // TEST 3H - Ticket Detail
  if (ticketId) {
    try {
      const ticket = await axios.get(`${BASE_URL}/customer/tickets/${ticketId}`, { headers: authHeader });
      console.log('TEST 3H PASSED:', ticket.status, 'QR_CODE present:', !!ticket.data.data.qr_code);
    } catch (err) {
      console.log('TEST 3H FAILED:', err.response?.status, err.response?.data?.message || err.message);
    }
  }

  // TEST 3I - Add Favorite
  if (facilityId) {
    try {
      const fav = await axios.post(`${BASE_URL}/customer/favorites/${facilityId}`, {}, { headers: authHeader });
      console.log('TEST 3I PASSED:', fav.status);
    } catch (err) {
      console.log('TEST 3I Potentially FAILED or Fav Exists:', err.response?.status, err.response?.data?.message || err.message);
    }
  }

  // TEST 3J - Get Favorites
  try {
    const favs = await axios.get(`${BASE_URL}/customer/favorites`, { headers: authHeader });
    console.log('TEST 3J PASSED:', favs.status, 'Fav count:', favs.data.data.length);
  } catch (err) {
    console.log('TEST 3J FAILED:', err.response?.status, err.response?.data?.message || err.message);
  }

  // TEST 3M - (Added for completeness) Delete Vehicle
  if (vehicleId) {
    try {
      const del = await axios.delete(`${BASE_URL}/customer/vehicles/${vehicleId}`, { headers: authHeader });
      console.log('TEST 3K PASSED:', del.status);
    } catch (err) {
      console.log('TEST 3K FAILED:', err.response?.status, err.response?.data?.message || err.message);
    }
  }

  // TEST 3L - Active Passes
  try {
    const passes = await axios.get(`${BASE_URL}/customer/passes/active`, { headers: authHeader });
    console.log('TEST 3L PASSED:', passes.status);
  } catch (err) {
    console.log('TEST 3L FAILED:', err.response?.status, err.response?.data?.message || err.message);
  }
}

testCustomerFlows();
