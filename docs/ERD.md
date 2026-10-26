# MediRemind — Entity Relationship Diagram (ERD) & Database Specification

**Project Title:** MediRemind — Cross-Platform Medicine & Prescription Reminder  
**Team Name:** Beergin  
- **Project Manager:** Jerold Sodusta  
- **Back-End Developer:** Francis John Empil  
- **Front-End Developer:** Jibson Cabilin  
- **Quality Assurance:** Nove Calasang  
**Submitted To:** Mr. Henzon Paul Dionsay  
**Date:** October 12, 2026  

---

## 1. Visual Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ DEPENDENTS : "manages"
    USERS ||--o{ MEDICINES : "owns"
    USERS ||--o{ SCHEDULES : "configures"
    USERS ||--o{ DOSE_LOGS : "records"
    DEPENDENTS ||--o{ MEDICINES : "prescribed_for"
    DEPENDENTS ||--o{ SCHEDULES : "scheduled_for"
    DEPENDENTS ||--o{ DOSE_LOGS : "logs_for"
    MEDICINES ||--o{ SCHEDULES : "has"
    MEDICINES ||--o{ DOSE_LOGS : "logged_in"
    SCHEDULES ||--o{ DOSE_LOGS : "triggers"

    USERS {
        int id PK
        string name
        string email UK
        string password_hash
        string role "patient | caregiver"
        string phone
        datetime created_at
    }

    DEPENDENTS {
        int id PK
        int caregiver_id FK
        string name
        string relationship
        date date_of_birth
        string emergency_contact
        text notes
        datetime created_at
    }

    MEDICINES {
        int id PK
        int user_id FK
        int dependent_id FK "nullable"
        string name
        string dosage
        string form "tablet | capsule | syrup | inhaler | etc"
        text instructions
        int stock_count
        int low_stock_threshold
        string color
        string shape
        string icon
        datetime created_at
    }

    SCHEDULES {
        int id PK
        int medicine_id FK
        int user_id FK
        int dependent_id FK "nullable"
        string frequency_type "daily | every_x_hours | specific_days | as_needed"
        string frequency_value
        json dose_times "['08:00', '20:00']"
        string meal_timing "before_meal | with_meal | after_meal | no_food_relation"
        date start_date
        date end_date "nullable"
        boolean is_active
        datetime created_at
    }

    DOSE_LOGS {
        int id PK
        int schedule_id FK
        int medicine_id FK
        int user_id FK
        int dependent_id FK "nullable"
        datetime scheduled_time
        string status "taken | skipped | snoozed | pending"
        datetime recorded_at "nullable"
        text notes
        datetime created_at
    }
```

---

## 2. Table DDL Definitions (PostgreSQL)

See full PostgreSQL DDL script located at:
[`backend/src/db/schema.sql`](file:///C:/Users/User/Desktop/mediremind/backend/src/db/schema.sql)
