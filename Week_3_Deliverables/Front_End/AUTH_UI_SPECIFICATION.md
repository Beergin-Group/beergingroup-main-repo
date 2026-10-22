# MediRemind — Front-End UI Specification: Authentication Module
**Week 3 Deliverable**  
**Author:** Jibson Cabilin (Front-End Developer)  
**Reviewed By:** Jerold Sodusta (Project Manager), Nove Calasang (Quality Assurance)  
**Target Course:** Application Development and Emerging Technologies  
**Date:** October 2026  

---

## 1. Overview & UI Objectives

The Week 3 Front-End deliverable establishes the client-side user authentication workflows across Mobile, Web, and Desktop platforms. The interface emphasizes accessibility, clear visual hierarchy, immediate input validation feedback, and frictionless onboarding.

### Target Platforms
- **Mobile (Android/iOS):** Responsive vertical viewport, thumb-accessible primary action buttons, touch-friendly tap targets ($\ge 48 \times 48\text{ dp}$).
- **Web & Desktop (Windows/macOS/Chrome/Safari):** Centered card layout with responsive breakpoints, keyboard accessibility (`Tab` indexing), and persistent session storage.

---

## 2. Screen Breakdown & Visual Layouts

### 2.1 Login Screen Layout
```text
+-------------------------------------------------------+
|                      [💊 Logo]                        |
|                     MediRemind                        |
|       Cross-Platform Medicine & Prescription Reminder |
|                                                       |
|  +-------------------------------------------------+  |
|  | Email Address                                   |  |
|  | [ patient@mediremind.com                      ] |  |
|  +-------------------------------------------------+  |
|  | Password                                        |  |
|  | [ ••••••••••••                               👁️ ] |  |
|  +-------------------------------------------------+  |
|                                                       |
|  [x] Remember me                   Forgot password?   |
|                                                       |
|  +-------------------------------------------------+  |
|  |             [    SIGN IN BUTTON    ]            |  |
|  +-------------------------------------------------+  |
|                                                       |
|  Demo Quick Access:                                   |
|  [ 👤 Patient Demo ]       [ 🩺 Caregiver Demo ]      |
|                                                       |
|  Don't have an account? Sign Up                       |
+-------------------------------------------------------+
```

### 2.2 Registration Screen Layout
```text
+-------------------------------------------------------+
|                     Create Account                    |
|             Join MediRemind in seconds                |
|                                                       |
|  +-------------------------------------------------+  |
|  | Full Name                                       |  |
|  | [ Maria Santos                                ] |  |
|  +-------------------------------------------------+  |
|  | Email Address                                   |  |
|  | [ maria.s@example.com                         ] |  |
|  +-------------------------------------------------+  |
|  | Password                                        |  |
|  | [ StrongPass123!                             👁️ ] |  |
|  +-------------------------------------------------+  |
|  | Password Strength: [████████░░] Strong          |  |
|  | • 8+ chars  • 1 number  • 1 letter              |  |
|  +-------------------------------------------------+  |
|  | Confirm Password                                |  |
|  | [ StrongPass123!                             👁️ ] |  |
|  +-------------------------------------------------+  |
|  | I am using MediRemind as:                       |  |
|  | (o) Patient (Personal)   ( ) Caregiver (Family) |  |
|  +-------------------------------------------------+  |
|  | Phone Number (Optional for SMS alerts)          |  |
|  | [ +63 917 123 4567                            ] |  |
|  +-------------------------------------------------+  |
|                                                       |
|  +-------------------------------------------------+  |
|  |             [   CREATE ACCOUNT   ]              |  |
|  +-------------------------------------------------+  |
|                                                       |
|  Already have an account? Sign In                     |
+-------------------------------------------------------+
```

---

## 3. Form Validation Matrix & Interactive Rules

| Input Field | Validation Criteria | Error Trigger / Message | Real-Time UI Indicator |
| :--- | :--- | :--- | :--- |
| **Email** | RFC 5322 regex format, non-empty | "Please enter a valid email address (e.g., name@domain.com)" | Red outline + helper text on blur or submit |
| **Password** | Min 8 chars, at least 1 number, at least 1 letter | "Password must be $\ge 8$ characters and include at least 1 number" | Dynamic 4-tier strength bar (Weak, Medium, Strong) |
| **Confirm Password**| Must match `password` field identically | "Passwords do not match." | Green checkmark when matching; red alert when different |
| **Full Name** | Min 2 characters, valid alphabetic & spaces | "Full name must be at least 2 characters." | Red warning on blur |
| **Role Selector** | Enum: `patient` or `caregiver` | Default selected: `patient` | Radio buttons with descriptive badge |
| **Phone** | Philippine format `+639xxxxxxxxx` or empty | "Invalid phone number format." | Formatted hint placeholder |

---

## 4. Design Tokens & Theme Standards
- **Primary Color:** Teal `#0D9488` (Medical trust, calming adherence)
- **Primary Hover/Dark:** Deep Teal `#0F766E`
- **Secondary Accent:** Coral `#F43F5E` (Emergency / Missed dose alert)
- **Background Light:** `#F8FAFC`
- **Card Surface:** `#FFFFFF` with `box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05)`
- **Typography:** Inter, Segoe UI, system-ui (clean sans-serif)
- **Font Sizes:**
  - Title: `24px` / Semi-bold (600)
  - Subtitle: `14px` / Regular (400)
  - Inputs: `15px`
  - Button Text: `16px` / Medium (500)
