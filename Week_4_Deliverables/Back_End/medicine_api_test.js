/**
 * MediRemind — Automated Medicine CRUD Test Runner
 * Week 4 Deliverable
 * Author: Francis John Empil & Nove Calasang
 */

const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';
let passedCount = 0;
let failedCount = 0;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const data = body ? JSON.stringify(body) : null;
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) options.headers['Content-Length'] = Buffer.byteLength(data);
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(rawData); } catch (e) { json = rawData; }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', (err) => reject(err));
    if (data) req.write(data);
    req.end();
  });
}

function assert(description, condition) {
  if (condition) {
    console.log(`  [PASS] ${description}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${description}`);
    failedCount++;
  }
}

async function runTests() {
  console.log('\n========================================');
  console.log('🧪 MediRemind — Week 4 Medicine CRUD Test Suite');
  console.log('========================================\n');

  try {
    // 1. Authenticate as demo patient
    console.log('Setup: Authenticating as patient@mediremind.com...');
    const authRes = await request('POST', '/api/auth/login', {
      email: 'patient@mediremind.com',
      password: 'password123'
    });
    if (!authRes.data || !authRes.data.token) {
      throw new Error('Authentication failed in setup. Ensure backend is running.');
    }
    const token = authRes.data.token;
    console.log('Setup successful. Token acquired.\n');

    // TC-01: Unauthorized GET
    console.log('Running Test 1: GET /api/medicines without Token...');
    const unauthRes = await request('GET', '/api/medicines');
    assert('Returns 401 Unauthorized', unauthRes.status === 401);

    // TC-02: Get All Medicines
    console.log('\nRunning Test 2: GET /api/medicines with Valid Token...');
    const listRes = await request('GET', '/api/medicines', null, token);
    assert('Returns 200 OK', listRes.status === 200);
    assert('Returns array of medicines', Array.isArray(listRes.data.data));

    // TC-03: Create Medicine Missing Name
    console.log('\nRunning Test 3: POST /api/medicines (Missing Name validation)...');
    const badCreateRes = await request('POST', '/api/medicines', { dosage: '100 mg' }, token);
    assert('Returns 400 Bad Request on missing name', badCreateRes.status === 400);

    // TC-04: Create Medicine Missing Dosage
    console.log('\nRunning Test 4: POST /api/medicines (Missing Dosage validation)...');
    const badDosageRes = await request('POST', '/api/medicines', { name: 'Aspirin' }, token);
    assert('Returns 400 Bad Request on missing dosage', badDosageRes.status === 400);

    // TC-05: Successful Medicine Creation
    console.log('\nRunning Test 5: POST /api/medicines (Create Valid Medicine)...');
    const testMedName = `Test Med ${Date.now()}`;
    const createRes = await request('POST', '/api/medicines', {
      name: testMedName,
      dosage: '250 mg',
      form: 'capsule',
      instructions: 'Take 1 after dinner',
      stock_count: 15,
      low_stock_threshold: 5,
      color: '#10b981'
    }, token);
    assert('Returns 201 Created', createRes.status === 201);
    assert('Returns created medicine ID', createRes.data.data && createRes.data.data.id);
    const createdId = createRes.data.data.id;

    // TC-06: Read Created Medicine by ID
    console.log(`\nRunning Test 6: GET /api/medicines/${createdId}...`);
    const getSingleRes = await request('GET', `/api/medicines/${createdId}`, null, token);
    assert('Returns 200 OK', getSingleRes.status === 200);
    assert('Name matches created name', getSingleRes.data.data.name === testMedName);

    // TC-07: Update Medicine
    console.log(`\nRunning Test 7: PUT /api/medicines/${createdId} (Update dosage)...`);
    const updateRes = await request('PUT', `/api/medicines/${createdId}`, {
      dosage: '500 mg',
      instructions: 'Updated: Take 2 after breakfast'
    }, token);
    assert('Returns 200 OK', updateRes.status === 200);
    assert('Dosage updated to 500 mg', updateRes.data.data.dosage === '500 mg');

    // TC-08: Quick Refill Stock
    console.log(`\nRunning Test 8: POST /api/medicines/${createdId}/refill (+30 units)...`);
    const refillRes = await request('POST', `/api/medicines/${createdId}/refill`, { count: 30 }, token);
    assert('Returns 200 OK', refillRes.status === 200);
    assert('Stock increased by 30 (15 + 30 = 45)', refillRes.data.data.stock_count === 45);

    // TC-09: Delete Medicine
    console.log(`\nRunning Test 9: DELETE /api/medicines/${createdId}...`);
    const deleteRes = await request('DELETE', `/api/medicines/${createdId}`, null, token);
    assert('Returns 200 OK', deleteRes.status === 200);

    // TC-10: Verify Deletion (404)
    console.log(`\nRunning Test 10: GET /api/medicines/${createdId} after deletion...`);
    const verifyDelRes = await request('GET', `/api/medicines/${createdId}`, null, token);
    assert('Returns 404 Not Found', verifyDelRes.status === 404);

    console.log('\n----------------------------------------');
    console.log(`Test Execution Summary: ${passedCount} Passed, ${failedCount} Failed`);
    console.log('----------------------------------------\n');
  } catch (err) {
    console.error('Test Execution Error:', err.message);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
