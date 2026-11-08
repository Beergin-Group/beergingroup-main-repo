# MediRemind — Live Deliverables Application (Week 3 & Week 4)

**Course:** Application Development and Emerging Technologies  
**Team:** Beergin  
- **Jerold Sodusta** — Project Manager  
- **Francis John Empil** — Back-End Developer  
- **Jibson Cabilin** — Front-End Developer  
- **Nove Calasang** — Quality Assurance  
**Submitted To:** Mr. Henzon Paul Dionsay  

---

## ⚡ Quick Launch Guide

1. **Option A (Double-Click):**
   - Double-click **`start.bat`** in this folder.
   - It starts the Node.js Express backend and opens your web browser to **[http://localhost:5000](http://localhost:5000)**.

2. **Option B (Terminal):**
   ```powershell
   cd backend
   node server.js
   ```
   Then navigate to `http://localhost:5000`.

---

## 🔑 Pre-Seeded Test Credentials

| Role | Email | Password | What to Verify |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@mediremind.com` | `password123` | Active prescriptions (Metformin, Lisinopril, Atorvastatin, Vitamin D3), stock refills, dosage edits, and deletion |
| **Caregiver** | `caregiver@mediremind.com` | `password123` | Dependent management, care authorization |

You can also use the **"Register"** tab to test new account creation with real-time email RFC validation and the dynamic 4-tier password strength meter!

---

## 🧪 Running Automated Backend API Test Suites

### Week 3 Authentication Tests:
```powershell
node ../Week_3_Deliverables/Back_End/auth_api_test.js
```

### Week 4 Medicine CRUD Tests:
```powershell
node ../Week_4_Deliverables/Back_End/medicine_api_test.js
```
