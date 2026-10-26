const db = require('../db');

exports.getSummary = async (req, res) => {
  try {
    const dependentId = req.query.dependent_id ? parseInt(req.query.dependent_id, 10) : null;
    const medicines = await db.medicines.findByUser(req.user.id, dependentId);
    const logs = await db.doseLogs.getHistory(req.user.id, { dependentId });

    const totalLogs = logs.length;
    const takenLogs = logs.filter(l => l.status === 'taken');
    const skippedLogs = logs.filter(l => l.status === 'skipped');
    const missedLogs = logs.filter(l => l.status === 'pending' && new Date(l.scheduled_time) < new Date());

    const adherenceRate = totalLogs > 0 ? Math.round((takenLogs.length / totalLogs) * 100) : 100;

    // Calculate current streak
    // Group logs by day (YYYY-MM-DD)
    const daysMap = {};
    for (const log of logs) {
      const day = new Date(log.scheduled_time).toISOString().split('T')[0];
      if (!daysMap[day]) {
        daysMap[day] = { total: 0, taken: 0, skipped: 0 };
      }
      daysMap[day].total++;
      if (log.status === 'taken') daysMap[day].taken++;
      if (log.status === 'skipped') daysMap[day].skipped++;
    }

    // Sort days descending
    const sortedDays = Object.keys(daysMap).sort().reverse();
    let currentStreak = 0;
    const todayStr = new Date().toISOString().split('T')[0];

    for (const day of sortedDays) {
      // For today, if some are still pending, don't break streak if what was taken so far was not skipped
      if (day === todayStr) {
        if (daysMap[day].skipped === 0 && daysMap[day].taken > 0) {
          currentStreak++;
        }
        continue;
      }
      const dayData = daysMap[day];
      if (dayData.total > 0 && dayData.taken === dayData.total) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Medicine breakdown
    const medicineBreakdown = medicines.map(med => {
      const medLogs = logs.filter(l => Number(l.medicine_id) === Number(med.id));
      const medTaken = medLogs.filter(l => l.status === 'taken').length;
      const rate = medLogs.length > 0 ? Math.round((medTaken / medLogs.length) * 100) : 100;
      return {
        id: med.id,
        name: med.name,
        dosage: med.dosage,
        color: med.color,
        icon: med.icon,
        total_doses: medLogs.length,
        taken_doses: medTaken,
        adherence_rate: rate,
        stock_count: med.stock_count,
        is_low_stock: med.stock_count <= med.low_stock_threshold
      };
    });

    return res.json({
      success: true,
      data: {
        adherence_rate: adherenceRate,
        current_streak: Math.max(currentStreak, 1),
        total_doses: totalLogs,
        taken_doses: takenLogs.length,
        skipped_doses: skippedLogs.length,
        missed_doses: missedLogs.length,
        medicine_breakdown: medicineBreakdown,
        recent_missed: skippedLogs.slice(0, 5)
      }
    });
  } catch (err) {
    console.error('Adherence summary error:', err);
    return res.status(500).json({ success: false, message: 'Failed to calculate adherence summary.' });
  }
};

exports.getWeekly = async (req, res) => {
  try {
    const dependentId = req.query.dependent_id ? parseInt(req.query.dependent_id, 10) : null;
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);

    const logs = await db.doseLogs.getHistory(req.user.id, {
      startDate: sevenDaysAgo.toISOString().split('T')[0] + 'T00:00:00.000Z',
      endDate: now.toISOString().split('T')[0] + 'T23:59:59.999Z',
      dependentId
    });

    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];

      const dayLogs = logs.filter(l => new Date(l.scheduled_time).toISOString().split('T')[0] === dateStr);
      const taken = dayLogs.filter(l => l.status === 'taken').length;
      const skipped = dayLogs.filter(l => l.status === 'skipped').length;
      const total = dayLogs.length;
      const rate = total > 0 ? Math.round((taken / total) * 100) : (i === 0 ? 100 : 100);

      days.push({
        date: dateStr,
        day: dayName,
        total,
        taken,
        skipped,
        rate
      });
    }

    return res.json({
      success: true,
      data: days
    });
  } catch (err) {
    console.error('Weekly adherence error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve weekly adherence.' });
  }
};

exports.exportReport = async (req, res) => {
  try {
    const dependentId = req.query.dependent_id ? parseInt(req.query.dependent_id, 10) : null;
    const medicines = await db.medicines.findByUser(req.user.id, dependentId);
    const logs = await db.doseLogs.getHistory(req.user.id, { dependentId });

    // Format CSV
    const csvRows = [];
    csvRows.push(['Date', 'Time', 'Medicine', 'Dosage', 'Status', 'Recorded At', 'Notes'].join(','));

    for (const l of logs) {
      const d = new Date(l.scheduled_time);
      const date = d.toISOString().split('T')[0];
      const time = d.toISOString().substring(11, 16);
      csvRows.push([
        `"${date}"`,
        `"${time}"`,
        `"${l.medicine_name || 'Medicine'}"`,
        `"${l.dosage || ''}"`,
        `"${l.status}"`,
        `"${l.recorded_at ? new Date(l.recorded_at).toLocaleString() : ''}"`,
        `"${(l.notes || '').replace(/"/g, '""')}"`
      ].join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="mediremind_adherence_report.csv"');
    return res.send(csvRows.join('\n'));
  } catch (err) {
    console.error('Export error:', err);
    return res.status(500).json({ success: false, message: 'Failed to export report.' });
  }
};
