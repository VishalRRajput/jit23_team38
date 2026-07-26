import express from 'express';
import { getDailyAttendance, getMonthlyAttendance, getAttendanceSummary, manualCheckInOverride } from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/daily', protect, getDailyAttendance);
router.get('/monthly', protect, getMonthlyAttendance);
router.get('/summary', protect, getAttendanceSummary);
router.post('/manual', protect, manualCheckInOverride);

export default router;
