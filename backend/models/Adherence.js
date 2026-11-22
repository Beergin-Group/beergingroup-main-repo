const Medicine = require('./Medicine');
const DoseLog = require('./DoseLog');

const Adherence = {
  async getSummary(userId, dependentId = null) {
    const medicines = await Medicine.findByUser(userId, dependentId);
    const logs = await DoseLog.getHistory(userId, { dependentId });

    const totalLogs = logs.length;
    const takenLogs = logs.filter(l => l.status === 'taken');
    const skippedLogs = logs.filter(l => l.status === 'skipped');
    const missedLogs = logs.filter(l => l.status === 'pending' && new Date(l.scheduled_time) < new Date());

    const adherenceRate = totalLogs > 0 ? Math.round((takenLogs.length / totalLogs) * 100) : 0;

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

    const sortedDays = Object.keys(daysMap).sort().reverse();
    let currentStreak = 0;
    const todayStr = new Date().toISOString().split('T')[0];

    for (const day of sortedDays) {
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

    return {
      overall_rate: adherenceRate,
      current_streak_days: currentStreak,
      total_logged_doses: totalLogs,
      taken_doses: takenLogs.length,
      skipped_doses: skippedLogs.length,
      missed_doses: missedLogs.length,
      medicine_breakdown: medicineBreakdown
    };
  },

  async getWeeklyReport(userId, dependentId = null) {
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    const startDate = `${days[0]}T00:00:00.000Z`;
    const endDate = `${days[days.length - 1]}T23:59:59.999Z`;

    const logs = await DoseLog.getHistory(userId, { startDate, endDate, dependentId });

    return days.map(dateStr => {
      const dayLogs = logs.filter(l => new Date(l.scheduled_time).toISOString().split('T')[0] === dateStr);
      const total = dayLogs.length;
      const taken = dayLogs.filter(l => l.status === 'taken').length;
      const rate = total > 0 ? Math.round((taken / total) * 100) : 0;
      return {
        date: dateStr,
        day_name: new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' }),
        total_doses: total,
        taken_doses: taken,
        rate
      };
    });
  }
};

module.exports = Adherence;
