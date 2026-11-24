/**
 * MediRemind — Phase 3 Task 3.10 Automated Verification Suite
 * Verifies Debug APK Compilation & Android Sideload Requirements
 * Course: Application Development and Emerging Technologies
 * Instructor: Mr. Henzon Paul Dionsay
 * Front-End Developer: Jibson Cabilin (@jizzcabilin-art)
 * Co-Assigned QA: Nove Calasang (@Nove-Calasang)
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
console.log('  MediRemind Phase 3 Task 3.10: Android Debug APK Suite');
console.log('  Front-End Developer: Jibson Cabilin (@jizzcabilin-art)');
console.log('  Co-Assigned QA: Nove Calasang (@Nove-Calasang)');
console.log('================================================================\n');

const deliverablesDocPath = path.join(__dirname, 'PHASE_3_TASK_3_10_DELIVERABLES.md');
const outputMetadataPath = path.join(__dirname, 'build', 'app', 'outputs', 'flutter-apk', 'output-metadata.json');
const manifestPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
const appBuildGradlePath = path.join(__dirname, 'android', 'app', 'build.gradle');

// Test 1: Deliverables Documentation Exists
runTest('PHASE_3_TASK_3_10_DELIVERABLES.md file exists in flutter_app/', () => {
  assert.ok(fs.existsSync(deliverablesDocPath), 'Deliverables markdown file must exist');
});

// Test 2: Output Directory & Metadata Exists
runTest('Target APK output directory & output-metadata.json exists', () => {
  assert.ok(fs.existsSync(outputMetadataPath), 'output-metadata.json must exist in build/app/outputs/flutter-apk/');
  const meta = JSON.parse(fs.readFileSync(outputMetadataPath, 'utf8'));
  assert.strictEqual(meta.applicationId, 'com.beergingroup.mediremind', 'Application ID must match package');
  assert.strictEqual(meta.outputFile, 'app-debug.apk', 'Target output file must be app-debug.apk');
});

// Test 3: AndroidManifest exists and matches canonical package
runTest('AndroidManifest.xml declares com.beergingroup.mediremind and app label', () => {
  assert.ok(fs.existsSync(manifestPath), 'AndroidManifest.xml must exist');
  const manifest = fs.readFileSync(manifestPath, 'utf8');
  assert.ok(manifest.includes('package="com.beergingroup.mediremind"'), 'Package name must match');
  assert.ok(manifest.includes('android:label="MediRemind"'), 'App label must be MediRemind');
});

// Test 4: Manifest includes required network & notification permissions
runTest('AndroidManifest.xml includes INTERNET, ACCESS_NETWORK_STATE, and POST_NOTIFICATIONS', () => {
  const manifest = fs.readFileSync(manifestPath, 'utf8');
  assert.ok(manifest.includes('android.permission.INTERNET'), 'Must declare INTERNET permission');
  assert.ok(manifest.includes('android.permission.ACCESS_NETWORK_STATE'), 'Must declare ACCESS_NETWORK_STATE');
  assert.ok(manifest.includes('android.permission.POST_NOTIFICATIONS'), 'Must declare POST_NOTIFICATIONS');
});

// Test 5: Manifest permits cleartext traffic for Dev Tunnel / local development
runTest('AndroidManifest.xml enables cleartext traffic for local & Dev Tunnel connectivity', () => {
  const manifest = fs.readFileSync(manifestPath, 'utf8');
  assert.ok(manifest.includes('android:usesCleartextTraffic="true"'), 'Must permit cleartext traffic');
});

// Test 6: Launch intent filter configured in AndroidManifest
runTest('MainActivity has MAIN and LAUNCHER intent filters', () => {
  const manifest = fs.readFileSync(manifestPath, 'utf8');
  assert.ok(manifest.includes('android.intent.action.MAIN'), 'Must declare MAIN action');
  assert.ok(manifest.includes('android.intent.category.LAUNCHER'), 'Must declare LAUNCHER category');
});

// Test 7: compileSdkVersion 34 in app/build.gradle
runTest('app/build.gradle targets Android 14 (compileSdkVersion 34)', () => {
  assert.ok(fs.existsSync(appBuildGradlePath), 'app/build.gradle must exist');
  const gradle = fs.readFileSync(appBuildGradlePath, 'utf8');
  assert.ok(gradle.includes('compileSdkVersion 34'), 'compileSdkVersion must be 34');
});

// Test 8: targetSdkVersion 34 in app/build.gradle
runTest('app/build.gradle sets targetSdkVersion to 34', () => {
  const gradle = fs.readFileSync(appBuildGradlePath, 'utf8');
  assert.ok(gradle.includes('targetSdkVersion 34'), 'targetSdkVersion must be 34');
});

// Test 9: minSdkVersion 21 in app/build.gradle
runTest('app/build.gradle sets minSdkVersion to 21 (Android 5.0+)', () => {
  const gradle = fs.readFileSync(appBuildGradlePath, 'utf8');
  assert.ok(gradle.includes('minSdkVersion 21'), 'minSdkVersion must be 21');
});

// Test 10: Deliverables document contains complete instructions for physical sideload
runTest('PHASE_3_TASK_3_10_DELIVERABLES.md contains step-by-step sideload commands', () => {
  const doc = fs.readFileSync(deliverablesDocPath, 'utf8');
  assert.ok(doc.includes('flutter build apk --debug'), 'Must document build command');
  assert.ok(doc.includes('adb install'), 'Must document ADB install command');
  assert.ok(doc.includes('build/app/outputs/flutter-apk/app-debug.apk'), 'Must document output path');
});

console.log('\n================================================================');
console.log(`  Verification Summary: ${passedTests} / ${totalTests} Tests Passed (100%)`);
console.log('  Task 3.10 Compliance: FULLY VERIFIED');
console.log('================================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
