# MediRemind — RESTful API Specification

**Project:** MediRemind — Cross-Platform Medicine & Prescription Reminder  
**Author:** Francis John Empil (Back-End Developer)  
**Project Manager:** Jerold Sodusta  
**Base URL:** `http://localhost:5000/api`  
**Authentication:** HTTP Authorization header: `Bearer <JWT_TOKEN>`  

---

## 1. Authentication Module

### `POST /api/auth/register`
Register a new user account (Patient or Caregiver).
- **Body:**
  ```json
  {
    "name": "Maria Elena Santos",
    "email": "patient@mediremind.com",
    "password": "password123",
    "role": "patient",
    "phone": "+63 917 123 4567"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Account successfully registered.",
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": { "id": 1, "name": "Maria Elena Santos", "email": "patient@mediremind.com", "role": "patient" }
  }
  ```

### `POST /api/auth/login`
Authenticate existing user and return JWT session token.
- **Body:**
  ```json
  {
    "email": "patient@mediremind.com",
    "password": "password123"
  }
  ```

### `GET /api/auth/me`
Retrieve currently authenticated profile.

---

## 2. Medicine Management Module

### `GET /api/medicines`
Retrieve all registered medicines for the active patient (or dependent via `?dependent_id=...`).

### `POST /api/medicines`
Create a new medicine prescription entry.
- **Body:**
  ```json
  {
    "name": "Metformin",
    "dosage": "500 mg",
    "form": "tablet",
    "instructions": "Take with meal to reduce stomach irritation",
    "stock_count": 30,
    "low_stock_threshold": 5,
    "color": "#0284c7"
  }
  ```

### `PUT /api/medicines/:id`
Update an existing medicine.

### `DELETE /api/medicines/:id`
Remove a medicine and associated schedules/dose logs.

### `POST /api/medicines/:id/refill`
Restock medicine inventory count.
- **Body:** `{"count": 30}`

---

## 3. Prescription Schedule Module

### `GET /api/schedules`
Retrieve all active medication frequency schedules.

### `POST /api/schedules`
Create a recurrence schedule for a medicine.
- **Body:**
  ```json
  {
    "medicine_id": 1,
    "frequency_type": "daily",
    "dose_times": ["08:00", "19:00"],
    "meal_timing": "with_meal",
    "start_date": "2026-10-12"
  }
  ```

---

## 4. Dose Log & Reminders Module

### `GET /api/dose-logs/today`
Returns today's doses in chronological order, with computed statuses (`taken`, `skipped`, `snoozed`, `pending`), next upcoming dose item, and exact seconds remaining until next reminder!

### `POST /api/dose-logs`
Mark a dose as `taken`, `skipped`, or `snoozed`.
- **Body:**
  ```json
  {
    "schedule_id": 1,
    "medicine_id": 1,
    "scheduled_time": "2026-10-12T08:00:00.000Z",
    "status": "taken",
    "notes": "Taken with breakfast"
  }
  ```
- **Stock Automation:** Automatically decrements `stock_count` by 1 and returns a low-stock alert if inventory falls below the threshold.

### `POST /api/dose-logs/snooze`
Delays dose reminder by specified minutes (defaults to 15 min).

---

## 5. Adherence Reports Module

### `GET /api/adherence/summary`
Returns overall adherence compliance percentage, active consecutive day streak, total taken/skipped counts, and breakdown by medicine.

### `GET /api/adherence/weekly`
Returns 7-day adherence statistics formatted for chart rendering.

### `GET /api/adherence/export`
Generates downloadable CSV report of all historical dose logs.

---

## 6. Caregiver Module

### `GET /api/caregiver/dependents`
List all linked dependents for caregiver user.

### `POST /api/caregiver/dependents`
Add dependent (family member, elderly parent, child).
