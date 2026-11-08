# MediRemind — Phase-Based Project Plan & GitHub Setup
**Course:** Application Development and Emerging Technologies  
**Instructor:** Mr. Henzon Paul Dionsay  
**Team Name:** Beergin  
**Project:** MediRemind — Cross-Platform Medicine & Prescription Reminder  
**Repository:** [`Beergin-Group/beergingroup-main-repo`](https://github.com/Beergin-Group/beergingroup-main-repo)  

---

## 🧭 Executive Summary of Project Phases

To satisfy software engineering best practices and your instructor's requirement, the 13-week proposal schedule is organized into **5 Development Phases**:

| Phase | Phase Name | Weeks | Focus & Modules | Progress | Status |
| :---: | :--- | :---: | :--- | :---: | :---: |
| **Phase 1** | **Inception, Requirements & Architectural Design** | W1–W2 | SRS, WBS, Git Strategy, ERD, PostgreSQL DDL, API Specs, Wireframes, Clickable Prototypes, QA Test Plan | **100%** | **Completed** |
| **Phase 2** | **Core Identity & Medication Asset Management** | W3–W5 | JWT Authentication, Bcrypt Hashing, Medicine CRUD, Inventory Tracking, Form Validation, Live API Integration | **85%** | **In Progress** |
| **Phase 3** | **Scheduling Engine & Dose Execution Workflow** | W6–W8 | Recurrence Rules (Daily/Hourly/Weekly), Today's Dashboard Timeline, Next-Dose Countdown, Dose Actions (Taken/Skip/Snooze) | **0%** | **Planned** |
| **Phase 4** | **Reminder Alerts, Adherence Analytics & Multi-Platform** | W9–W11 | Local Notifications (Android/Desktop), Adherence Percentage Reports, Missed Dose Analysis, Caregiver Dependent View | **0%** | **Planned** |
| **Phase 5** | **System Hardening, Full QA & Final Demonstration** | W12–W13 | End-to-End Regression Testing, Security Hardening, User Manual, Live System Defense & Instructor Demonstration | **0%** | **Planned** |

---

## 🛠️ How to Set Up "GitHub Projects" Based on Phases

Follow these exact steps in GitHub to set up your Phase-based Project Board:

### Step 1: Create the Project
1. Open your repository: **`https://github.com/Beergin-Group/beergingroup-main-repo`**
2. Click the **Projects** tab (between *Pull requests* and *Wiki* / *Insights*).
3. Click the green button: **New project**.
4. Choose **Board** (or **Table**) template.
5. Title your project: **`MediRemind — Project Roadmap & Phases`**.
6. Click **Create project**.

### Step 2: Add a Custom Field for "Phase"
1. In the top right of your project board, click the **`...`** (Settings) or **`+`** icon next to the column headers.
2. Select **+ New field**.
3. Set Field Name: **`Phase`**.
4. Set Field Type: **Single select**.
5. Add the following options with colors:
   - `Phase 1: Inception & Design` (Purple 🟣)
   - `Phase 2: Core Auth & Medicine` (Blue 🔵)
   - `Phase 3: Scheduling & Workflow` (Orange 🟠)
   - `Phase 4: Alerts & Analytics` (Yellow 🟡)
   - `Phase 5: Testing & Defense` (Green 🟢)
6. Click **Save**.

### Step 3: Configure Your Views
Create two views to give Mr. Dionsay full transparency:
- **View 1: "Phase Roadmap" (Grouped by Phase)**
  - Group by: `Phase`
  - Sort by: `Milestone` (ascending)
  - This displays all tasks cleanly in 5 Phase columns!
- **View 2: "Kanban Board" (Workflow Status)**
  - Columns: `Todo` ➔ `In Progress` ➔ `In Review / QA` ➔ `Done`
  - Cards show the assigned member and the Phase pill tag.

---

## 📌 Phase-Based GitHub Issue Epics (Ready to Copy-Paste)

You can create an issue for each Phase so they appear directly in your project board and issue tracker:

---

### 🟣 Phase 1: Inception, Requirements & Architectural System Design
- **Issue Title:** `[PHASE 1] Inception, Requirements & Architectural System Design (Weeks 1–2)`
- **Assignees:** Jerold Sodusta, Francis John Empil, Jibson Cabilin, Nove Calasang
- **Labels:** `epic`, `phase-1`, `documentation`, `status: completed`
- **Milestones:** `Week 1`, `Week 2`
- **Status:** **Closed / Completed**

```markdown
# 🟣 Phase 1: Inception, Requirements & Architectural System Design
**Timeline:** Weeks 1 – 2  
**Status:** Completed (100%)  
**Package Reference:** `MediRemind_Deliverables_Week_1_and_2/`

## 🎯 Phase Objectives
Establish the complete foundational engineering architecture, system specifications, database model, API contracts, interactive UI prototypes, and quality assurance framework.

## 📋 Deliverables & Verification Checklist

### 1. Requirements & Planning (Week 1)
- [x] **Project Repository & Branching Strategy:** Established `main`, `develop`, and `feature/*` branches (Jerold)
- [x] **Software Requirements Specification (SRS):** Documented 8 Functional Requirements (FR-01 to FR-08) and 5 Non-Functional Requirements (NFR-01 to NFR-05) (Jerold & Nove)
- [x] **Work Breakdown Structure (WBS) & RACI Matrix:** Formulated task distribution and team accountability (Jerold)
- [x] **Back-End Scaffolding:** Initialized Node.js + Express server with `.env` configuration on `localhost:5000` (Francis)
- [x] **Front-End Scaffolding:** Initialized Flutter project structure and responsive web simulator harness (Jibson)

### 2. System Architecture & Prototypes (Week 2)
- [x] **Entity-Relationship Diagram (ERD):** Modeled 5 core entities (`users`, `medicines`, `prescriptions`, `dose_logs`, `caregiver_links`) (Francis)
- [x] **PostgreSQL DDL Schema:** Created executable `database.sql` with cascading rules and foreign key constraints (Francis)
- [x] **RESTful API Documentation:** Specified endpoints, HTTP verbs, payload schemas, and response codes in `API_DOCUMENTATION.md` (Francis)
- [x] **UI Wireframes & Navigation Flow:** Designed 6 core screens in `WIREFRAMES.md` and visual `wireframes.html` (Jibson)
- [x] **Interactive Prototype:** Built working web prototype with real-time countdown, chime alert, and modals (Jibson)
- [x] **QA Test Plan:** Formalized `USER_MANUAL.md` featuring 11 test cases (Nove)

## ✅ Phase 1 Acceptance Sign-Off
- [x] Architectural design review signed and approved
- [x] Database schema executes without syntax or foreign key errors
- [x] Interactive prototype successfully verified by team and instructor
```

---

### 🔵 Phase 2: Core Identity, Security & Medication Asset Management
- **Issue Title:** `[PHASE 2] Core Identity, Security & Medication Asset Management (Weeks 3–5)`
- **Assignees:** Francis John Empil, Jibson Cabilin, Nove Calasang, Jerold Sodusta
- **Labels:** `epic`, `phase-2`, `backend`, `frontend`, `status: in-progress`
- **Milestones:** `Week 3`, `Week 4`, `Week 5`
- **Status:** **Active / In-Progress (85% Completed)**

```markdown
# 🔵 Phase 2: Core Identity, Security & Medication Asset Management
**Timeline:** Weeks 3 – 5  
**Status:** In Progress (85% Completed)  
**Package Reference:** `MediRemind_Deliverables_Week_3_and_4/`

## 🎯 Phase Objectives
Implement production-grade authentication with secure token handling and build the complete medication management system allowing users to track prescriptions, dosage, and stock.

## 📋 Deliverables & Verification Checklist

### 1. Authentication Subsystem (Week 3) — Completed
- [x] **Password Hashing:** Implemented `bcrypt` hashing with salt rounds >= 10 (Francis)
- [x] **Auth Endpoints:** `POST /api/auth/register` and `POST /api/auth/login` returning signed JWT (Francis)
- [x] **Auth Middleware:** JWT verification guard (`auth.js`) for private route access (Francis)
- [x] **Login & Registration UI:** Flutter and Web forms with regex email validation and password strength bar (Jibson)
- [x] **QA Auth Test Suite:** Automated test script (`auth_api_test.js`) and 15 QA test cases (TC-AUTH-01 to 15) passed (Nove)

### 2. Medicine Management Subsystem (Week 4) — Completed
- [x] **Medicine CRUD Routes:** Created full `/api/medicines` endpoints (GET, POST, PUT, DELETE) (Francis)
- [x] **Data Layer Security:** Parameterized SQL queries preventing SQL injection (Francis)
- [x] **Medicine Catalog UI:** Screen with search bar, dosage badges, color tag indicators, and refill buttons (Jibson)
- [x] **Medicine Form Modals:** Add and Edit prescription dialogs with double-confirmation delete modal (Jibson)
- [x] **QA CRUD Test Suite:** Automated test script (`medicine_api_test.js`) and 16 QA test cases (TC-MED-01 to 16) passed (Nove)

### 3. Live Integration & Error Hardening (Week 5) — Current Sprint
- [x] Backend database connectivity verification and demo dataset seeding
- [ ] Connect Flutter & Web clients directly to live PostgreSQL backend
- [ ] Implement client-side toast notifications for API operations
- [ ] Compile defect log and resolution report

## ✅ Phase 2 Acceptance Sign-Off
- [x] Authentication tokens securely protect user data
- [x] User prescriptions are fully isolated per user ID
- [ ] Zero critical defects remaining between UI and live API
```

---

### 🟠 Phase 3: Scheduling Engine & Dose Execution Workflow
- **Issue Title:** `[PHASE 3] Scheduling Engine & Dose Execution Workflow (Weeks 6–8)`
- **Assignees:** Francis John Empil, Jibson Cabilin, Nove Calasang
- **Labels:** `epic`, `phase-3`, `backend`, `frontend`, `status: planned`
- **Milestones:** `Week 6`, `Week 7`, `Week 8`
- **Status:** **Planned**

```markdown
# 🟠 Phase 3: Scheduling Engine & Dose Execution Workflow
**Timeline:** Weeks 6 – 8  
**Status:** Planned (Next Phase)  

## 🎯 Phase Objectives
Enable dynamic recurring medication schedules, build the primary daily dashboard with next-dose countdowns, and implement one-tap dose logging actions.

## 📋 Deliverables & Verification Checklist

### 1. Medication Scheduling Engine (Week 6)
- [ ] **Frequency Rule Parser:** Daily, every X hours, and specific days of the week (Francis)
- [ ] **Schedule Endpoints:** `POST /api/schedules` and `GET /api/schedules/:medicineId` (Francis)
- [ ] **Schedule Creation UI:** Recurrence chips, time pickers, and meal relation dropdowns (Jibson)
- [ ] **Schedule QA Matrix:** Boundary testing for interval hours and end dates (Nove)

### 2. Dashboard & Upcoming Doses (Week 7)
- [ ] **Today's Dose Endpoint:** `GET /api/dashboard/today` returning chronologically ordered queue (Francis)
- [ ] **Countdown Logic:** Real-time ticker calculating hours/minutes until next due dose (Francis & Jibson)
- [ ] **Dashboard Screen:** Today's schedule cards, streak counter badge, and summary stats (Jibson)
- [ ] **Dashboard Test Suite:** Verification of timeline queries against active database records (Nove)

### 3. Dose Logging & Adherence Actions (Week 8)
- [ ] **Dose Status Endpoints:** `POST /api/doses/log` supporting `TAKEN`, `SKIPPED`, and `SNOOZED` (Francis)
- [ ] **Inventory Synchronization:** Decrement pill stock count by 1 upon `TAKEN` confirmation (Francis)
- [ ] **Dose Action Buttons:** One-tap action buttons with visual status state changes (Jibson)
- [ ] **Dose History Screen:** Chronological log with filter by status and date (Jibson)
- [ ] **Dose Log Verification:** Audit log immutability and stock count verification (Nove)

## ✅ Phase 3 Acceptance Sign-Off
- [ ] Doses appear chronologically on the dashboard matching active schedule rules
- [ ] Marking a dose as Taken decrements inventory and logs timestamp accurately
```

---

### 🟡 Phase 4: Reminder Alerts, Adherence Analytics & Multi-Platform Expansion
- **Issue Title:** `[PHASE 4] Reminder Alerts, Adherence Analytics & Multi-Platform Expansion (Weeks 9–11)`
- **Assignees:** Jibson Cabilin, Francis John Empil, Nove Calasang
- **Labels:** `epic`, `phase-4`, `frontend`, `backend`, `status: planned`
- **Milestones:** `Week 9`, `Week 10`, `Week 11`
- **Status:** **Planned**

```markdown
# 🟡 Phase 4: Reminder Alerts, Adherence Analytics & Multi-Platform Expansion
**Timeline:** Weeks 9 – 11  
**Status:** Planned  

## 🎯 Phase Objectives
Deploy scheduled local alarm notifications on Android and Desktop, calculate compliance percentage analytics, and provide caregiver view for linked dependents.

## 📋 Deliverables & Verification Checklist

### 1. Local Notifications & Reminders (Week 9)
- [ ] **Notification Integration:** Configure `flutter_local_notifications` package for mobile/desktop (Jibson)
- [ ] **Alarm Channels:** High-priority channel with audio chime, vibration, and snooze action (Jibson)
- [ ] **Sync Payload:** Lightweight backend sync endpoint for schedule timestamps (Francis)
- [ ] **Physical Device Testing:** Verify alerts on physical Android devices and document battery optimization rules (Nove)

### 2. Adherence Analytics & Reporting (Week 10)
- [ ] **Adherence Algorithm:** Compute `(Taken / Total Scheduled) * 100` over 7-day and 30-day windows (Francis)
- [ ] **Missed Dose Query:** Aggregation of skipped/missed medications by category (Francis)
- [ ] **Analytics UI:** Progress rings, weekly adherence bar charts, and missed-dose report (Jibson)
- [ ] **Calculation Audit:** Cross-check computed percentages against ground-truth database records (Nove)

### 3. Caregiver View & Cross-Platform Builds (Week 11)
- [ ] **Dependent Relationship Endpoints:** `GET /api/caregiver/dependents` with strict ACL (Francis)
- [ ] **Caregiver Screen:** Dependent profile switcher to view medication schedules per family member (Jibson)
- [ ] **Multi-Platform Testing:** Generate and verify Windows Desktop and Web builds (Jibson & Nove)
- [ ] **Platform Matrix:** Document compatibility across Android, Chrome, and Windows (Nove)

## ✅ Phase 4 Acceptance Sign-Off
- [ ] Notifications trigger on schedule even when application is minimized
- [ ] Adherence reports accurately summarize patient compliance trends
- [ ] Caregivers can view dependent schedules without cross-account data leaks
```

---

### 🟢 Phase 5: System Hardening, Full QA & Final Demonstration
- **Issue Title:** `[PHASE 5] System Hardening, Full QA & Final Demonstration (Weeks 12–13)`
- **Assignees:** Jerold Sodusta, Francis John Empil, Jibson Cabilin, Nove Calasang
- **Labels:** `epic`, `phase-5`, `qa-testing`, `documentation`, `status: planned`
- **Milestones:** `Week 12`, `Week 13`
- **Status:** **Planned**

```markdown
# 🟢 Phase 5: System Hardening, Full QA & Final Demonstration
**Timeline:** Weeks 12 – 13  
**Status:** Planned (Final Milestone)  

## 🎯 Phase Objectives
Perform end-to-end regression testing, resolve all UI and API defects, assemble complete documentation and user manuals, and deliver the final live project defense to Mr. Henzon Paul Dionsay.

## 📋 Deliverables & Verification Checklist

### 1. Integration & Regression Testing (Week 12)
- [ ] **Full Regression Suite:** Execute end-to-end testing across Auth, Medicines, Schedules, Doses, and Reports (Nove)
- [ ] **API Defect Resolution:** Fix remaining API edge cases and verify foreign key cascading (Francis)
- [ ] **UI Polish & Accessibility:** Fix layout glitches and verify WCAG 2.1 AA touch target standards (Jibson)
- [ ] **User Manual:** Finalize comprehensive User Manual with screenshots and troubleshooting guide (Nove & Jerold)

### 2. Final Demonstration & Project Defense (Week 13)
- [ ] **Live Backend Demonstration:** Demonstrate RESTful API endpoints and PostgreSQL operations (Francis)
- [ ] **Live Client Demonstration:** Demonstrate Flutter app on Android and Web/Desktop environments (Jibson)
- [ ] **GitHub Audit:** Verify that all issues, commits, branches, and PRs are properly documented and closed (Jerold)
- [ ] **Project Presentation:** Deliver defense presentation slides and final project report handover (Jerold & Nove)

## ✅ Phase 5 Acceptance Sign-Off
- [ ] 0 critical or major defects open
- [ ] Complete system demo executed smoothly before instructor Mr. Henzon Paul Dionsay
- [ ] Full GitHub repository and documentation formally accepted
```
