// twitterDetailsController.js
const { getUserDetails } = require("./twitterController.js");

/**
 * Get Twitter user details and score based on username
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTwitterDetails = async (req, res) => {
    try {
        const { username } = req.body;
        
        // Validate if username is provided
        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'Username is required'
            });
        }
        
        console.log(`📝 Received request to fetch details for username: ${username}`);
        
        // Call the Twitter service to get user details
        const twitterData = await getUserDetails(username);

        
        
        // Return the data
        return res.status(200).json({
            success: true,
            data: twitterData
        });
        
    } catch (error) {
        console.error('❌ Error in Twitter details controller:', error.message);
        
        // Handle specific error cases
        if (error.message.includes('User not found')) {
            return res.status(404).json({
                success: false,
                message: 'Twitter user not found'
            });
        }
        
        if (error.message.includes('Rate limit')) {
            return res.status(429).json({
                success: false,
                message: 'Twitter API rate limit exceeded. Please try again later.'
            });
        }
        
        // Generic error response
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch Twitter user details',
            error: error.message
        });
    }
};

/**
 * Get Twitter score based on username
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTwitterScore = async (req, res) => {
    try {
        const { username } = req.body;
        
        // Validate if username is provided
        if (!username) {
            return res.status(400).json({
                success: false,
                message: 'Username is required'
            });
        }
        
        console.log(`📊 Calculating Twitter score for username: ${username}`);
        
        // Default fallback values
        let score = 20; // Lower default score to fit within the 50 max range
        let profileImageUrl = `https://unavatar.io/twitter/${username}`;
        
        try {
            // Call the Twitter service to get user details
            const twitterData = await getUserDetails(username);
            
            // Adjusted weights to keep score under 50
            const weights = {
                followers: 0.005, // Reduced from 0.01
                engagement: 0.0005, // Reduced from 0.001
                verification: 10, // Reduced from 20
                tweetFreq: 0.0005, // Reduced from 0.001
                subscriptions: 2.5, // Reduced from 5
                accountAge: 1, // Reduced from 2
                media: 0.001, // Reduced from 0.002
                pinned: 2.5, // Reduced from 5
                friends: 0.0005, // Reduced from 0.001
                listed: 0.25, // Reduced from 0.5
                superFollow: 5, // Reduced from 10
                retweets: 0.00025, // Reduced from 0.0005
                quotes: 0.00025, // Reduced from 0.0005
                replies: 0.00025 // Reduced from 0.0005
            };
            
            if (twitterData) {
                const twitter = twitterData?.data?.user?.result?.legacy;
                const twitterUser = twitterData?.data?.user?.result;
                
                if (twitter) {
                    console.log("📊 Twitter followers:", twitter.followers_count);
                    
                    // Set profile image URL if available
                    profileImageUrl = twitter.profile_image_url_https || profileImageUrl;
                    
                    // Calculate score using the provided algorithm with adjusted weights
                    score = (
                        (twitter.followers_count || 0) * weights.followers +
                        ((twitter.favourites_count || 0) + (twitter.media_count || 0) + (twitter.listed_count || 0)) * weights.engagement +
                        (twitterUser.is_blue_verified ? weights.verification : 0) +
                        (twitter.statuses_count || 0) * weights.tweetFreq +
                        (twitterUser.creator_subscriptions_count || 0) * weights.subscriptions +
                        ((new Date() - new Date(twitter.created_at || Date.now())) / (1000 * 60 * 60 * 24 * 365)) * weights.accountAge +
                        (twitter.media_count || 0) * weights.media +
                        (twitter.pinned_tweet_ids_str?.length > 0 ? weights.pinned : 0) +
                        (twitter.friends_count || 0) * weights.friends +
                        (twitter.listed_count || 0) * weights.listed +
                        (twitterUser.super_follow_eligible ? weights.superFollow : 0) +
                        (twitter.retweet_count || 0) * weights.retweets +
                        (twitter.quote_count || 0) * weights.quotes +
                        (twitter.reply_count || 0) * weights.replies
                    );
                    
                    console.log("Raw Twitter score calculated:", score);
                    
                    // Scale down the score if it's too high
                    if (score > 50) {
                        const scaleFactor = 50 / score;
                        score = score * scaleFactor;
                        console.log("Score scaled down to fit within max range:", score);
                    }
                    
                    // Cap the score at 50 and ensure it's at least 1
                    score = Math.max(1, Math.min(50, Math.round(score)));
                    console.log("Final Twitter score:", score);
                } else {
                    console.error("❌ Twitter legacy data not found");
                    // Use default fallback score (20)
                }
            }
        } catch (err) {
            console.error("❌ Error calculating Twitter score:", err.message);
            // Use default fallback score (20)
        }
        
        // Create basic badge
        const badges = [{ id: "Influence Investor", name: "Influence Investor", icon: "" }];
        
        // Add additional badges based on score (adjusted for max 50)
        if (score > 40) {
            badges.push({ id: "Media Mogul", name: "Media Mogul", icon: "" });
        } else if (score > 30) {
            badges.push({ id: "Engagement Economist", name: "Engagement Economist", icon: "" });
        } else if (score > 20) {
            badges.push({ id: "Tweet Trader", name: "Tweet Trader", icon: "" });
        }
        
        // Return the score and profile data
        return res.status(200).json({
            success: true,
            twitterScore: score,
            totalScore: score, // For now, total score equals Twitter score
            profileImageUrl,
            username,
            badges
        });
        
    } catch (error) {
        console.error('❌ Error in Twitter score controller:', error);
        
        // Return fallback data with default score of 20 (reduced from 30)
        return res.status(200).json({
            success: true,
            twitterScore: 20,
            totalScore: 20,
            profileImageUrl: `https://unavatar.io/twitter/${req.body.username}`,
            username: req.body.username,
            badges: [{ id: "twitter-basic", name: "Twitter User", icon: "🐦" }]
        });
    }
};