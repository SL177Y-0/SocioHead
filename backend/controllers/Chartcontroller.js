const Score = require("../models/Score");

// GET /api/chart/user - Fetch user by username
const getUserByUsername = async (req, res) => {
  try {
    const username = req.body.username || req.query.username;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await Score.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const walletScore = user.wallets.reduce((sum, w) => sum + (w.score || 0), 0);

    const responseData = {
      id: user._id,
      username: user.username,
      email: user.email || null,
      title: user.title || null,
      twitterScore: user.twitterScore || 0,
      telegramScore: user.telegramScore || 0,
      totalScore: user.totalScore || 0,
      walletScore,
      wallets: user.wallets || [],
      badges: user.badges || [],
      profileImageUrl: user.profileImageUrl, // You can extend this logic if image handling is added
      isVerified: !!user.email, // Example logic, adjust as needed
    };

    return res.status(200).json(responseData);
  } catch (err) {
    console.error("[ChartController] Error fetching user by username:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getUserByUsername,
};

