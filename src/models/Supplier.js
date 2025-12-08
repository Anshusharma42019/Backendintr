const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierId: { type: String, unique: true },
  name: { type: String, required: true, trim: true },
  company: { type: String, trim: true },
  email: { type: String, lowercase: true },
  phone: { type: String, required: true },
  alternatePhone: String,
  gstNumber: { type: String, uppercase: true },
  panNumber: { type: String, uppercase: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    branch: String
  },
  paymentTerms: { type: Number, default: 30 },
  creditLimit: { type: Number, default: 0 },
  rating: { type: Number, min: 1, max: 5 },
  category: String,
  materials: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Material' }],
  status: { type: String, enum: ['active', 'inactive', 'blacklisted'], default: 'active' },
  notes: String
}, { timestamps: true });

supplierSchema.pre('save', async function(next) {
  if (!this.supplierId) {
    let isUnique = false;
    let counter = 1;
    
    while (!isUnique) {
      const count = await this.constructor.countDocuments();
      const newId = `SUP${String(count + counter).padStart(4, '0')}`;
      
      const existing = await this.constructor.findOne({ supplierId: newId });
      if (!existing) {
        this.supplierId = newId;
        isUnique = true;
      } else {
        counter++;
      }
    }
  }
  next();
});

supplierSchema.index({ supplierId: 1 });
supplierSchema.index({ name: 1 });
supplierSchema.index({ status: 1 });

module.exports = mongoose.model('Supplier', supplierSchema);