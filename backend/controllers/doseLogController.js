const DoseLog = require('../models/DoseLog');
const Schedule = require('../models/Schedule');
const Medicine = require('../models/Medicine');

function isScheduleActiveOnDate(schedule, targetDateStr) {
  if (!schedule.is_active) return false;
  const targetDate = new Date(`${targetDateStr}T00:00:00`);
  const startDate = new Date(`${schedule.start_date}T00:00:00`);
  if (targetDate < startDate) return false;
  if (schedule.end_date) {
    const endDate = new Date(`${schedule.end_date}T23:59:59`);
    if (targetDate > endDate) return false;
  }

  if (schedule.frequency_type === 'specific_days') {
    try {
      const allowedDays = JSON.parse(schedule.frequency_value);
      const dayOfWeek = targetDate.getDay();
      if (Array.isArray(allowedDays) && !allowedDays.includes(dayOfWeek)) {
        return false;
      }
    } catch (e) {
      // fallback
    }
  }

  return true;
}

exports.getToday = async (req, res) => {
  try {
    const dependentId = req.query.dependent_id ? parseInt(req.query.dependent_id, 10) : null;
    const targetDateStr = req.query.date || new Date().toISOString().split('T')[0];

    const schedules = await Schedule.findByUser(req.user.id, dependentId);
    const existingLogs = await DoseLog.findToday(req.user.id, targetDateStr, dependentId);

    const doses = [];
    const now = new Date();

    for (const sched of schedules) {
      if (!isScheduleActiveOnDate(sched, targetDateStr)) continue;

      const doseTimes = Array.isArray(sched.dose_times) ? sched.dose_times : JSON.parse(sched.dose_times || '[]');
      for (const timeStr of doseTimes) {
        const scheduledTimeIso = new Date(`${targetDateStr}T${timeStr}:00.000Z`).toISOString();
        
        const match = existingLogs.find(
          l => Number(l.schedule_id) === Number(sched.id) &&
               new Date(l.scheduled_time).toISOString().substring(11, 16) === timeStr
        );

        if (match) {
          doses.push({
            id: match.id,
            schedule_id: sched.id,
            medicine_id: sched.medicine_id,
            medicine_name: sched.medicine_name,
            dosage: sched.dosage,
            form: sched.form,
            color: sched.color,
            shape: sched.shape,
            icon: sched.icon,
            instructions: sched.instructions,
            meal_timing: sched.meal_timing,
            scheduled_time: match.scheduled_time,
            status: match.status,
            recorded_at: match.recorded_at,
            notes: match.notes
          });
        } else {
          const doseDate = new Date(`${targetDateStr}T${timeStr}:00`);
          const status = doseDate < now ? 'pending' : 'upcoming';

          doses.push({
            id: null,
            schedule_id: sched.id,
            medicine_id: sched.medicine_id,
            medicine_name: sched.medicine_name,
            dosage: sched.dosage,
            form: sched.form,
            color: sched.color,
            shape: sched.shape,
            icon: sched.icon,
            instructions: sched.instructions,
            meal_timing: sched.meal_timing,
            scheduled_time: scheduledTimeIso,
            status,
            recorded_at: null,
            notes: ''
          });
        }
      }
    }

    doses.sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time));

    const totalToday = doses.length;
    const takenCount = doses.filter(d => d.status === 'taken').length;
    const skippedCount = doses.filter(d => d.status === 'skipped').length;
    const pendingCount = doses.filter(d => d.status === 'pending' || d.status === 'upcoming').length;
    const completionRate = totalToday > 0 ? Math.round((takenCount / totalToday) * 100) : 0;

    const upcomingDoses = doses.filter(d => d.status === 'upcoming' || d.status === 'pending');
    const nextDose = upcomingDoses.length > 0 ? upcomingDoses[0] : null;

    return res.json({
      success: true,
      date: targetDateStr,
      summary: {
        total: totalToday,
        taken: takenCount,
        skipped: skippedCount,
        pending: pendingCount,
        completion_rate: completionRate
      },
      next_dose: nextDose,
      data: doses
    });
  } catch (err) {
    console.error('Get today doses error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve today doses.' });
  }
};

exports.record = async (req, res) => {
  try {
    const { schedule_id, medicine_id, scheduled_time, status, notes, dependent_id } = req.body;
    if (!medicine_id || !scheduled_time || !status) {
      return res.status(400).json({ success: false, message: 'Medicine ID, scheduled time, and status are required.' });
    }

    const medicine = await Medicine.findById(parseInt(medicine_id, 10));
    if (!medicine || Number(medicine.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    const log = await DoseLog.recordDose({
      schedule_id: schedule_id ? parseInt(schedule_id, 10) : null,
      medicine_id: parseInt(medicine_id, 10),
      user_id: req.user.id,
      dependent_id: dependent_id ? parseInt(dependent_id, 10) : null,
      scheduled_time,
      status,
      recorded_at: new Date().toISOString(),
      notes: notes || ''
    });

    if (status === 'taken') {
      await Medicine.decrementStock(medicine.id, 1);
    }

    return res.status(201).json({
      success: true,
      message: `Dose recorded as ${status}.`,
      data: log
    });
  } catch (err) {
    console.error('Record dose error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record dose.' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const dependentId = req.query.dependent_id ? parseInt(req.query.dependent_id, 10) : null;
    const { start_date, end_date } = req.query;

    const history = await DoseLog.getHistory(req.user.id, {
      startDate: start_date,
      endDate: end_date,
      dependentId
    });

    return res.json({ success: true, count: history.length, data: history });
  } catch (err) {
    console.error('Get dose history error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dose history.' });
  }
};
