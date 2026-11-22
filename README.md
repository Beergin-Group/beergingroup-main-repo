# MediRemind — Web System (UCLIS MVC Standard)

**Course:** Application Development and Emerging Technologies  
**Instructor:** Mr. Henzon Paul Dionsay  
**Team:** Beergin  
**Branch:** `feature/web-system`  

| Member | Role |
|---|---|
| Jerold Sodusta (`@torpeness-blip`) | Project Manager |
| Francis John Empil (`@francisjohnempil93-ux`) | Back-End Developer |
| Jibson Cabilin (`@jizzcabilin-art`) | Front-End Developer |
| Nove Calasang (`@Nove-Calasang`) | Quality Assurance |

---

##  Architecture Overhaul (UCLIS Alignment)

To comply with the College of Computer Studies (CCS) standards established in the reference project (`UCLIS`):
1. **Backend (MVC Restructuring - Issue #38):**
   - Eliminated nested `src/` directory.
   - Introduced a dedicated `models/` layer (`User.js`, `Medicine.js`, `Schedule.js`, `DoseLog.js`, `Adherence.js`, `Caregiver.js`) separating database queries and business logic from controllers.
   - Standardized `config/db.js` providing dual-driver compatibility (PostgreSQL with auto-fallback to persistent JSON file storage).
   - Clean, modular routes mounted via `routes/index.js`.
   - Dedicated request logger middleware (`middleware/logger.js`).

2. **Frontend (Component Deconstruction - Issue #39):**
   - Deconstructed previous monolithic files (`app.js`, `index.html`, `styles.css`) into a modern Vite + React SPA architecture.
   - Reusable UI elements isolated in `src/components/` (`AppShell`, `Modal`, `StatCard`, `StatusBadge`, `PageHeader`, `Spinner`, `DoseCountdown`).
   - Domain features organized into dedicated views in `src/pages/` (`LoginPage`, `Dashboard`, `Medicines`, `Schedules`, `DoseLogs`, `Adherence`, `Caregiver`, `Profile`).
   - Global state managed via `src/context/AuthContext.jsx`.
   - Centralized Axios client with authentication interceptors in `src/services/api.js`.

---

##  Project Structure

```
mediremind_websystems/
├── backend/
│   ├── config/
│   │   ├── db.js                 ← Database connection pool & driver manager
│   │   └── index.js              ← Environment configuration
│   ├── controllers/
│   │   ├── adherenceController.js
│   │   ├── authController.js
│   │   ├── caregiverController.js
│   │   ├── doseLogController.js
│   │   ├── medicineController.js
│   │   └── scheduleController.js
│   ├── data/
│   │   ├── mediremind.json       ← Persistent local database
│   │   ├── schema.sql            ← PostgreSQL DDL schema
│   │   └── seed.js               ← Seeder script
│   ├── middleware/
│   │   ├── auth.js               ← JWT Bearer guard
│   │   └── logger.js             ← Request & latency logger
│   ├── models/                   ← MVC Data Model Layer
│   │   ├── Adherence.js
│   │   ├── Caregiver.js
│   │   ├── DoseLog.js
│   │   ├── Medicine.js
│   │   ├── Schedule.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adherenceRoutes.js
│   │   ├── authRoutes.js
│   │   ├── caregiverRoutes.js
│   │   ├── doseLogRoutes.js
│   │   ├── medicineRoutes.js
│   │   ├── scheduleRoutes.js
│   │   └── index.js              ← API route aggregator
│   ├── .env
│   ├── package.json
│   └── server.js                 ← Express entry point & static SPA delivery
│
├── frontend/
│   ├── dist/                     ← Production Vite build
│   ├── src/
│   │   ├── components/           ← Reusable UI widgets
│   │   │   ├── AppShell.jsx
│   │   │   ├── DoseCountdown.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── PageHeader.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx   ← Auth & dependent context
│   │   ├── pages/                ← Modularized screens
│   │   │   ├── Adherence.jsx
│   │   │   ├── Caregiver.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DoseLogs.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── Medicines.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Schedules.jsx
│   │   ├── services/
│   │   │   └── api.js            ← Axios HTTP client
│   │   ├── App.jsx               ← Protected route router
│   │   ├── index.css             ← Tailwind design system
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── start.bat                     ← One-click execution launcher
├── database.sql                  ← Standalone PostgreSQL schema
└── package.json                  ← Root workspace script runner
```

---

##  How to Run

### Method 1: One-Click Launcher (Recommended)
Double-click `start.bat` in the root folder.  
It boots the Node.js backend server and automatically opens `http://localhost:5000` in your default browser.

### Method 2: Manual Terminal Commands
```bash
# Start backend server (serves both API + built frontend)
cd backend
node server.js

# Optional: Run frontend in Vite hot-reload development mode
cd frontend
npm run dev
```

---

##  Demo Login Accounts

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Patient** | `patient@mediremind.com` | `password123` | Self medication management, dose tracking, adherence |
| **Caregiver** | `caregiver@mediremind.com` | `password123` | Proxy management for elderly parents and dependents |
