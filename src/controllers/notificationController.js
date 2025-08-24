const Notification = require('../models/Notification');
const mongoose = require('mongoose');

exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    const notifications = await Notification.find({ userId })
      .sort({ timestamp: -1 })
      .populate('sourceUserId', 'username')
      .limit(50);
    
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { userId, type, content, sourceUserId } = req.body;
    
    // Validate required fields
    if (!userId || !type || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create and save the notification
    const notification = new Notification({
      userId,
      type,
      content,
      sourceUserId
    });
    
    await notification.save();
    
    // Emit real-time notification if socket.io is available
    const io = req.app.get('io');
    if (io) {
      io.to(userId.toString()).emit('notification', notification);
    }
    
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    // Validate notificationId format
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ error: 'Invalid notification ID format' });
    }
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { status: 'read' },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
};