const Material = require('../models/Material');
const StockMovement = require('../models/StockMovement');

exports.createMaterial = async (req, res) => {
  try {
    const material = new Material(req.body);
    await material.save();
    res.status(201).json(material);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getMaterials = async (req, res) => {
  try {
    const materials = await Material.find();
    res.json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json(material);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json(material);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found' });
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createStockMovement = async (req, res) => {
  try {
    const material = await Material.findById(req.body.material);
    if (!material) return res.status(404).json({ error: 'Material not found' });
    
    let newBalance = material.currentStock;
    if (req.body.type === 'in') {
      newBalance += req.body.quantity;
    } else if (req.body.type === 'out') {
      if (material.currentStock < req.body.quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
      newBalance -= req.body.quantity;
    }
    
    const movement = new StockMovement({
      ...req.body,
      balanceQuantity: newBalance,
      createdBy: req.user?.id || req.body.createdBy
    });
    
    await movement.save();
    
    // Update material stock
    material.currentStock = newBalance;
    material.availableStock = material.currentStock - material.reservedStock;
    await material.save();
    
    res.status(201).json({ success: true, data: movement });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getStockMovements = async (req, res) => {
  try {
    const movements = await StockMovement.find()
      .populate('material project createdBy')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: movements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};





exports.getOutOfStockMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ 
      currentStock: 0,
      isActive: true
    }).select('name currentStock category unit');
    
    res.json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};