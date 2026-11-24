const Schedule = require('../models/Schedule');
const Medicine = require('../models/Medicine');

exports.getAll = async (req, res) => {
  try {
    const dependentId = req.query.dependent_id ? parseInt(req.query.dependent_id, 10) : null;
    const schedules = await Schedule.findByUser(req.user.id, dependentId);
    return res.json({ success: true, count: schedules.length, data: schedules });
  } catch (err) {
    console.error('Get schedules error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve schedules.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const schedule = await Schedule.findById(id);
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
    const { medicine_id, frequency_type, frequency_value, dose_times, meal_timing, start_date, end_date, dependent_id } = req.body;
    if (!medicine_id) {
      return res.status(400).json({ success: false, message: 'Medicine ID is required.' });
    }

    const medId = parseInt(medicine_id, 10);
    const medicine = await Medicine.findById(medId);
    if (!medicine || Number(medicine.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Referenced medicine not found.' });
    }

    const isPRN = frequency_type === 'as_needed';
    // For PRN, dose times can be empty. For scheduled, require dose_times or default to ['08:00']
    let cleanDoseTimes = dose_times;
    if (!isPRN) {
      if (!cleanDoseTimes || (Array.isArray(cleanDoseTimes) && cleanDoseTimes.length === 0)) {
        return res.status(400).json({ success: false, message: 'At least one dose time is required for fixed schedules.' });
      }
    } else {
      cleanDoseTimes = Array.isArray(cleanDoseTimes) ? cleanDoseTimes : [];
    }

    const startDateVal = start_date || new Date().toISOString().split('T')[0];
    const depId = dependent_id ? parseInt(dependent_id, 10) : (medicine.dependent_id || null);

    // Guard against duplicate schedule
    const duplicate = await Schedule.findDuplicate(req.user.id, depId, {
      medicine_id: medId,
      frequency_type: frequency_type || 'daily',
      start_date: startDateVal,
      dose_times: cleanDoseTimes
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: 'A duplicate schedule slot already exists for this medicine, date, and dose times.'
      });
    }

    const newSchedule = await Schedule.create({
      medicine_id: medId,
      user_id: req.user.id,
      dependent_id: depId,
      frequency_type: frequency_type || 'daily',
      frequency_value: frequency_value || '1',
      dose_times: cleanDoseTimes,
      meal_timing: meal_timing || 'no_food_relation',
      start_date: startDateVal,
      end_date: end_date || null,
      is_active: true
    });

    return res.status(201).json({ success: true, message: 'Schedule created successfully.', data: newSchedule });
  } catch (err) {
    console.error('Create schedule error:', err);
    if (err.code === '23505' || err.message?.includes('already exists')) {
      return res.status(409).json({ success: false, message: 'A duplicate schedule slot already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Failed to create schedule.' });
  }
};

exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await Schedule.findById(id);
    if (!existing || Number(existing.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Schedule not found.' });
    }

    const { frequency_type, frequency_value, dose_times, meal_timing, start_date, end_date, is_active } = req.body;

    const checkTimes = dose_times !== undefined ? dose_times : existing.dose_times;
    const checkFreq = frequency_type || existing.frequency_type;
    const checkStartDate = start_date || existing.start_date;

    const duplicate = await Schedule.findDuplicate(req.user.id, existing.dependent_id, {
      medicine_id: existing.medicine_id,
      frequency_type: checkFreq,
      start_date: checkStartDate,
      dose_times: checkTimes
    }, id);

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: 'Another schedule with identical medicine, date, and dose times already exists.'
      });
    }

    const updated = await Schedule.update(id, req.user.id, {
      frequency_type: checkFreq,
      frequency_value: frequency_value !== undefined ? frequency_value : existing.frequency_value,
      dose_times: checkTimes,
      meal_timing: meal_timing !== undefined ? meal_timing : existing.meal_timing,
      start_date: checkStartDate,
      end_date: end_date !== undefined ? end_date : existing.end_date,
      is_active: is_active !== undefined ? is_active : existing.is_active
    });

    return res.status(200).json({ success: true, message: 'Schedule updated successfully.', data: updated });
  } catch (err) {
    console.error('Update schedule error:', err);
    if (err.code === '23505' || err.message?.includes('already exists')) {
      return res.status(409).json({ success: false, message: 'A duplicate schedule slot already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Failed to update schedule.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await Schedule.findById(id);
    if (!existing || Number(existing.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Schedule not found.' });
    }

    await Schedule.delete(id, req.user.id);
    return res.json({ success: true, message: 'Schedule deleted successfully.' });
  } catch (err) {
    console.error('Delete schedule error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete schedule.' });
  }
};
