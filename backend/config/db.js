const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const config = require('./index');

const dataDir = path.resolve(__dirname, '../data');
const jsonFilePath = path.join(dataDir, 'mediremind.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let activeDriver = 'json'; // 'postgres' | 'json'
let pgPool = null;

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
      console.error('[Database] Failed to parse JSON database:', err.message);
    }
  }
}

function persistStore() {
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Database] Failed to save JSON database:', err.message);
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

    await testPool.query('SELECT 1');
    pgPool = testPool;

    const schemaPath = path.join(dataDir, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const ddl = fs.readFileSync(schemaPath, 'utf-8');
      await pgPool.query(ddl);
    }

    activeDriver = 'postgres';
    console.log(`[Database] Connected to PostgreSQL at ${config.pg.host}:${config.pg.port}/${config.pg.database}`);
    return true;
  } catch (err) {
    console.warn(`[Database] PostgreSQL unavailable (${err.message}). Using persistent JSON storage (${jsonFilePath}).`);
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
  getStore: () => store,
  setStore: (newStore) => {
    store = newStore;
    persistStore();
  },
  persistStore,
  async query(text, params) {
    if (activeDriver === 'postgres' && pgPool) {
      return await pgPool.query(text, params);
    }
    throw new Error('Raw query not supported on file driver; use Model methods');
  }
};

module.exports = db;
