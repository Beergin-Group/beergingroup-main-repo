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

  async create(data) {
    if (db.getDriver() === 'postgres') {
      const res = await db.getPgPool().query(
        `INSERT INTO dependents (caregiver_id, name, relationship, date_of_birth, emergency_contact, notes)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [data.caregiver_id, data.name, data.relationship, data.date_of_birth, data.emergency_contact, data.notes]
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
      date_of_birth: data.date_of_birth || null,
      emergency_contact: data.emergency_contact || '',
      notes: data.notes || '',
      created_at: new Date().toISOString()
    };
    store.dependents.push(newDep);
    db.persistStore();
    return newDep;
  },

  async delete(id, caregiverId) {
    if (db.getDriver() === 'postgres') {
      await db.getPgPool().query('DELETE FROM dependents WHERE id = $1 AND caregiver_id = $2', [id, caregiverId]);
      return true;
    }
    const store = db.getStore();
    store.dependents = store.dependents.filter(d => !(Number(d.id) === Number(id) && Number(d.caregiver_id) === Number(caregiverId)));
    db.persistStore();
    return true;
  }
};

module.exports = Caregiver;
