import { Notification } from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const { unreadOnly } = req.query;
    let query = {};
    if (unreadOnly === 'true') query.read = false;

    const notifications = await Notification.find(query).sort({ timestamp: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ read: false });

    res.json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'all') {
      await Notification.updateMany({ read: false }, { read: true });
      return res.json({ success: true, message: 'All notifications marked as read' });
    }

    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ success: true, message: 'Notification drawer cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
