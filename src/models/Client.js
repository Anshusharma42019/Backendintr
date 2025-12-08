const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: { type: String, default: 'India' }
}, { _id: false });

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: String,
  email: String,
  phone: String,
  isPrimary: { type: Boolean, default: false }
}, { _id: false });

const clientSchema = new mongoose.Schema({
  clientId: { type: String, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  alternatePhone: String,
  company: { type: String, trim: true },
  gstNumber: { type: String, uppercase: true, match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/ },
  panNumber: { type: String, uppercase: true, match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/ },
  address: addressSchema,
  billingAddress: addressSchema,
  contacts: [contactSchema],
  paymentTerms: { type: Number, default: 30 }, // days
  creditLimit: { type: Number, default: 0 },
  clientType: { type: String, enum: ['individual', 'business', 'government'], default: 'individual' },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  notes: String,
  tags: [String]
}, { timestamps: true });

clientSchema.pre('save', async function(next) {
  if (!this.clientId) {
    let isUnique = false;
    let counter = 1;
    
    while (!isUnique) {
      const count = await this.constructor.countDocuments();
      const newId = `CL${String(count + counter).padStart(4, '0')}`;
      
      const existing = await this.constructor.findOne({ clientId: newId });
      if (!existing) {
        this.clientId = newId;
        isUnique = true;
      } else {
        counter++;
      }
    }
  }
  next();
});

clientSchema.index({ clientId: 1 });
clientSchema.index({ email: 1 });
clientSchema.index({ status: 1 });

module.exports = mongoose.model('Client', clientSchema);