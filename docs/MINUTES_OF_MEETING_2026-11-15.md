# MINUTES OF THE GROUP PROJECT MEETING
**Course:** Application Development and Emerging Technologies  
**Instructor:** Mr. Henzon Paul Dionsay  
**Project:** MediRemind — Cross-Platform Medicine & Prescription Reminder  
**Team Name:** Beergin  
**Repository:** [Beergin-Group/beergingroup-main-repo](https://github.com/Beergin-Group/beergingroup-main-repo)  
**Document Code:** MOM-2026-11-15-01  

---

## 📌 Meeting Metadata

| Item | Details |
| :--- | :--- |
| **Date:** | Sunday, November 15, 2026 |
| **Time:** | 2:00 PM – 4:30 PM (PST / GMT+8) |
| **Venue / Medium:** | Physical Group Meeting |
| **Meeting Type:** | Sprint Review (Phases 1–2 Sign-Off) & Phase 3 Sprint Planning / GitHub Roadmap Alignment |
| **Presiding Officer:** | Jerold Sodusta (Project Manager / Lead) |
| **Minutes Scribe:** | Nove Calasang (QA & Technical Documentation) |

---

## 👥 Attendance & Roll Call

| Name | Role | Attendance Status | Remarks |
| :--- | :--- | :---: | :--- |
| **Jerold Sodusta** | Project Manager / Scrum Master | **Present** | Presided over session; sprint backlog planning |
| **Francis John Empil** | Back-End Developer / Database Admin | **Present** | Presented backend CRUD & VS Code Dev Tunnel architecture |
| **Jibson Cabilin** | Front-End & Mobile Developer / UI Designer | **Present** | Presented web UI integration & cross-platform porting plan |
| **Nove Calasang** | Quality Assurance (QA) & Documentation | **Present** | Recorded minutes; presented test plans and user manual outline |

*Quorum status: 100% Attendance (4 / 4 members present).*

---

## 🎯 Meeting Agenda & Objectives

1. **Review & Formal Acceptance of Completed Milestones (Phases 1 & 2):**
   - Verification of the completed Web System, JWT authentication, and PostgreSQL database CRUD operations.
2. **GitHub Repository & Project Board Setup (Mr. Dionsay's Course Requirement):**
   - Transitioning the master project plan into 5 High-Impact Phase Epics, Milestone Trackers, and Kanban Views.
3. **Cross-Platform Networking Architecture (VS Code Dev Tunnels):**
   - Addressing the instructor's requirement for physical mobile device access to the local backend without external cloud hosting.
4. **Phase 3 Sprint Planning & Task Allocation (Weeks 7–9):**
   - Defining immediate responsibilities for Windows Desktop build configuration, Android Mobile scaffolding, and Dev Tunnel base URL integration.
5. **Timeline Alignment for Final Defense:**
   - Setting targets for Phase 4 (Notifications & Dose Actions) and Phase 5 (Regression & User Manual) ahead of the **2nd week of December 2026 final defense**.

---

## 📝 Proceedings & Discussion Details

### 1. Call to Order
The meeting was formally called to order by the Project Manager, Jerold Sodusta, at 2:00 PM. Jerold reiterated the core objective of today's session: finalizing the structured deliverables required by Mr. Henzon Paul Dionsay for progress grading, establishing the official GitHub issue tracking hierarchy, and kicking off the cross-platform expansion.

---

### 2. Agenda Item 1: Review & Sign-Off on Phases 1 & 2
- **Back-End Report (Francis John Empil):**
  - Confirmed that the PostgreSQL schema (`database.sql`), relational constraints, and cascading rules are fully functional.
  - Core authentication endpoints (`/api/auth/register`, `/api/auth/login`) with Bcrypt password hashing ($\ge 10$ salt rounds) and JWT token validation middleware are operating as expected on `http://localhost:5000`.
  - All `/api/medicines` CRUD endpoints are integrated with parameterized SQL queries to prevent SQL injection.
- **Front-End Report (Jibson Cabilin):**
  - The responsive Web Management System is operational. Users can register, log in, browse their medication catalog, and manage prescriptions via Add/Edit modal dialogs.
  - Verified user data isolation: each authenticated user can only view and modify their own prescriptions.
- **QA & Verification Report (Nove Calasang):**
  - All 15 Authentication Test Cases (`TC-AUTH-01` to `TC-AUTH-15`) and 16 Medicine CRUD Test Cases (`TC-MED-01` to `TC-MED-16`) passed without critical regressions.
- **Resolution:** Phases 1 and 2 are officially marked **100% Completed** in the project tracking documents.

---

### 3. Agenda Item 2: GitHub Projects & Issue Tracking Configuration
- Jerold presented the updated `PHASE_BASED_PROJECT_PLAN.md` and `GITHUB_ISSUES_PROGRESS_TRACKER.md`.
- **Decisions on GitHub Structure:**
  1. **Custom Field:** Create a single-select custom field named `Phase` in the GitHub Project board with 5 color-coded phases:
     - 🟣 Phase 1: Inception & Design (W1–W2) — *Completed*
     - 🔵 Phase 2: Backend & Web System (W3–W6) — *Completed*
     - 🟠 Phase 3: Cross-Platform & Dev Tunnels (W7–W9) — *In Progress (Active Sprint)*
     - 🟡 Phase 4: Notifications & Workflow (W10–W11) — *Planned*
     - 🟢 Phase 5: QA Polish & Final Defense (W12–W13) — *Planned*
  2. **Project Board Views:** Configure two primary views:
     - *Phase Roadmap View:* Grouped by Phase, sorted by milestone for Mr. Dionsay's review.
     - *Kanban Workflow View:* Columns `Todo` ➔ `In Progress` ➔ `In Review / QA` ➔ `Done`.
  3. **Master Epic Tracker:** Issue #1 will be pinned at the top of the GitHub Issues tab to provide an immediate summary of team velocity (~46% total project completion).

---

### 4. Agenda Item 3: Cross-Platform Networking via VS Code Dev Tunnels
- **Context & Requirement:**
  - Cloud hosting is out of project scope for this course phase; the backend runs on developer laptops (`http://localhost:5000`).
  - To fulfill Mr. Dionsay's requirement that the application run and synchronize across Web, Windows Desktop, and physical Android mobile phones, the team evaluated networking solutions.
- **Technical Consensus:**
  - Standard LAN IP (`192.168.x.x`) is prone to subnet isolation and firewall blocks on campus/home Wi-Fi networks.
  - The team unanimously agreed to adopt **VS Code Built-in Port Forwarding (Dev Tunnels)**:
    1. Port `5000` forwarded via VS Code Ports panel.
    2. Visibility set to **Public** to avoid tunnel authentication errors on mobile clients.
    3. The generated HTTPS Dev Tunnel address (e.g., `https://<tunnel-id>-5000.asse.devtunnels.ms`) will serve as the mobile API endpoint.
  - Francis demonstrated forwarding port 5000 and confirmed mobile browser reachability of `/api/medicines`.
  - Jibson confirmed configuring `api_service.dart` with environment-aware base URLs.

---

### 5. Agenda Item 4: Phase 3 Sprint Backlog & Immediate Assignments (Weeks 7–9)
- **Windows Desktop Application (Week 7):**
  - Jibson will enable `flutter config --enable-windows-desktop`, set minimum window dimensions ($1024 \times 700$), and test local loopback connectivity (`http://localhost:5000`).
  - Nove will verify the compiled `.exe` build.
- **Android Mobile Scaffolding & Responsive Layouts (Week 8):**
  - Jibson will implement the mobile bottom navigation bar, floating action buttons, and touch-optimized prescription cards.
- **VS Code Dev Tunnel Live Mobile Sync (Week 9):**
  - Deploy debug APK to a physical Android device.
  - Conduct end-to-end multi-device sync test: Create a medicine on Web/Desktop and verify immediate rendering on the Android phone.
  - Jerold will document the step-by-step tunnel reproduction guide for grading.

---

### 6. Agenda Item 5: Roadmap to Final Defense (Phases 4 & 5)
- **Phase 4 (Weeks 10–11):**
  - Integration of `flutter_local_notifications` for scheduled alarm triggers.
  - Implementation of one-tap dose logging (`POST /api/doses/log`) with automatic PostgreSQL inventory decrement (`stock_count - 1`) and 7-day adherence scoring.
- **Phase 5 (Weeks 12–13 / Early to Mid-December):**
  - End-to-end regression testing across all 3 platforms.
  - Compilation of the comprehensive User Manual containing multi-device screenshots.
  - Rehearsal of the live cross-platform defense presentation before Mr. Henzon Paul Dionsay scheduled for the **2nd week of December 2026**.

---

## 📌 Action Items & Responsibility Matrix

| # | Action Item / Deliverable | Assignee | Priority | Target Completion Date | Success Criteria |
| :-: | :--- | :--- | :---: | :---: | :--- |
| **1** | Create 5 Phase Epics & Milestone Issues on GitHub repository | Jerold Sodusta | **High** | Nov 16, 2026 | All issues created, tagged with labels, and visible on Project Board |
| **2** | Configure GitHub Project Board Views (Phase Roadmap & Kanban) | Jerold Sodusta | **Medium** | Nov 16, 2026 | Grouped by Phase; shared with instructor |
| **3** | Initialize Windows Desktop build target & window constraints | Jibson Cabilin | **High** | Nov 18, 2026 | Flutter Windows app compiles and queries local backend |
| **4** | Finalize VS Code Dev Tunnel setup guide & test endpoint connectivity | Francis John Empil | **High** | Nov 17, 2026 | Stable public HTTPS tunnel URL streaming JSON responses |
| **5** | Configure `api_service.dart` with dual base URL (localhost / Dev Tunnel) | Jibson Cabilin | **High** | Nov 19, 2026 | APK communicates seamlessly with forwarded port |
| **6** | Build and install debug APK on physical Android test device | Jibson & Nove | **High** | Nov 20, 2026 | Successful login and medicine list render on Android phone |
| **7** | Prepare Phase 3 QA Test Plan (Multi-platform & Dev Tunnel sync) | Nove Calasang | **Medium** | Nov 21, 2026 | Test cases drafted covering desktop windowing & tunnel latency |
| **8** | Review and consolidate Phase 1 & 2 documentation for grading submission | Jerold & Nove | **Medium** | Nov 17, 2026 | Formatted documents archived in project repository |

---

## ⚠️ Identified Risks & Mitigation Strategies

1. **Risk:** VS Code Dev Tunnel URL changes whenever the developer restarts the tunnel session.
   - *Mitigation:* Francis will document how to configure a persistent tunnel name or update the base URL dynamically in `api_service.dart` without recompiling by using a runtime config setting.
2. **Risk:** Android background process throttling could delay scheduled notifications.
   - *Mitigation:* Jibson and Francis will prioritize Android high-priority alarm channels and `exact_alarms` permission during Phase 4 implementation.
3. **Risk:** Approaching deadline for the 2nd week of December final defense.
   - *Mitigation:* Team will adhere strictly to weekly milestone pull requests; no unreviewed code directly merged to `develop` or `main`.

---

## 📢 Adjournment & Next Meeting Schedule

- Having completed all agenda items, the meeting was adjourned at **4:30 PM**.
- **Next Group Session:**
  - **Date:** Wednesday, November 18, 2026
  - **Time:** 3:00 PM – 4:30 PM
  - **Agenda:** Review Windows Desktop build output, inspect Dev Tunnel mobile connectivity, and conduct code review of initial Android scaffolding PR.

---

## ✍️ Formal Review & Approval Signatures

*We hereby certify that these minutes represent a true, accurate, and faithful record of the discussions, agreements, and decisions reached during the project meeting held on November 15, 2026.*

<br>

| Prepared by: | Approved by: |
| :---: | :---: |
| <br>_________________________________________<br>**NOVE CALASANG**<br>Quality Assurance & Minutes Scribe | <br>_________________________________________<br>**JEROLD SODUSTA**<br>Project Manager / Team Lead |

<br>

| Concurred by: | Concurred by: |
| :---: | :---: |
| <br>_________________________________________<br>**FRANCIS JOHN EMPIL**<br>Back-End Developer / Database Admin | <br>_________________________________________<br>**JIBSON CABILIN**<br>Front-End & Mobile Developer |

<br>

---

### 👨‍🏫 Instructor Acknowledgment & Evaluation

**Course Instructor:** Mr. Henzon Paul Dionsay  
**Status:** [ ] Acknowledged & Approved &nbsp;&nbsp;&nbsp;&nbsp; [ ] For Revision  
**Instructor Comments / Feedback:**  

<br>
<br>

____________________________________________________  
**MR. HENZON PAUL DIONSAY**  
*Course Instructor, Application Development and Emerging Technologies*  
Date: ________________________
