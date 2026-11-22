const db = require('../config/db');

const Caregiver = {
  async findByCaregiver(caregiverId) {
    if (db.getDriver() === 'postgres') {
      const res = await db.getPgPool().query('SELECT * FROM dependents WHERE caregiver_id = $1 ORDER BY id ASC', [caregiverId]);
      return res.rows;
    }
    return db.getStore().dependents.filter(d => Number(d.caregiver_id) === Number(caregiverId));
  },

  async findById(id) {
    if (db.getDriver() === 'postgres') {
      const res = await db.getPgPool().query('SELECT * FROM dependents WHERE id = $1', [id]);
      return res.rows[0] || null;
    }
    return db.getStore().dependents.find(d => Number(d.id) === Number(id)) || null;
  },

  async findDuplicate(caregiverId, name, excludeId = null) {
    const trimmed = (name || '').trim().toLowerCase();
    if (db.getDriver() === 'postgres') {
      let q = 'SELECT * FROM dependents WHERE caregiver_id = $1 AND LOWER(TRIM(name)) = $2';
      const params = [caregiverId, trimmed];
      if (excludeId) {
        q += ' AND id != $3';
        params.push(excludeId);
      }
      const res = await db.getPgPool().query(q, params);
      return res.rows[0] || null;
    }
    return db.getStore().dependents.find(d => 
      Number(d.caregiver_id) === Number(caregiverId) &&
      d.name.trim().toLowerCase() === trimmed &&
      (!excludeId || Number(d.id) !== Number(excludeId))
    ) || null;
  },

  async create(data) {
    if (db.getDriver() === 'postgres') {
      const res = await db.getPgPool().query(
        `INSERT INTO dependents (caregiver_id, name, relationship, custom_relationship, email, age, address, date_of_birth, emergency_contact, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          data.caregiver_id,
          data.name,
          data.relationship || 'Family Member',
          data.custom_relationship || null,
          data.email || null,
          data.age !== undefined && data.age !== null && data.age !== '' ? parseInt(data.age, 10) : null,
          data.address || null,
          data.date_of_birth || null,
          data.emergency_contact || null,
          data.notes || null
        ]
      );
      return res.rows[0];
    }
    const store = db.getStore();
    const id = store.dependents.length ? Math.max(...store.dependents.map(d => d.id)) + 1 : 1;
    const newDep = {
      id,
      caregiver_id: Number(data.caregiver_id),
      name: data.name,
      relationship: data.relationship || 'Family Member',
      custom_relationship: data.custom_relationship || null,
      email: data.email || null,
      age: data.age !== undefined && data.age !== null && data.age !== '' ? parseInt(data.age, 10) : null,
      address: data.address || null,
      date_of_birth: data.date_of_birth || null,
      emergency_contact: data.emergency_contact || '',
      notes: data.notes || '',
      created_at: new Date().toISOString()
    };
    store.dependents.push(newDep);
    db.persistStore();
    return newDep;
  },

  async update(id, caregiverId, data) {
    if (db.getDriver() === 'postgres') {
      const fields = [];
      const values = [];
      let i = 1;
      const allowed = ['name', 'relationship', 'custom_relationship', 'email', 'age', 'address', 'date_of_birth', 'emergency_contact', 'notes'];
      for (const [key, val] of Object.entries(data)) {
        if (allowed.includes(key)) {
          fields.push(`${key} = $${i}`);
          values.push(key === 'age' && val !== null && val !== undefined && val !== '' ? parseInt(val, 10) : val);
          i++;
        }
      }
      if (!fields.length) return null;
      values.push(id, caregiverId);
      const q = `UPDATE dependents SET ${fields.join(', ')} WHERE id = $${i} AND caregiver_id = $${i + 1} RETURNING *`;
      const res = await db.getPgPool().query(q, values);
      return res.rows[0] || null;
    }
    const store = db.getStore();
    const idx = store.dependents.findIndex(d => Number(d.id) === Number(id) && Number(d.caregiver_id) === Number(caregiverId));
    if (idx === -1) return null;
    store.dependents[idx] = {
      ...store.dependents[idx],
      ...data,
      age: data.age !== undefined && data.age !== null && data.age !== '' ? parseInt(data.age, 10) : store.dependents[idx].age
    };
    db.persistStore();
    return store.dependents[idx];
  },

  async delete(id, caregiverId) {
    if (db.getDriver() === 'postgres') {
      await db.getPgPool().query('DELETE FROM dependents WHERE id = $1 AND caregiver_id = $2', [id, caregiverId]);
      return true;
    }
    const store = db.getStore();
    store.dependents = store.dependents.filter(d => !(Number(d.id) === Number(id) && Number(d.caregiver_id) === Number(caregiverId)));
    store.medicines = store.medicines.filter(m => Number(m.dependent_id) !== Number(id));
    store.schedules = store.schedules.filter(s => Number(s.dependent_id) !== Number(id));
    store.dose_logs = store.dose_logs.filter(d => Number(d.dependent_id) !== Number(id));
    db.persistStore();
    return true;
  }
};

module.exports = Caregiver;
