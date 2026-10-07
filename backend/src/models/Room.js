import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  floorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Floor',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
  },
  color: {
    type: String,
    default: '#ffffff', // Default color
  },
  type: {
    type: String,
    enum: ['Room', 'Meeting Room', 'HR', 'IT', 'Reception', 'Pantry', 'Server Room', 'Cabin', 'Store Room', 'Hallway'],
    default: 'Room',
  },
  dimensions: {
    x: { type: Number, required: true, default: 0 },
    y: { type: Number, required: true, default: 0 },
    width: { type: Number, required: true, default: 100 },
    height: { type: Number, required: true, default: 100 },
  },
  wifiFingerprints: [
    {
      bssid: String,
      ssid: String,
      rssiRange: {
        min: Number,
        max: Number,
      },
      priority: { type: Number, default: 1 },
    }
  ]
}, {
  timestamps: true
});

export const Room = mongoose.model('Room', roomSchema);
