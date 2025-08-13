// routes/scoreRoutes.js
const express = require("express");
const router = express.Router();
const {
  getTwitterScoreByPrivyId,
  getWalletScoreByPrivyId,
  getTelegramScoreByPrivyId,
  getTotalScoreByPrivyId
} = require("../controllers/scoreFetching.js");
const { getAllUserInfo } = require('../controllers/UserInfoController.js');

router.post('/users', getAllUserInfo);

router.post("/score/twitter", getTwitterScoreByPrivyId);
router.post("/score/wallet", getWalletScoreByPrivyId);
router.post("/score/telegram", getTelegramScoreByPrivyId);
router.post("/score/total", getTotalScoreByPrivyId);

module.exports = router;
