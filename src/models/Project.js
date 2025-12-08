const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  dueDate: Date,
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  completedDate: Date,
  amount: Number
});

const projectSchema = new mongoose.Schema({
  projectId: { type: String, unique: true },
  name: { type: String, required: true, trim: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  description: String,
  category: { type: String, enum: ['construction', 'renovation', 'interior', 'infrastructure', 'other'], default: 'other' },
  status: { type: String, enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'], default: 'planning' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  startDate: Date,
  endDate: Date,
  actualStartDate: Date,
  actualEndDate: Date,
  budget: { type: Number, required: true, min: 0 },
  actualCost: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  projectManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  milestones: [milestoneSchema],
  progress: { type: Number, min: 0, max: 100, default: 0 },
  location: {
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  tags: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

projectSchema.pre('save', async function(next) {
  if (!this.projectId) {
    let isUnique = false;
    let counter = 1;
    
    while (!isUnique) {
      const count = await this.constructor.countDocuments();
      const newId = `PR${String(count + counter).padStart(4, '0')}`;
      
      const existing = await this.constructor.findOne({ projectId: newId });
      if (!existing) {
        this.projectId = newId;
        isUnique = true;
      } else {
        counter++;
      }
    }
  }
  next();
});

projectSchema.index({ projectId: 1 });
projectSchema.index({ client: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ startDate: 1 });

module.exports = mongoose.model('Project', projectSchema);