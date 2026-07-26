import express from 'express';
import { getGeofences, createGeofence, updateGeofence, deleteGeofence, getGeofenceLogs } from '../controllers/geofenceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getGeofences);
router.post('/', protect, createGeofence);
router.put('/:id', protect, updateGeofence);
router.delete('/:id', protect, deleteGeofence);
router.get('/logs', protect, getGeofenceLogs);

export default router;
