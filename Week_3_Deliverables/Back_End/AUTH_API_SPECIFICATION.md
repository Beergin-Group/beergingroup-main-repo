# MediRemind — Backend API Specification: Authentication
**Week 3 Deliverable**  
**Author:** Francis John Empil (Back-End Developer)  
**Approved By:** Jerold Sodusta (Project Manager), Nove Calasang (Quality Assurance)  
**Target Course:** Application Development and Emerging Technologies  
**Date:** October 2026  

---

## 1. Overview & Architecture

The MediRemind Authentication module provides stateless authentication for cross-platform clients (Flutter Mobile, Flutter Web, Flutter Desktop, and browser interfaces) using JSON Web Tokens (JWT). All passwords stored in PostgreSQL are cryptographically hashed using `bcrypt` with a work factor of 10 salt rounds.

### Key Security & Architecture Features
- **Password Hashing:** Passwords are never stored in plaintext. `bcrypt.hashSync(password, 10)` generates a 60-character salted blowfish hash.
- **JWT Architecture:** Tokens are signed using HMAC-SHA256 with a secure server secret key (`JWT_SECRET`) and default to 7-day expiration (`7d`).
- **Authorization Header:** Protected endpoints require HTTP Header `Authorization: Bearer <token>`.
- **Role-Based Access Control (RBAC):** Users are granted roles: `patient` or `caregiver`. The caregiver role permits managing linked dependent records.
- **Defensive Error Handling:** Uniform JSON responses across all status codes (200, 201, 400, 401, 409, 500) preventing user enumeration and database stack leakage.

---

## 2. Authentication Endpoints Summary

| Method | Endpoint | Description | Auth Required | Rate Limited |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account (patient/caregiver) | No | Yes (10/min) |
| `POST` | `/api/auth/login` | Authenticate user & issue signed JWT | No | Yes (15/min) |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer Token) | No |
| `POST` | `/api/auth/refresh` | Re-issue new token before expiration | Yes (Bearer Token) | No |
| `GET` | `/api/auth/demo-accounts`| Return pre-seeded testing credentials | No | No |

---

## 3. Detailed Endpoint Specifications

### 3.1 Register User
- **Endpoint:** `POST /api/auth/register`
- **Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "name": "Juan Dela Cruz",
  "email": "juan.delacruz@example.com",
  "password": "Password123!",
  "role": "patient",
  "phone": "+639171234567"
}
```

#### Validation Rules
| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `name` | string | Yes | 2 to 100 characters, alphanumeric + spaces |
| `email` | string | Yes | Valid RFC 5322 email format, unique in DB |
| `password` | string | Yes | Min 8 chars, at least 1 uppercase, 1 number |
| `role` | string | No | Enum: `patient` (default) or `caregiver` |
| `phone` | string | No | Standard E.164 phone format or Philippine mobile format |

#### Response: 201 Created (Success)
```json
{
  "success": true,
  "message": "Account successfully registered.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImVtYWlsIjoianVhbi5kZWxhY3J1ekBleGFtcGxlLmNvbSIsInJvbGUiOiJwYXRpZW50IiwibmFtZSI6Ikp1YW4gRGVsYSBDcnV6IiwiaWF0IjoxNzg0ODAwMDAwLCJleHAiOjE3ODU0MDQ4MDB9.EXAMPLE_SIGNATURE",
  "user": {
    "id": 12,
    "name": "Juan Dela Cruz",
    "email": "juan.delacruz@example.com",
    "role": "patient",
    "phone": "+639171234567",
    "created_at": "2026-10-22T08:30:00.000Z"
  }
}
```

#### Response: 400 Bad Request (Validation Error)
```json
{
  "success": false,
  "message": "Validation failed: Password must be at least 8 characters with at least one number."
}
```

#### Response: 409 Conflict (Duplicate Email)
```json
{
  "success": false,
  "message": "An account with this email already exists."
}
```

---

### 3.2 Login User
- **Endpoint:** `POST /api/auth/login`
- **Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "email": "patient@mediremind.com",
  "password": "password123"
}
```

#### Response: 200 OK (Success)
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Maria Elena Santos",
    "email": "patient@mediremind.com",
    "role": "patient",
    "phone": "+639185551234",
    "created_at": "2026-10-01T08:00:00.000Z"
  }
}
```

#### Response: 401 Unauthorized (Invalid Credentials)
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

---

### 3.3 Get Current User Profile
- **Endpoint:** `GET /api/auth/me`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

#### Response: 200 OK (Success)
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Maria Elena Santos",
    "email": "patient@mediremind.com",
    "role": "patient",
    "phone": "+639185551234"
  }
}
```

#### Response: 401 Unauthorized (Missing or Invalid Token)
```json
{
  "success": false,
  "message": "Access denied. Valid Bearer authentication token required."
}
```

---

### 3.4 Token Refresh
- **Endpoint:** `POST /api/auth/refresh`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`

#### Response: 200 OK (Success)
```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.NEW_TOKEN...",
  "expiresIn": "7d"
}
```

---

## 4. Middleware Implementation Architecture

### JWT Verification Sequence
```mermaid
sequenceDiagram
    autonumber
    Client->>Backend: Request with Header (Authorization: Bearer <JWT>)
    Backend->>authMiddleware: Parse Bearer token
    alt Token Missing
        authMiddleware-->>Client: 401 Unauthorized (Token required)
    else Token Malformed / Expired
        authMiddleware-->>Client: 403 Forbidden (Token invalid or expired)
    else Token Valid
        authMiddleware->>authMiddleware: Attach req.user = decoded payload
        authMiddleware->>Controller: next() -> Execute controller logic
        Controller-->>Client: 200 OK with requested data
    end
```

---

## 5. Security & Cryptographic Checklist
- [x] Blowfish salt rounds set to `10` via `bcryptjs`
- [x] Password hash column length `VARCHAR(255)` in PostgreSQL schema
- [x] Passwords stripped from all controller responses (`delete user.password_hash`)
- [x] Timing-safe password comparisons via `bcrypt.compare`
- [x] Input sanitation on email (`toLowerCase().trim()`)
- [x] Token payload includes non-sensitive claims only (`id`, `email`, `role`, `name`)
