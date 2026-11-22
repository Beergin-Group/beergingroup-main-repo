const Adherence = require('../models/Adherence');

exports.getSummary = async (req, res) => {
  try {
    const dependentId = req.query.dependent_id ? parseInt(req.query.dependent_id, 10) : null;
    const summary = await Adherence.getSummary(req.user.id, dependentId);
    return res.json({
      success: true,
      data: summary
    });
  } catch (err) {
    console.error('Get adherence error:', err);
    return res.status(500).json({ success: false, message: 'Failed to calculate adherence.' });
  }
};

exports.getWeekly = async (req, res) => {
  try {
    const dependentId = req.query.dependent_id ? parseInt(req.query.dependent_id, 10) : null;
    const weekly = await Adherence.getWeeklyReport(req.user.id, dependentId);
    return res.json({
      success: true,
      data: weekly
    });
  } catch (err) {
    console.error('Get weekly report error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate weekly report.' });
  }
};
