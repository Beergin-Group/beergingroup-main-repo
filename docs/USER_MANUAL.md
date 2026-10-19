# MediRemind — User Manual & Quality Assurance Testing Guide

**Project:** MediRemind — Cross-Platform Medicine & Prescription Reminder  
**Author:** Nove Calasang (Quality Assurance)  
**Project Manager:** Jerold Sodusta  
**Submitted To:** Mr. Henzon Paul Dionsay  
**Date:** October 12, 2026  

---

## 1. Quick Launch & Access

1. Ensure the Node.js server is running:
   ```powershell
   cd C:/Users/User/Desktop/mediremind\backend
   node server.js
   ```
2. Open your web browser (Chrome, Edge, Firefox, or Safari) to:
   **[http://localhost:5000](http://localhost:5000)**

---

## 2. Testing Credentials

Pre-seeded demo accounts are ready for instant login:

| Role | Email | Password | Pre-populated Data |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@mediremind.com` | `password123` | 4 active medicines (Metformin, Lisinopril, Atorvastatin, Vitamin D3), 14 days of realistic adherence history, 96% adherence rate, 5-day streak |
| **Caregiver** | `caregiver@mediremind.com` | `password123` | 2 linked dependents (Grandmother Rosa - 78 y/o, Timmy Santos - 9 y/o) with active prescriptions |

---

## 3. Core Feature Verification Matrix (QA Test Plan)

### Test Case 1: Cross-Platform Device Viewport Switching
1. In the top black bar, click **"💻 Desktop View"**: Observe wide dashboard layout with persistent left navigation sidebar.
2. Click **"📱 Mobile Phone Frame"**: Observe the interface dynamically adjust into an iPhone/Android handset frame with rounded corners, camera notch, and bottom tab bar navigation.
3. Click **"📟 Tablet View"**: Observe fluid intermediate layout.
- *Expected Result: PASS* — UI adapts seamlessly without broken elements.

### Test Case 2: Audible Chime & Notification Test
1. Click the **"🔔 Test Reminder Chime"** button in the top bar.
2. Listen for the synthesized two-tone harmonic medical alert chime (powered by Web Audio API).
3. If browser permissions allow, notice the system desktop notification appear.
4. An in-app alert modal appears with "Mark Taken", "Snooze 15 Min", and "Dismiss".
- *Expected Result: PASS* — Sound plays instantly without needing third-party MP3 assets.

### Test Case 3: Next Dose Live Countdown Ticker
1. On the Dashboard, observe the teal hero banner labeled **"UP NEXT"**.
2. Notice the real-time clock ticking down seconds until the nearest scheduled medication.
3. Click **"✓ Mark Taken"**: Observe the dose instantly marked as completed, celebratory confirmation toast appears, stock decreases, and next dose recalculates.
- *Expected Result: PASS*.

### Test Case 4: Dose Logging (Taken, Skipped, Snoozed)
1. On Today's Dose Timeline, select any pending medication.
2. Click **"Take"**: Status turns into green "✓ Taken", stock decreases by 1 unit.
3. Click **"⏰ Snooze"**: Dose status changes to snoozed for 15 minutes.
4. Click **"Skip"**: Status turns into red "✕ Skipped".
- *Expected Result: PASS*.

### Test Case 5: Prescription & Stock Refill Management
1. Click the **"Prescriptions"** tab in navigation.
2. Review the list of current medicines with stock level progress bars.
3. Click **"+ Refill (30)"** on any medicine: Observe stock increases immediately by 30 units.
4. Click **"+ New Medicine"**: Fill in name, dosage, form, dose times, and color; click "Save Prescription": Observe medicine and schedule appear on Dashboard and Medicine catalog immediately.
- *Expected Result: PASS*.

### Test Case 6: Adherence Analytics & Report Export
1. Click the **"Adherence Report"** tab.
2. Observe the **Overall Medication Adherence %** gauge and 7-day compliance bar chart.
3. Review the compliance table grouped by each medicine.
4. Click **"📥 Download CSV Report"**: A CSV file (`mediremind_adherence_report.csv`) downloads directly to your machine.
- *Expected Result: PASS*.

### Test Case 7: Caregiver View & Dependent Prescriptions
1. Switch to Caregiver account via the account switcher modal (or quick login with `caregiver@mediremind.com`).
2. Notice the **Caregiver View dropdown** appear in the sidebar.
3. Switch between **"Grandmother Rosa"** and **"Timmy Santos"**: Observe prescription lists and schedules filter specifically to each dependent family member.
- *Expected Result: PASS*.
