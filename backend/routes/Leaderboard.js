// routes/leaderboard.js
const express = require('express');
const router = express.Router();
const Score = require('../models/Score');

// Utility function to safely get fallback name
function getDisplayName(user) {
  if (user.username && user.username.trim() !== '') {
    return user.username;
  } else if (user.email && user.email.trim() !== '') {
    return user.email.split('@')[0]; // use email prefix
  }
  return "Anonymous";
}

function getHandle(user) {
  if (user.username && user.username.trim() !== '') {
    return '@' + user.username;
  } else if (user.email && user.email.trim() !== '') {
    return '@' + user.email.split('@')[0];
  }
  return '@anon';
}

router.get('/data', async (req, res) => {
  try {
    // Explicitly select all fields we need
    const topUsers = await Score.find({})
      .select('username email twitterScore telegramScore walletScore totalScore twitterFollowers lastUpdated wallets')
      .sort({ totalScore: -1 })
      .limit(100);
    
    const formattedUsers = topUsers.map((user, index) => {
      // Make sure we're getting the actual scores from the database
      return {
        rank: index + 1,
        user: getDisplayName(user),
        handle: getHandle(user),
        telegramScore: user.telegramScore || 0,
        walletScore: user.walletScore || 0,
        twitterScore: user.twitterScore || 0,
        twitterFollowers: user.twitterFollowers || 0,
        totalScore: user.totalScore || 0,
        timestamp: user.lastUpdated?.getTime() || Date.now(),
      };
    });
    
    res.json(formattedUsers);
  } catch (error) {
    console.error("❌ Error fetching leaderboard:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


  

module.exports = router;
