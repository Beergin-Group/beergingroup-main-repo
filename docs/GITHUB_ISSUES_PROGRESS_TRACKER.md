# MediRemind — GitHub Issues & Progress Tracking Guide
**Course:** Application Development and Emerging Technologies  
**Instructor:** Mr. Henzon Paul Dionsay  
**Team Name:** Beergin  
**Project:** MediRemind — Cross-Platform Medicine & Prescription Reminder  

---

## 👥 Team Members & Roles
- **Jerold Sodusta** (`@jerold`) — Project Manager
- **Francis John Empil** (`@francis`) — Back-End Developer
- **Jibson Cabilin** (`@jibson`) — Front-End Developer
- **Nove Calasang** (`@nove`) — Quality Assurance (QA)

---

## 🏷️ Recommended GitHub Labels to Create
Before creating the issues, go to **Issues > Labels > New label** in your GitHub repository (`https://github.com/Beergin-Group/beergingroup-main-repo`):

| Label Name | Color | Description |
| :--- | :--- | :--- |
| `epic` | `#3E4B9E` | High-level roadmap tracking issue |
| `milestone` | `#0E8A16` | Weekly milestone package |
| `backend` | `#1D76DB` | Node.js, Express, PostgreSQL, REST API |
| `frontend` | `#7057FF` | Flutter, UI screens, Web client |
| `qa-testing` | `#E99695` | Test cases, manual testing, defect reports |
| `documentation` | `#0075CA` | SRS, ERD, API specs, User manual |
| `status: completed` | `#0E8A16` | Deliverables finalized and verified |
| `status: in-progress` | `#FBCA04` | Currently being developed / integrated |
| `status: planned` | `#C5DEF5` | Scheduled for future weeks |

---

# 📌 Issue #1: [EPIC] MediRemind 13-Week Master Progress & Milestone Tracker
*(Tip: Pin this issue to the top of your GitHub Issues tab so your instructor can review your overall progress in one click!)*

**Title:** `[EPIC] MediRemind — 13-Week Master Progress & Milestone Tracking`  
**Assignees:** Jerold Sodusta  
**Labels:** `epic`, `documentation`, `status: in-progress`  
**Milestone:** All Milestones  

### Issue Body:
```markdown
# 🏥 MediRemind: 13-Week Project Progress Tracker

**Course:** Application Development and Emerging Technologies  
**Instructor:** Mr. Henzon Paul Dionsay  
**Team:** Beergin  
**Repository:** [Beergin-Group/beergingroup-main-repo](https://github.com/Beergin-Group/beergingroup-main-repo)  

---

## 👥 Team Roles & Responsibilities
- **Project Manager:** Jerold Sodusta
- **Back-End Developer:** Francis John Empil
- **Front-End Developer:** Jibson Cabilin
- **Quality Assurance:** Nove Calasang

---

## 📊 Project Progress Overview
- **Completed Milestones:** Week 1, Week 2, Week 3, Week 4 (4 / 13 — ~31% Completed)
- **Current Sprint:** Week 5: Medicine Management Completion & Live API Integration
- **Upcoming:** Weeks 6–13 (Scheduling, Dashboard, Logging, Reminders, Reports, Caregiver, Final Demo)

---

## 🗓️ 13-Week Deliverable Roadmap

### 🏁 Phase 1: Planning, Design & Core Foundations (Completed)
- [x] **Week 1: Requirements and Planning**
  - [x] Initial Node.js + Express backend setup & environment configuration (Francis)
  - [x] Initial Flutter project scaffolding & UI architecture (Jibson)
  - [x] Software Requirements Specification (SRS: FR-01–08, NFR-01–05), WBS, and 13-week schedule (Jerold & Nove)
- [x] **Week 2: System Design and Prototypes**
  - [x] PostgreSQL ERD, DDL database schema, and RESTful API endpoint specifications (Francis)
  - [x] 6-Screen wireframes, navigation flow, and interactive prototype (Jibson)
  - [x] Architecture design review sign-off and 11-case QA test plan (Nove & Jerold)
- [x] **Week 3: Authentication Module**
  - [x] Registration and login endpoints with bcrypt hashing and JWT bearer authentication (Francis)
  - [x] Flutter & Web responsive login and registration interfaces with validation (Jibson)
  - [x] 15 QA authentication test cases (TC-AUTH-01–15) and defect verification (Nove & Jerold)
- [x] **Week 4: Medicine Management CRUD**
  - [x] Medicine CRUD endpoints (`/api/medicines`), PostgreSQL table schema, and data access layer (Francis)
  - [x] Medicine catalog screen, add/edit modal forms, search filter, and delete confirmation (Jibson)
  - [x] 16 QA CRUD test cases (TC-MED-01–16) and API response validation (Nove & Jerold)

---

### 🚀 Phase 2: Core Feature Implementation (Current & Upcoming)
- [ ] **Week 5: Medicine Management Completion & Integration** *(Current)*
  - [ ] Connect Flutter & Web screens to live PostgreSQL backend endpoints
  - [ ] End-to-end CRUD validation, error handling, and toast feedback
  - [ ] Integrated medicine demonstration and defect resolution report
- [ ] **Week 6: Medication Scheduling Engine**
  - [ ] Schedule endpoints (`/api/schedules`), frequency rules (daily, interval hours, specific days), start/end dates
  - [ ] Schedule creation and editing UI forms
  - [ ] Schedule validation test suite and integration results
- [ ] **Week 7: Dashboard & Upcoming Doses**
  - [ ] Today's dose query optimization, next-dose countdown logic, and streak calculations
  - [ ] Dashboard screen with today's medication timeline and quick status view
  - [ ] Real-database dashboard verification testing
- [ ] **Week 8: Dose Logging & Adherence History**
  - [ ] Taken, Skipped, and Snoozed action handlers and dose history logging endpoints
  - [ ] One-tap dose action buttons and visual log timeline
  - [ ] Verification tests for dose status persistence
- [ ] **Week 9: Local Notifications & Reminders**
  - [ ] Reminder synchronization backend payload
  - [ ] Flutter Local Notifications plugin integration on Android & Desktop
  - [ ] Real-device notification fire tests and battery/background limitation documentation

---

### 🎯 Phase 3: Advanced Modules, Polish & Demonstration
- [ ] **Week 10: Adherence Analytics & Reports**
  - [ ] Aggregation queries for adherence percentages and missed dose breakdowns
  - [ ] Visual weekly/monthly adherence charts and missed-dose report screens
  - [ ] Mathematical calculation verification against test dataset
- [ ] **Week 11: Caregiver View & Cross-Platform Builds**
  - [ ] Dependent profile linking and role-based access control
  - [ ] Caregiver dashboard view and multi-profile switcher
  - [ ] Web, Android, and Desktop multi-platform build testing
- [ ] **Week 12: Integration, Security & Regression Testing**
  - [ ] End-to-end API regression testing and database constraint hardening
  - [ ] UI bug fixes, WCAG accessibility check, and smooth navigation polish
  - [ ] Comprehensive consolidated QA test report and completed User Manual
- [ ] **Week 13: Final Project Demonstration & Defense**
  - [ ] Final live demonstration of full RESTful API and PostgreSQL database
  - [ ] Final application demonstration across supported platforms (Mobile/Web/Desktop)
  - [ ] Final documentation submission, GitHub repository audit, and project defense
```

---

# 📦 Individual Weekly Issues (Ready to Copy & Paste)

---

### Issue #2: Week 1 — Requirements and Planning
**Title:** `[Milestone] Week 1: Requirements and Planning`  
**Assignees:** Jerold Sodusta, Francis John Empil, Jibson Cabilin, Nove Calasang  
**Labels:** `milestone`, `documentation`, `status: completed`  
**Milestone:** `Week 1: Requirements & Planning`  
**State:** `Closed` (or checked as completed)

```markdown
## 🎯 Week 1 Objective
Establish the project foundation, define the scope of work, set up development environments, and formulate development workflows and timelines.

### 📋 Role Deliverables Breakdown

#### ⚙️ Back-End (Francis John Empil)
- [x] Initialize Node.js and Express project repository structure (`server.js`, `package.json`, `src/`)
- [x] Configure environment variables handling (`.env`, `.env.example`)
- [x] Verify local development server setup on `http://localhost:5000`

#### 🎨 Front-End (Jibson Cabilin)
- [x] Initialize Flutter cross-platform project structure (`pubspec.yaml`, `lib/main.dart`)
- [x] Scaffold core folder layout: `screens/`, `widgets/`, `models/`, `services/`
- [x] Create initial responsive web preview harness

#### 📋 QA & Project Management (Jerold Sodusta & Nove Calasang)
- [x] Finalize Software Requirements Specification (SRS) with 8 Functional and 5 Non-Functional requirements
- [x] Define Work Breakdown Structure (WBS) and RACI matrix
- [x] Establish Git repository branching strategy (`main`, `develop`, `feature/*`, `bugfix/*`)
- [x] Formulate 13-week master project milestone schedule

### ✅ Acceptance Criteria
- [x] Approved proposal and requirements documentation available
- [x] Backend and frontend scaffolding runs cleanly without build errors
- [x] Team roles and weekly deliverables agreed and signed off
```

---

### Issue #3: Week 2 — System Design and Prototypes
**Title:** `[Milestone] Week 2: System Design and Prototypes`  
**Assignees:** Francis John Empil, Jibson Cabilin, Nove Calasang, Jerold Sodusta  
**Labels:** `milestone`, `backend`, `frontend`, `documentation`, `status: completed`  
**Milestone:** `Week 2: System Design & Prototypes`  
**State:** `Closed`

```markdown
## 🎯 Week 2 Objective
Design the system architecture, produce the PostgreSQL relational schema, document REST API specifications, create UI wireframes, and develop interactive clickable prototypes.

### 📋 Role Deliverables Breakdown

#### ⚙️ Back-End (Francis John Empil)
- [x] Formulate visual Entity-Relationship Diagram (ERD) with 5 core tables (`users`, `medicines`, `prescriptions`, `dose_logs`, `caregiver_links`)
- [x] Write PostgreSQL DDL schema (`database.sql`) with primary keys, foreign keys, and cascading rules
- [x] Document RESTful API endpoint specifications (`API_DOCUMENTATION.md`) with HTTP methods, request bodies, and JSON responses

#### 🎨 Front-End (Jibson Cabilin)
- [x] Design mid-fidelity wireframes for 6 primary application screens (`WIREFRAMES.md`)
- [x] Build interactive visual wireframe showcase (`wireframes.html`)
- [x] Implement interactive prototype with navigation flows, dose countdown, and modal forms

#### 📋 QA & Project Management (Nove Calasang & Jerold Sodusta)
- [x] Conduct architecture and database design review with signed approval
- [x] Write formal QA Test Plan (`USER_MANUAL.md`) with 11 test cases covering auth, CRUD, and responsiveness
- [x] Prepare verified Live Prototype package with `start.bat` runner

### ✅ Acceptance Criteria
- [x] Database schema executes successfully on PostgreSQL without syntax or constraint errors
- [x] API contract clearly defines all input parameters and HTTP status codes
- [x] UI prototypes match user flow and design specifications
```

---

### Issue #4: Week 3 — Authentication Module
**Title:** `[Milestone] Week 3: Authentication Module`  
**Assignees:** Francis John Empil, Jibson Cabilin, Nove Calasang  
**Labels:** `milestone`, `backend`, `frontend`, `qa-testing`, `status: completed`  
**Milestone:** `Week 3: Authentication`  
**State:** `Closed`

```markdown
## 🎯 Week 3 Objective
Implement secure user registration, login, and JWT-based session authorization across both the backend REST API and the client applications.

### 📋 Role Deliverables Breakdown

#### ⚙️ Back-End (Francis John Empil)
- [x] Create user registration endpoint (`POST /api/auth/register`) with email uniqueness check
- [x] Secure password storage using `bcrypt` (minimum 10 salt rounds)
- [x] Implement login endpoint (`POST /api/auth/login`) generating signed JWT access tokens
- [x] Implement JWT Bearer authentication middleware (`auth.js`) for protecting private routes
- [x] Add user profile endpoint (`GET /api/auth/me`)

#### 🎨 Front-End (Jibson Cabilin)
- [x] Create Login screen with email format regex and password visibility toggle
- [x] Create Registration screen with real-time 4-level password strength meter
- [x] Implement token persistence using local storage / secure storage
- [x] Build responsive standalone web simulator with demo credential one-click login

#### 📋 QA & Project Management (Nove Calasang & Jerold Sodusta)
- [x] Design 15 QA test cases (TC-AUTH-01 through TC-AUTH-15) covering valid/invalid logins, duplicates, and expired tokens
- [x] Execute automated API test suite (`auth_api_test.js`) with 10 assertions passing
- [x] Document test traceability matrix and signed Week 3 milestone report

### ✅ Acceptance Criteria
- [x] Unauthenticated requests to protected endpoints return `401 Unauthorized`
- [x] Passwords are never saved or returned in plain text
- [x] Client successfully stores JWT and attaches `Authorization: Bearer <token>` to requests
```

---

### Issue #5: Week 4 — Medicine Management CRUD
**Title:** `[Milestone] Week 4: Medicine Management CRUD`  
**Assignees:** Francis John Empil, Jibson Cabilin, Nove Calasang  
**Labels:** `milestone`, `backend`, `frontend`, `qa-testing`, `status: completed`  
**Milestone:** `Week 4: Medicine Management`  
**State:** `Closed`

```markdown
## 🎯 Week 4 Objective
Develop the complete Medicine Management module allowing users to view, add, update, search, and delete medications.

### 📋 Role Deliverables Breakdown

#### ⚙️ Back-End (Francis John Empil)
- [x] Implement Medicine CRUD routes and controller (`/api/medicines`):
  - `GET /api/medicines` — Fetch all user medicines
  - `GET /api/medicines/:id` — Fetch specific medicine details
  - `POST /api/medicines` — Add new medicine with validation
  - `PUT /api/medicines/:id` — Update existing medicine
  - `DELETE /api/medicines/:id` — Remove medicine
- [x] Create data access model (`medicineModel.js`) with parameterized SQL queries preventing SQL injection
- [x] Add inventory stock quantity and refill tracking fields

#### 🎨 Front-End (Jibson Cabilin)
- [x] Build Medicine List screen with search filter and dosage badges
- [x] Implement Add Medicine form with dosage form selector, instructions, and color tags
- [x] Implement Edit Medicine modal pre-filled with existing data
- [x] Implement safe double-confirmation delete dialog
- [x] Build stock inventory indicators with low-stock warnings

#### 📋 QA & Project Management (Nove Calasang & Jerold Sodusta)
- [x] Create 16 QA test cases (TC-MED-01 through TC-MED-16) covering full CRUD lifecycle
- [x] Execute automated API test suite (`medicine_api_test.js`) with 10 assertions passing
- [x] Prepare integrated live deliverables package for Weeks 3 & 4

### ✅ Acceptance Criteria
- [x] User can successfully create, read, update, and delete prescriptions
- [x] Form fields enforce validation (required medicine name, positive dosage, valid form)
- [x] Medicines belonging to one user are completely isolated from other users
```

---

### Issue #6: Week 5 — Medicine Management Completion & Live API Integration
**Title:** `[Milestone] Week 5: Medicine Management Completion`  
**Assignees:** Francis John Empil, Jibson Cabilin, Nove Calasang  
**Labels:** `milestone`, `backend`, `frontend`, `qa-testing`, `status: in-progress`  
**Milestone:** `Week 5: Medicine Completion`  
**State:** `Open` *(Current)*

```markdown
## 🎯 Week 5 Objective
Refine input validation, polish error handling, connect frontend client screens directly to the running backend API, and produce the defect report.

### 📋 Role Deliverables Breakdown

#### ⚙️ Back-End (Francis John Empil)
- [ ] Add strict server-side schema validation (field length, enum constraints for dosage forms)
- [ ] Implement standardized error responses (`{ error: true, message: string }`)
- [ ] Test edge cases (special characters, large payloads, concurrent updates)

#### 🎨 Front-End (Jibson Cabilin)
- [ ] Wire Flutter and Web medicine forms to live backend endpoints via `http` service
- [ ] Implement friendly client toast notifications for successful save/update/delete actions
- [ ] Handle offline and server-error fallback states gracefully

#### 📋 QA & Project Management (Nove Calasang & Jerold Sodusta)
- [ ] Execute integrated end-to-end testing between client UI and PostgreSQL backend
- [ ] Log discovered UI/API defects in defect tracker and verify resolutions
- [ ] Prepare live milestone demonstration and sign-off report

### ✅ Acceptance Criteria
- [ ] Medicine CRUD operations persist directly to PostgreSQL database from the UI
- [ ] Errors (e.g. server down, invalid inputs) display clear user-friendly messages
- [ ] Defect resolution report shows 0 critical/high severity open bugs
```

---

### Issue #7: Week 6 — Medication Scheduling Engine
**Title:** `[Milestone] Week 6: Medication Scheduling`  
**Assignees:** Francis John Empil, Jibson Cabilin, Nove Calasang  
**Labels:** `milestone`, `backend`, `frontend`, `status: planned`  
**Milestone:** `Week 6: Scheduling`  
**State:** `Open`

```markdown
## 🎯 Week 6 Objective
Implement flexible prescription scheduling rules supporting daily, hourly interval, and specific day-of-week recurrence.

### 📋 Role Deliverables Breakdown

#### ⚙️ Back-End (Francis John Empil)
- [ ] Implement Schedule endpoints (`/api/schedules`):
  - `POST /api/schedules` — Create frequency rules and scheduled times
  - `GET /api/schedules/:medicineId` — Retrieve active schedules for medicine
  - `PUT /api/schedules/:id` — Adjust time slots or frequencies
- [ ] Implement schedule parsing logic: daily, every X hours, specific weekdays, start and end dates

#### 🎨 Front-End (Jibson Cabilin)
- [ ] Build Schedule Creation Form with time picker and recurrence selector
- [ ] Implement day-of-week chip selection and interval stepper
- [ ] Display active schedules inside medicine detail screen

#### 📋 QA & Project Management (Nove Calasang & Jerold Sodusta)
- [ ] Develop test matrix for all scheduling patterns (daily, alternate days, end-date expirations)
- [ ] Verify schedule conflict handling and date boundaries

### ✅ Acceptance Criteria
- [ ] Schedules calculate correct expected dose instances
- [ ] Users can edit or cancel an active schedule without deleting the medicine record
```

---

### Issue #8: Week 7 — Dashboard & Upcoming Doses
**Title:** `[Milestone] Week 7: Dashboard and Upcoming Doses`  
**Assignees:** Francis John Empil, Jibson Cabilin, Nove Calasang  
**Labels:** `milestone`, `backend`, `frontend`, `status: planned`  
**Milestone:** `Week 7: Dashboard`  
**State:** `Open`

```markdown
## 🎯 Week 7 Objective
Develop the primary user dashboard aggregating today's scheduled doses, next dose countdown, and adherence streak.

### 📋 Role Deliverables Breakdown

#### ⚙️ Back-End (Francis John Empil)
- [ ] Build endpoint `GET /api/dashboard/today` returning today's chronological dose queue
- [ ] Implement query logic determining "Next Scheduled Dose" and countdown timer data
- [ ] Calculate user's current streak (consecutive days with 100% adherence)

#### 🎨 Front-End (Jibson Cabilin)
- [ ] Build Dashboard screen with today's medication timeline cards
- [ ] Add live countdown timer to the next upcoming dose
- [ ] Display streak counter badge and today's summary card

#### 📋 QA & Project Management (Nove Calasang & Jerold Sodusta)
- [ ] Verify dashboard calculations using real database records across different time zones
- [ ] Test empty dashboard states (no medications scheduled for today)

### ✅ Acceptance Criteria
- [ ] Dashboard displays accurate chronological order of today's doses
- [ ] Next dose countdown updates in real time
```

---

### Issue #9: Week 8 — Dose Logging & Adherence Tracking
**Title:** `[Milestone] Week 8: Dose Logging`  
**Assignees:** Francis John Empil, Jibson Cabilin, Nove Calasang  
**Labels:** `milestone`, `backend`, `frontend`, `qa-testing`, `status: planned`  
**Milestone:** `Week 8: Dose Logging`  
**State:** `Open`

```markdown
## 🎯 Week 8 Objective
Allow users to log dose actions (Taken, Skipped, Snoozed) and maintain an immutable historical dose log.

### 📋 Role Deliverables Breakdown

#### ⚙️ Back-End (Francis John Empil)
- [ ] Implement Dose Log endpoints (`/api/doses`):
  - `POST /api/doses/log` — Record dose status (`TAKEN`, `SKIPPED`, `SNOOZED`) with timestamp
  - `GET /api/doses/history` — Query historical dose records with date range filters
- [ ] Auto-decrement medicine inventory count when dose is marked `TAKEN`

#### 🎨 Front-End (Jibson Cabilin)
- [ ] Add quick-action buttons on dashboard cards: `Taken` (green), `Skip` (gray), `Snooze` (amber)
- [ ] Build Dose History log view with chronological filters
- [ ] Provide instant visual feedback when a dose status is updated

#### 📋 QA & Project Management (Nove Calasang & Jerold Sodusta)
- [ ] Test dose logging concurrency and timestamp accuracy
- [ ] Verify medicine stock reduces properly upon marking dose as taken

### ✅ Acceptance Criteria
- [ ] Action buttons immediately reflect logged status
- [ ] Inventory quantity synchronizes with dose taken logs
```

---

### Issue #10: Week 9 — Local Notifications & Reminders
**Title:** `[Milestone] Week 9: Notifications`  
**Assignees:** Jibson Cabilin, Francis John Empil, Nove Calasang  
**Labels:** `milestone`, `frontend`, `qa-testing`, `status: planned`  
**Milestone:** `Week 9: Notifications`  
**State:** `Open`

```markdown
## 🎯 Week 9 Objective
Implement scheduled local notifications on Android and Desktop environments to alert users when a dose is due.

### 📋 Role Deliverables Breakdown

#### ⚙️ Back-End (Francis John Empil)
- [ ] Provide lightweight sync endpoint for fetching active reminder time slots

#### 🎨 Front-End (Jibson Cabilin)
- [ ] Integrate `flutter_local_notifications` package for mobile and desktop
- [ ] Implement background notification channel with sound, vibration, and actionable buttons
- [ ] Support notification cancellation when a prescription is edited or deleted

#### 📋 QA & Project Management (Nove Calasang & Jerold Sodusta)
- [ ] Perform real-device notification verification on physical Android phone
- [ ] Document device-specific battery saver limitations and permission requirements

### ✅ Acceptance Criteria
- [ ] Notification fires at the exact scheduled time with medicine name and dosage instructions
- [ ] Tapping the notification opens the app directly to the dose action prompt
```

---

### Issue #11: Week 10 — Adherence Reports & Analytics
**Title:** `[Milestone] Week 10: Adherence Reports`  
**Assignees:** Francis John Empil, Jibson Cabilin, Nove Calasang  
**Labels:** `milestone`, `backend`, `frontend`, `status: planned`  
**Milestone:** `Week 10: Adherence Reports`  
**State:** `Open`

```markdown
## 🎯 Week 10 Objective
Calculate and visualize medication adherence statistics, missed doses, and compliance percentages over weekly and monthly periods.

### 📋 Role Deliverables Breakdown

#### ⚙️ Back-End (Francis John Empil)
- [ ] Implement analytics endpoint `GET /api/reports/adherence`:
  - Calculate `(doses_taken / total_scheduled) * 100` for 7-day and 30-day windows
  - Query list of missed or skipped medications grouped by date

#### 🎨 Front-End (Jibson Cabilin)
- [ ] Build Adherence Report screen with percentage progress rings and bar charts
- [ ] Display list of missed/skipped doses with reasons/notes
- [ ] Include date range picker (Last 7 Days, Last 30 Days)

#### 📋 QA & Project Management (Nove Calasang & Jerold Sodusta)
- [ ] Verify mathematical accuracy of adherence percentages against test datasets
- [ ] Test edge cases (new users with 0 scheduled doses)

### ✅ Acceptance Criteria
- [ ] Adherence score accurately matches logged database records
- [ ] Reports render cleanly on mobile, web, and desktop viewports
```

---

### Issue #12: Week 11 — Caregiver View & Cross-Platform Progress
**Title:** `[Milestone] Week 11: Caregiver View and Cross-Platform Progress`  
**Assignees:** Francis John Empil, Jibson Cabilin, Nove Calasang  
**Labels:** `milestone`, `backend`, `frontend`, `status: planned`  
**Milestone:** `Week 11: Caregiver View`  
**State:** `Open`

```markdown
## 🎯 Week 11 Objective
Provide a Caregiver management view for monitoring dependent patients' schedules and test multi-platform builds.

### 📋 Role Deliverables Breakdown

#### ⚙️ Back-End (Francis John Empil)
- [ ] Implement caregiver relationship endpoints (`/api/caregiver/dependents`)
- [ ] Enforce authorization checks ensuring caregivers only access authorized dependent data

#### 🎨 Front-End (Jibson Cabilin)
- [ ] Build Caregiver Overview screen showing linked family members/patients
- [ ] Add dependent profile switcher to view medication schedules per dependent
- [ ] Generate preliminary desktop (Windows) and Web builds

#### 📋 QA & Project Management (Nove Calasang & Jerold Sodusta)
- [ ] Test caregiver data isolation and security access control
- [ ] Compile cross-platform compatibility test report

### ✅ Acceptance Criteria
- [ ] Caregivers can view dependent dose statuses without modifying unauthorized records
- [ ] Application compiles and runs on Web and Desktop targets
```

---

### Issue #13: Week 12 — Integration, Security & Final Testing
**Title:** `[Milestone] Week 12: Integration and Final Testing`  
**Assignees:** Nove Calasang, Francis John Empil, Jibson Cabilin, Jerold Sodusta  
**Labels:** `milestone`, `qa-testing`, `backend`, `frontend`, `status: planned`  
**Milestone:** `Week 12: Integration Testing`  
**State:** `Open`

```markdown
## 🎯 Week 12 Objective
Perform comprehensive system integration, regression testing, bug fixing, and finalize user documentation.

### 📋 Role Deliverables Breakdown

#### ⚙️ Back-End (Francis John Empil)
- [ ] Resolve any outstanding API defects or performance bottlenecks
- [ ] Finalize database foreign key cascading, index optimization, and backups

#### 🎨 Front-End (Jibson Cabilin)
- [ ] Fix UI styling inconsistencies and responsive layout glitches
- [ ] Polish transitions, loading indicators, and error banners

#### 📋 QA & Project Management (Nove Calasang & Jerold Sodusta)
- [ ] Execute full regression test suite across all modules
- [ ] Compile final Consolidated QA Test Report with test execution logs
- [ ] Write completed User Manual with step-by-step screenshots

### ✅ Acceptance Criteria
- [ ] All high and medium severity bugs closed
- [ ] Regression test suite achieves 100% pass rate
- [ ] User Manual clearly guides end users through all application features
```

---

### Issue #14: Week 13 — Finalization and Demonstration
**Title:** `[Milestone] Week 13: Finalization and Demonstration`  
**Assignees:** Jerold Sodusta, Francis John Empil, Jibson Cabilin, Nove Calasang  
**Labels:** `milestone`, `documentation`, `status: planned`  
**Milestone:** `Week 13: Final Demonstration`  
**State:** `Open`

```markdown
## 🎯 Week 13 Objective
Conduct final system defense and demonstration for instructor Mr. Henzon Paul Dionsay and submit final project packages.

### 📋 Role Deliverables Breakdown

#### ⚙️ Back-End (Francis John Empil)
- [ ] Demonstrate live RESTful API and PostgreSQL database operations via Postman / logs

#### 🎨 Front-End (Jibson Cabilin)
- [ ] Present live application running across Mobile, Web, and Desktop environments

#### 📋 QA & Project Management (Jerold Sodusta & Nove Calasang)
- [ ] Present completed GitHub repository with full issue history and milestone tracking
- [ ] Deliver project slide presentation, known limitations list, and final package handover

### ✅ Acceptance Criteria
- [ ] Successful live demonstration of all core features without crashes
- [ ] GitHub repository audit shows complete commit history and closed milestone issues
```
