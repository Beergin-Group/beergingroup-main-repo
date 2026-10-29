/**
 * MediRemind — Medicine Routes
 * Week 4 Deliverable
 * Author: Francis John Empil (Back-End Developer)
 */

const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { authenticateToken } = require('../../../Week_3_Deliverables/Back_End/src/middleware/auth');

module.exports = (db) => {
  // All medicine routes require valid JWT authentication
  router.use(authenticateToken);

  router.get('/', (req, res) => medicineController.getAll(req, res, db));
  router.get('/:id', (req, res) => medicineController.getById(req, res, db));
  router.post('/', (req, res) => medicineController.create(req, res, db));
  router.put('/:id', (req, res) => medicineController.update(req, res, db));
  router.delete('/:id', (req, res) => medicineController.delete(req, res, db));
  router.post('/:id/refill', (req, res) => medicineController.refill(req, res, db));

  return router;
};
