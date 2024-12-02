const express = require('express');
const { sendMessage } = require('../controllers/message');

const router = express.Router();

// Public route to send a contact message via email
router.post('/send', sendMessage);

module.exports = router;
