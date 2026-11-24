-- ====================================================================
-- MediRemind — Complete PostgreSQL Database Schema & Seed Data
-- Project: MediRemind — Cross-Platform Medicine & Prescription Reminder
-- Team: Beergin (Jerold Sodusta, Francis John Empil, Jibson Cabilin, Nove Calasang)
-- Course: Application Development and Emerging Technologies
-- Reference Architecture: UCLIS (CCS Standards)
-- ====================================================================

-- 1. DROP EXISTING TRIGGERS, PROCEDURES, FUNCTIONS & TABLES (IF RE-CREATING)
DROP TRIGGER IF EXISTS trg_prevent_duplicate_medicine ON medicines;
DROP TRIGGER IF EXISTS trg_prevent_duplicate_dependent ON dependents;
DROP TRIGGER IF EXISTS trg_prevent_duplicate_schedule ON schedules;
DROP TRIGGER IF EXISTS trg_guard_dose_log_status ON dose_logs;

DROP FUNCTION IF EXISTS trg_fn_prevent_duplicate_medicine();
DROP FUNCTION IF EXISTS trg_fn_prevent_duplicate_dependent();
DROP FUNCTION IF EXISTS trg_fn_prevent_duplicate_schedule();
DROP FUNCTION IF EXISTS trg_fn_guard_dose_log_status();
DROP FUNCTION IF EXISTS fn_calculate_adherence_rate(INTEGER, DATE, DATE);
DROP FUNCTION IF EXISTS fn_get_skipped_doses(INTEGER, INTEGER);
DROP FUNCTION IF EXISTS fn_is_dose_time_valid(TIMESTAMP WITH TIME ZONE, INTEGER);

DROP PROCEDURE IF EXISTS sp_mark_dose_taken(INTEGER, TEXT);
DROP PROCEDURE IF EXISTS sp_auto_skip_overdue_doses(INTERVAL);

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
    custom_relationship VARCHAR(100),
    email VARCHAR(150),
    age INTEGER,
    address TEXT,
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
    form VARCHAR(30) DEFAULT 'tablet' CHECK (form IN ('tablet', 'capsule', 'syrup', 'injection', 'drops', 'inhaler', 'topical', 'powder', 'other')),
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
    dose_times TEXT DEFAULT '[]', -- JSON array of strings e.g. '["08:00", "20:00"]' or '[]' for as_needed
    meal_timing VARCHAR(30) DEFAULT 'no_food_relation' CHECK (meal_timing IN ('before_meal', 'with_meal', 'after_meal', 'no_food_relation', 'empty_stomach')),
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
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('taken', 'skipped', 'snoozed', 'pending', 'upcoming')),
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
CREATE INDEX idx_dependents_caregiver_id ON dependents(caregiver_id);

-- ====================================================================
-- 3. FUNCTIONS
-- ====================================================================

-- Function 1: Calculate Adherence Rate Percentage
CREATE OR REPLACE FUNCTION fn_calculate_adherence_rate(
    p_user_id INTEGER,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
    v_taken_count INTEGER := 0;
    v_total_count INTEGER := 0;
    v_rate NUMERIC := 0;
BEGIN
    SELECT 
        COUNT(*) FILTER (WHERE status = 'taken'),
        COUNT(*)
    INTO v_taken_count, v_total_count
    FROM dose_logs
    WHERE user_id = p_user_id
      AND (p_start_date IS NULL OR scheduled_time >= p_start_date)
      AND (p_end_date IS NULL OR scheduled_time <= (p_end_date + INTERVAL '1 day' - INTERVAL '1 second'));

    IF v_total_count > 0 THEN
        v_rate := ROUND((v_taken_count::NUMERIC / v_total_count::NUMERIC) * 100, 2);
    ELSE
        v_rate := 100.00;
    END IF;

    RETURN v_rate;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Query All Skipped Doses with Medicine Metadata
CREATE OR REPLACE FUNCTION fn_get_skipped_doses(
    p_user_id INTEGER,
    p_dependent_id INTEGER DEFAULT NULL
)
RETURNS TABLE (
    log_id INTEGER,
    medicine_name VARCHAR(150),
    dosage VARCHAR(50),
    form VARCHAR(30),
    scheduled_time TIMESTAMP WITH TIME ZONE,
    recorded_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dl.id,
        m.name,
        m.dosage,
        m.form,
        dl.scheduled_time,
        dl.recorded_at,
        dl.notes
    FROM dose_logs dl
    JOIN medicines m ON dl.medicine_id = m.id
    WHERE dl.user_id = p_user_id
      AND dl.status = 'skipped'
      AND (
          (p_dependent_id IS NULL AND dl.dependent_id IS NULL)
          OR (dl.dependent_id = p_dependent_id)
      )
    ORDER BY dl.scheduled_time DESC;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Validate if current timestamp is eligible to take dose (not excessively early)
CREATE OR REPLACE FUNCTION fn_is_dose_time_valid(
    p_scheduled_time TIMESTAMP WITH TIME ZONE,
    p_early_window_minutes INTEGER DEFAULT 30
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Cannot take earlier than (scheduled_time - window_minutes)
    IF CURRENT_TIMESTAMP < (p_scheduled_time - (p_early_window_minutes || ' minutes')::INTERVAL) THEN
        RETURN FALSE;
    END IF;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- 4. PROCEDURES
-- ====================================================================

-- Procedure 1: Mark dose as taken and automatically decrement stock
CREATE OR REPLACE PROCEDURE sp_mark_dose_taken(
    p_dose_log_id INTEGER,
    p_notes TEXT DEFAULT NULL
)
LANGUAGE plpgsql AS $$
DECLARE
    v_med_id INTEGER;
    v_curr_status VARCHAR(20);
BEGIN
    SELECT medicine_id, status INTO v_med_id, v_curr_status
    FROM dose_logs
    WHERE id = p_dose_log_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Dose log record % not found', p_dose_log_id;
    END IF;

    IF v_curr_status = 'skipped' THEN
        RAISE EXCEPTION 'Cannot mark skipped dose as taken directly. Reset required.';
    END IF;

    UPDATE dose_logs
    SET status = 'taken',
        recorded_at = CURRENT_TIMESTAMP,
        notes = COALESCE(p_notes, notes)
    WHERE id = p_dose_log_id;

    -- Decrement stock count
    UPDATE medicines
    SET stock_count = GREATEST(0, stock_count - 1)
    WHERE id = v_med_id;
END;
$$;

-- Procedure 2: Auto-mark overdue pending doses as skipped
CREATE OR REPLACE PROCEDURE sp_auto_skip_overdue_doses(
    p_threshold_interval INTERVAL DEFAULT INTERVAL '4 hours'
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE dose_logs
    SET status = 'skipped',
        notes = CASE 
            WHEN notes IS NULL OR notes = '' THEN 'Automatically marked as skipped: overdue beyond schedule grace period.'
            ELSE notes || ' [Auto-skipped: overdue]'
        END
    WHERE status = 'pending'
      AND scheduled_time < (CURRENT_TIMESTAMP - p_threshold_interval);
END;
$$;

-- ====================================================================
-- 5. TRIGGERS & TRIGGER FUNCTIONS
-- ====================================================================

-- Trigger Function 1: Prevent Duplicate Medicines with Exact Same Parameters
CREATE OR REPLACE FUNCTION trg_fn_prevent_duplicate_medicine()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM medicines
        WHERE user_id = NEW.user_id
          AND (dependent_id IS NOT DISTINCT FROM NEW.dependent_id)
          AND LOWER(TRIM(name)) = LOWER(TRIM(NEW.name))
          AND LOWER(TRIM(dosage)) = LOWER(TRIM(NEW.dosage))
          AND form = NEW.form
          AND color = NEW.color
          AND id != COALESCE(NEW.id, 0)
    ) THEN
        RAISE EXCEPTION 'A medicine record with identical name, dosage, form, and color already exists.'
            USING ERRCODE = 'unique_violation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_duplicate_medicine
BEFORE INSERT OR UPDATE ON medicines
FOR EACH ROW EXECUTE FUNCTION trg_fn_prevent_duplicate_medicine();

-- Trigger Function 2: Prevent Duplicate Dependents Under the Same Caregiver
CREATE OR REPLACE FUNCTION trg_fn_prevent_duplicate_dependent()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM dependents
        WHERE caregiver_id = NEW.caregiver_id
          AND LOWER(TRIM(name)) = LOWER(TRIM(NEW.name))
          AND id != COALESCE(NEW.id, 0)
    ) THEN
        RAISE EXCEPTION 'A dependent with this name is already registered under your caregiver account.'
            USING ERRCODE = 'unique_violation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_duplicate_dependent
BEFORE INSERT OR UPDATE ON dependents
FOR EACH ROW EXECUTE FUNCTION trg_fn_prevent_duplicate_dependent();

-- Trigger Function 3: Prevent Duplicate Schedule for Same Medicine, Day, & Times
CREATE OR REPLACE FUNCTION trg_fn_prevent_duplicate_schedule()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM schedules
        WHERE medicine_id = NEW.medicine_id
          AND user_id = NEW.user_id
          AND (dependent_id IS NOT DISTINCT FROM NEW.dependent_id)
          AND frequency_type = NEW.frequency_type
          AND start_date = NEW.start_date
          AND dose_times = NEW.dose_times
          AND id != COALESCE(NEW.id, 0)
    ) THEN
        RAISE EXCEPTION 'An identical medication routine schedule already exists for this medicine.'
            USING ERRCODE = 'unique_violation';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_duplicate_schedule
BEFORE INSERT OR UPDATE ON schedules
FOR EACH ROW EXECUTE FUNCTION trg_fn_prevent_duplicate_schedule();

-- Trigger Function 4: Lock 'skipped' Dose Log Status State Machine
CREATE OR REPLACE FUNCTION trg_fn_guard_dose_log_status()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'skipped' AND NEW.status = 'taken' THEN
        -- Allow only if notes contains explicit admin reset flag
        IF NEW.notes IS NULL OR POSITION('[RESET]' IN NEW.notes) = 0 THEN
            RAISE EXCEPTION 'Status guard lock: Doses logged as skipped cannot be modified to taken without explicit reset.'
                USING ERRCODE = 'check_violation';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_guard_dose_log_status
BEFORE UPDATE ON dose_logs
FOR EACH ROW EXECUTE FUNCTION trg_fn_guard_dose_log_status();

-- ====================================================================
-- 6. SEED DATA (USERS, DEPENDENTS, MEDICINES, SCHEDULES, DOSE LOGS)
-- ====================================================================

-- Demo Users (Password: password123, bcrypt hash)
INSERT INTO users (id, name, email, password_hash, role, phone) VALUES
(1, 'Maria Elena Santos', 'patient@mediremind.com', '$2b$10$wK1bYnqyWd7b4vHsp1yFf.bX4k92m3P9F/JqY2oE8LgW6Vn4G4G3G', 'patient', '+63 917 123 4567'),
(2, 'Francis Empil (Caregiver)', 'caregiver@mediremind.com', '$2b$10$wK1bYnqyWd7b4vHsp1yFf.bX4k92m3P9F/JqY2oE8LgW6Vn4G4G3G', 'caregiver', '+63 920 987 6543');

-- Dependents for Caregiver
INSERT INTO dependents (id, caregiver_id, name, relationship, custom_relationship, email, age, address, date_of_birth, emergency_contact, notes) VALUES
(1, 2, 'Grandmother Rosa (78y/o)', 'Grandmother', NULL, 'rosa.santos@gmail.com', 78, 'Barangay Lahug, Cebu City', '1948-04-12', '+63 917 555 1234', 'Chronic hypertension and type 2 diabetes management.'),
(2, 2, 'Timmy Santos (9y/o)', 'Child', 'Son', 'timmy.caregiver@gmail.com', 9, 'Barangay Lahug, Cebu City', '2017-08-20', '+63 917 555 5678', 'Childhood asthma and seasonal allergies.');

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
