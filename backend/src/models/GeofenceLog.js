import mongoose from 'mongoose';

const geofenceLogSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  deviceId: {
    type: String,
    required: true
  },
  geofenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Geofence',
    required: true
  },
  eventType: {
    type: String,
    enum: ['ENTRY', 'EXIT'],
    required: true
  },
  verificationMethod: {
    type: String,
    enum: ['GPS', 'WIFI_BSSID', 'HYBRID'],
    default: 'GPS'
  },
  latitude: Number,
  longitude: Number,
  durationMinutes: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

export const GeofenceLog = mongoose.model('GeofenceLog', geofenceLogSchema);
