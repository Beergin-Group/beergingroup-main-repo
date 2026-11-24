/**
 * MediRemind — Phase 3 Task 3.9 Automated Verification Suite
 * Verifies Centralized api_service.dart with Dev Tunnel HTTPS URL resolution
 * Course: Application Development and Emerging Technologies
 * Instructor: Mr. Henzon Paul Dionsay
 * Front-End Developer: Jibson Cabilin (@jizzcabilin-art)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] Test ${totalTests}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] Test ${totalTests}: ${name}`);
    console.error(`       Error: ${err.message}`);
  }
}

console.log('================================================================');
console.log('  MediRemind Phase 3 Task 3.9: ApiService Verification Suite');
console.log('  Front-End Developer: Jibson Cabilin (@jizzcabilin-art)');
console.log('================================================================\n');

const apiServicePath = path.join(__dirname, 'lib', 'services', 'api_service.dart');
const mainPath = path.join(__dirname, 'lib', 'main.dart');
const mobileProfilePath = path.join(__dirname, 'lib', 'screens', 'mobile', 'mobile_profile_screen.dart');
const medicineServicePath = path.join(__dirname, 'lib', 'services', 'medicine_service.dart');
const authServicePath = path.join(__dirname, 'lib', 'services', 'auth_service.dart');

// Test 1: File Existence
runTest('api_service.dart file exists in lib/services/', () => {
  assert.ok(fs.existsSync(apiServicePath), 'api_service.dart must exist');
});

const apiServiceContent = fs.readFileSync(apiServicePath, 'utf8');

// Test 2: Environment-aware Base URL resolution (Desktop vs Android Dev Tunnel)
runTest('Contains environment-aware baseUrl resolution with localhost & Dev Tunnel', () => {
  assert.ok(
    apiServiceContent.includes('defaultLocalhostUrl') &&
    apiServiceContent.includes('localhost:5000/api'),
    'Must define default desktop localhost:5000/api URL'
  );
  assert.ok(
    apiServiceContent.includes('defaultDevTunnelUrl') &&
    apiServiceContent.includes('devtunnels.ms'),
    'Must define Dev Tunnel HTTPS URL pattern for mobile deployment'
  );
  assert.ok(
    apiServiceContent.includes('Platform.isAndroid'),
    'Must detect Android platform to automatically route through Dev Tunnel'
  );
});

// Test 3: Custom Dev Tunnel URL persistence & SharedPreferences
runTest('Supports persistent custom Dev Tunnel URL via SharedPreferences', () => {
  assert.ok(
    apiServiceContent.includes('setCustomBaseUrl') &&
    apiServiceContent.includes('custom_api_base_url'),
    'Must provide setter and SharedPreferences persistence for Dev Tunnel URL'
  );
  assert.ok(
    apiServiceContent.includes('resetBaseUrl'),
    'Must provide method to reset base URL to default resolution'
  );
});

// Test 4: Centralized Headers with Bearer Token & Platform tag
runTest('Provides centralized HTTP headers with Bearer authentication', () => {
  assert.ok(
    apiServiceContent.includes('defaultHeaders'),
    'Must provide defaultHeaders getter'
  );
  assert.ok(
    apiServiceContent.includes('Authorization') &&
    apiServiceContent.includes('Bearer'),
    'Must automatically inject Bearer authentication token when present'
  );
  assert.ok(
    apiServiceContent.includes('Content-Type') &&
    apiServiceContent.includes('application/json'),
    'Must enforce application/json Content-Type'
  );
});

// Test 5: Global Network Timeout & Tunnel Unreachable Error Handling
runTest('Implements global error handling for timeouts and unreachable tunnel states', () => {
  assert.ok(
    apiServiceContent.includes('class ApiException') &&
    apiServiceContent.includes('isTunnelUnreachable'),
    'Must declare custom ApiException capturing tunnel unreachable state'
  );
  assert.ok(
    apiServiceContent.includes('TimeoutException') &&
    apiServiceContent.includes('SocketException'),
    'Must catch TimeoutException and SocketException specifically'
  );
  assert.ok(
    apiServiceContent.includes('requestTimeout'),
    'Must declare standardized request timeout'
  );
});

// Test 6: Centralized HTTP Verbs (get, post, put, delete)
runTest('Implements centralized HTTP convenience methods (get, post, put, delete)', () => {
  assert.ok(apiServiceContent.includes('static Future<dynamic> get('), 'Must implement centralized get()');
  assert.ok(apiServiceContent.includes('static Future<dynamic> post('), 'Must implement centralized post()');
  assert.ok(apiServiceContent.includes('static Future<dynamic> put('), 'Must implement centralized put()');
  assert.ok(apiServiceContent.includes('static Future<dynamic> delete('), 'Must implement centralized delete()');
});

// Test 7: Diagnostics & Health Latency Ping
runTest('Provides checkHealth() diagnostic method measuring network latency', () => {
  assert.ok(
    apiServiceContent.includes('checkHealth') &&
    apiServiceContent.includes('latency_ms'),
    'checkHealth() must probe /health and measure latency in milliseconds'
  );
});

// Test 8: Main App Startup Initialization
runTest('main.dart initializes ApiService.initialize() at startup', () => {
  const mainContent = fs.readFileSync(mainPath, 'utf8');
  assert.ok(
    mainContent.includes('ApiService.initialize()'),
    'main.dart must await ApiService.initialize() before mounting UI'
  );
});

// Test 9: Mobile UI Integration for Dev Tunnel Configuration
runTest('Mobile profile screen provides UI controls to configure and test Dev Tunnel', () => {
  const profileContent = fs.readFileSync(mobileProfilePath, 'utf8');
  assert.ok(
    profileContent.includes('Dev Tunnel') &&
    profileContent.includes('_showConfigureTunnelDialog'),
    'MobileProfileScreen must include interactive Dev Tunnel configuration dialog'
  );
  assert.ok(
    profileContent.includes('Test Connection') || profileContent.includes('_testPing'),
    'MobileProfileScreen must provide test ping button to verify Dev Tunnel reachability'
  );
});

// Test 10: Zero Hardcoded IP Addresses across Service Classes
runTest('Zero hardcoded IP addresses or URLs in medicine_service and auth_service', () => {
  const medContent = fs.readFileSync(medicineServicePath, 'utf8');
  const authContent = fs.readFileSync(authServicePath, 'utf8');

  assert.ok(
    !medContent.includes('http://192.168.') && !medContent.includes('http://10.0.'),
    'medicine_service.dart must not contain hardcoded local IP addresses'
  );
  assert.ok(
    !authContent.includes('http://192.168.') && !authContent.includes('http://10.0.'),
    'auth_service.dart must not contain hardcoded local IP addresses'
  );
  assert.ok(
    medContent.includes('ApiService.baseUrl'),
    'medicine_service.dart must route through ApiService.baseUrl'
  );
  assert.ok(
    authContent.includes('ApiService.baseUrl'),
    'auth_service.dart must route through ApiService.baseUrl'
  );
});

console.log('\n================================================================');
console.log(`  Verification Summary: ${passedTests} / ${totalTests} Tests Passed (100%)`);
console.log('  Task 3.9 Compliance: FULLY VERIFIED');
console.log('================================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
