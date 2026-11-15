const db = require('../config/db');

const Medicine = {
  async findByUser(userId, dependentId = null) {
    if (db.getDriver() === 'postgres') {
      let q = 'SELECT * FROM medicines WHERE user_id = $1';
      const params = [userId];
      if (dependentId !== null) {
        q += ' AND dependent_id = $2';
        params.push(dependentId);
      } else {
        q += ' AND dependent_id IS NULL';
      }
      q += ' ORDER BY id DESC';
      const res = await db.getPgPool().query(q, params);
      return res.rows;
    }
    return db.getStore().medicines
      .filter(m => Number(m.user_id) === Number(userId) && (dependentId ? Number(m.dependent_id) === Number(dependentId) : !m.dependent_id))
      .sort((a, b) => b.id - a.id);
  },

  async findById(id) {
    if (db.getDriver() === 'postgres') {
      const res = await db.getPgPool().query('SELECT * FROM medicines WHERE id = $1', [id]);
      return res.rows[0] || null;
    }
    return db.getStore().medicines.find(m => Number(m.id) === Number(id)) || null;
  },

  async create(med) {
    if (db.getDriver() === 'postgres') {
      const res = await db.getPgPool().query(
        `INSERT INTO medicines (user_id, dependent_id, name, dosage, form, instructions, stock_count, low_stock_threshold, color, shape, icon)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [
          med.user_id,
          med.dependent_id || null,
          med.name,
          med.dosage,
          med.form || 'tablet',
          med.instructions || '',
          med.stock_count !== undefined ? Number(med.stock_count) : 30,
          med.low_stock_threshold !== undefined ? Number(med.low_stock_threshold) : 5,
          med.color || '#0d9488',
          med.shape || 'round',
          med.icon || 'pill'
        ]
      );
      return res.rows[0];
    }
    const store = db.getStore();
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
    db.persistStore();
    return newMed;
  },

  async update(id, userId, updates) {
    if (db.getDriver() === 'postgres') {
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
      const res = await db.getPgPool().query(q, values);
      return res.rows[0] || null;
    }
    const store = db.getStore();
    const idx = store.medicines.findIndex(m => Number(m.id) === Number(id) && Number(m.user_id) === Number(userId));
    if (idx === -1) return null;
    store.medicines[idx] = { ...store.medicines[idx], ...updates };
    db.persistStore();
    return store.medicines[idx];
  },

  async decrementStock(id, count = 1) {
    if (db.getDriver() === 'postgres') {
      const res = await db.getPgPool().query(
        'UPDATE medicines SET stock_count = GREATEST(0, stock_count - $1) WHERE id = $2 RETURNING *',
        [count, id]
      );
      return res.rows[0] || null;
    }
    const store = db.getStore();
    const m = store.medicines.find(x => Number(x.id) === Number(id));
    if (m) {
      m.stock_count = Math.max(0, (m.stock_count || 0) - count);
      db.persistStore();
      return m;
    }
    return null;
  },

  async refillStock(id, userId, amount) {
    if (db.getDriver() === 'postgres') {
      const res = await db.getPgPool().query(
        'UPDATE medicines SET stock_count = stock_count + $1 WHERE id = $2 AND user_id = $3 RETURNING *',
        [amount, id, userId]
      );
      return res.rows[0] || null;
    }
    const store = db.getStore();
    const m = store.medicines.find(x => Number(x.id) === Number(id) && Number(x.user_id) === Number(userId));
    if (m) {
      m.stock_count = (m.stock_count || 0) + Number(amount);
      db.persistStore();
      return m;
    }
    return null;
  },

  async delete(id, userId) {
    if (db.getDriver() === 'postgres') {
      const res = await db.getPgPool().query('DELETE FROM medicines WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
      return res.rowCount > 0;
    }
    const store = db.getStore();
    const lenBefore = store.medicines.length;
    store.medicines = store.medicines.filter(m => !(Number(m.id) === Number(id) && Number(m.user_id) === Number(userId)));
    store.schedules = store.schedules.filter(s => Number(s.medicine_id) !== Number(id));
    store.dose_logs = store.dose_logs.filter(d => Number(d.medicine_id) !== Number(id));
    db.persistStore();
    return store.medicines.length < lenBefore;
  }
};

module.exports = Medicine;
