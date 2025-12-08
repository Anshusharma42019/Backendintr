const express = require('express');
const { 
  createMaterial, getMaterials, getMaterial, updateMaterial, deleteMaterial,
  createStockMovement, getStockMovements, getOutOfStockMaterials
} = require('../controllers/inventoryController');
const router = express.Router();

// Material routes
router.post('/materials', createMaterial);
router.get('/materials', getMaterials);

router.get('/materials/out-of-stock', getOutOfStockMaterials);
router.get('/materials/:id', getMaterial);
router.put('/materials/:id', updateMaterial);

router.delete('/materials/:id', deleteMaterial);

// Stock movement routes
router.post('/stock-movements', createStockMovement);
router.get('/stock-movements', getStockMovements);



module.exports = router;