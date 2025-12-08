const express = require('express');
const { getProjectReport, getFinancialReport, getInventoryReport } = require('../controllers/reportController');
const router = express.Router();

router.get('/projects', getProjectReport);
router.get('/financial', getFinancialReport);
router.get('/inventory', getInventoryReport);

module.exports = router;