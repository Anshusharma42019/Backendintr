const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone: { type: String, required: true, match: /^[+]?[0-9\s\-\(\)]{10,20}$/ },
  company: { type: String, trim: true },
  source: { type: String, enum: ['website', 'referral', 'social', 'advertisement', 'cold-call', 'other'], default: 'other' },
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'proposal-sent', 'converted', 'lost'], default: 'new' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  estimatedValue: { type: Number, min: 0 },
  expectedCloseDate: Date,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: [{
    content: String,
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  tags: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

leadSchema.index({ email: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);