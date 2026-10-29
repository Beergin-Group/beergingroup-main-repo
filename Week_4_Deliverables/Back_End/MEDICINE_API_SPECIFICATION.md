# MediRemind — Backend API Specification: Medicine Management
**Week 4 Deliverable**  
**Author:** Francis John Empil (Back-End Developer)  
**Approved By:** Jerold Sodusta (Project Manager), Nove Calasang (Quality Assurance)  
**Target Course:** Application Development and Emerging Technologies  
**Date:** October 2026  

---

## 1. Overview & Data Architecture

The Medicine Management module is the central repository for patient prescription records in MediRemind. It exposes full CRUD (Create, Read, Update, Delete) RESTful endpoints backed by PostgreSQL, ensuring data integrity, strict user ownership enforcement, inventory tracking, and low-stock alerts.

### Key Data Architecture Features
- **User Scoping & Data Isolation:** Every medicine record is linked to a `user_id`. Users cannot query, edit, or delete another user's prescription data.
- **Dependent Support:** If `dependent_id` is supplied, medicines are tagged to the corresponding dependent (e.g. child or elderly parent) managed by a caregiver.
- **Inventory Tracking:** Each record maintains `stock_count` and `low_stock_threshold`. Dedicated refill endpoints allow fast stock updates.
- **Relational Integrity:** Foreign keys to the `users` and `dependents` tables are configured with `ON DELETE CASCADE`.

---

## 2. API Endpoints Summary

| Method | Endpoint | Description | Auth Required | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/medicines` | Retrieve list of user's medicines (optional filter by `dependent_id`) | Yes | 200, 401, 500 |
| `GET` | `/api/medicines/:id` | Retrieve single medicine details by ID | Yes | 200, 401, 404, 500 |
| `POST` | `/api/medicines` | Create a new prescription medication | Yes | 201, 400, 401, 500 |
| `PUT` | `/api/medicines/:id` | Update medication attributes | Yes | 200, 400, 401, 404, 500 |
| `DELETE` | `/api/medicines/:id` | Delete medication (cascades to orphan schedules) | Yes | 200, 401, 404, 500 |
| `POST` | `/api/medicines/:id/refill` | Quick refill pill/unit stock (+count) | Yes | 200, 400, 401, 404, 500 |

---

## 3. Detailed Endpoint Specifications

### 3.1 Get All Medicines
- **Endpoint:** `GET /api/medicines`
- **Query Parameters:**
  - `dependent_id` *(optional, integer)*: Filter medicines prescribed for a specific dependent.
- **Headers:** `Authorization: Bearer <token>`

#### Response: 200 OK
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "dependent_id": null,
      "name": "Metformin HCl",
      "dosage": "500 mg",
      "form": "tablet",
      "instructions": "Take with breakfast and dinner to lower blood glucose",
      "stock_count": 42,
      "low_stock_threshold": 10,
      "color": "#0d9488",
      "shape": "round",
      "icon": "pill",
      "is_low_stock": false,
      "created_at": "2026-10-01T08:00:00.000Z"
    },
    {
      "id": 2,
      "user_id": 1,
      "dependent_id": null,
      "name": "Lisinopril",
      "dosage": "10 mg",
      "form": "tablet",
      "instructions": "Take 1 tablet every morning with water",
      "stock_count": 4,
      "low_stock_threshold": 7,
      "color": "#0284c7",
      "shape": "oval",
      "icon": "pill",
      "is_low_stock": true,
      "created_at": "2026-10-02T08:00:00.000Z"
    }
  ]
}
```

---

### 3.2 Get Medicine by ID
- **Endpoint:** `GET /api/medicines/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Response: 200 OK
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "name": "Metformin HCl",
    "dosage": "500 mg",
    "form": "tablet",
    "instructions": "Take with breakfast and dinner",
    "stock_count": 42,
    "low_stock_threshold": 10,
    "color": "#0d9488",
    "shape": "round",
    "icon": "pill"
  }
}
```

#### Response: 404 Not Found
```json
{
  "success": false,
  "message": "Medicine not found or access unauthorized."
}
```

---

### 3.3 Create Medicine
- **Endpoint:** `POST /api/medicines`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

#### Request Body
```json
{
  "name": "Amoxicillin",
  "dosage": "250 mg",
  "form": "capsule",
  "instructions": "Take 1 capsule every 8 hours after meals until finished",
  "stock_count": 21,
  "low_stock_threshold": 5,
  "color": "#e11d48",
  "shape": "capsule",
  "icon": "pill",
  "dependent_id": null
}
```

#### Validation Rules
| Property | Type | Constraints | Default |
| :--- | :--- | :--- | :--- |
| `name` | string | Required, min 2 chars, max 100 chars | — |
| `dosage` | string | Required (e.g., "500mg", "10ml", "1 puff") | — |
| `form` | string | Enum: `tablet`, `capsule`, `syrup`, `injection`, `drops`, `inhaler`, `other` | `tablet` |
| `instructions`| string | Optional, max 500 characters | `""` |
| `stock_count` | integer| Min 0 | `30` |
| `low_stock_threshold`| integer| Min 0 | `5` |
| `color` | string | Valid hex color `#RRGGBB` | `#0d9488` |

#### Response: 201 Created
```json
{
  "success": true,
  "message": "Medicine added successfully.",
  "data": {
    "id": 5,
    "user_id": 1,
    "name": "Amoxicillin",
    "dosage": "250 mg",
    "form": "capsule",
    "stock_count": 21,
    "low_stock_threshold": 5,
    "color": "#e11d48",
    "created_at": "2026-10-22T09:15:00.000Z"
  }
}
```

---

### 3.4 Update Medicine
- **Endpoint:** `PUT /api/medicines/:id`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

#### Request Body
```json
{
  "dosage": "500 mg",
  "instructions": "Adjusted dosage: Take 2 capsules after meals",
  "stock_count": 18
}
```

#### Response: 200 OK
```json
{
  "success": true,
  "message": "Medicine updated successfully.",
  "data": {
    "id": 5,
    "name": "Amoxicillin",
    "dosage": "500 mg",
    "instructions": "Adjusted dosage: Take 2 capsules after meals",
    "stock_count": 18
  }
}
```

---

### 3.5 Delete Medicine
- **Endpoint:** `DELETE /api/medicines/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Response: 200 OK
```json
{
  "success": true,
  "message": "Medicine deleted successfully."
}
```

---

### 3.6 Refill Stock
- **Endpoint:** `POST /api/medicines/:id/refill`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

#### Request Body
```json
{
  "count": 30
}
```

#### Response: 200 OK
```json
{
  "success": true,
  "message": "Refilled +30 units. New stock: 48",
  "data": {
    "id": 5,
    "name": "Amoxicillin",
    "stock_count": 48,
    "is_low_stock": false
  }
}
```
