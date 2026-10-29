/**
 * MediRemind — Automated Authentication Endpoint Test Runner
 * Week 3 Deliverable
 * Author: Francis John Empil & Nove Calasang
 *
 * Runs 10 automated test assertions against the Auth API.
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

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

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
  console.log('🧪 MediRemind — Week 3 Auth API Test Suite');
  console.log('========================================\n');

  try {
    // TC-01: Demo accounts endpoint
    console.log('Running Test 1: GET /api/auth/demo-accounts...');
    const demoRes = await request('GET', '/api/auth/demo-accounts');
    assert('Returns 200 OK', demoRes.status === 200);
    assert('Accounts array returned with patient & caregiver', demoRes.data.accounts && demoRes.data.accounts.length >= 2);

    // TC-02: Missing fields registration
    console.log('\nRunning Test 2: POST /api/auth/register (Missing Password)...');
    const missingPwdRes = await request('POST', '/api/auth/register', {
      name: 'Test Missing',
      email: 'missing@example.com'
    });
    assert('Returns 400 Bad Request', missingPwdRes.status === 400);

    // TC-03: Invalid Email format registration
    console.log('\nRunning Test 3: POST /api/auth/register (Malformed Email)...');
    const badEmailRes = await request('POST', '/api/auth/register', {
      name: 'Bad Email',
      email: 'not-an-email',
      password: 'Password123'
    });
    assert('Returns 400 Bad Request on invalid email format', badEmailRes.status === 400);

    // TC-04: Weak password registration (< 8 chars)
    console.log('\nRunning Test 4: POST /api/auth/register (Weak Password)...');
    const weakPwdRes = await request('POST', '/api/auth/register', {
      name: 'Weak Pass',
      email: 'weak@example.com',
      password: '123'
    });
    assert('Returns 400 Bad Request on weak password', weakPwdRes.status === 400);

    // TC-05: Successful Registration
    const uniqueEmail = `test_user_${Date.now()}@mediremind.com`;
    console.log(`\nRunning Test 5: POST /api/auth/register (Valid Account: ${uniqueEmail})...`);
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Automated Test User',
      email: uniqueEmail,
      password: 'Password123!',
      role: 'patient',
      phone: '+639170001122'
    });
    assert('Returns 201 Created', regRes.status === 201);
    assert('Returns valid JWT token', typeof regRes.data.token === 'string' && regRes.data.token.length > 20);
    assert('Returns sanitized user object without password_hash', regRes.data.user && !regRes.data.user.password_hash);

    // TC-06: Duplicate email registration
    console.log('\nRunning Test 6: POST /api/auth/register (Duplicate Email Conflict)...');
    const dupRes = await request('POST', '/api/auth/register', {
      name: 'Duplicate Clone',
      email: uniqueEmail,
      password: 'Password123!'
    });
    assert('Returns 409 Conflict', dupRes.status === 409);

    // TC-07: Valid Login
    console.log('\nRunning Test 7: POST /api/auth/login (Valid Credentials)...');
    const loginRes = await request('POST', '/api/auth/login', {
      email: uniqueEmail,
      password: 'Password123!'
    });
    assert('Returns 200 OK', loginRes.status === 200);
    assert('Contains signed token', typeof loginRes.data.token === 'string');
    const authToken = loginRes.data.token;

    // TC-08: Invalid Password Login
    console.log('\nRunning Test 8: POST /api/auth/login (Wrong Password)...');
    const wrongPassRes = await request('POST', '/api/auth/login', {
      email: uniqueEmail,
      password: 'WrongPassword999!'
    });
    assert('Returns 401 Unauthorized', wrongPassRes.status === 401);

    // TC-09: Protected Endpoint with Valid Bearer Token
    console.log('\nRunning Test 9: GET /api/auth/me (Authenticated Session)...');
    const meRes = await request('GET', '/api/auth/me', null, authToken);
    assert('Returns 200 OK', meRes.status === 200);
    assert('Decodes user matching email', meRes.data.user && meRes.data.user.email === uniqueEmail);

    // TC-10: Protected Endpoint with No Token
    console.log('\nRunning Test 10: GET /api/auth/me (Unauthorized Request)...');
    const noTokenRes = await request('GET', '/api/auth/me');
    assert('Returns 401 Unauthorized', noTokenRes.status === 401);

    console.log('\n----------------------------------------');
    console.log(`Test Execution Summary: ${passedCount} Passed, ${failedCount} Failed`);
    console.log('----------------------------------------\n');
  } catch (err) {
    console.error('Test Execution Error:', err.message);
    console.log('Note: Ensure the MediRemind backend server is running on localhost:5000 before running tests.');
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
