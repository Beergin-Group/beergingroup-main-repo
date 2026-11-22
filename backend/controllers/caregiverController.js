const Caregiver = require('../models/Caregiver');
const Medicine = require('../models/Medicine');
const Schedule = require('../models/Schedule');
const DoseLog = require('../models/DoseLog');

exports.getDependents = async (req, res) => {
  try {
    const dependents = await Caregiver.findByCaregiver(req.user.id);
    return res.json({ success: true, count: dependents.length, data: dependents });
  } catch (err) {
    console.error('Get dependents error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dependents.' });
  }
};

exports.createDependent = async (req, res) => {
  try {
    const { name, relationship, date_of_birth, emergency_contact, notes } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Dependent name is required.' });
    }

    const dependent = await Caregiver.create({
      caregiver_id: req.user.id,
      name,
      relationship: relationship || 'Family Member',
      date_of_birth,
      emergency_contact,
      notes
    });

    return res.status(201).json({ success: true, message: 'Dependent added successfully.', data: dependent });
  } catch (err) {
    console.error('Create dependent error:', err);
    return res.status(500).json({ success: false, message: 'Failed to add dependent.' });
  }
};

exports.deleteDependent = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await Caregiver.delete(id, req.user.id);
    return res.json({ success: true, message: 'Dependent removed successfully.' });
  } catch (err) {
    console.error('Delete dependent error:', err);
    return res.status(500).json({ success: false, message: 'Failed to remove dependent.' });
  }
};

exports.getDependentSummary = async (req, res) => {
  try {
    const dependentId = parseInt(req.params.id, 10);
    const dependent = await Caregiver.findById(dependentId);
    if (!dependent || Number(dependent.caregiver_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Dependent not found.' });
    }

    const medicines = await Medicine.findByUser(req.user.id, dependentId);
    const schedules = await Schedule.findByUser(req.user.id, dependentId);
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = await DoseLog.findToday(req.user.id, todayStr, dependentId);

    return res.json({
      success: true,
      dependent,
      stats: {
        medicines_count: medicines.length,
        schedules_count: schedules.length,
        today_doses_logged: todayLogs.length
      }
    });
  } catch (err) {
    console.error('Get dependent summary error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dependent summary.' });
  }
};
