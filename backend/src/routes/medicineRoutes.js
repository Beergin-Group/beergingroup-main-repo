const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', medicineController.getAll);
router.get('/:id', medicineController.getById);
router.post('/', medicineController.create);
router.put('/:id', medicineController.update);
router.delete('/:id', medicineController.delete);
router.post('/:id/refill', medicineController.refill);

module.exports = router;
