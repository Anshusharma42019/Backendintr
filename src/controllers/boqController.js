const mongoose = require('mongoose');
const BOQ = require('../models/BOQ');
const Invoice = require('../models/Invoice');
const Material = require('../models/Material');
const StockMovement = require('../models/StockMovement');
const StockService = require('../services/stockService');

exports.createBOQ = async (req, res) => {
  try {
    // Only check stock for items that have materials (skip if skipStockCheck is true)
    const itemsWithMaterials = (req.body.items || []).filter(item => item.material);
    
    if (itemsWithMaterials.length > 0 && !req.body.skipStockCheck) {
      const stockCheck = await StockService.checkStockAvailability(itemsWithMaterials);
      const insufficientStock = stockCheck.filter(item => !item.sufficient);
      
      if (insufficientStock.length > 0) {
        return res.status(400).json({
          error: 'Insufficient stock for some materials',
          insufficientItems: insufficientStock
        });
      }
    }

    const boqData = {
      ...req.body,
      createdBy: req.body.createdBy || req.user?.id || new mongoose.Types.ObjectId()
    };
    
    const boq = new BOQ(boqData);
    await boq.save();
    
    // Reduce stock for materials in BOQ
    const stockMovements = [];
    
    for (const item of boq.items) {
      if (item.material) {
        try {
          const result = await StockService.reduceStock(
            item.material,
            item.quantity,
            boq.boqNumber,
            'project',
            boq.project,
            boqData.createdBy,
            `Material issued for BOQ: ${boq.boqNumber} - ${boq.title}`
          );
          
          stockMovements.push(result.stockMovement);
          
        } catch (stockError) {
          return res.status(400).json({ error: stockError.message });
        }
      }
    }
    
    res.status(201).json({
      success: true,
      data: boq,
      stockMovements: stockMovements.length
    });
  } catch (error) {
    console.error('BOQ Creation Error:', error);
    res.status(400).json({ 
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`) : null
    });
  }
};

exports.getBOQs = async (req, res) => {
  try {
    const boqs = await BOQ.find().populate('project items.material createdBy approvedBy');
    res.json(boqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBOQ = async (req, res) => {
  try {
    const boq = await BOQ.findById(req.params.id).populate('project items.material createdBy approvedBy');
    if (!boq) return res.status(404).json({ error: 'BOQ not found' });
    res.json(boq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBOQ = async (req, res) => {
  try {
    const boq = await BOQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!boq) return res.status(404).json({ error: 'BOQ not found' });
    res.json(boq);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBOQ = async (req, res) => {
  try {
    const boq = await BOQ.findByIdAndDelete(req.params.id);
    if (!boq) return res.status(404).json({ error: 'BOQ not found' });
    res.json({ message: 'BOQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveBOQ = async (req, res) => {
  try {
    const boq = await BOQ.findById(req.params.id).populate('items.material project');
    if (!boq) return res.status(404).json({ error: 'BOQ not found' });
    
    // Update BOQ status
    boq.status = 'approved';
    boq.approvedBy = req.body.approvedBy;
    boq.approvedAt = new Date();
    await boq.save();
    
    res.json({
      success: true,
      data: boq,
      message: 'BOQ approved successfully. Stock was already reduced during BOQ creation.'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.checkBOQStock = async (req, res) => {
  try {
    const { items } = req.body;
    const stockCheck = await StockService.checkStockAvailability(items);
    
    res.json({
      success: true,
      stockStatus: stockCheck,
      allAvailable: stockCheck.every(item => item.sufficient)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateInvoiceFromBOQ = async (req, res) => {
  try {
    const boq = await BOQ.findById(req.params.id).populate('project');
    if (!boq) return res.status(404).json({ error: 'BOQ not found' });
    
    // Check if invoice already exists for this BOQ
    const existingInvoice = await Invoice.findOne({ boq: boq._id });
    if (existingInvoice) {
      return res.status(400).json({ error: 'Invoice already generated for this BOQ' });
    }
    
    const invoiceItems = boq.items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      rate: item.rate,
      amount: item.amount || (item.quantity * item.rate),
      taxRate: 18,
      taxAmount: ((item.amount || (item.quantity * item.rate)) * 18) / 100,
      totalAmount: (item.amount || (item.quantity * item.rate)) + (((item.amount || (item.quantity * item.rate)) * 18) / 100)
    }));
    
    const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    const totalTax = (subtotal * 18) / 100;
    
    const invoice = new Invoice({
      client: boq.project.client,
      project: boq.project._id,
      boq: boq._id,
      items: invoiceItems,
      subtotal,
      cgst: totalTax / 2,
      sgst: totalTax / 2,
      totalTax,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};