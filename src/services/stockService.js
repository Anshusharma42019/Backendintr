const Material = require('../models/Material');
const StockMovement = require('../models/StockMovement');

class StockService {
  static async reduceStock(materialId, quantity, reference, referenceType, project, createdBy, remarks) {
    const material = await Material.findById(materialId);
    if (!material) {
      throw new Error('Material not found');
    }

    if (material.currentStock < quantity) {
      throw new Error(`Insufficient stock for ${material.name}. Available: ${material.currentStock}, Required: ${quantity}`);
    }

    // Create stock movement
    const rate = material.currentRate || material.standardRate;
    const stockMovement = new StockMovement({
      material: materialId,
      type: 'out',
      subType: 'issue',
      quantity,
      rate,
      amount: quantity * rate,
      balanceQuantity: material.currentStock - quantity,
      reference,
      referenceType,
      project,
      createdBy,
      remarks
    });

    await stockMovement.save();

    // Update material stock
    material.currentStock -= quantity;
    material.availableStock = material.currentStock - (material.reservedStock || 0);
    await material.save();

    return {
      stockMovement,
      material
    };
  }

  static async checkStockAvailability(items) {
    const stockCheck = [];
    
    for (const item of items) {
      if (item.material) {
        const material = await Material.findById(item.material);
        if (material) {
          stockCheck.push({
            materialId: item.material,
            materialName: material.name,
            required: item.quantity,
            available: material.currentStock,
            sufficient: material.currentStock >= item.quantity
          });
        }
      }
    }
    
    return stockCheck;
  }


}

module.exports = StockService;