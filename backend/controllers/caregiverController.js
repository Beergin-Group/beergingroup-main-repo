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

exports.getDependentById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const dependent = await Caregiver.findById(id);
    if (!dependent || Number(dependent.caregiver_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Dependent not found.' });
    }
    return res.json({ success: true, data: dependent });
  } catch (err) {
    console.error('Get dependent by id error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dependent.' });
  }
};

exports.createDependent = async (req, res) => {
  try {
    const { name, relationship, custom_relationship, email, age, address, date_of_birth, emergency_contact, notes } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Dependent name is required.' });
    }

    // Duplicate check
    const existing = await Caregiver.findDuplicate(req.user.id, name);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A dependent with this name already exists under your caregiver account.'
      });
    }

    const dependent = await Caregiver.create({
      caregiver_id: req.user.id,
      name: name.trim(),
      relationship: relationship || 'Family Member',
      custom_relationship: custom_relationship || null,
      email: email ? email.trim() : null,
      age: age !== undefined && age !== null && age !== '' ? parseInt(age, 10) : null,
      address: address ? address.trim() : null,
      date_of_birth: date_of_birth || null,
      emergency_contact: emergency_contact || null,
      notes: notes || ''
    });

    return res.status(201).json({ success: true, message: 'Dependent added successfully.', data: dependent });
  } catch (err) {
    console.error('Create dependent error:', err);
    if (err.code === '23505' || err.message?.includes('already exists')) {
      return res.status(409).json({ success: false, message: 'A dependent with this name already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Failed to add dependent.' });
  }
};

exports.updateDependent = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await Caregiver.findById(id);
    if (!existing || Number(existing.caregiver_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Dependent not found.' });
    }

    const { name, relationship, custom_relationship, email, age, address, date_of_birth, emergency_contact, notes } = req.body;

    if (name && name.trim()) {
      const duplicate = await Caregiver.findDuplicate(req.user.id, name, id);
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'Another dependent with this name already exists under your caregiver account.'
        });
      }
    }

    const updated = await Caregiver.update(id, req.user.id, {
      name: name ? name.trim() : existing.name,
      relationship: relationship !== undefined ? relationship : existing.relationship,
      custom_relationship: custom_relationship !== undefined ? custom_relationship : existing.custom_relationship,
      email: email !== undefined ? (email ? email.trim() : null) : existing.email,
      age: age !== undefined && age !== null && age !== '' ? parseInt(age, 10) : existing.age,
      address: address !== undefined ? (address ? address.trim() : null) : existing.address,
      date_of_birth: date_of_birth !== undefined ? date_of_birth : existing.date_of_birth,
      emergency_contact: emergency_contact !== undefined ? emergency_contact : existing.emergency_contact,
      notes: notes !== undefined ? notes : existing.notes
    });

    return res.json({ success: true, message: 'Dependent updated successfully.', data: updated });
  } catch (err) {
    console.error('Update dependent error:', err);
    if (err.code === '23505' || err.message?.includes('already exists')) {
      return res.status(409).json({ success: false, message: 'A dependent with this name already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Failed to update dependent.' });
  }
};

exports.deleteDependent = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await Caregiver.findById(id);
    if (!existing || Number(existing.caregiver_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Dependent not found.' });
    }

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
