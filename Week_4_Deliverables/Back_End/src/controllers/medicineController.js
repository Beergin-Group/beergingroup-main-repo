/**
 * MediRemind — Medicine Controller
 * Week 4 Deliverable
 * Author: Francis John Empil (Back-End Developer)
 */

/**
 * Get All Medicines for Authenticated User
 * GET /api/medicines
 */
exports.getAll = async (req, res, db) => {
  try {
    const dependentId = req.query.dependent_id ? parseInt(req.query.dependent_id, 10) : null;
    const medicines = await db.medicines.findByUser(req.user.id, dependentId);
    return res.json({
      success: true,
      count: medicines.length,
      data: medicines
    });
  } catch (err) {
    console.error('Get medicines error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve medicine list.' });
  }
};

/**
 * Get Single Medicine by ID
 * GET /api/medicines/:id
 */
exports.getById = async (req, res, db) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid medicine identifier.' });
    }

    const medicine = await db.medicines.findById(id);
    if (!medicine || Number(medicine.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Medicine not found or access denied.' });
    }

    return res.json({ success: true, data: medicine });
  } catch (err) {
    console.error('Get medicine error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve medicine details.' });
  }
};

/**
 * Create New Medicine
 * POST /api/medicines
 */
exports.create = async (req, res, db) => {
  try {
    const {
      name,
      dosage,
      form,
      instructions,
      stock_count,
      low_stock_threshold,
      color,
      shape,
      icon,
      dependent_id
    } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Medicine name is required.' });
    }
    if (!dosage || !dosage.trim()) {
      return res.status(400).json({ success: false, message: 'Dosage is required (e.g. 500 mg, 10 ml).' });
    }

    const validForms = ['tablet', 'capsule', 'syrup', 'injection', 'drops', 'inhaler', 'other'];
    const chosenForm = (form && validForms.includes(form.toLowerCase())) ? form.toLowerCase() : 'tablet';

    const stock = stock_count !== undefined ? Math.max(0, parseInt(stock_count, 10) || 0) : 30;
    const threshold = low_stock_threshold !== undefined ? Math.max(0, parseInt(low_stock_threshold, 10) || 0) : 5;

    const newMed = await db.medicines.create({
      user_id: req.user.id,
      dependent_id: dependent_id ? parseInt(dependent_id, 10) : null,
      name: name.trim(),
      dosage: dosage.trim(),
      form: chosenForm,
      instructions: instructions ? instructions.trim() : '',
      stock_count: stock,
      low_stock_threshold: threshold,
      color: color || '#0d9488',
      shape: shape || 'round',
      icon: icon || 'pill'
    });

    return res.status(201).json({
      success: true,
      message: 'Medicine added successfully.',
      data: newMed
    });
  } catch (err) {
    console.error('Create medicine error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create medicine record.' });
  }
};

/**
 * Update Existing Medicine
 * PUT /api/medicines/:id
 */
exports.update = async (req, res, db) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid medicine identifier.' });
    }

    const medicine = await db.medicines.findById(id);
    if (!medicine || Number(medicine.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Medicine not found or access denied.' });
    }

    // Clean inputs if provided
    const updatePayload = { ...req.body };
    if (updatePayload.name !== undefined) updatePayload.name = updatePayload.name.trim();
    if (updatePayload.dosage !== undefined) updatePayload.dosage = updatePayload.dosage.trim();
    if (updatePayload.stock_count !== undefined) updatePayload.stock_count = Math.max(0, parseInt(updatePayload.stock_count, 10) || 0);
    if (updatePayload.low_stock_threshold !== undefined) updatePayload.low_stock_threshold = Math.max(0, parseInt(updatePayload.low_stock_threshold, 10) || 0);

    const updated = await db.medicines.update(id, req.user.id, updatePayload);

    return res.json({
      success: true,
      message: 'Medicine updated successfully.',
      data: updated
    });
  } catch (err) {
    console.error('Update medicine error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update medicine record.' });
  }
};

/**
 * Delete Medicine
 * DELETE /api/medicines/:id
 */
exports.delete = async (req, res, db) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid medicine identifier.' });
    }

    const medicine = await db.medicines.findById(id);
    if (!medicine || Number(medicine.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Medicine not found or access denied.' });
    }

    await db.medicines.delete(id, req.user.id);

    return res.json({
      success: true,
      message: 'Medicine deleted successfully.'
    });
  } catch (err) {
    console.error('Delete medicine error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete medicine record.' });
  }
};

/**
 * Quick Refill Stock
 * POST /api/medicines/:id/refill
 */
exports.refill = async (req, res, db) => {
  try {
    const id = parseInt(req.params.id, 10);
    const count = parseInt(req.body.count, 10) || 30;

    const medicine = await db.medicines.findById(id);
    if (!medicine || Number(medicine.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ success: false, message: 'Medicine not found.' });
    }

    const newStock = Math.max(0, (medicine.stock_count || 0) + count);
    const updated = await db.medicines.update(id, req.user.id, { stock_count: newStock });

    return res.json({
      success: true,
      message: `Refilled +${count} units. New stock: ${updated.stock_count}`,
      data: updated
    });
  } catch (err) {
    console.error('Refill error:', err);
    return res.status(500).json({ success: false, message: 'Failed to refill medicine.' });
  }
};
