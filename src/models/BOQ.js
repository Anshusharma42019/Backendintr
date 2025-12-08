const mongoose = require('mongoose');

const boqItemSchema = new mongoose.Schema({
  itemCode: String,
  description: { type: String, required: true },
  material: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
  category: String,
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  rate: { type: Number, required: true, min: 0 },
  amount: { type: Number, min: 0 },
  laborCost: { type: Number, default: 0 },
  overheadCost: { type: Number, default: 0 },
  profitMargin: { type: Number, default: 0 },
  totalCost: Number,
  remarks: String
});

boqItemSchema.pre('save', function(next) {
  this.amount = this.quantity * this.rate;
  this.totalCost = this.amount + this.laborCost + this.overheadCost + this.profitMargin;
  next();
});

const boqSchema = new mongoose.Schema({
  boqNumber: { type: String, unique: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  version: { type: Number, default: 1 },
  title: { type: String, required: true },
  description: String,
  items: [boqItemSchema],
  subtotal: { type: Number, default: 0 },
  taxRate: { type: Number, default: 18 }, // GST percentage
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number },
  currency: { type: String, default: 'INR' },
  validityDays: { type: Number, default: 30 },
  status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected', 'revised'], default: 'draft' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  rejectionReason: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
  attachments: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

boqSchema.pre('save', async function(next) {
  if (!this.boqNumber) {
    const count = await this.constructor.countDocuments();
    this.boqNumber = `BOQ${String(count + 1).padStart(4, '0')}`;
  }
  
  this.subtotal = this.items.reduce((sum, item) => sum + (item.totalCost || item.amount), 0);
  this.taxAmount = (this.subtotal * this.taxRate) / 100;
  this.totalAmount = this.subtotal + this.taxAmount;
  
  next();
});

boqSchema.index({ boqNumber: 1 });
boqSchema.index({ project: 1 });
boqSchema.index({ status: 1 });

module.exports = mongoose.model('BOQ', boqSchema);