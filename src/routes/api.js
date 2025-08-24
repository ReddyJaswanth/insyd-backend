const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const notificationController = require('../controllers/notificationController');

// User routes (for testing)
router.post('/users', async (req, res) => {
  try {
    const User = require('../models/User');
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Event routes
router.post('/events', eventController.createEvent);

// Notification routes
router.get('/notifications/:userId', notificationController.getNotifications);
router.post('/notifications', notificationController.createNotification); // For testing
router.put('/notifications/:notificationId/read', notificationController.markAsRead);

module.exports = router;