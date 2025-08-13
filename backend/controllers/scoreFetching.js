// scoreFetching.js
const Score = require("../models/Score.js");

// 🐦 Twitter Score
async function getTwitterScoreByPrivyId(req, res) {
  const { privyId } = req.body;

  if (!privyId) return res.status(400).json({ error: "Privy ID is required" });

  try {
    const user = await Score.findOne({ privyId });
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({
      twitterScore: user.twitterScore || 30,
     
    });
  } catch (error) {
    console.error("❌ Error fetching Twitter score:", error.message);
    return res.status(500).json({ error: "Server Error" });
  }
}

// 👛 Wallet Score
async function getWalletScoreByPrivyId(req, res) {
  const { privyId } = req.body;

  if (!privyId) return res.status(400).json({ error: "Privy ID is required" });

  try {
    const user = await Score.findOne({ privyId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const walletScore = (user.wallets || []).reduce((sum, wallet) => sum + wallet.score, 0);

    return res.json({
      walletScore,
    });
  } catch (error) {
    console.error("❌ Error fetching Wallet score:", error.message);
    return res.status(500).json({ error: "Server Error" });
  }
}

// 💬 Telegram Score
async function getTelegramScoreByPrivyId(req, res) {
  const { privyId } = req.body;

  if (!privyId) return res.status(400).json({ error: "Privy ID is required" });

  try {
    const user = await Score.findOne({ privyId });
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({
      telegramScore: user.telegramScore || 25
    });
  } catch (error) {
    console.error("❌ Error fetching Telegram score:", error.message);
    return res.status(500).json({ error: "Server Error" });
  }
}

// 🧮 Total Score
async function getTotalScoreByPrivyId(req, res) {
  const { privyId } = req.body;

  if (!privyId) return res.status(400).json({ error: "Privy ID is required" });

  try {
    const user = await Score.findOne({ privyId });
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({
      totalScore: user.totalScore || 60,
    });
  } catch (error) {
    console.error("❌ Error fetching Total score:", error.message);
    return res.status(500).json({ error: "Server Error" });
  }
}

module.exports = {
  getTwitterScoreByPrivyId,
  getWalletScoreByPrivyId,
  getTelegramScoreByPrivyId,
  getTotalScoreByPrivyId
};
