const db = require('../config/db');

const DoseLog = {
  async autoSkipOverdue(userId = null) {
    const fourHoursAgoIso = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    if (db.getDriver() === 'postgres') {
      try {
        let q = `
          UPDATE dose_logs
          SET status = 'skipped',
              notes = CASE 
                WHEN notes IS NULL OR notes = '' THEN '[Auto-skipped: overdue]'
                ELSE notes || ' [Auto-skipped: overdue]'
              END
          WHERE status = 'pending' AND scheduled_time < $1
        `;
        const params = [fourHoursAgoIso];
        if (userId) {
          q += ' AND user_id = $2';
          params.push(userId);
        }
        await db.getPgPool().query(q, params);
      } catch (e) {
        console.warn('Auto skip overdue error:', e.message);
      }
      return;
    }

    const store = db.getStore();
    let modified = false;
    for (const log of store.dose_logs) {
      if (log.status === 'pending' && new Date(log.scheduled_time) < new Date(fourHoursAgoIso)) {
        if (!userId || Number(log.user_id) === Number(userId)) {
          log.status = 'skipped';
          log.notes = log.notes ? `${log.notes} [Auto-skipped: overdue]` : '[Auto-skipped: overdue]';
          modified = true;
        }
      }
    }
    if (modified) db.persistStore();
  },

  async findToday(userId, dateStr, dependentId = null) {
    await this.autoSkipOverdue(userId);

    const startOfDay = `${dateStr}T00:00:00.000Z`;
    const endOfDay = `${dateStr}T23:59:59.999Z`;

    if (db.getDriver() === 'postgres') {
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
      const res = await db.getPgPool().query(q, params);
      return res.rows;
    }

    const store = db.getStore();
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
    // Time-window guard: if status is 'taken', cannot be marked excessively early (>30 mins before scheduled time)
    if (data.status === 'taken') {
      const scheduledTime = new Date(data.scheduled_time).getTime();
      const now = Date.now();
      const earlyThresholdMs = 30 * 60 * 1000; // 30-minute early window
      if (scheduledTime - now > earlyThresholdMs) {
        const err = new Error('EARLY_DOSE_GUARD: Cannot mark dose as taken before scheduled window.');
        err.code = 'EARLY_DOSE_GUARD';
        throw err;
      }
    }

    if (db.getDriver() === 'postgres') {
      const existing = await db.getPgPool().query(
        `SELECT id, status, notes FROM dose_logs
         WHERE (schedule_id IS NOT DISTINCT FROM $1) AND medicine_id = $2 AND scheduled_time = $3`,
        [data.schedule_id || null, data.medicine_id, data.scheduled_time]
      );

      if (existing.rows.length > 0) {
        const current = existing.rows[0];
        // Status lock: if previously skipped and attempting taken without explicit reset
        if (current.status === 'skipped' && data.status === 'taken') {
          const notes = data.notes || '';
          if (!notes.includes('[RESET]')) {
            const err = new Error('STATUS_LOCKED: Doses marked as skipped are locked against accidental taken status.');
            err.code = 'STATUS_LOCKED';
            throw err;
          }
        }

        const updateRes = await db.getPgPool().query(
          `UPDATE dose_logs
           SET status = $1, recorded_at = $2, notes = $3
           WHERE id = $4 RETURNING *`,
          [data.status, data.recorded_at || new Date().toISOString(), data.notes || '', current.id]
        );
        return updateRes.rows[0];
      }

      const res = await db.getPgPool().query(
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

    const store = db.getStore();
    const existingIdx = store.dose_logs.findIndex(
      l => (Number(l.schedule_id) === Number(data.schedule_id) || (!l.schedule_id && !data.schedule_id)) &&
           Number(l.medicine_id) === Number(data.medicine_id) &&
           new Date(l.scheduled_time).getTime() === new Date(data.scheduled_time).getTime()
    );

    if (existingIdx !== -1) {
      const current = store.dose_logs[existingIdx];
      if (current.status === 'skipped' && data.status === 'taken') {
        const notes = data.notes || '';
        if (!notes.includes('[RESET]')) {
          const err = new Error('STATUS_LOCKED: Doses marked as skipped are locked against accidental taken status.');
          err.code = 'STATUS_LOCKED';
          throw err;
        }
      }

      store.dose_logs[existingIdx].status = data.status;
      store.dose_logs[existingIdx].recorded_at = data.recorded_at || new Date().toISOString();
      if (data.notes !== undefined) store.dose_logs[existingIdx].notes = data.notes;
      db.persistStore();
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
    db.persistStore();
    return newLog;
  },

  async getHistory(userId, { startDate, endDate, dependentId = null, status = null } = {}) {
    await this.autoSkipOverdue(userId);

    if (db.getDriver() === 'postgres') {
      let q = `
        SELECT dl.*, m.name as medicine_name, m.dosage, m.form, m.color, m.icon
        FROM dose_logs dl
        JOIN medicines m ON dl.medicine_id = m.id
        WHERE dl.user_id = $1
      `;
      const params = [userId];
      let pIndex = 2;

      if (status) {
        q += ` AND dl.status = $${pIndex}`;
        params.push(status);
        pIndex++;
      }
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
      q += ' ORDER BY dl.scheduled_time DESC LIMIT 300';
      const res = await db.getPgPool().query(q, params);
      return res.rows;
    }

    const store = db.getStore();
    return store.dose_logs
      .filter(d => {
        if (Number(d.user_id) !== Number(userId)) return false;
        if (dependentId ? Number(d.dependent_id) !== Number(dependentId) : d.dependent_id) return false;
        if (status && d.status !== status) return false;
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
};

module.exports = DoseLog;
