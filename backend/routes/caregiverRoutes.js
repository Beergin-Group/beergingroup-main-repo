const express = require('express');
const router = express.Router();
const caregiverController = require('../controllers/caregiverController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/dependents', caregiverController.getDependents);
router.get('/dependents/:id', caregiverController.getDependentById);
router.post('/dependents', caregiverController.createDependent);
router.put('/dependents/:id', caregiverController.updateDependent);
router.delete('/dependents/:id', caregiverController.deleteDependent);
router.get('/dependents/:id/summary', caregiverController.getDependentSummary);

module.exports = router;
