const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: String,
  email: String,
  rate: Number,
  leadTime: Number, // days
  isPreferred: { type: Boolean, default: false }
}, { _id: false });

const materialSchema = new mongoose.Schema({
  materialCode: { type: String, unique: true },
  name: { type: String, required: true, trim: true },
  description: String,
  category: { type: String, required: true },
  subCategory: String,
  brand: String,
  model: String,
  specifications: String,
  unit: { type: String, required: true },
  baseUnit: String,
  conversionFactor: { type: Number, default: 1 },
  currentStock: { type: Number, default: 0, min: 0 },
  reservedStock: { type: Number, default: 0, min: 0 },
  availableStock: { type: Number, default: 0, min: 0 },

  maxStock: { type: Number, default: 1000 },
  standardRate: { type: Number, required: true, min: 0 },
  currentRate: { type: Number, min: 0 },
  lastPurchaseRate: { type: Number, min: 0 },
  avgRate: { type: Number, min: 0 },
  currency: { type: String, default: 'INR' },
  taxRate: { type: Number, default: 18 },
  location: String,
  binLocation: String,
  suppliers: [supplierSchema],
  isActive: { type: Boolean, default: true },
  isConsumable: { type: Boolean, default: true },
  hasSerialNumber: { type: Boolean, default: false },
  hasBatchNumber: { type: Boolean, default: false },
  shelfLife: Number, // days
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: { type: String, default: 'cm' }
  },
  images: [String],
  documents: [{
    name: String,
    url: String,
    type: String
  }],
  tags: [String],
  notes: String
}, { timestamps: true });

materialSchema.pre('save', async function(next) {
  if (!this.materialCode) {
    const count = await this.constructor.countDocuments();
    this.materialCode = `MAT${String(count + 1).padStart(4, '0')}`;
  }
  
  this.availableStock = this.currentStock - this.reservedStock;
  this.currentRate = this.currentRate || this.standardRate;
  
  next();
});

materialSchema.index({ materialCode: 1 });
materialSchema.index({ name: 1 });
materialSchema.index({ category: 1 });
materialSchema.index({ currentStock: 1 });
materialSchema.index({ isActive: 1 });

module.exports = mongoose.model('Material', materialSchema);