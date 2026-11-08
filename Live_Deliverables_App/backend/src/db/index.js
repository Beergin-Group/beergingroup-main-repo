const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const config = require('../config');

const dataDir = path.resolve(__dirname, '../../data');
const jsonFilePath = path.join(dataDir, 'mediremind.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let activeDriver = 'json'; // 'postgres' | 'json'
let pgPool = null;

// In-memory / file-persisted store fallback
let store = {
  users: [],
  dependents: [],
  medicines: [],
  schedules: [],
  dose_logs: []
};

function loadStoreFromFile() {
  if (fs.existsSync(jsonFilePath)) {
    try {
      const raw = fs.readFileSync(jsonFilePath, 'utf-8');
      store = JSON.parse(raw);
    } catch (err) {
      console.error('Failed to parse persistent JSON DB:', err.message);
    }
  }
}

function persistStore() {
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write JSON DB:', err.message);
  }
}

async function tryConnectPostgres() {
  if (config.dbType === 'file') {
    return false;
  }

  try {
    const testPool = new Pool({
      host: config.pg.host,
      port: config.pg.port,
      user: config.pg.user,
      password: config.pg.password,
      database: config.pg.database,
      connectionTimeoutMillis: 2500
    });

    // Test simple query
    await testPool.query('SELECT 1');
    pgPool = testPool;

    // Apply schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const ddl = fs.readFileSync(schemaPath, 'utf-8');
      await pgPool.query(ddl);
    }

    activeDriver = 'postgres';
    console.log(`[Database] Successfully connected to PostgreSQL at ${config.pg.host}:${config.pg.port}/${config.pg.database}`);
    return true;
  } catch (err) {
    console.warn(`[Database] PostgreSQL connection failed (${err.message}). Using built-in persistent storage (backend/data/mediremind.json).`);
    return false;
  }
}

async function init() {
  const pgSuccess = await tryConnectPostgres();
  if (!pgSuccess) {
    activeDriver = 'json';
    loadStoreFromFile();
  }
}

const db = {
  init,
  getDriver: () => activeDriver,
  getPgPool: () => pgPool,

  // User queries
  users: {
    async findByEmail(email) {
      if (activeDriver === 'postgres') {
        const res = await pgPool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
        return res.rows[0] || null;
      }
      return store.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    },
    async findById(id) {
      if (activeDriver === 'postgres') {
        const res = await pgPool.query('SELECT id, name, email, role, phone, created_at FROM users WHERE id = $1', [id]);
        return res.rows[0] || null;
      }
      const u = store.users.find(u => Number(u.id) === Number(id));
      if (!u) return null;
      const { password_hash, ...rest } = u;
      return rest;
    },
    async findByIdWithPassword(id) {
      if (activeDriver === 'postgres') {
        const res = await pgPool.query('SELECT * FROM users WHERE id = $1', [id]);
        return res.rows[0] || null;
      }
      return store.users.find(u => Number(u.id) === Number(id)) || null;
    },
    async create(user) {
      if (activeDriver === 'postgres') {
        const res = await pgPool.query(
          `INSERT INTO users (name, email, password_hash, role, phone)
           VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, phone, created_at`,
          [user.name, user.email, user.password_hash, user.role || 'patient', user.phone || '']
        );
        return res.rows[0];
      }
      const id = store.users.length ? Math.max(...store.users.map(u => u.id)) + 1 : 1;
      const newUser = {
        id,
        name: user.name,
        email: user.email,
        password_hash: user.password_hash,
        role: user.role || 'patient',
        phone: user.phone || '',
        created_at: new Date().toISOString()
      };
      store.users.push(newUser);
      persistStore();
      const { password_hash, ...rest } = newUser;
      return rest;
    }
  },

  // Dependents / Caregiver
  dependents: {
    async findByCaregiver(caregiverId) {
      if (activeDriver === 'postgres') {
        const res = await pgPool.query('SELECT * FROM dependents WHERE caregiver_id = $1 ORDER BY id ASC', [caregiverId]);
        return res.rows;
      }
      return store.dependents.filter(d => Number(d.caregiver_id) === Number(caregiverId));
    },
    async findById(id) {
      if (activeDriver === 'postgres') {
        const res = await pgPool.query('SELECT * FROM dependents WHERE id = $1', [id]);
        return res.rows[0] || null;
      }
      return store.dependents.find(d => Number(d.id) === Number(id)) || null;
    },
    async create(data) {
      if (activeDriver === 'postgres') {
        const res = await pgPool.query(
          `INSERT INTO dependents (caregiver_id, name, relationship, date_of_birth, emergency_contact, notes)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [data.caregiver_id, data.name, data.relationship, data.date_of_birth, data.emergency_contact, data.notes]
        );
        return res.rows[0];
      }
      const id = store.dependents.length ? Math.max(...store.dependents.map(d => d.id)) + 1 : 1;
      const newDep = {
        id,
        caregiver_id: Number(data.caregiver_id),
        name: data.name,
        relationship: data.relationship || 'Family Member',
        date_of_birth: data.date_of_birth || null,
        emergency_contact: data.emergency_contact || '',
        notes: data.notes || '',
        created_at: new Date().toISOString()
      };
      store.dependents.push(newDep);
      persistStore();
      return newDep;
    },
    async delete(id, caregiverId) {
      if (activeDriver === 'postgres') {
        await pgPool.query('DELETE FROM dependents WHERE id = $1 AND caregiver_id = $2', [id, caregiverId]);
        return true;
      }
      store.dependents = store.dependents.filter(d => !(Number(d.id) === Number(id) && Number(d.caregiver_id) === Number(caregiverId)));
      persistStore();
      return true;
    }
  },

  // Medicines
  medicines: {
    async findByUser(userId, dependentId = null) {
      if (activeDriver === 'postgres') {
        let q = 'SELECT * FROM medicines WHERE user_id = $1';
        const params = [userId];
        if (dependentId !== null) {
          q += ' AND dependent_id = $2';
          params.push(dependentId);
        } else {
          q += ' AND dependent_id IS NULL';
        }
        q += ' ORDER BY id DESC';
        const res = await pgPool.query(q, params);
        return res.rows;
      }
      return store.medicines
        .filter(m => Number(m.user_id) === Number(userId) && (dependentId ? Number(m.dependent_id) === Number(dependentId) : !m.dependent_id))
        .sort((a, b) => b.id - a.id);
    },
    async findById(id) {
      if (activeDriver === 'postgres') {
        const res = await pgPool.query('SELECT * FROM medicines WHERE id = $1', [id]);
        return res.rows[0] || null;
      }
      return store.medicines.find(m => Number(m.id) === Number(id)) || null;
    },
    async create(med) {
      if (activeDriver === 'postgres') {
        const res = await pgPool.query(
          `INSERT INTO medicines (user_id, dependent_id, name, dosage, form, instructions, stock_count, low_stock_threshold, color, shape, icon)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
          [
            med.user_id,
            med.dependent_id || null,
            med.name,
            med.dosage,
            med.form || 'tablet',
            med.instructions || '',
            med.stock_count !== undefined ? med.stock_count : 30,
            med.low_stock_threshold !== undefined ? med.low_stock_threshold : 5,
            med.color || '#0d9488',
            med.shape || 'round',
            med.icon || 'pill'
          ]
        );
        return res.rows[0];
      }
      const id = store.medicines.length ? Math.max(...store.medicines.map(m => m.id)) + 1 : 1;
      const newMed = {
        id,
        user_id: Number(med.user_id),
        dependent_id: med.dependent_id ? Number(med.dependent_id) : null,
        name: med.name,
        dosage: med.dosage,
        form: med.form || 'tablet',
        instructions: med.instructions || '',
        stock_count: med.stock_count !== undefined ? Number(med.stock_count) : 30,
        low_stock_threshold: med.low_stock_threshold !== undefined ? Number(med.low_stock_threshold) : 5,
        color: med.color || '#0d9488',
        shape: med.shape || 'round',
        icon: med.icon || 'pill',
        created_at: new Date().toISOString()
      };
      store.medicines.push(newMed);
      persistStore();
      return newMed;
    },
    async update(id, userId, updates) {
      if (activeDriver === 'postgres') {
        const fields = [];
        const values = [];
        let i = 1;
        for (const [key, val] of Object.entries(updates)) {
          if (['name', 'dosage', 'form', 'instructions', 'stock_count', 'low_stock_threshold', 'color', 'shape', 'icon'].includes(key)) {
            fields.push(`${key} = $${i}`);
            values.push(val);
            i++;
          }
        }
        if (!fields.length) return null;
        values.push(id, userId);
        const q = `UPDATE medicines SET ${fields.join(', ')} WHERE id = $${i} AND user_id = $${i + 1} RETURNING *`;
        const res = await pgPool.query(q, values);
        return res.rows[0] || null;
      }
      const idx = store.medicines.findIndex(m => Number(m.id) === Number(id) && Number(m.user_id) === Number(userId));
      if (idx === -1) return null;
      store.medicines[idx] = { ...store.medicines[idx], ...updates };
      persistStore();
      return store.medicines[idx];
    },
    async decrementStock(id, count = 1) {
      if (activeDriver === 'postgres') {
        const res = await pgPool.query(
          'UPDATE medicines SET stock_count = GREATEST(0, stock_count - $1) WHERE id = $2 RETURNING *',
          [count, id]
        );
        return res.rows[0] || null;
      }
      const m = store.medicines.find(x => Number(x.id) === Number(id));
      if (m) {
        m.stock_count = Math.max(0, (m.stock_count || 0) - count);
        persistStore();
        return m;
      }
      return null;
    },
    async delete(id, userId) {
      if (activeDriver === 'postgres') {
        const res = await pgPool.query('DELETE FROM medicines WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
        return res.rowCount > 0;
      }
      const lenBefore = store.medicines.length;
      store.medicines = store.medicines.filter(m => !(Number(m.id) === Number(id) && Number(m.user_id) === Number(userId)));
      // Cascade delete associated schedules and logs
      store.schedules = store.schedules.filter(s => Number(s.medicine_id) !== Number(id));
      store.dose_logs = store.dose_logs.filter(d => Number(d.medicine_id) !== Number(id));
      persistStore();
      return store.medicines.length < lenBefore;
    }
  },

  // Schedules
  schedules: {
    async findByUser(userId, dependentId = null) {
      if (activeDriver === 'postgres') {
        let q = `
          SELECT s.*, m.name as medicine_name, m.dosage, m.form, m.color, m.shape, m.icon, m.stock_count, m.instructions
          FROM schedules s
          JOIN medicines m ON s.medicine_id = m.id
          WHERE s.user_id = $1
        `;
        const params = [userId];
        if (dependentId !== null) {
          q += ' AND s.dependent_id = $2';
          params.push(dependentId);
        } else {
          q += ' AND s.dependent_id IS NULL';
        }
        q += ' ORDER BY s.id DESC';
        const res = await pgPool.query(q, params);
        return res.rows.map(r => ({
          ...r,
          dose_times: typeof r.dose_times === 'string' ? JSON.parse(r.dose_times) : r.dose_times
        }));
      }
      return store.schedules
        .filter(s => Number(s.user_id) === Number(userId) && (dependentId ? Number(s.dependent_id) === Number(dependentId) : !s.dependent_id))
        .map(s => {
          const med = store.medicines.find(m => Number(m.id) === Number(s.medicine_id)) || {};
          return {
            ...s,
            medicine_name: med.name,
            dosage: med.dosage,
            form: med.form,
            color: med.color,
            shape: med.shape,
            icon: med.icon,
            stock_count: med.stock_count,
            instructions: med.instructions,
            dose_times: Array.isArray(s.dose_times) ? s.dose_times : JSON.parse(s.dose_times || '[]')
          };
        })
        .sort((a, b) => b.id - a.id);
    },
    async findById(id) {
      if (activeDriver === 'postgres') {
        const res = await pgPool.query('SELECT * FROM schedules WHERE id = $1', [id]);
        if (!res.rows[0]) return null;
        const r = res.rows[0];
        return {
          ...r,
          dose_times: typeof r.dose_times === 'string' ? JSON.parse(r.dose_times) : r.dose_times
        };
      }
      const s = store.schedules.find(x => Number(x.id) === Number(id));
      if (!s) return null;
      return {
        ...s,
        dose_times: Array.isArray(s.dose_times) ? s.dose_times : JSON.parse(s.dose_times || '[]')
      };
    },
    async create(data) {
      const timesJson = Array.isArray(data.dose_times) ? JSON.stringify(data.dose_times) : data.dose_times;
      if (activeDriver === 'postgres') {
        const res = await pgPool.query(
          `INSERT INTO schedules (medicine_id, user_id, dependent_id, frequency_type, frequency_value, dose_times, meal_timing, start_date, end_date, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
          [
            data.medicine_id,
            data.user_id,
            data.dependent_id || null,
            data.frequency_type || 'daily',
            data.frequency_value || '1',
            timesJson,
            data.meal_timing || 'no_food_relation',
            data.start_date || new Date().toISOString().split('T')[0],
            data.end_date || null,
            data.is_active !== undefined ? data.is_active : true
          ]
        );
        const r = res.rows[0];
        return { ...r, dose_times: JSON.parse(r.dose_times) };
      }
      const id = store.schedules.length ? Math.max(...store.schedules.map(s => s.id)) + 1 : 1;
      const newSchedule = {
        id,
        medicine_id: Number(data.medicine_id),
        user_id: Number(data.user_id),
        dependent_id: data.dependent_id ? Number(data.dependent_id) : null,
        frequency_type: data.frequency_type || 'daily',
        frequency_value: data.frequency_value || '1',
        dose_times: Array.isArray(data.dose_times) ? data.dose_times : JSON.parse(timesJson || '[]'),
        meal_timing: data.meal_timing || 'no_food_relation',
        start_date: data.start_date || new Date().toISOString().split('T')[0],
        end_date: data.end_date || null,
        is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
        created_at: new Date().toISOString()
      };
      store.schedules.push(newSchedule);
      persistStore();
      return newSchedule;
    },
    async update(id, userId, updates) {
      if (activeDriver === 'postgres') {
        const fields = [];
        const values = [];
        let i = 1;
        for (const [key, val] of Object.entries(updates)) {
          if (['frequency_type', 'frequency_value', 'dose_times', 'meal_timing', 'start_date', 'end_date', 'is_active'].includes(key)) {
            fields.push(`${key} = $${i}`);
            values.push(key === 'dose_times' && Array.isArray(val) ? JSON.stringify(val) : val);
            i++;
          }
        }
        if (!fields.length) return null;
        values.push(id, userId);
        const q = `UPDATE schedules SET ${fields.join(', ')} WHERE id = $${i} AND user_id = $${i + 1} RETURNING *`;
        const res = await pgPool.query(q, values);
        if (!res.rows[0]) return null;
        const r = res.rows[0];
        return { ...r, dose_times: typeof r.dose_times === 'string' ? JSON.parse(r.dose_times) : r.dose_times };
      }
      const idx = store.schedules.findIndex(s => Number(s.id) === Number(id) && Number(s.user_id) === Number(userId));
      if (idx === -1) return null;
      store.schedules[idx] = { ...store.schedules[idx], ...updates };
      persistStore();
      return store.schedules[idx];
    },
    async delete(id, userId) {
      if (activeDriver === 'postgres') {
        const res = await pgPool.query('DELETE FROM schedules WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
        return res.rowCount > 0;
      }
      const len = store.schedules.length;
      store.schedules = store.schedules.filter(s => !(Number(s.id) === Number(id) && Number(s.user_id) === Number(userId)));
      store.dose_logs = store.dose_logs.filter(d => Number(d.schedule_id) !== Number(id));
      persistStore();
      return store.schedules.length < len;
    }
  },

  // Dose Logs
  doseLogs: {
    async findToday(userId, dateStr, dependentId = null) {
      // dateStr format: YYYY-MM-DD
      const startOfDay = `${dateStr}T00:00:00.000Z`;
      const endOfDay = `${dateStr}T23:59:59.999Z`;

      if (activeDriver === 'postgres') {
        let q = `
          SELECT dl.*, m.name as medicine_name, m.dosage, m.form, m.color, m.shape, m.icon, m.instructions,
                 s.meal_timing, s.dose_times
          FROM dose_logs dl
          JOIN medicines m ON dl.medicine_id = m.id
          LEFT JOIN schedules s ON dl.schedule_id = s.id
          WHERE dl.user_id = $1 AND dl.scheduled_time >= $2 AND dl.scheduled_time <= $3
        `;
        const params = [userId, startOfDay, endOfDay];
        if (dependentId !== null) {
          q += ' AND dl.dependent_id = $4';
          params.push(dependentId);
        } else {
          q += ' AND dl.dependent_id IS NULL';
        }
        q += ' ORDER BY dl.scheduled_time ASC';
        const res = await pgPool.query(q, params);
        return res.rows;
      }

      return store.dose_logs
        .filter(d => {
          if (Number(d.user_id) !== Number(userId)) return false;
          if (dependentId ? Number(d.dependent_id) !== Number(dependentId) : d.dependent_id) return false;
          const t = new Date(d.scheduled_time).toISOString();
          return t >= startOfDay && t <= endOfDay;
        })
        .map(d => {
          const med = store.medicines.find(m => Number(m.id) === Number(d.medicine_id)) || {};
          const sched = store.schedules.find(s => Number(s.id) === Number(d.schedule_id)) || {};
          return {
            ...d,
            medicine_name: med.name,
            dosage: med.dosage,
            form: med.form,
            color: med.color,
            shape: med.shape,
            icon: med.icon,
            instructions: med.instructions,
            meal_timing: sched.meal_timing || 'no_food_relation'
          };
        })
        .sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time));
    },

    async recordDose(data) {
      if (activeDriver === 'postgres') {
        // Check if an existing log exists for this schedule and time
        const existing = await pgPool.query(
          `SELECT id FROM dose_logs
           WHERE schedule_id = $1 AND scheduled_time = $2`,
          [data.schedule_id, data.scheduled_time]
        );

        if (existing.rows.length > 0) {
          const updateRes = await pgPool.query(
            `UPDATE dose_logs
             SET status = $1, recorded_at = $2, notes = $3
             WHERE id = $4 RETURNING *`,
            [data.status, data.recorded_at || new Date().toISOString(), data.notes || '', existing.rows[0].id]
          );
          return updateRes.rows[0];
        }

        const res = await pgPool.query(
          `INSERT INTO dose_logs (schedule_id, medicine_id, user_id, dependent_id, scheduled_time, status, recorded_at, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [
            data.schedule_id || null,
            data.medicine_id,
            data.user_id,
            data.dependent_id || null,
            data.scheduled_time,
            data.status || 'taken',
            data.recorded_at || new Date().toISOString(),
            data.notes || ''
          ]
        );
        return res.rows[0];
      }

      const existingIdx = store.dose_logs.findIndex(
        l => Number(l.schedule_id) === Number(data.schedule_id) &&
             new Date(l.scheduled_time).getTime() === new Date(data.scheduled_time).getTime()
      );

      if (existingIdx !== -1) {
        store.dose_logs[existingIdx].status = data.status;
        store.dose_logs[existingIdx].recorded_at = data.recorded_at || new Date().toISOString();
        if (data.notes !== undefined) store.dose_logs[existingIdx].notes = data.notes;
        persistStore();
        return store.dose_logs[existingIdx];
      }

      const id = store.dose_logs.length ? Math.max(...store.dose_logs.map(l => l.id)) + 1 : 1;
      const newLog = {
        id,
        schedule_id: data.schedule_id ? Number(data.schedule_id) : null,
        medicine_id: Number(data.medicine_id),
        user_id: Number(data.user_id),
        dependent_id: data.dependent_id ? Number(data.dependent_id) : null,
        scheduled_time: new Date(data.scheduled_time).toISOString(),
        status: data.status || 'taken',
        recorded_at: data.recorded_at || new Date().toISOString(),
        notes: data.notes || '',
        created_at: new Date().toISOString()
      };
      store.dose_logs.push(newLog);
      persistStore();
      return newLog;
    },

    async getHistory(userId, { startDate, endDate, dependentId = null }) {
      if (activeDriver === 'postgres') {
        let q = `
          SELECT dl.*, m.name as medicine_name, m.dosage, m.form, m.color, m.icon
          FROM dose_logs dl
          JOIN medicines m ON dl.medicine_id = m.id
          WHERE dl.user_id = $1
        `;
        const params = [userId];
        let pIndex = 2;

        if (startDate) {
          q += ` AND dl.scheduled_time >= $${pIndex}`;
          params.push(startDate);
          pIndex++;
        }
        if (endDate) {
          q += ` AND dl.scheduled_time <= $${pIndex}`;
          params.push(endDate);
          pIndex++;
        }
        if (dependentId !== null) {
          q += ` AND dl.dependent_id = $${pIndex}`;
          params.push(dependentId);
          pIndex++;
        } else {
          q += ` AND dl.dependent_id IS NULL`;
        }
        q += ' ORDER BY dl.scheduled_time DESC LIMIT 200';
        const res = await pgPool.query(q, params);
        return res.rows;
      }

      return store.dose_logs
        .filter(d => {
          if (Number(d.user_id) !== Number(userId)) return false;
          if (dependentId ? Number(d.dependent_id) !== Number(dependentId) : d.dependent_id) return false;
          const t = new Date(d.scheduled_time).toISOString();
          if (startDate && t < startDate) return false;
          if (endDate && t > endDate) return false;
          return true;
        })
        .map(d => {
          const med = store.medicines.find(m => Number(m.id) === Number(d.medicine_id)) || {};
          return {
            ...d,
            medicine_name: med.name,
            dosage: med.dosage,
            form: med.form,
            color: med.color,
            icon: med.icon
          };
        })
        .sort((a, b) => new Date(b.scheduled_time) - new Date(a.scheduled_time));
    }
  },

  // Export raw data for backup or seeding
  getStore: () => store,
  setStore: (newStore) => {
    store = newStore;
    persistStore();
  }
};

module.exports = db;
