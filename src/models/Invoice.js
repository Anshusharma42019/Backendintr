const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: String,
  rate: { type: Number, required: true, min: 0 },
  amount: { type: Number, min: 0 },
  taxRate: { type: Number, default: 18 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number }
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  invoiceType: { type: String, enum: ['tax-invoice', 'proforma', 'credit-note', 'debit-note'], default: 'tax-invoice' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  boq: { type: mongoose.Schema.Types.ObjectId, ref: 'BOQ' },
  invoiceDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  paymentTerms: { type: Number, default: 30 }, // days
  items: [invoiceItemSchema],
  subtotal: { type: Number, min: 0 },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  discountAmount: { type: Number, default: 0, min: 0 },
  taxableAmount: { type: Number },
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  totalTax: { type: Number, default: 0 },
  totalAmount: { type: Number, min: 0 },
  roundOff: { type: Number, default: 0 },
  finalAmount: { type: Number },
  currency: { type: String, default: 'INR' },
  paidAmount: { type: Number, default: 0, min: 0 },
  balanceAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'sent', 'viewed', 'partially-paid', 'paid', 'overdue', 'cancelled'], default: 'draft' },
  paymentStatus: { type: String, enum: ['unpaid', 'partially-paid', 'paid', 'overpaid'], default: 'unpaid' },
  sentDate: Date,
  viewedDate: Date,
  paidDate: Date,
  notes: String,
  termsAndConditions: String,
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    branch: String
  },
  attachments: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date
}, { timestamps: true });

invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNumber) {
    const count = await this.constructor.countDocuments();
    this.invoiceNumber = `INV${String(count + 1).padStart(4, '0')}`;
  }
  
  this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
  this.discountAmount = (this.subtotal * this.discountPercent) / 100;
  this.taxableAmount = this.subtotal - this.discountAmount;
  this.totalTax = this.cgst + this.sgst + this.igst;
  this.totalAmount = this.taxableAmount + this.totalTax;
  this.finalAmount = Math.round(this.totalAmount + this.roundOff);
  this.balanceAmount = this.finalAmount - this.paidAmount;
  
  // Update payment status
  if (this.paidAmount === 0) {
    this.paymentStatus = 'unpaid';
  } else if (this.paidAmount >= this.finalAmount) {
    this.paymentStatus = 'paid';
  } else {
    this.paymentStatus = 'partially-paid';
  }
  
  next();
});

invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ client: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ invoiceDate: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);