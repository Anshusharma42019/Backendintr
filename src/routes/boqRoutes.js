const express = require('express');
const { createBOQ, getBOQs, getBOQ, updateBOQ, deleteBOQ, approveBOQ, generateInvoiceFromBOQ, checkBOQStock } = require('../controllers/boqController');
const router = express.Router();

router.post('/', createBOQ);
router.post('/check-stock', checkBOQStock);
router.get('/', getBOQs);
router.get('/:id', getBOQ);
router.put('/:id', updateBOQ);
router.delete('/:id', deleteBOQ);
router.patch('/:id/approve', approveBOQ);
router.post('/:id/generate-invoice', generateInvoiceFromBOQ);

module.exports = router;