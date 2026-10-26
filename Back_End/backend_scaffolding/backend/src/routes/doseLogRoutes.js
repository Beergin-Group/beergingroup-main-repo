const express = require('express');
const router = express.Router();
const doseLogController = require('../controllers/doseLogController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/today', doseLogController.getToday);
router.post('/', doseLogController.recordDose);
router.post('/snooze', doseLogController.snooze);
router.get('/history', doseLogController.getHistory);

module.exports = router;
