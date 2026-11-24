# MediRemind — Phase 3 Deliverables: Task 3.9
**Project Title:** MediRemind — Cross-Platform Medicine & Prescription Reminder  
**Course:** Application Development and Emerging Technologies  
**Instructor:** Mr. Henzon Paul Dionsay  
**Team Name:** Beergin  
**Front-End Developer:** Jibson Cabilin (`@jizzcabilin-art`)  
**Task Code:** Phase 3.9 (GitHub Issue #48)  
**Status:** Complete & Verified (100% Tests Passing)  

---

## 📌 Executive Summary

This deliverable fulfills **Task 3.9: Implement centralized `api_service.dart` with Dev Tunnel HTTPS URL**.

To ensure seamless cross-platform communication between the Flutter client and the Node.js REST API backend without requiring hardcoded IP addresses or manual code edits during testing, `ApiService` provides:
1. **Dynamic Environment-Aware Base URL Resolution:** Automatically detects the execution platform. On Windows desktop, macOS, Linux, and Web, it defaults to `http://localhost:5000/api`. On physical Android phones and mobile emulators, it routes all API traffic through the secure HTTPS **VS Code Dev Tunnel** (`https://<tunnel-id>.devtunnels.ms/api`) established in Task 3.8.
2. **Persistent Dev Tunnel Configuration:** Features on-the-fly Dev Tunnel URL configuration persisted via `SharedPreferences`, with interactive edit and test controls built into both mobile and desktop profile views.
3. **Centralized Authentication & Platform Headers:** Injects standard JSON headers, automatic `Authorization: Bearer <token>` JWT headers, and `X-Client-Platform` tags.
4. **Global Network & Timeout Error Handling:** Encapsulates network timeouts, unreachable tunnel states, and HTTP status codes into a strongly-typed `ApiException` model with custom diagnostics.
5. **Real-time Latency & Health Diagnostic:** Embeds a diagnostic `checkHealth()` probe measuring live server latency in milliseconds.

---

## 📋 Compliance & Technical Checklist Verification

| Requirement / Checklist Item (Issue #48) | Implementation Details | Status |
| :--- | :--- | :---: |
| **1. Environment-Aware Base URL Resolution** | Windows / Web ➔ `http://localhost:5000/api`<br>Android Mobile ➔ `https://<tunnel-id>.devtunnels.ms/api` (Dev Tunnel) | **COMPLETED** |
| **2. Persistent Custom Tunnel URL** | Implemented `setCustomBaseUrl()` and `resetBaseUrl()` storing custom tunnel endpoints in `SharedPreferences`. | **COMPLETED** |
| **3. Centralized HTTP Headers** | Injected standard `Content-Type: application/json`, `Accept: application/json`, and dynamic `Authorization: Bearer <token>`. | **COMPLETED** |
| **4. Global Network Timeout & Tunnel Error Handling** | Standardized `requestTimeout = Duration(seconds: 8)`. Specific exception handling for `TimeoutException`, `SocketException`, and unreachable tunnel states. | **COMPLETED** |
| **5. Centralized HTTP Convenience Methods** | Implemented static asynchronous `get()`, `post()`, `put()`, and `delete()` methods eliminating boilerplate. | **COMPLETED** |
| **6. Zero Hardcoded IP Addresses** | Fully verified that `medicine_service.dart`, `auth_service.dart`, and all UI screens route strictly via `ApiService.baseUrl`. | **COMPLETED** |
| **7. Mobile Profile UI Configuration** | Added an interactive Dev Tunnel configuration dialog and latency ping test button in `MobileProfileScreen`. | **COMPLETED** |
| **8. Automated Test Suite** | Executed `verify_phase_3_9.js` with **10/10 automated assertions passing (100%)**. | **COMPLETED** |

---

## 📂 Deliverables Directory Map

```text
flutter_app/
├── verify_phase_3_9.js                         # Automated verification test runner
├── PHASE_3_TASK_3_9_DELIVERABLES.md            # This verification document
│
└── lib/
    ├── main.dart                               # Startup initialization via ApiService.initialize()
    │
    ├── services/
    │   ├── api_service.dart                    # Centralized Dev Tunnel HTTPS & localhost URL engine
    │   ├── auth_service.dart                   # Auth routes consuming ApiService.defaultHeaders
    │   └── medicine_service.dart               # CRUD routes consuming ApiService.baseUrl
    │
    └── screens/
        ├── mobile/
        │   └── mobile_profile_screen.dart      # Interactive Dev Tunnel URL editor & ping diagnostic
        └── desktop/
            └── desktop_profile_screen.dart     # System port & health status inspector
```

---

## 💻 Architecture & Code Highlights

### 1. Environment-Aware Base URL Resolution
```dart
static String get baseUrl {
  if (_customBaseUrl != null && _customBaseUrl!.trim().isNotEmpty) {
    return _customBaseUrl!.trim();
  }

  if (kIsWeb) return defaultLocalhostUrl;

  try {
    if (Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
      return defaultLocalhostUrl; // http://localhost:5000/api
    }
    if (Platform.isAndroid) {
      // Secure VS Code Dev Tunnel URL for physical Android devices
      return defaultDevTunnelUrl; // https://<tunnel-id>.devtunnels.ms/api
    }
  } catch (_) {}

  return defaultLocalhostUrl;
}
```

### 2. Centralized Headers & Request Execution
```dart
static Map<String, String> get defaultHeaders {
  final headers = <String, String>{
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Platform': kIsWeb ? 'web' : (Platform.isAndroid ? 'android' : 'desktop'),
  };
  if (authToken != null && authToken!.isNotEmpty) {
    headers['Authorization'] = 'Bearer $authToken';
  }
  return headers;
}
```

---

## 🚀 Verification Steps for Mr. Dionsay

### 1. Run Automated Verification Test Suite
```bash
cd websystem/flutter_app
node verify_phase_3_9.js
```
*Expected Output:*
```text
[PASS] Test 1: api_service.dart file exists in lib/services/
[PASS] Test 2: Contains environment-aware baseUrl resolution with localhost & Dev Tunnel
[PASS] Test 3: Supports persistent custom Dev Tunnel URL via SharedPreferences
[PASS] Test 4: Provides centralized HTTP headers with Bearer authentication
[PASS] Test 5: Implements global error handling for timeouts and unreachable tunnel states
[PASS] Test 6: Implements centralized HTTP convenience methods (get, post, put, delete)
[PASS] Test 7: Provides checkHealth() diagnostic method measuring network latency
[PASS] Test 8: main.dart initializes ApiService.initialize() at startup
[PASS] Test 9: Mobile profile screen provides UI controls to configure and test Dev Tunnel
[PASS] Test 10: Zero hardcoded IP addresses or URLs in medicine_service and auth_service
Verification Summary: 10 / 10 Tests Passed (100%)
```

### 2. Live Dev Tunnel Configuration & Ping Verification in App
1. Open MediRemind on Android or Desktop.
2. Navigate to **Profile & Settings**.
3. Under **Dev Tunnel API Endpoint**, click **Edit**.
4. Paste the public VS Code Dev Tunnel URL generated from Task 3.8 (e.g. `https://<tunnel-id>.devtunnels.ms/api`).
5. Click **Save & Test**. The client immediately pings `/api/health` and confirms latency (e.g., `Connected (48 ms) ✓`).
