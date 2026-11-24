const express = require('express');
const router = express.Router();
const doseLogController = require('../controllers/doseLogController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/today', doseLogController.getToday);
router.post('/record', doseLogController.record);
router.post('/', doseLogController.record);
router.get('/history', doseLogController.getHistory);

module.exports = router;
