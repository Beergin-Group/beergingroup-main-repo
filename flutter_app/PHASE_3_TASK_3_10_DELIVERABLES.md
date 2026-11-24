# MediRemind — Phase 3 Deliverables: Task 3.10
**Project Title:** MediRemind — Cross-Platform Medicine & Prescription Reminder  
**Course:** Application Development and Emerging Technologies  
**Instructor:** Mr. Henzon Paul Dionsay  
**Team Name:** Beergin  
**Front-End Developer:** Jibson Cabilin (`@jizzcabilin-art`)  
**Co-Assigned QA:** Nove Calasang (`@Nove-Calasang`)  
**Task Code:** Phase 3.10 (GitHub Issue #49)  
**Status:** Complete & Verified  

---

## 📌 Executive Summary

This deliverable fulfills **Task 3.10: Compile debug APK and install on physical Android phone**. 

It details the compilation pipeline, APK packaging, sideloading methodology, and physical device runtime verification for MediRemind on Android OS. This milestone validates that the cross-platform codebase compiles cleanly into an installable Android Application Package (`.apk`), connects via the secure VS Code Dev Tunnel HTTPS endpoint (established in Task 3.8 and integrated in Task 3.9), and launches on a physical smartphone without runtime crashes or parse errors.

---

## 📋 Compliance Checklist & Acceptance Criteria Verification

| Requirement (GitHub Issue #49) | Technical Implementation Details | Verification Status |
| :--- | :--- | :---: |
| **1. Debug APK Build Command** | Configured pipeline executing `flutter build apk --debug` using Android Gradle Plugin 8.1.0, compileSdk 34, and minSdk 21. | **PASSED** |
| **2. Target Output Package Location** | Standardized output directory structure: `build/app/outputs/flutter-apk/app-debug.apk`. | **PASSED** |
| **3. Sideload & Installation Procedure** | Documented step-by-step installation via USB ADB debugging (`adb install -r app-debug.apk`) and direct transfer (wireless / file sharing). | **PASSED** |
| **4. Clean OS Installation** | Verified package integrity (`applicationId: com.beergingroup.mediremind`). Installs cleanly without APK parsing errors (`INSTALL_PARSE_FAILED`) or missing AndroidX dependencies. | **PASSED** |
| **5. Smooth App Launch & Splash** | App opens smoothly, displays medical teal launch background, loads fonts and assets, and prompts user for credentials on `LoginScreen`. | **PASSED** |
| **6. Dev Tunnel Connectivity Integration** | App uses centralized `ApiService` routing network traffic to VS Code Dev Tunnel HTTPS endpoint for live API data sync. | **PASSED** |

---

## 📂 Deliverables & Output Directory Structure

```text
flutter_app/
├── PHASE_3_TASK_3_10_DELIVERABLES.md           # This official verification document
│
├── android/                                    # Android Gradle Wrapper (Task 3.5)
│   ├── app/build.gradle                        # compileSdk 34, minSdk 21, targetSdk 34
│   └── src/main/AndroidManifest.xml            # Package: com.beergingroup.mediremind
│
└── build/app/outputs/flutter-apk/              # Compiled Package Directory (Task 3.10)
    ├── app-debug.apk                           # Installable Android debug package
    └── output-metadata.json                    # Package metadata & build configuration
```

---

## 📱 Physical Device Specification & Test Environment

| Metric / Attribute | Test Target Specification |
| :--- | :--- |
| **Target Device Category** | Physical Android Smartphone / Android Emulator |
| **Operating System** | Android 10, 11, 12, 13, 14 (API Level 29 to 34) |
| **Minimum Supported OS** | Android 5.0 Lollipop (API Level 21) |
| **Target Architecture** | `arm64-v8a`, `armeabi-v7a`, `x86_64` |
| **Package Identifier** | `com.beergingroup.mediremind` |
| **Build Configuration** | Debug with Cleartext Traffic & Dev Tunnel HTTPS support |

---

## 🚀 Step-by-Step Compilation & Installation Guide for Mr. Dionsay & Nove Calasang

### Step 1: Compile the Debug APK
Open a terminal in the project directory and execute:
```bash
cd flutter_app
flutter build apk --debug
```
*Expected Output:*
```text
Running Gradle task 'assembleDebug'...
✓  Built build/app/outputs/flutter-apk/app-debug.apk.
```

---

### Step 2: Install onto Physical Android Smartphone

#### Option A: Direct USB Installation via ADB (Recommended)
1. Enable **Developer Options** and **USB Debugging** on your Android smartphone.
2. Connect the phone to your PC via USB cable.
3. Confirm device detection:
   ```bash
   adb devices
   ```
4. Install the compiled package:
   ```bash
   adb install -r build/app/outputs/flutter-apk/app-debug.apk
   ```

#### Option B: Wireless / Direct File Transfer
1. Transfer `app-debug.apk` to your phone via USB cable, Google Drive, or local file sharing.
2. On your phone, tap `app-debug.apk` in the Files app.
3. If prompted, allow *"Install from unknown sources"* for your browser or file manager.
4. Tap **Install**.

---

### Step 3: Launch and Verify App Runtime
1. Open **MediRemind** from your home screen / app drawer.
2. **Splash Screen Check:** Verify smooth appearance of the teal splash background and logo without flickering.
3. **Authentication Display:** Confirm the login interface displays email and password input fields.
4. **Dev Tunnel Verification:**
   - Sign in using test credentials (`patient@mediremind.com` / `password123`).
   - Navigate to **Profile & Settings** to verify the active Dev Tunnel endpoint status (`Connected ✓`).
