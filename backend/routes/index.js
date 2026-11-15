const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const medicineRoutes = require('./medicineRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const doseLogRoutes = require('./doseLogRoutes');
const adherenceRoutes = require('./adherenceRoutes');
const caregiverRoutes = require('./caregiverRoutes');

router.use('/auth', authRoutes);
router.use('/medicines', medicineRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/dose-logs', doseLogRoutes);
router.use('/adherence', adherenceRoutes);
router.use('/caregiver', caregiverRoutes);

module.exports = router;
