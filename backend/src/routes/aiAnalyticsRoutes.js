import express from 'express';
import { getAIAnalytics } from '../controllers/aiAnalyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAIAnalytics);

export default router;
