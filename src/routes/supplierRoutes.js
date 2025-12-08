const express = require('express');
const { createSupplier, getSuppliers, getSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const router = express.Router();

router.post('/', createSupplier);
router.get('/', getSuppliers);
router.get('/:id', getSupplier);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);

module.exports = router;