-- ====================================================================
-- MediRemind — Complete PostgreSQL Database Schema & Seed Data
-- Project: MediRemind — Cross-Platform Medicine & Prescription Reminder
-- Team: Beergin (Jerold Sodusta, Francis John Empil, Jibson Cabilin, Nove Calasang)
-- Submitted To: Mr. Henzon Paul Dionsay
-- Date: October 12, 2026
-- ====================================================================

-- 1. DROP EXISTING TABLES (IF RE-CREATING)
DROP TABLE IF EXISTS dose_logs CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS dependents CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. CREATE TABLES
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'patient' CHECK (role IN ('patient', 'caregiver')),
    phone VARCHAR(25),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dependents (
    id SERIAL PRIMARY KEY,
    caregiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) DEFAULT 'Family Member',
    date_of_birth DATE,
    emergency_contact VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medicines (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dependent_id INTEGER REFERENCES dependents(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    form VARCHAR(30) DEFAULT 'tablet' CHECK (form IN ('tablet', 'capsule', 'syrup', 'injection', 'drops', 'inhaler', 'topical', 'other')),
    instructions TEXT,
    stock_count INTEGER DEFAULT 30,
    low_stock_threshold INTEGER DEFAULT 5,
    color VARCHAR(20) DEFAULT '#0d9488',
    shape VARCHAR(20) DEFAULT 'round',
    icon VARCHAR(30) DEFAULT 'pill',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dependent_id INTEGER REFERENCES dependents(id) ON DELETE CASCADE,
    frequency_type VARCHAR(30) NOT NULL DEFAULT 'daily' CHECK (frequency_type IN ('daily', 'every_x_hours', 'specific_days', 'as_needed')),
    frequency_value VARCHAR(100) DEFAULT '1',
    dose_times TEXT NOT NULL, -- JSON array of strings e.g. '["08:00", "20:00"]'
    meal_timing VARCHAR(30) DEFAULT 'no_food_relation' CHECK (meal_timing IN ('before_meal', 'with_meal', 'after_meal', 'no_food_relation')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dose_logs (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
    medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dependent_id INTEGER REFERENCES dependents(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('taken', 'skipped', 'snoozed', 'pending')),
    recorded_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for rapid querying
CREATE INDEX idx_medicines_user_id ON medicines(user_id);
CREATE INDEX idx_medicines_dependent_id ON medicines(dependent_id);
CREATE INDEX idx_schedules_medicine_id ON schedules(medicine_id);
CREATE INDEX idx_schedules_user_id ON schedules(user_id);
CREATE INDEX idx_dose_logs_scheduled_time ON dose_logs(scheduled_time);
CREATE INDEX idx_dose_logs_status ON dose_logs(status);

-- ====================================================================
-- 3. SEED DATA (USERS, DEPENDENTS, MEDICINES, SCHEDULES, DOSE LOGS)
-- ====================================================================

-- Demo Users (Password: password123, bcrypt hash)
INSERT INTO users (id, name, email, password_hash, role, phone) VALUES
(1, 'Maria Elena Santos', 'patient@mediremind.com', '$2b$10$wK1bYnqyWd7b4vHsp1yFf.bX4k92m3P9F/JqY2oE8LgW6Vn4G4G3G', 'patient', '+63 917 123 4567'),
(2, 'Francis Empil (Caregiver)', 'caregiver@mediremind.com', '$2b$10$wK1bYnqyWd7b4vHsp1yFf.bX4k92m3P9F/JqY2oE8LgW6Vn4G4G3G', 'caregiver', '+63 920 987 6543');

-- Dependents for Caregiver
INSERT INTO dependents (id, caregiver_id, name, relationship, date_of_birth, emergency_contact, notes) VALUES
(1, 2, 'Grandmother Rosa (78y/o)', 'Grandmother', '1948-04-12', '+63 917 555 1234', 'Chronic hypertension and type 2 diabetes management.'),
(2, 2, 'Timmy Santos (9y/o)', 'Son', '2017-08-20', '+63 917 555 5678', 'Childhood asthma and seasonal allergies.');

-- Prescriptions for Patient (Maria Elena)
INSERT INTO medicines (id, user_id, dependent_id, name, dosage, form, instructions, stock_count, low_stock_threshold, color, shape, icon) VALUES
(1, 1, NULL, 'Metformin', '500 mg', 'tablet', 'Take with food to reduce stomach upset', 36, 10, '#0284c7', 'oval', 'pill'),
(2, 1, NULL, 'Lisinopril', '10 mg', 'tablet', 'Take every morning with a full glass of water', 22, 7, '#10b981', 'round', 'pill'),
(3, 1, NULL, 'Atorvastatin', '20 mg', 'tablet', 'Take once daily in the evening / bedtime', 14, 5, '#8b5cf6', 'oval', 'pill'),
(4, 1, NULL, 'Vitamin D3', '1000 IU', 'capsule', 'Take once daily with breakfast for bone health', 48, 10, '#f59e0b', 'capsule', 'capsule');

-- Prescription for Dependent (Rosa)
INSERT INTO medicines (id, user_id, dependent_id, name, dosage, form, instructions, stock_count, low_stock_threshold, color, shape, icon) VALUES
(5, 2, 1, 'Amlodipine', '5 mg', 'tablet', 'Take in the morning for blood pressure control', 20, 7, '#06b6d4', 'round', 'pill');

-- Prescription Schedules
INSERT INTO schedules (id, medicine_id, user_id, dependent_id, frequency_type, frequency_value, dose_times, meal_timing, start_date, end_date, is_active) VALUES
(1, 1, 1, NULL, 'daily', '1', '["08:00", "19:00"]', 'with_meal', '2026-09-01', NULL, TRUE),
(2, 2, 1, NULL, 'daily', '1', '["08:00"]', 'before_meal', '2026-09-01', NULL, TRUE),
(3, 3, 1, NULL, 'daily', '1', '["21:00"]', 'after_meal', '2026-09-01', NULL, TRUE),
(4, 4, 1, NULL, 'daily', '1', '["08:00"]', 'with_meal', '2026-09-01', NULL, TRUE),
(5, 5, 2, 1, 'daily', '1', '["09:00"]', 'with_meal', '2026-09-01', NULL, TRUE);

-- Reset sequence counters for auto-increment PKs
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('dependents_id_seq', (SELECT MAX(id) FROM dependents));
SELECT setval('medicines_id_seq', (SELECT MAX(id) FROM medicines));
SELECT setval('schedules_id_seq', (SELECT MAX(id) FROM schedules));
