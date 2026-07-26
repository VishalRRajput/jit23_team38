import { generateAIAnalyticsInsights } from '../services/aiAnalyticsService.js';

export const getAIAnalytics = async (req, res) => {
  try {
    const insightsData = await generateAIAnalyticsInsights();
    res.json({ success: true, data: insightsData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
