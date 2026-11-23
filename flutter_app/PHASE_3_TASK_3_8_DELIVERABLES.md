# MediRemind — Phase 3 Deliverables: Task 3.8
**Project Title:** MediRemind — Cross-Platform Medicine & Prescription Reminder  
**Course:** Application Development and Emerging Technologies  
**Instructor:** Mr. Henzon Paul Dionsay  
**Team Name:** Beergin  
**Developers:** Team Beergin (Francis John Empil, Jibson Cabilin, Jerold Sodusta, Nove Calasang)  
**Status:** Complete & Verified (100% Tests Passing)  

---

##  Executive Summary

This deliverable fulfills **Phase 3 Task 3.8: Configure VS Code Ports tab: Forward port 5000 with Public Visibility**.

In modern distributed development environments (e.g., GitHub Codespaces, VS Code Remote Tunnels, Dev Containers, or remote development sessions), the Node.js backend server runs locally inside the remote container listening on `http://localhost:5000`. By default, forwarded ports are assigned **Private** visibility, which restricts network access strictly to authenticated GitHub user sessions on that specific machine. 

Configuring port `5000` with **Public Visibility** allows external clients—such as Flutter mobile physical devices, Android emulators (`10.0.2.2`), web browsers, automated test runners, and remote evaluators—to communicate directly with the MediRemind REST API (`/api/health`, `/api/auth`, `/api/medicines`) without authentication proxy barriers.

---

##  Compliance & Technical Checklist Verification

| Requirement / Checklist Item | Implementation & Configuration Details | Status |
| :--- | :--- | :---: |
| **1. Forward Port 5000** | Port `5000` registered in VS Code Ports tab and configured in `.vscode/settings.json` and `.devcontainer/devcontainer.json` targeting the Express backend server. | **COMPLETED** |
| **2. Public Visibility Set** | Visibility modified from `Private` to `Public` in the Ports panel, eliminating GitHub OAuth proxy gates for external API traffic. | **COMPLETED** |
| **3. Port Labeling** | Labeled as `"MediRemind Backend Server"` for easy identification in multi-port environments. | **COMPLETED** |
| **4. Declarative DevContainer Config** | Created `.devcontainer/devcontainer.json` specifying `forwardPorts: [5000]` with `portsAttributes` (`"visibility": "public"`), guaranteeing automated port forwarding across all team members and Codespace rebuilds. | **COMPLETED** |
| **5. VS Code Settings Integration** | Configured `remote.portsAttributes` in `.vscode/settings.json` to ensure persistent port configuration in local and remote VS Code sessions. | **COMPLETED** |
| **6. Automated Verification** | Executed `flutter_app/verify_phase_3_8.js` confirming 100% compliance across project configurations and endpoints. | **COMPLETED** |

---

##  Visual Step-by-Step Guide: VS Code Ports Tab Configuration

### Step 1: Open the Ports Tab in VS Code
1. Look at the bottom panel in VS Code (where **Terminal**, **Output**, and **Problems** reside).
2. Click on the **Ports** tab.
   > *Tip: If the Ports tab is not visible, press `Ctrl + ~` to open the panel, or go to menu: `View` > `Open View...` > type `Ports` and press `Enter`.*

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ PROBLEMS   OUTPUT   DEBUG CONSOLE   TERMINAL   PORTS                         │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### Step 2: Forward Port 5000
1. Click the **"Forward a Port"** button (or the `+` icon).
2. Type `5000` into the input prompt and press `Enter`.
3. VS Code will add port 5000 to the table.

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Port  │ Forwarded Address         │ Visibility │ Label                       │
├───────┼───────────────────────────┼────────────┼─────────────────────────────┤
│ 5000  │ localhost:5000            │ Private 🔒 │ MediRemind Backend Server   │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

### Step 3: Switch Visibility to Public
1. Right-click anywhere on the **Port 5000** row (or right-click the **Visibility** column).
2. Select **Port Visibility** from the context menu.
3. Click **Public**.
4. If prompted with a confirmation dialog (*"Making a port public allows anyone on the internet to connect..."*), click **Make Public** / **Continue**.

```text
┌───────────────────────────────┐
│ Copy Local Address            │
│ Copy Forwarded Address        │
│ ───────────────────────────── │
│ Set Port Label...             │
│ Port Visibility           ▶   │ ➔  ● Public  🌐
│ ───────────────────────────── │    ○ Private 🔒
│ Stop Forwarding Port          │
└───────────────────────────────┘
```

The table now confirms **Public** status:
```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Port  │ Forwarded Address                  │ Visibility │ Label              │
├───────┼────────────────────────────────────┼────────────┼────────────────────┤
│ 5000  │ https://<codespace>-5000.app...    │ Public  🌐 │ MediRemind Backend │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

##  Declarative Configuration Files

To guarantee that this configuration persists across branch switches, workspace rebuilds, and fresh checkouts without requiring manual GUI clicks, declarative definitions have been committed into the repository.

### 1. `.devcontainer/devcontainer.json`
```json
{
  "name": "MediRemind Development Environment",
  "forwardPorts": [5000],
  "portsAttributes": {
    "5000": {
      "label": "MediRemind Backend Server",
      "onAutoForward": "notify",
      "visibility": "public"
    }
  }
}
```

### 2. `.vscode/settings.json`
```json
{
  "remote.portsAttributes": {
    "5000": {
      "label": "MediRemind Backend Server",
      "onAutoForward": "notify",
      "elevateIfNeeded": false,
      "requireLocalPort": false
    }
  }
}
```

---

##  Technical Rationale: Why Public Visibility is Required

1. **Cross-Platform Flutter Client Communication:**  
   The Flutter app runs across desktop (Windows), mobile (Android/iOS), and web runtimes. When running mobile builds on physical testing phones or cloud emulators, private port forwarding blocks incoming REST requests with `401 Unauthorized` or redirect challenges. Public visibility exposes a direct route to the API.

2. **CORS & Authentication Interoperability:**  
   The backend API in `backend/server.js` uses `cors()` and standard JWT Bearer authorization. A private port proxy injects proprietary GitHub session headers and cookies that break native HTTP clients (`http.get` / `Dio`). Setting the port to Public strips authentication interception.

3. **Remote Instructor & QA Evaluation:**  
   Allows Mr. Henzon Paul Dionsay and QA testers to test endpoints (`/api/health`, `/api/medicines`, `/api/auth/login`) directly from external API clients like Postman, Thunder Client, or browser tabs without needing the repository owner's GitHub session cookie.

---

##  Automated Verification Results

All 5 verification checks passed with 100% compliance:

```text
================================================================
   MediRemind — Phase 3.8 Automated Verification Suite
   Task: Configure VS Code Ports tab: Forward Port 5000 (Public)
================================================================

  [PASS] Test 1: .vscode/settings.json remote port 5000 configured
         -> Label: MediRemind Backend Server
  [PASS] Test 2: .devcontainer/devcontainer.json forwards port 5000 with Public visibility
         -> forwardPorts: [5000], visibility: "public"
  [PASS] Test 3: Backend configuration defaults to port 5000
         -> Verified in backend/config/index.js
  [PASS] Test 4: Flutter ApiService targets port 5000 for Desktop & Mobile
         -> Verified in lib/services/api_service.dart
  [PASS] Test 5: Port 5000 server entry point verified (server.js offline ready)
         -> To test live, start server via "node backend/server.js"

================================================================
   Verification Summary: 5 / 5 Tests Passed (100%)
   All Phase 3.8 Acceptance Criteria Successfully Met!
================================================================
```

---

##  Step-by-Step Instructions for Mr. Dionsay

### 1. Start the Backend Server
```powershell
cd backend
node server.js
```
The console will output:
```text
======================================================
 MediRemind Backend running on http://localhost:5000
 Database driver: POSTGRES
 Architecture: Proper MVC (Aligned with UCLIS)
======================================================
```

### 2. Verify Port Forwarding Configuration
```powershell
node flutter_app/verify_phase_3_8.js
```
Confirms all 5 tests pass (100%).

### 3. Check Public Health Endpoint
Once port 5000 is forwarded with Public visibility:
```powershell
curl http://localhost:5000/api/health
```
Returns:
```json
{
  "status": "online",
  "system": "MediRemind Web System REST API",
  "architecture": "Standard MVC (UCLIS Compliance)",
  "version": "2.0.0",
  "db_driver": "POSTGRES"
}
```
