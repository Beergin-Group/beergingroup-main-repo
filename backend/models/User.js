const db = require('../config/db');

const User = {
  async findByEmail(email) {
    if (db.getDriver() === 'postgres') {
      const res = await db.getPgPool().query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
      return res.rows[0] || null;
    }
    return db.getStore().users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findById(id) {
    if (db.getDriver() === 'postgres') {
      const res = await db.getPgPool().query('SELECT id, name, email, role, phone, created_at FROM users WHERE id = $1', [id]);
      return res.rows[0] || null;
    }
    const u = db.getStore().users.find(u => Number(u.id) === Number(id));
    if (!u) return null;
    const { password_hash, ...rest } = u;
    return rest;
  },

  async findByIdWithPassword(id) {
    if (db.getDriver() === 'postgres') {
      const res = await db.getPgPool().query('SELECT * FROM users WHERE id = $1', [id]);
      return res.rows[0] || null;
    }
    return db.getStore().users.find(u => Number(u.id) === Number(id)) || null;
  },

  async create(user) {
    if (db.getDriver() === 'postgres') {
      const res = await db.getPgPool().query(
        `INSERT INTO users (name, email, password_hash, role, phone)
         VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, phone, created_at`,
        [user.name, user.email, user.password_hash, user.role || 'patient', user.phone || '']
      );
      return res.rows[0];
    }
    const store = db.getStore();
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
    db.persistStore();
    const { password_hash, ...rest } = newUser;
    return rest;
  },

  async findAll() {
    if (db.getDriver() === 'postgres') {
      const res = await db.getPgPool().query('SELECT id, name, email, role, phone, created_at FROM users ORDER BY id ASC');
      return res.rows;
    }
    return db.getStore().users.map(({ password_hash, ...rest }) => rest);
  }
};

module.exports = User;
