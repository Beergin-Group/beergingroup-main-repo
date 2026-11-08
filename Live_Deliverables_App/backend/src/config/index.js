const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || 'mediremind_secret_jwt_key_2026_beergin',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  dbType: process.env.DB_TYPE || 'auto', // 'postgres' | 'file' | 'auto'
  pg: {
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT, 10) || 5432,
    database: process.env.PG_DATABASE || 'mediremind',
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false
  }
};
