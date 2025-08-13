// controllers/dbUserInfoController.js

const Score = require('../models/Score'); // Adjust path as needed

// POST /api/user-info - Fetch user by privyId or create if not exists
const getAllUserInfo = async (req, res) => {
  try {
    const { privyId } = req.body;

    if (!privyId) {
      return res.status(400).json({ message: "Missing privyId in request body." });
    }

    let user = await Score.findOne({ privyId });

    if (!user) {
      // User not found – create new user with default values
      const newUser = new Score({
        privyId,
        // No need to provide other fields as they have default values in the schema
      });

      user = await newUser.save();
      console.log("✅ New user created:", user);
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error fetching or creating user:", error.message);
    res.status(500).json({ message: "Server error while fetching or creating user info." });
  }
};

module.exports = {
  getAllUserInfo,
};