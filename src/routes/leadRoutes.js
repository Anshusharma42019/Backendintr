const express = require('express');
const { createLead, getLeads, getLead, updateLead, deleteLead } = require('../controllers/leadController');
const router = express.Router();

router.post('/', createLead);
router.get('/', getLeads);
router.get('/:id', getLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

module.exports = router;