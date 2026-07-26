import mongoose from 'mongoose';

const geofenceSchema = new mongoose.Schema({
  officeName: {
    type: String,
    required: [true, 'Office Name is required'],
    trim: true
  },
  latitude: {
    type: Number,
    required: [true, 'Center Latitude is required']
  },
  longitude: {
    type: Number,
    required: [true, 'Center Longitude is required']
  },
  radiusMeters: {
    type: Number,
    required: [true, 'Radius in meters is required'],
    default: 150
  },
  officeWifiBSSIDs: [
    {
      roomName: String,
      ssid: String,
      bssid: String,
      minRssi: { type: Number, default: -85 }
    }
  ],
  description: {
    type: String,
    default: 'Corporate HQ Geofence Boundary'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

export const Geofence = mongoose.model('Geofence', geofenceSchema);
