const Event = require('../models/Event');
const notificationService = require('../services/notificationService');

exports.createEvent = async (req, res) => {
  try {
    const { type, sourceUserId, targetUserId, data } = req.body;
    
    // Validate required fields
    if (!type || !sourceUserId || !targetUserId || !data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create and save the event
    const event = new Event({
      type,
      sourceUserId,
      targetUserId,
      data
    });
    
    await event.save();
    
    // Process the event to generate notifications
    await notificationService.processEvent(event, req.app.get('io'));
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: error.message });
  }
};