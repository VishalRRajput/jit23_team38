import express from 'express';
import { getReportsList, generateReport, exportReportData } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getReportsList);
router.post('/generate', protect, generateReport);
router.get('/download/:type.:format', exportReportData);

export default router;
