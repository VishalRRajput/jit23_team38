import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['ENTRY', 'EXIT', 'DEVICE_OFFLINE', 'SIGNAL_LOST', 'GEOFENCE_ALERT', 'SOS_ALERT'],
    required: true
  },
  employeeId: {
    type: String,
    default: null
  },
  read: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

export const Notification = mongoose.model('Notification', notificationSchema);
