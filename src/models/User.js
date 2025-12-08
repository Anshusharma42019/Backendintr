const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phone: String,
  role: { type: String, enum: ['admin', 'manager', 'supervisor', 'employee', 'accountant'], required: true },
  department: { type: String, enum: ['admin', 'sales', 'project', 'accounts', 'inventory', 'hr'] },
  permissions: [{
    module: String,
    actions: [String] // ['create', 'read', 'update', 'delete']
  }],
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  profileImage: String
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    let isUnique = false;
    let counter = 1;
    
    while (!isUnique) {
      const count = await this.constructor.countDocuments();
      const newId = `EMP${String(count + counter).padStart(3, '0')}`;
      
      const existing = await this.constructor.findOne({ employeeId: newId });
      if (!existing) {
        this.employeeId = newId;
        isUnique = true;
      } else {
        counter++;
      }
    }
  }
  
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.index({ employeeId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);