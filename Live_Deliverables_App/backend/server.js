/**
 * MediRemind — Backend REST API Server (Week 3 & Week 4 Live Integration)
 * Course: Application Development and Emerging Technologies
 * Team: Beergin
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./src/config');
const db = require('./src/db');
const seed = require('./src/db/seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
const authRoutes = require('./src/routes/authRoutes');
const medicineRoutes = require('./src/routes/medicineRoutes');

app.use('/api/auth', authRoutes(db));
app.use('/api/medicines', medicineRoutes(db));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    course: 'Application Development and Emerging Technologies',
    team: 'Beergin',
    deliverables: 'Week 3 (Authentication) & Week 4 (Medicine Management)'
  });
});

// Serve frontend static files
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found.' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start Server with Database Initialization & Seed
async function startServer() {
  try {
    await db.init();

    // Auto-seed if database is empty or test account missing
    const testUser = await db.users.findByEmail('patient@mediremind.com');
    if (!testUser) {
      console.log('[MediRemind] First-time setup detected. Initializing sample data...');
      await seed();
    }

    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log('💊 MediRemind Live Server — Week 3 & 4 Deliverables');
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🗄️ Database Driver: ${db.getDriver().toUpperCase()}`);
      console.log('👥 Team Beergin: Francis, Jibson, Nove, Jerold');
      console.log('====================================================');
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${PORT} in use, trying ${PORT + 1}...`);
        app.listen(PORT + 1, () => {
          console.log(`MediRemind running on http://localhost:${PORT + 1}`);
        });
      } else {
        console.error('Server error:', err);
      }
    });
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
