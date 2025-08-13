const mongoose = require("mongoose");

const ScoreSchema = new mongoose.Schema({
  privyId: { type: String, required: true, unique: true },
  userdid: { type: String, default: null },      // Added userDid field
  authToken: { type: String, default: null },    // Added authToken field
  username: { type: String, default: null },
  email: { type: String, required: false, unique: true },
  title: { type: String, default: null },
  profileImageUrl: { type: String, default: null },
  twitterScore: { type: Number, default: 0 },
  telegramScore: { type: Number, default: 0 },
  walletScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  wallets: [
    {
      walletAddress: { type: String, required: true },
      score: { type: Number, required: true, default: 10 },
    },
  ],
  badges: [{ type: String, default: [] }],
  lastUpdated: { type: Date, default: Date.now },
  referredBy: { type: String, default: null }    // Username or code of who referred this user
});

ScoreSchema.pre("save", function (next) {
  const walletScore = this.wallets.reduce((sum, wallet) => sum + wallet.score, 0);
  this.walletScore = walletScore;
  this.totalScore = this.twitterScore + this.telegramScore + walletScore;
  this.lastUpdated = new Date(); // ✅ update timestamp on every save
  next();
});

module.exports = mongoose.model("Score", ScoreSchema);