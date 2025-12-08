const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentNumber: { type: String, unique: true },
  paymentType: { type: String, enum: ['received', 'paid'], required: true },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  exchangeRate: { type: Number, default: 1 },
  paymentDate: { type: Date, default: Date.now },
  method: { type: String, enum: ['cash', 'bank-transfer', 'cheque', 'online', 'upi', 'card', 'dd'], required: true },
  bankAccount: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String
  },
  chequeDetails: {
    chequeNumber: String,
    chequeDate: Date,
    bankName: String,
    clearanceDate: Date
  },
  onlineDetails: {
    transactionId: String,
    gateway: String,
    utrNumber: String
  },
  reference: String,
  description: String,
  status: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled', 'bounced'], default: 'pending' },
  clearanceStatus: { type: String, enum: ['pending', 'cleared', 'bounced'], default: 'pending' },
  clearanceDate: Date,
  tdsAmount: { type: Number, default: 0 },
  tdsRate: { type: Number, default: 0 },
  netAmount: { type: Number, required: true },
  charges: { type: Number, default: 0 },
  notes: String,
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  reconciled: { type: Boolean, default: false },
  reconciledAt: Date,
  reconciledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

paymentSchema.pre('save', async function(next) {
  if (!this.paymentNumber) {
    const count = await this.constructor.countDocuments();
    const prefix = this.paymentType === 'received' ? 'RCP' : 'PAY';
    this.paymentNumber = `${prefix}${String(count + 1).padStart(4, '0')}`;
  }
  
  this.netAmount = this.amount - this.tdsAmount - this.charges;
  next();
});

paymentSchema.index({ paymentNumber: 1 });
paymentSchema.index({ invoice: 1 });
paymentSchema.index({ client: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);