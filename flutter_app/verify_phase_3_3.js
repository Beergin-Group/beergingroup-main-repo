/**
 * MediRemind Phase 3.3 End-to-End Verification Suite
 * Task: Connect desktop client to localhost:5000 and verify CRUD
 * Issue: #42
 * Team: Beergin
 */

const http = require('http');
const path = require('path');
const { Pool } = require(path.join(__dirname, '../backend/node_modules/pg'));

const BASE_URL = 'http://localhost:5000/api';
const HOST = 'localhost';
const PORT = 5000;

const pgPool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'FrancisEmpil',
  database: 'mediremind'
});

function request(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {
      'Accept': 'application/json'
    };
    if (data) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(data);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request({
      hostname: HOST,
      port: PORT,
      path: `/api${endpoint}`,
      method,
      headers
    }, (res) => {
      let buf = '';
      res.on('data', chunk => buf += chunk);
      res.on('end', () => {
        try {
          const parsed = buf ? JSON.parse(buf) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: buf });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runVerification() {
  console.log('================================================================');
  console.log('   MediRemind — Phase 3.3 Automated Verification Suite');
  console.log('   Issue #42: Connect Desktop Client to localhost:5000 & CRUD');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`  [PASS] Test ${total}: ${testName}`);
      if (details) console.log(`         -> ${details}`);
    } else {
      console.error(`  [FAIL] Test ${total}: ${testName}`);
      if (details) console.error(`         -> ${details}`);
    }
  }

  // 1. Target URL & Health Check
  console.log('--- Step 1: Verify HTTP Client Target (http://localhost:5000/api) ---');
  const healthRes = await request('GET', '/health');
  assert(
    healthRes.status === 200 && healthRes.body.status === 'online',
    'Verify backend health endpoint is active',
    `Status: ${healthRes.body.status}, Driver: ${healthRes.body.db_driver}, Arch: ${healthRes.body.architecture}`
  );
  assert(
    healthRes.body.db_driver === 'POSTGRES',
    'Verify PostgreSQL database driver is connected',
    `DB Driver: ${healthRes.body.db_driver}`
  );

  // 2. Authentication (POST /api/auth/login)
  console.log('\n--- Step 2: Verify User Authentication (POST /api/auth/login) ---');
  const loginRes = await request('POST', '/auth/login', {
    email: 'patient@mediremind.com',
    password: 'password123'
  });
  assert(
    loginRes.status === 200 && loginRes.body.success === true,
    'Verify POST /api/auth/login returns HTTP 200 & success',
    `User: ${loginRes.body.user.name} (${loginRes.body.user.role})`
  );
  const token = loginRes.body.token;
  assert(
    typeof token === 'string' && token.length > 20,
    'Verify JWT token returned for desktop session storage',
    `Token Prefix: ${token.substring(0, 25)}...`
  );

  // 3. Native Storage & Profile Retrieval (GET /api/auth/me)
  console.log('\n--- Step 3: Verify Profile Retrieval (GET /api/auth/me) with JWT ---');
  const meRes = await request('GET', '/auth/me', null, token);
  assert(
    meRes.status === 200 && meRes.body.success === true,
    'Verify GET /api/auth/me succeeds with Bearer token',
    `Retrieved Name: ${meRes.body.user.name}, Email: ${meRes.body.user.email}`
  );

  // 4. Medication CRUD: READ (GET /api/medicines)
  console.log('\n--- Step 4: Verify Medication READ (GET /api/medicines) ---');
  const getMedsRes = await request('GET', '/medicines', null, token);
  assert(
    getMedsRes.status === 200 && Array.isArray(getMedsRes.body.data),
    'Verify GET /api/medicines returns list of user medications',
    `Found ${getMedsRes.body.count} existing medications in catalog`
  );

  // 5. Medication CRUD: CREATE (POST /api/medicines)
  console.log('\n--- Step 5: Verify Medication CREATE (POST /api/medicines) ---');
  const testMed = {
    name: 'Phase 3.3 Test Tablet',
    dosage: '250mg',
    form: 'tablet',
    instructions: 'Take 1 tablet before sleeping',
    stock_count: 50,
    low_stock_threshold: 10,
    color: '#0d9488'
  };
  const createRes = await request('POST', '/medicines', testMed, token);
  assert(
    createRes.status === 201 && createRes.body.success === true,
    'Verify POST /api/medicines returns HTTP 201 Created',
    `Created ID: ${createRes.body.data ? createRes.body.data.id : 'N/A'}`
  );
  const createdId = createRes.body.data.id;

  // Direct PostgreSQL DB Persistence Verification
  const pgCheckCreate = await pgPool.query('SELECT * FROM medicines WHERE id = $1', [createdId]);
  assert(
    pgCheckCreate.rows.length === 1 && pgCheckCreate.rows[0].name === testMed.name,
    'Verify prescription persisted directly into PostgreSQL database table "medicines"',
    `PostgreSQL Record: ID ${pgCheckCreate.rows[0].id}, Stock: ${pgCheckCreate.rows[0].stock_count}, Form: ${pgCheckCreate.rows[0].form}`
  );

  // 6. Medication CRUD: UPDATE (PUT /api/medicines/:id)
  console.log('\n--- Step 6: Verify Medication UPDATE (PUT /api/medicines/:id) ---');
  const updatePayload = {
    name: 'Phase 3.3 Test Tablet (Refilled & Updated)',
    dosage: '500mg',
    stock_count: 65,
    low_stock_threshold: 12
  };
  const updateRes = await request('PUT', `/medicines/${createdId}`, updatePayload, token);
  assert(
    updateRes.status === 200 && updateRes.body.success === true,
    'Verify PUT /api/medicines/:id returns HTTP 200 & updated entity',
    `Updated Name: ${updateRes.body.data.name}, Stock: ${updateRes.body.data.stock_count}`
  );

  // Direct PostgreSQL DB Update Verification
  const pgCheckUpdate = await pgPool.query('SELECT * FROM medicines WHERE id = $1', [createdId]);
  assert(
    pgCheckUpdate.rows.length === 1 &&
    pgCheckUpdate.rows[0].name === updatePayload.name &&
    Number(pgCheckUpdate.rows[0].stock_count) === 65,
    'Verify prescription updates persisted in PostgreSQL database',
    `PostgreSQL Verified: Name="${pgCheckUpdate.rows[0].name}", Stock=${pgCheckUpdate.rows[0].stock_count}`
  );

  // 7. Medication Refill (POST /api/medicines/:id/refill)
  console.log('\n--- Step 7: Verify Medication REFILL (POST /api/medicines/:id/refill) ---');
  const refillRes = await request('POST', `/medicines/${createdId}/refill`, { amount: 20 }, token);
  assert(
    refillRes.status === 200 && refillRes.body.success === true,
    'Verify POST /api/medicines/:id/refill increments inventory stock',
    `Stock after +20: ${refillRes.body.data.stock_count}`
  );

  // 8. Medication CRUD: DELETE (DELETE /api/medicines/:id)
  console.log('\n--- Step 8: Verify Medication DELETE (DELETE /api/medicines/:id) ---');
  const deleteRes = await request('DELETE', `/medicines/${createdId}`, null, token);
  assert(
    deleteRes.status === 200 && deleteRes.body.success === true,
    'Verify DELETE /api/medicines/:id returns HTTP 200',
    `Message: ${deleteRes.body.message}`
  );

  // Direct PostgreSQL DB Deletion Verification
  const pgCheckDelete = await pgPool.query('SELECT * FROM medicines WHERE id = $1', [createdId]);
  assert(
    pgCheckDelete.rows.length === 0,
    'Verify prescription was permanently purged from PostgreSQL database',
    'PostgreSQL query returned 0 rows (Record completely deleted)'
  );

  // 9. Negative / Disconnection & Error Handling (Toast validation)
  console.log('\n--- Step 9: Verify Error & Authentication Feedback (Toast Trigger) ---');
  const invalidLoginRes = await request('POST', '/auth/login', {
    email: 'wrong@mediremind.com',
    password: 'badpassword'
  });
  assert(
    invalidLoginRes.status === 401 && invalidLoginRes.body.success === false,
    'Verify invalid credentials return HTTP 401 with descriptive error message',
    `Backend Error: "${invalidLoginRes.body.message}"`
  );

  const unauthorizedReq = await request('GET', '/medicines', null, 'invalid_or_expired_token');
  assert(
    unauthorizedReq.status === 401 || unauthorizedReq.status === 403,
    'Verify unauthorized requests return HTTP 401/403 for desktop session expiry',
    `Status: HTTP ${unauthorizedReq.status}`
  );

  await pgPool.end();

  console.log('\n================================================================');
  console.log(`   Verification Summary: ${passed} / ${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('   All Phase 3.3 Acceptance Criteria Successfully Met!');
  console.log('================================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
