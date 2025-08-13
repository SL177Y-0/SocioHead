const express = require("express");
const { getUserDetails } = require("../controllers/twitterController.js");
const {getTwitterDetails,getTwitterScore}= require('../controllers/twitterdetailsController.js')

const router = express.Router();

// Route to get Twitter user details
router.get("/user", getUserDetails);
router.post('/details',getTwitterScore)

module.exports = router;
