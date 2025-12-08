const express = require('express');
const { 
  createInvoice, getInvoices, getInvoice, updateInvoice, deleteInvoice,
  createPayment, getPayments, getPayment, updatePayment, deletePayment
} = require('../controllers/accountController');
const router = express.Router();

// Invoice routes
router.post('/invoices', createInvoice);
router.get('/invoices', getInvoices);
router.get('/invoices/:id', getInvoice);
router.put('/invoices/:id', updateInvoice);
router.delete('/invoices/:id', deleteInvoice);

// Payment routes
router.post('/payments', createPayment);
router.get('/payments', getPayments);
router.get('/payments/:id', getPayment);
router.put('/payments/:id', updatePayment);
router.delete('/payments/:id', deletePayment);

module.exports = router;