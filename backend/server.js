/**
 * MediRemind Web System — Backend Server (MVC Architecture)
 * Course: Application Development and Emerging Technologies
 * Team: Beergin (Jerold Sodusta, Francis John Empil, Jibson Cabilin, Nove Calasang)
 * Reference Architecture: UCLIS (CCS Standards)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const config = require('./config');
const db = require('./config/db');
const { requestLogger } = require('./middleware/logger');
const apiRoutes = require('./routes/index');

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// ─── Static Frontend Delivery ─────────────────────────────────────────────────
const distPath = path.resolve(__dirname, '../frontend/dist');
const legacyPath = path.resolve(__dirname, '../frontend');
const fs = require('fs');
const staticPath = fs.existsSync(distPath) ? distPath : legacyPath;
app.use(express.static(staticPath));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'MediRemind Web System REST API',
    architecture: 'Standard MVC (UCLIS Compliance)',
    version: '2.0.0',
    db_driver: db.getDriver().toUpperCase(),
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    team: 'Beergin — Jerold, Francis, Jibson, Nove'
  });
});

// ─── SPA Fallback ─────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: `API route ${req.method} ${req.originalUrl} not found.` });
  }
  const indexFile = fs.existsSync(path.join(staticPath, 'index.html'))
    ? path.join(staticPath, 'index.html')
    : path.join(legacyPath, 'index.html');
  res.sendFile(indexFile);
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
async function startServer() {
  try {
    await db.init();
    const PORT = config.port;
    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(` MediRemind Backend running on http://localhost:${PORT}`);
      console.log(` Database driver: ${db.getDriver().toUpperCase()}`);
      console.log(` Architecture: Proper MVC (Aligned with UCLIS)`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
