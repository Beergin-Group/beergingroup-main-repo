-- ====================================================================
-- MediRemind PostgreSQL Database Schema
-- Project: MediRemind — Cross-Platform Medicine & Prescription Reminder
-- Team: Beergin (Jerold Sodusta, Francis John Empil, Jibson Cabilin, Nove Calasang)
-- ====================================================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'patient' CHECK (role IN ('patient', 'caregiver')),
    phone VARCHAR(25),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dependents (
    id SERIAL PRIMARY KEY,
    caregiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) DEFAULT 'Family Member',
    date_of_birth DATE,
    emergency_contact VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medicines (
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

CREATE TABLE IF NOT EXISTS schedules (
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

CREATE TABLE IF NOT EXISTS dose_logs (
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

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_medicines_user_id ON medicines(user_id);
CREATE INDEX IF NOT EXISTS idx_medicines_dependent_id ON medicines(dependent_id);
CREATE INDEX IF NOT EXISTS idx_schedules_medicine_id ON schedules(medicine_id);
CREATE INDEX IF NOT EXISTS idx_schedules_user_id ON schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_dose_logs_scheduled_time ON dose_logs(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_dose_logs_status ON dose_logs(status);
