const express = require('express');
const router = express.Router();
const { handleChat } = require('../Controllers/chatController');

router.post('/', handleChat);

module.exports = router;
