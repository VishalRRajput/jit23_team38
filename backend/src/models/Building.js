import mongoose from 'mongoose';

const buildingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Building name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true
});

export const Building = mongoose.model('Building', buildingSchema);
