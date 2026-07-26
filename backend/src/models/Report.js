import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  reportType: {
    type: String,
    enum: ['ATTENDANCE', 'MOVEMENT_HISTORY', 'GEOFENCE_LOGS', 'AI_ANALYTICS'],
    required: true
  },
  fileFormat: {
    type: String,
    enum: ['PDF', 'EXCEL', 'CSV'],
    required: true
  },
  generatedBy: {
    type: String,
    default: 'System Admin'
  },
  recordCount: {
    type: Number,
    default: 0
  },
  downloadUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export const Report = mongoose.model('Report', reportSchema);
