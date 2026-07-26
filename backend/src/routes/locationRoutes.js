import express from 'express';
import { postLocationData, getLatestEmployeeLocation, getEmployeeLocationHistory, getAllActiveLocations } from '../controllers/locationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ESP32 hardware pushes location without JWT header (unprotected hardware REST endpoint)
router.post('/', postLocationData);

// Protected Admin Telemetry Routes
router.get('/active/all', protect, getAllActiveLocations);
router.get('/history/:employeeId', protect, getEmployeeLocationHistory);
router.get('/:employeeId', protect, getLatestEmployeeLocation);

export default router;
