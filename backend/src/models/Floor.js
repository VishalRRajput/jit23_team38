import mongoose from 'mongoose';

const floorSchema = new mongoose.Schema({
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Floor name is required'],
    trim: true,
  },
  level: {
    type: Number,
    required: true,
    default: 0,
  }
}, {
  timestamps: true
});

export const Floor = mongoose.model('Floor', floorSchema);
