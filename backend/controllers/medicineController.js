const Medicine = require('../models/Medicine');

exports.getAll = async (req, res) => {
  try {
    const dependentId = req.query.dependent_id ? parseInt(req.query.dependent_id, 10) : null;
    const medicines = await Medicine.findByUser(req.user.id, dependentId);
    return res.json({ success: true, count: medicines.length, data: medicines });
  } catch (err) {
    console.error('Get medicines error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve medicines.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const medicine = await Medicine.findById(id);
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
    if (!name || !name.trim() || !dosage || !dosage.trim()) {
      return res.status(400).json({ success: false, message: 'Medicine name and dosage are required.' });
    }

    const cleanForm = (form || 'tablet').toLowerCase();
    const cleanColor = (color || '#0d9488').toLowerCase();
    const depId = dependent_id ? parseInt(dependent_id, 10) : null;

    // Check for exact duplicate under same user and dependent
    const duplicate = await Medicine.findDuplicate(req.user.id, depId, {
      name,
      dosage,
      form: cleanForm,
      color: cleanColor
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: 'A medicine with identical name, dosage, form, and color already exists.'
      });
    }

    const newMed = await Medicine.create({
      user_id: req.user.id,
      dependent_id: depId,
      name: name.trim(),
      dosage: dosage.trim(),
      form: cleanForm,
      instructions: instructions || '',
      stock_count: stock_count !== undefined ? parseInt(stock_count, 10) : 30,
      low_stock_threshold: low_stock_threshold !== undefined ? parseInt(low_stock_threshold, 10) : 5,
      color: cleanColor,
      shape: shape || 'round',
      icon: icon || 'pill'
    });

    return res.status(201).json({ success: true, message: 'Medicine added successfully.', data: newMed });
  } catch (err) {
    console.error('Create medicine error:', err);
    if (err.code === '23505' || err.message?.includes('already exists')) {
      return res.status(409).json({ success: false, message: 'A medicine with identical parameters already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Failed to add medicine.' });
  }
};

exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await Medicine.findById(id);
    if (!existing || Number(existing.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    const { name, dosage, form, instructions, stock_count, low_stock_threshold, color, shape, icon } = req.body;

    const checkName = name ? name.trim() : existing.name;
    const checkDosage = dosage ? dosage.trim() : existing.dosage;
    const checkForm = form ? form.toLowerCase() : existing.form;
    const checkColor = color ? color.toLowerCase() : existing.color;

    const duplicate = await Medicine.findDuplicate(req.user.id, existing.dependent_id, {
      name: checkName,
      dosage: checkDosage,
      form: checkForm,
      color: checkColor
    }, id);

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: 'Another medicine with identical name, dosage, form, and color already exists.'
      });
    }

    const updated = await Medicine.update(id, req.user.id, req.body);
    return res.json({ success: true, message: 'Medicine updated successfully.', data: updated });
  } catch (err) {
    console.error('Update medicine error:', err);
    if (err.code === '23505' || err.message?.includes('already exists')) {
      return res.status(409).json({ success: false, message: 'A medicine with identical parameters already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Failed to update medicine.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await Medicine.findById(id);
    if (!existing || Number(existing.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    await Medicine.delete(id, req.user.id);
    return res.json({ success: true, message: 'Medicine deleted successfully.' });
  } catch (err) {
    console.error('Delete medicine error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete medicine.' });
  }
};

exports.refill = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { amount } = req.body;
    const refillQty = parseInt(amount, 10) || 30;

    const existing = await Medicine.findById(id);
    if (!existing || Number(existing.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    const updated = await Medicine.refillStock(id, req.user.id, refillQty);
    return res.json({ success: true, message: `Refilled +${refillQty} units.`, data: updated });
  } catch (err) {
    console.error('Refill medicine error:', err);
    return res.status(500).json({ success: false, message: 'Failed to refill medicine.' });
  }
};
