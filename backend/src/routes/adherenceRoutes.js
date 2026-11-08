const express = require('express');
const router = express.Router();
const adherenceController = require('../controllers/adherenceController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/summary', adherenceController.getSummary);
router.get('/weekly', adherenceController.getWeekly);
router.get('/export', adherenceController.exportReport);

module.exports = router;
