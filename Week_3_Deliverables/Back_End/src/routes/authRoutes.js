/**
 * MediRemind — Authentication Routes
 * Week 3 Deliverable
 * Author: Francis John Empil (Back-End Developer)
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

module.exports = (db) => {
  // Public Routes
  router.post('/register', (req, res) => authController.register(req, res, db));
  router.post('/login', (req, res) => authController.login(req, res, db));
  router.get('/demo-accounts', authController.getDemoAccounts);

  // Protected Routes
  router.get('/me', authenticateToken, authController.getMe);
  router.post('/refresh', authenticateToken, authController.refreshToken);

  return router;
};
