const Score = require("../models/Score.js"); 

/**
 * Get referral information for a user by privyId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getUserReferralInfo(req, res) {
  try {
    const { privyId } = req.body;
    
    if (!privyId) {
      return res.status(400).json({ 
        success: false, 
        message: "privyId is required in request body" 
      });
    }
    
    // Find the user by privyId
    const user = await Score.findOne({ privyId });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    // Get the user who referred this user (if any)
    let referredByUser = null;
    if (user.referredBy) {
      referredByUser = await Score.findOne({ 
        $or: [
          { username: user.referredBy },
          { privyId: user.referredBy }
        ]
      });
    }
    
    // Find all users who were referred by this user
    const referredToUsers = await Score.find({ 
      referredBy: user.username || user.privyId
    });
    
    return res.status(200).json({
      success: true,
      data: {
        user: {
          privyId: user.privyId,
          username: user.username
        },
        referredBy: referredByUser ? {
          privyId: referredByUser.privyId,
          username: referredByUser.username,
          totalScore: referredByUser.totalScore
        } : null,
        referredTo: referredToUsers.map(referee => ({
          privyId: referee.privyId,
          username: referee.username,
          totalScore: referee.totalScore
        }))
      }
    });
  } catch (error) {
    console.error("Error fetching referral information:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
}

/**
 * Get all referrals in the system with their metrics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllReferralMetrics(req, res) {
  try {
    // Get all users
    const allUsers = await Score.find({});
    
    // Map of privyId/username to array of referred users
    const referralMap = {};
    
    // Build the referral map
    allUsers.forEach(user => {
      if (user.referredBy) {
        if (!referralMap[user.referredBy]) {
          referralMap[user.referredBy] = [];
        }
        referralMap[user.referredBy].push({
          privyId: user.privyId,
          username: user.username,
          totalScore: user.totalScore
        });
      }
    });
    
    // Calculate metrics for each user
    const metrics = allUsers.map(user => {
      const identifier = user.username || user.privyId;
      const referrals = referralMap[identifier] || [];
      
      return {
        privyId: user.privyId,
        username: user.username,
        referredByUsername: user.referredBy,
        referralCount: referrals.length,
        referredUsers: referrals,
        totalReferredScore: referrals.reduce((sum, referee) => sum + referee.totalScore, 0)
      };
    });
    
    return res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error("Error fetching all referral metrics:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
}

module.exports = {
  getUserReferralInfo,
  getAllReferralMetrics
};