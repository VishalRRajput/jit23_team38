import { Geofence } from '../models/Geofence.js';
import { GeofenceLog } from '../models/GeofenceLog.js';

export const getGeofences = async (req, res) => {
  try {
    const geofences = await Geofence.find().sort({ createdAt: -1 });
    res.json({ success: true, count: geofences.length, geofences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createGeofence = async (req, res) => {
  try {
    const { officeName, latitude, longitude, radiusMeters, officeWifiBSSIDs, description, status } = req.body;

    const geofence = await Geofence.create({
      officeName,
      latitude,
      longitude,
      radiusMeters: radiusMeters || 150,
      officeWifiBSSIDs: officeWifiBSSIDs || [],
      description,
      status: status || 'Active'
    });

    res.status(201).json({ success: true, message: 'Geofence boundary created successfully', geofence });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateGeofence = async (req, res) => {
  try {
    const { id } = req.params;
    const geofence = await Geofence.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!geofence) {
      return res.status(404).json({ success: false, message: 'Geofence not found' });
    }
    res.json({ success: true, message: 'Geofence updated successfully', geofence });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteGeofence = async (req, res) => {
  try {
    const { id } = req.params;
    const geofence = await Geofence.findByIdAndDelete(id);
    if (!geofence) {
      return res.status(404).json({ success: false, message: 'Geofence not found' });
    }
    res.json({ success: true, message: 'Geofence deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGeofenceLogs = async (req, res) => {
  try {
    const { employeeId, eventType, limit = 100 } = req.query;
    let query = {};
    if (employeeId) query.employeeId = employeeId;
    if (eventType) query.eventType = eventType;

    const logs = await GeofenceLog.find(query).sort({ timestamp: -1 }).limit(Number(limit));
    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
