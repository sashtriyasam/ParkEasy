const BASE_URL = 'https://parkeasy-backend-uy3x.onrender.com/api/v1';

async function runTests() {
  const report = {
    passing: [],
    failing: [],
    warnings: [],
    summary: { total: 0, passed: 0, failed: 0 }
  };

  const logPass = (id) => {
    console.log(`✅ ${id} PASSED`);
    report.passing.push(id);
    report.summary.passed++;
    report.summary.total++;
  };

  const logFail = (id, expected, actual, error, severity = 'HIGH') => {
    console.log(`❌ ${id} FAILED: ${error}`);
    report.failing.push({ id, expected, actual, error, severity });
    report.summary.failed++;
    report.summary.total++;
  };

  const logWarn = (msg) => {
    console.log(`⚠️ WARNING: ${msg}`);
    report.warnings.push(msg);
  };

  let CUSTOMER_TOKEN, PROVIDER_TOKEN, FACILITY_ID, SLOT_ID, VEHICLE_ID, RESERVED_SLOT_ID, TICKET_ID, QA_FACILITY_ID, QA_FLOOR_ID;
  let REFRESH_TOKEN;

  async function api(path, method = 'GET', body = null, token = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ParkEasy-QA-Agent/1.0'
      }
    };
    if (body) options.body = JSON.stringify(body);
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    console.log(`DEBUG: [${method}] ${path} | Auth: ${token ? (token.substring(0, 10) + '...') : 'None'}`);

    const res = await fetch(`${BASE_URL}${path}`, options).catch(err => {
        console.log(`DEBUG: FETCH ERROR for ${path}: ${err.message}`);
        throw err;
    });
    
    const data = await res.json().catch(() => ({}));
    if (res.status !== 200 && res.status !== 201) {
        console.log(`DEBUG: ERROR RESPONSE [${res.status}] for ${path}: ${JSON.stringify(data)}`);
    } else {
        // console.log(`DEBUG: SUCCESS [${res.status}] for ${path}`);
    }
    return { status: res.status, data };
  }

  console.log('--- STARTING ParkEasy FULL E2E API TESTS (DEBUG MODE) ---');
  
  const C_EMAIL = `qa_c_${Date.now()}@test.com`;
  const P_EMAIL = `qa_p_${Date.now()}@test.com`;

  // 2A - Register Customer
  try {
    const res = await api('/auth/register', 'POST', { email: C_EMAIL, password: "QATest@1234", full_name: "QA Customer", phone_number: "+919999999901", role: "CUSTOMER" });
    if (res.status === 201) {
      logPass('TEST 2A');
    } else logFail('TEST 2A', 201, res.status, res.data.message || 'Reg failed');
  } catch (err) { logFail('TEST 2A', 201, 'ERR', err.message); }

  // 2C - Login Customer
  try {
    const res = await api('/auth/login', 'POST', { email: C_EMAIL, password: "QATest@1234" });
    if (res.status === 200) {
      CUSTOMER_TOKEN = res.data.data.accessToken;
      REFRESH_TOKEN = res.data.data.refreshToken;
      console.log(`DEBUG: Received CUSTOMER_TOKEN: ${CUSTOMER_TOKEN ? 'DEFINED' : 'UNDEFINED'}`);
      logPass('TEST 2C');
    } else logFail('TEST 2C', 200, res.status, res.data.message || 'Login failed');
  } catch (err) { logFail('TEST 2C', 200, 'ERR', err.message); }

  // 3A - Search
  if (CUSTOMER_TOKEN) {
    try {
      const res = await api('/customer/search?latitude=19.0662&longitude=72.8659&radius=20', 'GET', null, CUSTOMER_TOKEN);
      if (res.status === 200) {
          FACILITY_ID = res.data.data[0]?.id;
          logPass('TEST 3A');
      } else logFail('TEST 3A', 200, res.status, res.data.message || 'Search failed');
    } catch (err) { logFail('TEST 3A', 200, 'ERR', err.message); }
  } else {
      logFail('TEST 3A', 'TOKEN', 'MISSING', 'Skipping because no token');
  }

  console.log('\n--- FINAL REPORT DATA ---');
  console.log(JSON.stringify(report, null, 2));
}

runTests();
