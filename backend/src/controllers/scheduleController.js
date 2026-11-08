const db = require('../db');

exports.getAll = async (req, res) => {
  try {
    const dependentId = req.query.dependent_id ? parseInt(req.query.dependent_id, 10) : null;
    const schedules = await db.schedules.findByUser(req.user.id, dependentId);
    return res.json({ success: true, count: schedules.length, data: schedules });
  } catch (err) {
    console.error('Get schedules error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve schedules.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const schedule = await db.schedules.findById(id);
    if (!schedule || Number(schedule.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Schedule not found.' });
    }
    return res.json({ success: true, data: schedule });
  } catch (err) {
    console.error('Get schedule error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve schedule.' });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      medicine_id,
      frequency_type,
      frequency_value,
      dose_times,
      meal_timing,
      start_date,
      end_date,
      dependent_id
    } = req.body;

    if (!medicine_id || !dose_times || (Array.isArray(dose_times) && !dose_times.length)) {
      return res.status(400).json({ success: false, message: 'Medicine ID and at least one dose time are required.' });
    }

    const medicine = await db.medicines.findById(medicine_id);
    if (!medicine || Number(medicine.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Invalid medicine selected.' });
    }

    const newSchedule = await db.schedules.create({
      medicine_id: parseInt(medicine_id, 10),
      user_id: req.user.id,
      dependent_id: dependent_id ? parseInt(dependent_id, 10) : null,
      frequency_type: frequency_type || 'daily',
      frequency_value: frequency_value || '1',
      dose_times: Array.isArray(dose_times) ? dose_times : [dose_times],
      meal_timing: meal_timing || 'no_food_relation',
      start_date: start_date || new Date().toISOString().split('T')[0],
      end_date: end_date || null,
      is_active: true
    });

    return res.status(201).json({ success: true, message: 'Prescription schedule created successfully.', data: newSchedule });
  } catch (err) {
    console.error('Create schedule error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create schedule.' });
  }
};

exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const schedule = await db.schedules.findById(id);
    if (!schedule || Number(schedule.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Schedule not found.' });
    }

    const updated = await db.schedules.update(id, req.user.id, req.body);
    return res.json({ success: true, message: 'Schedule updated successfully.', data: updated });
  } catch (err) {
    console.error('Update schedule error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update schedule.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const schedule = await db.schedules.findById(id);
    if (!schedule || Number(schedule.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Schedule not found.' });
    }

    await db.schedules.delete(id, req.user.id);
    return res.json({ success: true, message: 'Schedule deleted successfully.' });
  } catch (err) {
    console.error('Delete schedule error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete schedule.' });
  }
};
