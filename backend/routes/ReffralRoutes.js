const express = require('express');
const router = express.Router();
const referralController = require('../controllers/ReffralController.js');

/**
 * @route POST /api/referrals/user
 * @desc Get referral information for a specific user
 * @access Public (or add authentication middleware as needed)
 */
router.post('/user', referralController.getUserReferralInfo);

/**
 * @route GET /api/referrals/all
 * @desc Get all referral metrics in the system
 * @access Public (or add authentication middleware as needed)
 */
router.get('/all', referralController.getAllReferralMetrics);

module.exports = router;