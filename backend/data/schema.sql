-- ====================================================================
-- MediRemind PostgreSQL Database Schema (Embedded Driver / Auto-init)
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
    custom_relationship VARCHAR(100),
    email VARCHAR(150),
    age INTEGER,
    address TEXT,
    date_of_birth DATE,
    emergency_contact VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Idempotent schema upgrades for existing installations
ALTER TABLE dependents ADD COLUMN IF NOT EXISTS custom_relationship VARCHAR(100);
ALTER TABLE dependents ADD COLUMN IF NOT EXISTS email VARCHAR(150);
ALTER TABLE dependents ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE dependents ADD COLUMN IF NOT EXISTS address TEXT;


CREATE TABLE IF NOT EXISTS medicines (
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

CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dependent_id INTEGER REFERENCES dependents(id) ON DELETE CASCADE,
    frequency_type VARCHAR(30) NOT NULL DEFAULT 'daily' CHECK (frequency_type IN ('daily', 'every_x_hours', 'specific_days', 'as_needed')),
    frequency_value VARCHAR(100) DEFAULT '1',
    dose_times TEXT DEFAULT '[]',
    meal_timing VARCHAR(30) DEFAULT 'no_food_relation' CHECK (meal_timing IN ('before_meal', 'with_meal', 'after_meal', 'no_food_relation', 'empty_stomach')),
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
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('taken', 'skipped', 'snoozed', 'pending', 'upcoming')),
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
CREATE INDEX IF NOT EXISTS idx_dependents_caregiver_id ON dependents(caregiver_id);

-- Functions
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

-- Trigger Functions & Triggers
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

DROP TRIGGER IF EXISTS trg_prevent_duplicate_medicine ON medicines;
CREATE TRIGGER trg_prevent_duplicate_medicine
BEFORE INSERT OR UPDATE ON medicines
FOR EACH ROW EXECUTE FUNCTION trg_fn_prevent_duplicate_medicine();

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

DROP TRIGGER IF EXISTS trg_prevent_duplicate_dependent ON dependents;
CREATE TRIGGER trg_prevent_duplicate_dependent
BEFORE INSERT OR UPDATE ON dependents
FOR EACH ROW EXECUTE FUNCTION trg_fn_prevent_duplicate_dependent();

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

DROP TRIGGER IF EXISTS trg_prevent_duplicate_schedule ON schedules;
CREATE TRIGGER trg_prevent_duplicate_schedule
BEFORE INSERT OR UPDATE ON schedules
FOR EACH ROW EXECUTE FUNCTION trg_fn_prevent_duplicate_schedule();

CREATE OR REPLACE FUNCTION trg_fn_guard_dose_log_status()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'skipped' AND NEW.status = 'taken' THEN
        IF NEW.notes IS NULL OR POSITION('[RESET]' IN NEW.notes) = 0 THEN
            RAISE EXCEPTION 'Status guard lock: Doses logged as skipped cannot be modified to taken without explicit reset.'
                USING ERRCODE = 'check_violation';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_guard_dose_log_status ON dose_logs;
CREATE TRIGGER trg_guard_dose_log_status
BEFORE UPDATE ON dose_logs
FOR EACH ROW EXECUTE FUNCTION trg_fn_guard_dose_log_status();
