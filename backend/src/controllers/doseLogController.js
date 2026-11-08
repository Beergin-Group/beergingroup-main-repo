const db = require('../db');

// Helper to check if a schedule is active on a given date
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
      const allowedDays = JSON.parse(schedule.frequency_value); // e.g. [1, 3, 5]
      const dayOfWeek = targetDate.getDay(); // 0 is Sun, 1 is Mon
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

    // 1. Get all schedules
    const schedules = await db.schedules.findByUser(req.user.id, dependentId);

    // 2. Get existing logs for this date
    const existingLogs = await db.doseLogs.findToday(req.user.id, targetDateStr, dependentId);

    // 3. For each active schedule, ensure today's dose slots exist
    const doses = [];
    const now = new Date();

    for (const sched of schedules) {
      if (!isScheduleActiveOnDate(sched, targetDateStr)) continue;

      const doseTimes = Array.isArray(sched.dose_times) ? sched.dose_times : JSON.parse(sched.dose_times || '[]');
      for (const timeStr of doseTimes) {
        const scheduledTimeIso = new Date(`${targetDateStr}T${timeStr}:00.000Z`).toISOString();
        
        // Find if already recorded in logs
        const match = existingLogs.find(
          l => Number(l.schedule_id) === Number(sched.id) &&
               new Date(l.scheduled_time).toISOString().substring(11, 16) === timeStr
        );

        if (match) {
          doses.push({
            id: match.id,
            schedule_id: sched.id,
            medicine_id: match.medicine_id,
            medicine_name: match.medicine_name || sched.medicine_name,
            dosage: match.dosage || sched.dosage,
            form: match.form || sched.form,
            color: match.color || sched.color,
            shape: match.shape || sched.shape,
            icon: match.icon || sched.icon,
            instructions: match.instructions || sched.instructions,
            meal_timing: match.meal_timing || sched.meal_timing,
            scheduled_time: match.scheduled_time,
            time_display: timeStr,
            status: match.status,
            recorded_at: match.recorded_at,
            notes: match.notes,
            stock_count: sched.stock_count
          });
        } else {
          // Virtual pending dose slot
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
            time_display: timeStr,
            status: 'pending',
            recorded_at: null,
            notes: '',
            stock_count: sched.stock_count
          });
        }
      }
    }

    // Sort doses chronologically
    doses.sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time));

    // Calculate next dose & adherence summary for today
    const totalToday = doses.length;
    const takenToday = doses.filter(d => d.status === 'taken').length;
    const skippedToday = doses.filter(d => d.status === 'skipped').length;
    const pendingToday = doses.filter(d => d.status === 'pending' || d.status === 'snoozed').length;

    // Next dose calculation
    let nextDose = null;
    let secondsToNextDose = null;

    const upcomingDose = doses.find(d => {
      const dTime = new Date(d.scheduled_time);
      return (d.status === 'pending' || d.status === 'snoozed') && dTime >= now;
    });

    if (upcomingDose) {
      nextDose = upcomingDose;
      secondsToNextDose = Math.max(0, Math.floor((new Date(upcomingDose.scheduled_time) - now) / 1000));
    } else {
      // If none in the future today, check if there is an overdue pending dose
      const overdueDose = doses.find(d => d.status === 'pending' || d.status === 'snoozed');
      if (overdueDose) {
        nextDose = overdueDose;
        secondsToNextDose = 0; // Overdue
      }
    }

    return res.json({
      success: true,
      date: targetDateStr,
      summary: {
        total: totalToday,
        taken: takenToday,
        skipped: skippedToday,
        pending: pendingToday,
        adherence_rate: totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 100
      },
      next_dose: nextDose,
      seconds_to_next_dose: secondsToNextDose,
      doses
    });
  } catch (err) {
    console.error('Get today doses error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve today doses.' });
  }
};

exports.recordDose = async (req, res) => {
  try {
    const { schedule_id, medicine_id, scheduled_time, status, notes, dependent_id } = req.body;
    if (!medicine_id || !scheduled_time || !status) {
      return res.status(400).json({ success: false, message: 'Medicine ID, scheduled time, and status are required.' });
    }

    const recordedTime = new Date().toISOString();
    const log = await db.doseLogs.recordDose({
      schedule_id: schedule_id ? parseInt(schedule_id, 10) : null,
      medicine_id: parseInt(medicine_id, 10),
      user_id: req.user.id,
      dependent_id: dependent_id ? parseInt(dependent_id, 10) : null,
      scheduled_time,
      status, // 'taken' | 'skipped' | 'snoozed' | 'pending'
      recorded_at: recordedTime,
      notes: notes || ''
    });

    let stockAlert = null;
    // Decrement stock if taken
    if (status === 'taken') {
      const updatedMed = await db.medicines.decrementStock(parseInt(medicine_id, 10), 1);
      if (updatedMed && updatedMed.stock_count <= updatedMed.low_stock_threshold) {
        stockAlert = {
          lowStock: true,
          medicineName: updatedMed.name,
          currentStock: updatedMed.stock_count,
          threshold: updatedMed.low_stock_threshold,
          message: `Low Stock Alert: Only ${updatedMed.stock_count} units remaining of ${updatedMed.name}!`
        };
      }
    }

    return res.json({
      success: true,
      message: `Dose recorded as ${status}.`,
      data: log,
      stockAlert
    });
  } catch (err) {
    console.error('Record dose error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record dose.' });
  }
};

exports.snooze = async (req, res) => {
  try {
    const { schedule_id, medicine_id, scheduled_time, minutes = 15, dependent_id } = req.body;
    if (!medicine_id || !scheduled_time) {
      return res.status(400).json({ success: false, message: 'Medicine ID and scheduled time are required.' });
    }

    const snoozeUntil = new Date(Date.now() + minutes * 60000).toISOString();
    const log = await db.doseLogs.recordDose({
      schedule_id: schedule_id ? parseInt(schedule_id, 10) : null,
      medicine_id: parseInt(medicine_id, 10),
      user_id: req.user.id,
      dependent_id: dependent_id ? parseInt(dependent_id, 10) : null,
      scheduled_time,
      status: 'snoozed',
      recorded_at: new Date().toISOString(),
      notes: `Snoozed for ${minutes} minutes until ${new Date(snoozeUntil).toLocaleTimeString()}`
    });

    return res.json({
      success: true,
      message: `Dose snoozed for ${minutes} minutes.`,
      snooze_until: snoozeUntil,
      data: log
    });
  } catch (err) {
    console.error('Snooze error:', err);
    return res.status(500).json({ success: false, message: 'Failed to snooze dose.' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const dependentId = req.query.dependent_id ? parseInt(req.query.dependent_id, 10) : null;
    const { startDate, endDate } = req.query;

    const history = await db.doseLogs.getHistory(req.user.id, {
      startDate,
      endDate,
      dependentId
    });

    return res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (err) {
    console.error('Get dose history error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dose history.' });
  }
};
