const Notification = require('../models/Notification');
const User = require('../models/User');

exports.processEvent = async (event, io) => {
  try {
    const { type, sourceUserId, targetUserId, data } = event;
    
    // Skip processing if source and target are the same user
    if (sourceUserId.toString() === targetUserId.toString()) {
      return;
    }
    
    // Get target user to check notification preferences
    const targetUser = await User.findById(targetUserId);
    if (!targetUser || !targetUser.preferences.inApp) {
      return; // User doesn't exist or has disabled in-app notifications
    }
    
    // Generate notification content based on event type
    let content = '';
    switch (type) {
      case 'like':
        content = `Someone liked your ${data.contentType}`;
        break;
      case 'comment':
        content = `Someone commented on your ${data.contentType}`;
        break;
      case 'follow':
        content = `Someone started following you`;
        break;
      case 'post':
        content = `Someone you follow created a new post`;
        break;
      case 'message':
        content = `You received a new message`;
        break;
      default:
        content = `You have a new notification`;
    }
    
    // Create the notification
    const notification = new Notification({
      userId: targetUserId,
      type,
      content,
      sourceUserId
    });
    
    await notification.save();
    
    // Send real-time notification if socket.io is available
    if (io) {
      io.to(targetUserId.toString()).emit('notification', notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Error processing event:', error);
    throw error;
  }
};