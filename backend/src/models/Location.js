import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    index: true
  },
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  speed: {
    type: Number,
    default: 0
  },
  satellites: {
    type: Number,
    default: 0
  },
  battery: {
    type: Number,
    default: 100
  },
  batteryVoltage: {
    type: Number,
    default: 4.1
  },
  sosAlert: {
    type: Boolean,
    default: false
  },
  isInsideGeofence: {
    type: Boolean,
    default: false
  },
  geofenceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Geofence',
    default: null
  },
  isIndoor: {
    type: Boolean,
    default: false
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  floorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Floor',
    default: null
  },
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    default: null
  },
  scannedWifi: [
    {
      ssid: String,
      bssid: String,
      rssi: Number
    }
  ],
  verificationMethod: {
    type: String,
    enum: ['GPS', 'WIFI_BSSID', 'HYBRID', 'OUTSIDE'],
    default: 'GPS'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

locationSchema.index({ employeeId: 1, timestamp: -1 });

export const Location = mongoose.model('Location', locationSchema);
