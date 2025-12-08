const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  transactionId: { type: String, unique: true },
  material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
  type: { type: String, enum: ['in', 'out', 'transfer', 'adjustment'], required: true },
  subType: { type: String, enum: ['purchase', 'sale', 'issue', 'return', 'wastage', 'opening', 'closing', 'transfer-in', 'transfer-out'] },
  quantity: { type: Number, required: true },
  rate: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true },
  balanceQuantity: { type: Number, required: true },
  batchNumber: String,
  serialNumbers: [String],
  expiryDate: Date,
  location: String,
  fromLocation: String,
  toLocation: String,
  reference: String,
  referenceType: { type: String, enum: ['purchase-order', 'sales-order', 'project', 'manual', 'transfer'] },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  remarks: String,
  documents: [{
    name: String,
    url: String,
    type: String
  }]
}, { timestamps: true });

stockMovementSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    const count = await this.constructor.countDocuments();
    this.transactionId = `STK${String(count + 1).padStart(6, '0')}`;
  }
  
  this.amount = this.quantity * this.rate;
  next();
});

stockMovementSchema.index({ transactionId: 1 });
stockMovementSchema.index({ material: 1, createdAt: -1 });
stockMovementSchema.index({ type: 1 });
stockMovementSchema.index({ project: 1 });
stockMovementSchema.index({ createdAt: -1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);