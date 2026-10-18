const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./src/config');
const db = require('./src/db');
const seed = require('./src/db/seed');

const authRoutes = require('./src/routes/authRoutes');
const medicineRoutes = require('./src/routes/medicineRoutes');
const scheduleRoutes = require('./src/routes/scheduleRoutes');
const doseLogRoutes = require('./src/routes/doseLogRoutes');
const adherenceRoutes = require('./src/routes/adherenceRoutes');
const caregiverRoutes = require('./src/routes/caregiverRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/dose-logs', doseLogRoutes);
app.use('/api/adherence', adherenceRoutes);
app.use('/api/caregiver', caregiverRoutes);

// System Health & Info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'MediRemind REST API Server',
    version: '1.0.0',
    db_driver: db.getDriver(),
    timestamp: new Date().toISOString()
  });
});

// Fallback to frontend index.html for SPA client navigation
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start server
async function startServer() {
  try {
    await db.init();

    // Auto-seed if database is empty
    const testUser = await db.users.findByEmail('patient@mediremind.com');
    if (!testUser) {
      console.log('[MediRemind] First-time setup detected. Initializing sample data...');
      await seed();
    }

    const port = config.port;
    const server = app.listen(port, () => {
      console.log(`=======================================================`);
      console.log(`  MediRemind REST API Server is running!               `);
      console.log(`  Access URL: http://localhost:${port}                 `);
      console.log(`  Database Engine: ${db.getDriver().toUpperCase()}     `);
      console.log(`  Team: Beergin (Jerold, Francis, Jibson, Nove)        `);
      console.log(`=======================================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} in use, trying port ${port + 1}...`);
        app.listen(port + 1, () => {
          console.log(`MediRemind running on http://localhost:${port + 1}`);
        });
      } else {
        console.error('Server error:', err);
      }
    });
  } catch (err) {
    console.error('Failed to start MediRemind server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
