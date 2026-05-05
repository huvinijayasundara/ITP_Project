const express = require('express');
const router = express.Router();

// Simulate a login (hardcoded user ID)
router.post('/login', (req, res) => {
  // This would normally come from a database
  const dummyUserId = '68d76a0bf0a9922ad624a9a1';

  // Store user ID in session (if using express-session)
  req.session.userId = dummyUserId;

  res.json({ message: 'Logged in as test user', userId: dummyUserId });
});

module.exports = router;
