# MediRemind — Phase 3 Deliverables: Task 3.3 (Issue #42)
**Project Title:** MediRemind — Cross-Platform Medicine & Prescription Reminder  
**Course:** Application Development and Emerging Technologies  
**Instructor:** Mr. Henzon Paul Dionsay  
**Team Name:** Beergin  
**Developers:** Team Beergin (Francis John Empil, Jibson Cabilin, Jerold Sodusta, Nove Calasang)  
**Status:** Complete & Verified (100% Tests Passing)  

---

## 📌 Executive Summary

This deliverable fulfills **Phase 3 Task 3.3 (Issue #42: Connect Desktop Client to localhost:5000 and Verify CRUD)**. It wires the native Flutter Windows Desktop client directly to the locally running Node.js REST API and PostgreSQL database (`localhost:5000`), implements native JWT token persistence via `shared_preferences`, establishes user authentication and profile retrieval (`GET /api/auth/me`), and validates complete end-to-end Medication CRUD lifecycle persistence directly in PostgreSQL.

---

## 📋 Compliance & Technical Checklist Verification

### 🔹 Task 3.3: Connect Desktop Client to localhost:5000 and Verify CRUD (Issue #42)
| Requirement / Checklist Item | Implementation Details | Status |
| :--- | :--- | :---: |
| **1. Target `http://localhost:5000/api`** | Configured `ApiService.baseUrl` targeting `http://localhost:5000/api` across Windows desktop and local runtimes. Added `ApiService.checkHealth()` calling `/api/health` with live PostgreSQL database driver detection. | **COMPLETED** |
| **2. Native JWT Token Persistence** | Implemented session storage in `AuthService` leveraging Windows native `shared_preferences` for `auth_token` and `user_session`. On app launch, `_loadSession()` seamlessly restores credentials and calls `GET /api/auth/me`. | **COMPLETED** |
| **3. User Authentication (`POST /api/auth/login`) & Profile Retrieval (`GET /api/auth/me`)** | Built full sign-in pipeline in `AuthService.login()` with input validation and password toggles. Profile retrieval in `fetchProfile()` validates bearer token against backend and synchronizes user info (Name, Email, Role, Phone). | **COMPLETED** |
| **4. Medication Catalog Retrieval (`GET /api/medicines`)** | Implemented `MedicineService.fetchMedicines()`, handling dual backend JSON wrappers (`{ success: true, count, data }`) and populating the responsive 3-column desktop catalog. | **COMPLETED** |
| **5. Prescription Creation (`POST /api/medicines`)** | Implemented `MedicineService.addMedicine()` sending normalized medication forms (`tablet`, `capsule`, `syrup`, `drops`, `inhaler`, etc.) and colors. Maps PostgreSQL auto-generated serial sequence IDs upon `201 Created`. | **COMPLETED** |
| **6. Prescription Update (`PUT /api/medicines/:id`)** | Implemented `MedicineService.updateMedicine()`. Persists updated dosage, instructions, inventory counts, and color badges directly to PostgreSQL with real-time UI synchronization. | **COMPLETED** |
| **7. Prescription Deletion (`DELETE /api/medicines/:id`)** | Implemented `MedicineService.deleteMedicine()` linked to `DeleteConfirmationDialog`. Purges records from PostgreSQL and cascades to reminders and dose logs. | **COMPLETED** |
| **8. Inventory Refill (`POST /api/medicines/:id/refill`)** | Implemented `MedicineService.refillMedicine()` adding customizable unit refills directly into the database. | **COMPLETED** |

---

## 🎯 Acceptance Criteria Compliance

### Criterion 1: All CRUD operations persist in the local PostgreSQL database
- Verified via direct SQL queries against `localhost:5432/mediremind` in `verify_phase_3_3.js`:
  - `POST` creates a real record verified with `SELECT * FROM medicines WHERE id = $1`.
  - `PUT` modifies attributes and confirms row updates in PostgreSQL.
  - `DELETE` permanently purges the row from the database (0 rows returned).

### Criterion 2: Network errors or backend disconnections display clear desktop toast notifications
- Implemented floating `SnackBar` desktop toasts and persistent notification banners across all screens:
  - **Success Toasts (Teal #0D9488):**
    - `"Prescription '<name>' saved to PostgreSQL database!"`
    - `"Prescription '<name>' updated in PostgreSQL!"`
    - `"Deleted '<name>' from PostgreSQL database."`
    - `"Refilled <name> (+30 units in database)!"`
  - **Error Toasts (Red #DC2626):**
    - Network timeout/socket error: `"Network error: Cannot connect to localhost:5000 to save prescription."`
    - Disconnection banner: `"Backend Server Disconnected — Could not reach http://localhost:5000. Operating in offline cached mode."` with interactive `"Retry Connection"` button.
    - Invalid authentication: `"Invalid email or password."` toast on login error.

---

## 🧪 Automated End-to-End Verification Results

All 15 verification tests pass against `http://localhost:5000` and PostgreSQL 18:

```text
================================================================
   MediRemind — Phase 3.3 Automated Verification Suite
   Issue #42: Connect Desktop Client to localhost:5000 & CRUD
================================================================

--- Step 1: Verify HTTP Client Target (http://localhost:5000/api) ---
  [PASS] Test 1: Verify backend health endpoint is active
         -> Status: online, Driver: POSTGRES, Arch: Standard MVC (UCLIS Compliance)
  [PASS] Test 2: Verify PostgreSQL database driver is connected
         -> DB Driver: POSTGRES

--- Step 2: Verify User Authentication (POST /api/auth/login) ---
  [PASS] Test 3: Verify POST /api/auth/login returns HTTP 200 & success
         -> User: Maria Elena Santos (patient)
  [PASS] Test 4: Verify JWT token returned for desktop session storage
         -> Token Prefix: eyJhbGciOiJIUzI1NiIsInR5c...

--- Step 3: Verify Profile Retrieval (GET /api/auth/me) with JWT ---
  [PASS] Test 5: Verify GET /api/auth/me succeeds with Bearer token
         -> Retrieved Name: Maria Elena Santos, Email: patient@mediremind.com

--- Step 4: Verify Medication READ (GET /api/medicines) ---
  [PASS] Test 6: Verify GET /api/medicines returns list of user medications
         -> Found 4 existing medications in catalog

--- Step 5: Verify Medication CREATE (POST /api/medicines) ---
  [PASS] Test 7: Verify POST /api/medicines returns HTTP 201 Created
         -> Created ID: 14
  [PASS] Test 8: Verify prescription persisted directly into PostgreSQL database table "medicines"
         -> PostgreSQL Record: ID 14, Stock: 50, Form: tablet

--- Step 6: Verify Medication UPDATE (PUT /api/medicines/:id) ---
  [PASS] Test 9: Verify PUT /api/medicines/:id returns HTTP 200 & updated entity
         -> Updated Name: Phase 3.3 Test Tablet (Refilled & Updated), Stock: 65
  [PASS] Test 10: Verify prescription updates persisted in PostgreSQL database
         -> PostgreSQL Verified: Name="Phase 3.3 Test Tablet (Refilled & Updated)", Stock=65

--- Step 7: Verify Medication REFILL (POST /api/medicines/:id/refill) ---
  [PASS] Test 11: Verify POST /api/medicines/:id/refill increments inventory stock
         -> Stock after +20: 85

--- Step 8: Verify Medication DELETE (DELETE /api/medicines/:id) ---
  [PASS] Test 12: Verify DELETE /api/medicines/:id returns HTTP 200
         -> Message: Medicine deleted successfully.
  [PASS] Test 13: Verify prescription was permanently purged from PostgreSQL database
         -> PostgreSQL query returned 0 rows (Record completely deleted)

--- Step 9: Verify Error & Authentication Feedback (Toast Trigger) ---
  [PASS] Test 14: Verify invalid credentials return HTTP 401 with descriptive error message
         -> Backend Error: "Invalid email or password."
  [PASS] Test 15: Verify unauthorized requests return HTTP 401/403 for desktop session expiry
         -> Status: HTTP 401

================================================================
   Verification Summary: 15 / 15 Tests Passed (100%)
   All Phase 3.3 Acceptance Criteria Successfully Met!
================================================================
```

---

## 📂 Deliverables File Map

```text
flutter_app/
├── PHASE_3_TASK_3_3_DELIVERABLES.md            # This formal verification deliverable
├── verify_phase_3_3.js                         # Automated E2E verification test suite
│
├── test/
│   └── phase_3_3_verification_test.dart        # Unit tests for URL, storage & normalization
│
└── lib/
    ├── main.dart                               # Window & multi-provider wiring
    │
    ├── models/
    │   ├── medicine.dart                       # Enhanced with DB normalization & PostgreSQL field mappings
    │   └── user.dart                           # User schema with roles
    │
    ├── services/
    │   ├── api_service.dart                    # Target http://localhost:5000/api & health check
    │   ├── auth_service.dart                   # Native SharedPreferences JWT persistence, login & GET /api/auth/me
    │   └── medicine_service.dart               # Complete CRUD with PostgreSQL synchronization & error states
    │
    ├── layouts/
    │   └── desktop_scaffold.dart               # Live backend connectivity status indicator in sidebar footer
    │
    └── screens/
        ├── login_screen.dart                   # Sign-in with demo quick-fill buttons & error toast feedback
        └── desktop/
            ├── desktop_medicines_screen.dart   # CRUD actions with floating toasts, sync button & offline banner
            └── desktop_profile_screen.dart     # Backend health inspection & GET /api/auth/me verification trigger
```

---

## 💻 Step-by-Step Instructions for Mr. Dionsay

### 1. Launch Backend Server (Node.js + PostgreSQL)
```powershell
# From the project root, start the backend
cd backend
node server.js
# Output confirms:
# MediRemind Backend running on http://localhost:5000
# Database driver: POSTGRES
```

### 2. Run the Automated Verification Suite
```powershell
# Run the complete test suite against localhost:5000
node flutter_app/verify_phase_3_3.js
# Confirms all 15 tests pass (100%)
```

### 3. Launch the Desktop Client
```powershell
cd flutter_app
flutter run -d windows
```

### 4. Interactive UI Verification
1. **Login:** Use quick-fill **Patient** (`patient@mediremind.com` / `password123`) or **Caregiver** and click **Sign In**.
2. **Read Catalog:** Open **Medicines** tab. View prescriptions loaded from PostgreSQL.
3. **Create:** Click **"Add Prescription"**, enter name and dosage, press `Ctrl + Enter`. Observe the green toast notification confirming PostgreSQL persistence.
4. **Update:** Click the **Edit** icon on any medication card, change stock count or dosage, and save. Observe the update toast.
5. **Delete:** Click the **Delete** icon, confirm in the dialog. Observe the removal toast and PostgreSQL deletion.
6. **Backend Health & Profile:** Navigate to **Profile** tab, click **"Test Connection"** and **"GET /api/auth/me"** to see live PostgreSQL session verification.
