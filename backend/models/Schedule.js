const db = require('../config/db');

function normalizeTimes(doseTimes) {
  if (!Array.isArray(doseTimes)) {
    if (typeof doseTimes === 'string') {
      try {
        doseTimes = JSON.parse(doseTimes);
      } catch (e) {
        doseTimes = [];
      }
    } else {
      doseTimes = [];
    }
  }
  return doseTimes.map(t => {
    if (!t) return '08:00';
    const clean = String(t).trim();
    const match = clean.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      return `${match[1].padStart(2, '0')}:${match[2]}`;
    }
    return clean;
  }).sort();
}

const Schedule = {
  normalizeTimes,

  async findByUser(userId, dependentId = null) {
    if (db.getDriver() === 'postgres') {
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
      const res = await db.getPgPool().query(q, params);
      return res.rows.map(r => ({
        ...r,
        dose_times: normalizeTimes(r.dose_times)
      }));
    }
    const store = db.getStore();
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
          dose_times: normalizeTimes(s.dose_times)
        };
      })
      .sort((a, b) => b.id - a.id);
  },

  async findById(id) {
    if (db.getDriver() === 'postgres') {
      const res = await db.getPgPool().query('SELECT * FROM schedules WHERE id = $1', [id]);
      if (!res.rows[0]) return null;
      const r = res.rows[0];
      return {
        ...r,
        dose_times: normalizeTimes(r.dose_times)
      };
    }
    const s = db.getStore().schedules.find(x => Number(x.id) === Number(id));
    if (!s) return null;
    return {
      ...s,
      dose_times: normalizeTimes(s.dose_times)
    };
  },

  async findDuplicate(userId, dependentId, { medicine_id, frequency_type, start_date, dose_times }, excludeId = null) {
    const timesNorm = normalizeTimes(dose_times);
    const timesJson = JSON.stringify(timesNorm);

    if (db.getDriver() === 'postgres') {
      let q = `
        SELECT * FROM schedules
        WHERE user_id = $1
          AND (dependent_id IS NOT DISTINCT FROM $2)
          AND medicine_id = $3
          AND frequency_type = $4
          AND start_date = $5
          AND dose_times = $6
      `;
      const params = [userId, dependentId || null, medicine_id, frequency_type || 'daily', start_date, timesJson];
      if (excludeId) {
        q += ' AND id != $7';
        params.push(excludeId);
      }
      const res = await db.getPgPool().query(q, params);
      return res.rows[0] || null;
    }

    const store = db.getStore();
    return store.schedules.find(s => {
      if (Number(s.user_id) !== Number(userId)) return false;
      const sDep = s.dependent_id ? Number(s.dependent_id) : null;
      const targetDep = dependentId ? Number(dependentId) : null;
      if (sDep !== targetDep) return false;
      if (excludeId && Number(s.id) === Number(excludeId)) return false;

      const sTimes = normalizeTimes(s.dose_times);
      return (
        Number(s.medicine_id) === Number(medicine_id) &&
        s.frequency_type === (frequency_type || 'daily') &&
        String(s.start_date).split('T')[0] === String(start_date).split('T')[0] &&
        JSON.stringify(sTimes) === timesJson
      );
    }) || null;
  },

  async create(data) {
    const normalizedTimes = normalizeTimes(data.dose_times);
    const timesJson = JSON.stringify(normalizedTimes);

    if (db.getDriver() === 'postgres') {
      const res = await db.getPgPool().query(
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
      return { ...r, dose_times: normalizeTimes(r.dose_times) };
    }

    const store = db.getStore();
    const id = store.schedules.length ? Math.max(...store.schedules.map(s => s.id)) + 1 : 1;
    const newSchedule = {
      id,
      medicine_id: Number(data.medicine_id),
      user_id: Number(data.user_id),
      dependent_id: data.dependent_id ? Number(data.dependent_id) : null,
      frequency_type: data.frequency_type || 'daily',
      frequency_value: data.frequency_value || '1',
      dose_times: normalizedTimes,
      meal_timing: data.meal_timing || 'no_food_relation',
      start_date: data.start_date || new Date().toISOString().split('T')[0],
      end_date: data.end_date || null,
      is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
      created_at: new Date().toISOString()
    };
    store.schedules.push(newSchedule);
    db.persistStore();
    return newSchedule;
  },

  async update(id, userId, updates) {
    if (updates.dose_times !== undefined) {
      updates.dose_times = normalizeTimes(updates.dose_times);
    }

    if (db.getDriver() === 'postgres') {
      const fields = [];
      const values = [];
      let i = 1;
      for (const [key, val] of Object.entries(updates)) {
        if (['frequency_type', 'frequency_value', 'dose_times', 'meal_timing', 'start_date', 'end_date', 'is_active'].includes(key)) {
          fields.push(`${key} = $${i}`);
          values.push(key === 'dose_times' ? JSON.stringify(val) : val);
          i++;
        }
      }
      if (!fields.length) return null;
      values.push(id, userId);
      const q = `UPDATE schedules SET ${fields.join(', ')} WHERE id = $${i} AND user_id = $${i + 1} RETURNING *`;
      const res = await db.getPgPool().query(q, values);
      if (!res.rows[0]) return null;
      const r = res.rows[0];
      return { ...r, dose_times: normalizeTimes(r.dose_times) };
    }

    const store = db.getStore();
    const idx = store.schedules.findIndex(s => Number(s.id) === Number(id) && Number(s.user_id) === Number(userId));
    if (idx === -1) return null;
    store.schedules[idx] = { ...store.schedules[idx], ...updates };
    db.persistStore();
    return {
      ...store.schedules[idx],
      dose_times: normalizeTimes(store.schedules[idx].dose_times)
    };
  },

  async delete(id, userId) {
    if (db.getDriver() === 'postgres') {
      const res = await db.getPgPool().query('DELETE FROM schedules WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
      return res.rowCount > 0;
    }
    const store = db.getStore();
    const len = store.schedules.length;
    store.schedules = store.schedules.filter(s => !(Number(s.id) === Number(id) && Number(s.user_id) === Number(userId)));
    store.dose_logs = store.dose_logs.filter(d => Number(d.schedule_id) !== Number(id));
    db.persistStore();
    return store.schedules.length < len;
  }
};

module.exports = Schedule;
