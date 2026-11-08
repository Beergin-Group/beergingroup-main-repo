# MediRemind — Defect Resolution & Integration Report
**Course:** Application Development and Emerging Technologies  
**Instructor:** Mr. Henzon Paul Dionsay  
**Team Name:** Beergin  
**Project:** MediRemind — Cross-Platform Medicine & Prescription Reminder  
**Milestone:** Phase 2.9 (Week 5): Live API-to-UI Integration & Defect Resolution  
**Date:** November 2026  

---

## 1. Executive Summary & Objective

The primary objective of **Phase 2.9 / Week 5** is to bridge the client-side user interfaces (Flutter mobile app and Web client) with the active Node.js / Express backend server (`http://localhost:5000`) and the PostgreSQL database. This milestone validates the complete end-to-end user lifecycle—from registration and authentication to live medicine CRUD persistence—while identifying, documenting, and resolving all defects found during integration testing.

---

## 2. Integration Architecture & Data Flow

```text
[ Client UI (Web / Flutter) ]
       │
       ├─► 1. POST /api/auth/login ──────────► [ Express authController ]
       │                                            │ (bcrypt.compare + JWT sign)
       │◄── 2. 200 OK + JWT Bearer Token ◄──────────┘
       │
       ├─► 3. Store Token in LocalStorage / SharedPreferences
       │
       ├─► 4. GET /api/medicines (Bearer Token) ──► [ authMiddleware -> medicineController ]
       │                                                │ (SELECT * FROM medicines WHERE user_id = $1)
       │◄── 5. 200 OK + Medicine Catalog Array ◄────────┘
       │
       ├─► 6. POST /api/medicines (Add/Edit) ────► [ Parameterized INSERT/UPDATE medicines ]
       │◄── 7. 201 Created / 200 OK ◄───────────────┘
       │
       └─► 8. Client UI Toast Notification Feedback
```

### Key Deliverables in this Package:
1. **`Live_Deliverables_App/`**: Standalone, zero-setup integrated package.
   - **`backend/`**: Express REST API running on `http://localhost:5000` with dual-engine database adapter (PostgreSQL + JSON fallback).
   - **`frontend/`**: Responsive client interface with real-time feedback (toasts), search filter, dosage badges, and modal forms.
   - **`start.bat`**: One-click launcher that boots the backend server and opens the browser application automatically.
2. **Pre-Seeded Test Credentials:**
   - **Patient Account:** `patient@mediremind.com` / `password123`
   - **Caregiver Account:** `caregiver@mediremind.com` / `password123`

---

## 3. Consolidated Defect Resolution Log

During the integration and end-to-end testing between the frontend clients and the backend REST API, the following 4 defects were discovered, logged, and resolved:

| Defect # | Module | Issue Description | Root Cause | Resolution Implemented | Verification Status |
| :---: | :---: | :--- | :--- | :--- | :---: |
| **DEF-01** | Auth | Login failed when typing email in uppercase or mixed case | Database query performed strict case-sensitive match | Applied `.toLowerCase().trim()` to email on both registration and login | **RESOLVED & VERIFIED** |
| **DEF-02** | Auth | Registration API returned `password_hash` string in JSON response | User entity returned directly from database query | Explicitly deleted `password_hash` before sending HTTP 201 response | **RESOLVED & VERIFIED** |
| **DEF-03** | Medicine | Decrementing stock when count was 0 allowed negative stock numbers | Missing bounds check on inventory updates | Added `CHECK (stock_count >= 0)` constraint and `Math.max(0, ...)` clamp | **RESOLVED & VERIFIED** |
| **DEF-04** | UI / API | Expired token left app in broken state without feedback | Missing 401/403 response interceptor | Added client interceptor clearing invalid token and routing to login with session toast | **RESOLVED & VERIFIED** |

---

## 4. Defect Details & Resolutions

### Defect DEF-01: Email Case Sensitivity
- **Severity:** Medium
- **Component:** `Live_Deliverables_App/backend/src/controllers/authController.js`
- **Symptom:** Users registering with `User@Example.com` could not log in with `user@example.com`.
- **Fix:** Normalized email strings using `.toLowerCase().trim()` upon both account creation and credential lookup.

### Defect DEF-02: Password Hash Exposure in Registration Payload
- **Severity:** High (Security)
- **Component:** `Live_Deliverables_App/backend/src/controllers/authController.js`
- **Symptom:** `POST /api/auth/register` returned the hashed password string in the response JSON.
- **Fix:** Sanitized the response object:
  ```javascript
  const sanitizedUser = { ...newUser };
  delete sanitizedUser.password_hash;
  return res.status(201).json({ success: true, user: sanitizedUser, token });
  ```

### Defect DEF-03: Negative Inventory Stock Counts
- **Severity:** Medium
- **Component:** `Live_Deliverables_App/backend/src/controllers/medicineController.js`
- **Symptom:** Refilling or decrementing stock beyond 0 caused stock count to display negative integers (e.g. `-1 pills`).
- **Fix:** Clamped values using `Math.max(0, newStock)` in the application controller and added `CHECK (stock_count >= 0)` in SQL schemas.

### Defect DEF-04: Silent Failure on Expired JWT Session
- **Severity:** Medium
- **Component:** `Live_Deliverables_App/frontend/js/app.js`
- **Symptom:** When a JWT expired, API requests returned HTTP 401/403, but the UI hung on loading spinners without informing the user.
- **Fix:** Added a global `fetch` response interceptor:
  ```javascript
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    showToast('Your session has expired. Please log in again.', 'warning');
    navigateToLogin();
  }
  ```

---

## 5. Acceptance Criteria Sign-Off

- [x] Double-clicking `start.bat` boots the backend server and opens the frontend client in the default browser.
- [x] Registering a new account immediately persists the user to the database and logs in.
- [x] Medicine additions, edits, refills, and deletions persist and refresh cleanly without page errors.
- [x] User-friendly toast notifications provide feedback for all successful or failed operations.
- [x] All 4 tracked defects are marked resolved and verified with zero open critical issues.

**Signed Off By:**
- **Jerold Sodusta** (Project Manager)
- **Francis John Empil** (Back-End Developer)
- **Jibson Cabilin** (Front-End Developer)
- **Nove Calasang** (Quality Assurance)
