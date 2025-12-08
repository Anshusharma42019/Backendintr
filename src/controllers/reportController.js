const Project = require('../models/Project');
const Invoice = require('../models/Invoice');
const Material = require('../models/Material');

exports.getProjectReport = async (req, res) => {
  try {
    const projects = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFinancialReport = async (req, res) => {
  try {
    const invoices = await Invoice.aggregate([
      { $group: { _id: '$status', total: { $sum: '$amount' } } }
    ]);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInventoryReport = async (req, res) => {
  try {
    const lowStock = await Material.find({ $expr: { $lt: ['$currentStock', '$minStock'] } });
    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};