const db = require('../db');

exports.getAll = async (req, res) => {
  try {
    const dependentId = req.query.dependent_id ? parseInt(req.query.dependent_id, 10) : null;
    const medicines = await db.medicines.findByUser(req.user.id, dependentId);
    return res.json({ success: true, count: medicines.length, data: medicines });
  } catch (err) {
    console.error('Get medicines error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve medicines.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const medicine = await db.medicines.findById(id);
    if (!medicine || Number(medicine.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }
    return res.json({ success: true, data: medicine });
  } catch (err) {
    console.error('Get medicine error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve medicine.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, dosage, form, instructions, stock_count, low_stock_threshold, color, shape, icon, dependent_id } = req.body;
    if (!name || !dosage) {
      return res.status(400).json({ success: false, message: 'Medicine name and dosage are required.' });
    }

    const newMed = await db.medicines.create({
      user_id: req.user.id,
      dependent_id: dependent_id ? parseInt(dependent_id, 10) : null,
      name,
      dosage,
      form: form || 'tablet',
      instructions: instructions || '',
      stock_count: stock_count !== undefined ? parseInt(stock_count, 10) : 30,
      low_stock_threshold: low_stock_threshold !== undefined ? parseInt(low_stock_threshold, 10) : 5,
      color: color || '#0d9488',
      shape: shape || 'round',
      icon: icon || 'pill'
    });

    return res.status(201).json({ success: true, message: 'Medicine added successfully.', data: newMed });
  } catch (err) {
    console.error('Create medicine error:', err);
    return res.status(500).json({ success: false, message: 'Failed to add medicine.' });
  }
};

exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const medicine = await db.medicines.findById(id);
    if (!medicine || Number(medicine.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    const updated = await db.medicines.update(id, req.user.id, req.body);
    return res.json({ success: true, message: 'Medicine updated successfully.', data: updated });
  } catch (err) {
    console.error('Update medicine error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update medicine.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const medicine = await db.medicines.findById(id);
    if (!medicine || Number(medicine.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    await db.medicines.delete(id, req.user.id);
    return res.json({ success: true, message: 'Medicine deleted successfully.' });
  } catch (err) {
    console.error('Delete medicine error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete medicine.' });
  }
};

exports.refill = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const count = parseInt(req.body.count, 10) || 30;
    const medicine = await db.medicines.findById(id);
    if (!medicine || Number(medicine.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    const updatedStock = (medicine.stock_count || 0) + count;
    const updated = await db.medicines.update(id, req.user.id, { stock_count: updatedStock });
    return res.json({ success: true, message: `Refilled +${count} units. New stock: ${updated.stock_count}`, data: updated });
  } catch (err) {
    console.error('Refill medicine error:', err);
    return res.status(500).json({ success: false, message: 'Failed to refill medicine.' });
  }
};
