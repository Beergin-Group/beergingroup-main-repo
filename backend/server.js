/**
 * MediRemind Web System — Backend Server
 * Course: Application Development and Emerging Technologies
 * Team: Beergin (Jerold Sodusta, Francis John Empil, Jibson Cabilin, Nove Calasang)
 * Branch: feature/web-system
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const config = require('./src/config');
const db = require('./src/db');
const seed = require('./src/db/seed');

const authRoutes     = require('./src/routes/authRoutes');
const medicineRoutes = require('./src/routes/medicineRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');
const doseLogRoutes  = require('./src/routes/doseLogRoutes');
const adherenceRoutes = require('./src/routes/adherenceRoutes');
const caregiverRoutes = require('./src/routes/caregiverRoutes');

const app = express();

// ── Middleware ────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  const t = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - t;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// ── Static Files — Web System Frontend ───────────────────
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath));

// ── API Routes ────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/dose-logs', doseLogRoutes);
app.use('/api/adherence', adherenceRoutes);
app.use('/api/caregiver', caregiverRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'MediRemind Web System REST API',
    version: '1.0.0',
    branch: 'feature/web-system',
    db_driver: db.getDriver().toUpperCase(),
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    team: 'Beergin — Jerold, Francis, Jibson, Nove'
  });
});

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found.' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ── Start Server ──────────────────────────────────────────
async function startServer() {
  try {
    await db.init();

    // Auto-seed on first run
    const testUser = await db.users.findByEmail('patient@mediremind.com');
    if (!testUser) {
      console.log('[MediRemind] First-time setup detected. Seeding sample data...');
      await seed();
      console.log('[MediRemind] Sample data seeded successfully.');
    }

    const PORT = config.port || 5000;

    const server = app.listen(PORT, () => {
      console.log('');
      console.log('  ╔══════════════════════════════════════════════╗');
      console.log('  ║     MediRemind — Web System Server           ║');
      console.log(`  ║     URL  : http://localhost:${PORT}              ║`);
      console.log(`  ║     DB   : ${db.getDriver().toUpperCase().padEnd(10)}                        ║`);
      console.log('  ║     Team : Beergin (Jerold, Francis,         ║');
      console.log('  ║            Jibson, Nove)                     ║');
      console.log('  ║     Branch: feature/web-system               ║');
      console.log('  ╚══════════════════════════════════════════════╝');
      console.log('');
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const fallback = PORT + 1;
        console.warn(`[MediRemind] Port ${PORT} in use. Trying port ${fallback}...`);
        app.listen(fallback, () => {
          console.log(`[MediRemind] Running on http://localhost:${fallback}`);
        });
      } else {
        console.error('[MediRemind] Server error:', err);
      }
    });

  } catch (err) {
    console.error('[MediRemind] Failed to start server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
