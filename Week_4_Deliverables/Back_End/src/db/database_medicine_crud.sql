-- =============================================================================
-- MediRemind — PostgreSQL Database Schema: Medicine Module
-- Week 4 Deliverable
-- Author: Francis John Empil (Back-End Developer)
-- =============================================================================

-- 1. Ensure Dependent / Foreign Key References Exist
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'caregiver')),
    phone VARCHAR(30) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dependents (
    id SERIAL PRIMARY KEY,
    caregiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    emergency_contact VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Medicine Catalog Table with Constraints & Inventory Guard
CREATE TABLE IF NOT EXISTS medicines (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dependent_id INTEGER REFERENCES dependents(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    form VARCHAR(30) NOT NULL DEFAULT 'tablet' CHECK (form IN ('tablet', 'capsule', 'syrup', 'injection', 'drops', 'inhaler', 'other')),
    instructions TEXT DEFAULT '',
    stock_count INTEGER NOT NULL DEFAULT 30 CHECK (stock_count >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
    color VARCHAR(20) DEFAULT '#0d9488',
    shape VARCHAR(20) DEFAULT 'round',
    icon VARCHAR(30) DEFAULT 'pill',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Optimization Indexes for Fast Queries & Scoping
CREATE INDEX IF NOT EXISTS idx_medicines_user_id ON medicines(user_id);
CREATE INDEX IF NOT EXISTS idx_medicines_dependent_id ON medicines(dependent_id);
CREATE INDEX IF NOT EXISTS idx_medicines_name ON medicines(name);

-- 4. Initial Seed Data for Testing
INSERT INTO users (id, name, email, password_hash, role)
VALUES 
(1, 'Maria Elena Santos', 'patient@mediremind.com', '$2a$10$7v.9T34fVl00wzF9vKq0/u0/uG9V9a1VpQn3tZJ6x6YmZgHqO3mWW', 'patient'),
(2, 'Carlos Mendoza', 'caregiver@mediremind.com', '$2a$10$7v.9T34fVl00wzF9vKq0/u0/uG9V9a1VpQn3tZJ6x6YmZgHqO3mWW', 'caregiver')
ON CONFLICT (id) DO NOTHING;

INSERT INTO medicines (id, user_id, name, dosage, form, instructions, stock_count, low_stock_threshold, color, shape)
VALUES 
(1, 1, 'Metformin HCl', '500 mg', 'tablet', 'Take with breakfast and dinner to lower blood sugar', 42, 10, '#0d9488', 'round'),
(2, 1, 'Lisinopril', '10 mg', 'tablet', 'Take 1 tablet every morning with full glass of water', 4, 7, '#0284c7', 'oval'),
(3, 1, 'Atorvastatin', '20 mg', 'tablet', 'Take at bedtime for cholesterol control', 28, 5, '#8b5cf6', 'round'),
(4, 1, 'Vitamin D3', '1000 IU', 'capsule', 'Take once daily with food', 60, 10, '#f59e0b', 'capsule')
ON CONFLICT (id) DO NOTHING;
