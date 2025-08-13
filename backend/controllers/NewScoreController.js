const { getUserDetails } = require("./twitterController.js");
const { getWalletDetails } = require("./BlockchainController.js");
const { getTelegramData } = require("../Services/veridaService.js");
const Score = require("../models/Score");


async function telegramScore(req, res) {
  try {
    const { privyId, email, userdid, authToken } = req.body;

    if (!privyId && !email) {
      return res.status(400).json({ error: "privyId or email is required" });
    }

    // 🔐 Look up user
    const query = privyId ? { privyId } : { email };
    let user = await Score.findOne(query);


    console.log("before if condition Userdid",userdid);
    console.log("before if condition authtoken",authToken);
    // ✅ Fetch Telegram Data from Verida
    let telegramData = {};
    if (userdid && authToken) {
      try {
        console.log(`📊 Fetching Telegram score for: PrivyID(${privyId}), Verida DID(${userdid}), AuthToken(${authToken})`);
        telegramData = await getTelegramData(userdid, authToken);
      } catch (err) {
        console.error("❌ Error fetching Telegram data:", err.message);
      }
    }

    console.log("after if condition",userdid)
    console.log("after if condition authtoken",authToken);
    const telegramGroups = telegramData.groups || [];
    const telegramMessages = telegramData.messages || [];
    const twitterData = {};
    const walletData = {};

    // 🔢 Evaluate User (reuses evaluateUser logic)
    const { scores, badges, title } = await evaluateUser({
      privyId,
      twitterData,
      walletData,
      telegramGroups,
      telegramMessages,
    });

    // ✅ Safe parsing with fallbacks
    let telegramScore = parseFloat(scores?.telegramScore);
    let communityScore = parseFloat(scores?.communityScore);
    if (isNaN(telegramScore)) telegramScore = 5;
    if (isNaN(communityScore)) communityScore = 10;

    const finalTelegramScore = Math.min(telegramScore + communityScore, 35);
    console.log("✅ Telegram Score (capped):", finalTelegramScore);

    
    if (!user) {
      user = new Score({
        privyId,
        email: email || undefined,
        userdid: userdid || null,   
        authToken: authToken || null,  
        telegramScore: finalTelegramScore,
        title: title || null,
        badges: Object.keys(badges || {}),
        wallets: [],
      });
    } else {
      user.telegramScore = finalTelegramScore;
      user.title = title || user.title;
      const newBadges = Object.keys(badges || {});
      const existingBadges = user.badges || [];
      user.badges = Array.from(new Set([...existingBadges, ...newBadges]));

      // Update userDid and authToken if provided
      if (userdid) user.userdid = userdid;
      if (authToken) user.authToken = authToken;
      if (email) user.email = email;
    }

    // 💾 Save & auto-calculate totalScore via pre-save hook
    await user.save();

    return res.json({
      telegramScore: user.telegramScore,
      totalScore: user.totalScore
    });

  } catch (error) {
    console.error("❌ Error calculating telegram score:", error.message);
    return res.status(500).json({ error: "Server Error" });
  }
}



async function WalletScore(req, res) {
  try {
    let { privyId, email, address } = req.body;

    if (!privyId && !email) {
      return res.status(400).json({ error: "Provide a Privy ID or Email" });
    }

    console.log(`📢 Fetching data for: PrivyID(${privyId}), Wallet(${address || "None"})`);

    let walletData = {};
    const telegramGroups = [];
    const telegramMessages = [];
    const twitterData = {};

    // ✅ Fetch Wallet Data
    if (address) {
      try {
        walletData = await getWalletDetails(address);
        console.log("Wallet data fetched:", walletData);
      } catch (err) {
        console.error("❌ Error fetching wallet data:", err.message);
      }
    }

    // 🔢 Evaluate User (reuses evaluateUser logic with scoring & badges)
    const { scores, badges, title } = await evaluateUser({
      privyId,
      twitterData,
      walletData,
      telegramGroups,
      telegramMessages,
    });


    let cryptoScore = parseFloat(scores?.cryptoScore);
    let nftScore = parseFloat(scores?.nftScore);
    if (isNaN(cryptoScore)) cryptoScore = 15;
    if (isNaN(nftScore)) nftScore = 10;

    const walletScore = Math.min(cryptoScore + nftScore, 70); // max 70 points


    // ✅ Look up user or create one
    const query = privyId ? { privyId } : { email };
    let user = await Score.findOne(query);

    if (!user) {
      user = new Score({
        privyId: privyId || undefined,
        email: email || undefined,
        title: title || null,
        badges: Object.keys(badges || {}),
        wallets: [{
          walletAddress: address,
          score: walletScore,
        }],
      });
    } else {
      // Update or add wallet entry
      const existingWallet = user.wallets.find(w => w.walletAddress === address);
      if (existingWallet) {
        existingWallet.score = walletScore;
      } else {
        user.wallets.push({
          walletAddress: address,
          score: walletScore,
        });
      }

      // Update badges and title
      user.title = title || user.title;
      const newBadges = Object.keys(badges || {});
      const existingBadges = user.badges || [];
      user.badges = Array.from(new Set([...existingBadges, ...newBadges]));
      if (email) user.email = email;
    }

    // 💾 Save user and trigger pre-save hook to update totalScore
    await user.save();

    return res.json({
      WalletScore: walletScore,
      totalScore: user.totalScore
    });

  } catch (error) {
    console.error("❌ Error calculating wallet score:", error.message);
    return res.status(500).json({ error: "Server Error" });
  }
}



async function TwitterScore(req, res) {
  try {
    console.log("🔍 Request Received:", req.method === "POST" ? req.body : req.params);

    let { privyId, email, username, referralCode } = req.body;

    if (!privyId && !email) {
      return res.status(400).json({ error: "Provide a Privy ID or Email" });
    }

    console.log(`📢 Fetching data for: PrivyID(${privyId}), Twitter(${username || "None"})`);
    if (referralCode) {
      console.log(`🔗 Referral code received: ${referralCode}`);
    }
    console.log("Username to be saved:", username, "Type:", typeof username);

    let twitterData = {};
    const walletData = {};
    const telegramGroups = [];
    const telegramMessages = [];

    // ✅ Fetch Twitter Data
    if (username) {
      try {
        twitterData = await getUserDetails(username);
      } catch (err) {
        console.error("❌ Error fetching Twitter user data:", err.message);
      }
    }
    console.log("twitter fn", twitterData?.data?.user?.result?.legacy?.profile_image_url_https);

    const profileImageUrl=twitterData?.data?.user?.result?.legacy?.profile_image_url_https
    
    console.log("see the imagee", profileImageUrl)
    // 🔢 Evaluate User
    const evaluation = await evaluateUser(
      privyId,
      twitterData,
      walletData,
      telegramGroups,
      telegramMessages,
    );

    const { scores, badges, title } = evaluation;

    // 🧠 Safely get twitterScore and apply fallback logic
    let twitterScore = parseFloat(scores?.socialScore);
    if (isNaN(twitterScore) || twitterScore === 0) {
      twitterScore = 50; // ✅ fallback default
    } else {
      twitterScore = Math.min(twitterScore, 50);
    }

    console.log("✅ Final Twitter Score:", twitterScore);

    // ✅ Look up user or create one
    const query = privyId ? { privyId } : { email };
    let user = await Score.findOne(query);

    if (!user) {
      // Create new user with referral code if provided
      user = new Score({
        privyId: privyId || undefined,
        email: email || undefined,
        username: username || null,
        profileImageUrl: profileImageUrl || `https://unavatar.io/twitter/${username}`, // Added profile image URL
        twitterScore,
        title: title || null,
        badges: Object.keys(badges || {}),
        wallets: [],
        referredBy: referralCode || null // Add referral code if available

        
      });
    } else {
      user.twitterScore = twitterScore;
      if (email) user.email = email;
      
      // Always update the username regardless if it's undefined/null
      user.username = username;
      console.log("See the full user:", user);
      user.profileImageUrl = profileImageUrl || user.profileImageUrl || `https://unavatar.io/twitter/${username}`;
      user.title = title || user.title;
      const newBadges = Object.keys(badges || {});
      const existingBadges = user.badges || [];
      user.badges = Array.from(new Set([...existingBadges, ...newBadges]));
      
      // Only set referredBy if it's not already set and if referralCode is provided
      if (referralCode && !user.referredBy) {
        console.log(`✅ Adding referral code to existing user: ${referralCode}`);
        user.referredBy = referralCode;
      }
    }

    // Force Mongoose to recognize username has been modified
    user.markModified('username');
    
    // If referralCode was provided, make sure it gets updated too
    if (referralCode) {
      user.markModified('referredBy');
    }
    
    console.log("User object before save:", {
      privyId: user.privyId,
      email: user.email,
      username: user.username,
      twitterScore: user.twitterScore,
      referredBy: user.referredBy
    });

    // 💾 Save user and let pre-save hook handle totalScore
    await user.save();
    
    // Double-check if the user was saved correctly
    const savedUser = await Score.findOne(query);
    console.log("User saved in DB:", {
      privyId: savedUser.privyId,
      email: savedUser.email,
      username: savedUser.username,
      twitterScore: savedUser.twitterScore,
      referredBy: savedUser.referredBy
    });

    return res.json({
       twitterScore: user.twitterScore,
       totalScore: user.totalScore
      
    });

  } catch (error) {
    console.error("❌ Error calculating Twitter score:", error.message);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ error: "Server Error" });
  }
}
async function refreshUserScore(req, res) {
  try {
    const { privyId, email } = req.body;

    if (!privyId && !email) {
      return res.status(400).json({ error: "privyId or email is required" });
    }

    // Find user
    const query = privyId ? { privyId } : { email };
    const user = await Score.findOne(query);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get data from different sources
    let twitterData = {};
    let walletData = {};
    let telegramData = { groups: [], messages: [] };

    // Twitter data
    if (user.username) {
      try {
        twitterData = await getUserDetails(user.username);
      } catch (err) {
        console.error("Error fetching Twitter data:", err.message);
      }
    }

    // Wallet data (using first wallet for simplicity)
    if (user.wallets && user.wallets.length > 0) {
      try {
        walletData = await getWalletDetails(user.wallets[0].walletAddress);
      } catch (err) {
        console.error("Error fetching wallet data:", err.message);
      }
    }

    // Telegram data
    if (user.userdid && user.authToken) {
      try {
        telegramData = await getTelegramData(user.userdid, user.authToken);
      } catch (err) {
        console.error("Error fetching Telegram data:", err.message);
      }
    }

    // Extract telegram groups and messages
    const telegramGroups = telegramData.groups || [];
    const telegramMessages = telegramData.messages || [];

    // Evaluate user with collected data
    const { scores, badges, title } = await evaluateUser({
      privyId: user.privyId,
      twitterData,
      walletData,
      telegramGroups,
      telegramMessages,
    });

    // Update scores
    user.twitterScore = Math.min(parseFloat(scores?.socialScore) || 10, 50);
    if (user.twitterScore < 10) {
      user.twitterScore = 10;
    }
    user.telegramScore = Math.min((parseFloat(scores?.telegramScore) || 5) + (parseFloat(scores?.communityScore) || 10), 35);
    
    // Update wallet score if we have wallets
    if (user.wallets.length > 0) {
      const cryptoScore = parseFloat(scores?.cryptoScore) || 15;
      const nftScore = parseFloat(scores?.nftScore) || 10;
      const totalWalletScore = Math.min(cryptoScore + nftScore, 70);
      user.wallets[0].score = totalWalletScore;
    }

    // Update badges and title
    user.title = title || user.title;
    user.badges = Array.from(new Set([...user.badges, ...Object.keys(badges || {})]));

    // Save user (pre-save hook will calculate totalScore)
    await user.save();

   

    // Return only totalScore
    return res.json({ totalScore: user.totalScore });

  } catch (error) {
    console.error("Error refreshing scores:", error.message);
    return res.status(500).json({ error: "Server Error" });
  }
}




const weights = {
  // Twitter weights
  followers: 0.001,           // Per follower
  engagement: 0.0001,         // Per engagement unit (favourites + media + listed)
  verification: 5,            // Flat score if verified
  tweetFreq: 0.001,           // Per tweet
  subscriptions: 2,           // Per subscription
  accountAge: 0.1,            // Per year
  media: 0.01,                // Per media item
  pinned: 5,                  // Flat score if pinned tweet exists
  friends: 0.001,             // Per friend
  listed: 0.01,               // Per list membership
  superFollow: 5,             // Flat score if eligible
  retweets: 0.005,            // NEW: Per retweet
  quotes: 0.005,              // NEW: Per quote tweet
  replies: 0.002,             // NEW: Per reply

  // Wallet weights
  activeChains: 5,            // Per chain
  nativeBalance: 10,          // Per unit of native balance
  tokenHoldings: 2,           // Per token
  nftHoldings: 5,             // Per NFT
  defiPositions: 5,           // Per DeFi position
  web3Domains: 5,             // Flat score if domain exists
  transactionCount: 0.01,     // NEW: Per transaction
  uniqueTokenInteractions: 1, // NEW: Per unique token interacted with

  // Telegram weights
  groupCount: 2,              // Per group
  messageFreq: 0.1,           // Per message
  pinnedMessages: 5,          // Per pinned message
  mediaMessages: 2,           // Per media message
  hashtags: 1,                // Per hashtag
  polls: 2,                   // Flat score if can send polls
  leadership: 5,              // Flat score if has leadership permissions
  botInteractions: 1,         // Per bot interaction
  stickerMessages: 0.5,       // NEW: Per sticker message
  gifMessages: 0.5,           // NEW: Per GIF message
  mentionCount: 1             // NEW: Per mention
};

// Updated badge thresholds with new badges
const badgeThresholds = {
  // Twitter-Based Badges
  "Influence Investor": [1000000, 5000000, 10000000], // Followers
  "Tweet Trader": [5, 10, 20],                       // Tweets / 100
  "Engagement Economist": [1000, 5000, 10000],       // Likes received
  "Media Mogul": [100, 500, 1000],                   // Media count
  "List Legend": [100, 500, 1000],                   // Listed count
  "Verified Visionary": [1, 1, 1],                   // Verified status
  "Pinned Post Pro": [1, 1, 1],                      // Pinned tweet exists
  "Super Follower": [1, 1, 1],                       // Super follow eligible
  "Creator Subscriber": [5, 10, 20],                 // Creator subscriptions
  "Twitter Veteran": [5, 10, 15],                    // Account age in years
  "Retweet King": [100, 500, 1000],                  // NEW: Retweets
  "Quote Master": [50, 200, 500],                    // NEW: Quote tweets
  "Reply Champion": [100, 500, 1000],                // NEW: Replies

  // Wallet-Based Badges
  "Chain Explorer": [2, 5, 10],                      // Active chains
  "Token Holder": [5, 20, 50],                       // Token holdings
  "NFT Collector": [1, 5, 10],                       // NFT holdings
  "DeFi Participant": [1, 3, 5],                     // DeFi positions
  "Gas Spender": [100, 500, 1000],                   // Total gas spent (not fully implemented)
  "Staking Enthusiast": [1, 3, 5],                   // Staking positions (not fully implemented)
  "Airdrop Recipient": [1, 5, 10],                   // Airdrops (not fully implemented)
  "DAO Voter": [1, 5, 10],                           // DAO votes (not fully implemented)
  "Web3 Domain Owner": [1, 1, 1],                    // Web3 domain exists
  "High-Value Trader": [10000, 50000, 100000],       // Transaction volume (not fully implemented)
  "Transaction Titan": [100, 500, 1000],             // NEW: Transaction count
  "Token Interactor": [10, 50, 100],                 // NEW: Unique token interactions

  // Telegram-Based Badges
  "Group Guru": [5, 10, 20],                         // Group count
  "Message Maestro": [100, 500, 1000],               // Message frequency
  "Pinned Message Master": [1, 5, 10],               // Pinned messages
  "Media Messenger": [10, 50, 100],                  // Media messages
  "Hashtag Hero": [10, 50, 100],                     // Hashtag usage
  "Poll Creator": [1, 5, 10],                        // Polls created
  "Leadership Legend": [1, 3, 5],                    // Leadership roles
  "Bot Interactor": [10, 50, 100],                   // Bot interactions
  "Verified Group Member": [1, 3, 5],                // Verified groups (not fully implemented)
  "Quick Responder": [10, 50, 100],                  // Fast responses (not fully implemented)
  "Sticker Star": [10, 50, 100],                     // NEW: Sticker messages
  "GIF Guru": [10, 50, 100],                         // NEW: GIF messages
  "Mention Magnet": [10, 50, 100]                    // NEW: Mentions received
};

// Title requirements (unchanged)
const titleRequirements = {
  "Crypto Connoisseur": ["Crypto Communicator", "Social Connector", "Liquidity Laureate", "Telegram Titan"],
  "Blockchain Baron": ["DeFi Master", "Liquidity Laureate", "Governance Griot", "Staking Veteran", "Gas Gladiator"],
  "Digital Dynamo": ["Twitter Veteran", "Fast Grower", "Engagement Star", "Verified Visionary", "Degen Dualist"],
  "DeFi Dynamo": ["DeFi Master", "Airdrop Veteran", "Dapp Diplomat"],
  "NFT Aficionado": ["NFT Networker", "NFT Whale"],
  "Social Savant": ["Crypto Communicator", "Social Connector", "Twitter Veteran", "Engagement Economist", "Retweet Riches"],
  "Protocol Pioneer": ["Chain Explorer", "Cross-Chain Crusader", "DeFi Drifter"],
  "Token Titan": ["Influence Investor", "Meme Miner", "Tweet Trader"],
  "Chain Champion": ["Bridge Blazer", "Viral Validator", "Social HODLer"],
  "Governance Guru": ["DAO Diplomat", "Community Leader", "Governance Griot"]
};

/**
 * Calculate scores for each category based on user data
 * @param {Object} twitterData - Twitter API data
 * @param {Object} walletData - Wallet API data
 * @param {Object} telegramGroups - Telegram groups data
 * @param {Object} telegramMessages - Telegram messages data
 * @returns {Object} Scores for each category and total score
 */
// Model imported once at top

async function calculateScore({ privyId, twitterData, walletData, telegramGroups, telegramMessages }) {
  let socialScore = 0;
  let cryptoScore = 0;
  let nftScore = 0;
  let communityScore = 0;
  let telegramScore = 0;

  // ✅ Twitter Score
  // ✅ Twitter Score
  if (twitterData) {
    try {
      const twitter = twitterData?.data?.user?.result?.legacy;
      const twitterUser = twitterData?.data?.user?.result;

      if (twitter) {
        console.log("📊 Twitter followers:", twitter.followers_count);

        socialScore = (
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

        console.log("Twitter score calculated:", socialScore);
      } else {
        console.error("❌ Twitter legacy data not found");
        socialScore = 0;
      }
    } catch (err) {
      console.error("❌ Error calculating Twitter score:", err.message);
      socialScore = 0;
    }
  }


  // ✅ Wallet Score
  if (walletData) {
    try {
      const wallet = {
        "Native Balance Result": walletData["Native Balance Result"] || 0,
        "Token Balances Result": walletData["Token Balances Result"] || [],
        "activeChains": walletData["Active Chains Result"]?.activeChains || [],
        "DeFi Positions Summary Result": walletData["DeFi Positions Summary Result"] || [],
        "Resolved Address Result": walletData["Resolved Address Result"],
        "Wallet NFTs Result": walletData["Wallet NFTs Result"] || [],
        "transactionCount": walletData["Transaction Count"] || 0,
        "uniqueTokenInteractions": walletData["Unique Token Interactions"] || 0
      };
      console.log("Wallet data", wallet);
      cryptoScore = (
        wallet.activeChains.length * weights.activeChains +
        wallet["Native Balance Result"] * weights.nativeBalance +
        wallet["Token Balances Result"].length * weights.tokenHoldings +
        wallet["DeFi Positions Summary Result"].length * weights.defiPositions +
        (wallet["Resolved Address Result"] ? weights.web3Domains : 0) +
        wallet.transactionCount * weights.transactionCount +
        wallet.uniqueTokenInteractions * weights.uniqueTokenInteractions
      );

      nftScore = wallet["Wallet NFTs Result"].length * weights.nftHoldings;
    } catch (err) {
      console.error("❌ Error calculating Wallet score:", err.message);
    }
  }

  // ✅ Telegram Score
  if (telegramGroups && telegramMessages) {

    try {
      const telegram = Array.isArray(telegramGroups.items) ? telegramGroups.items : [];
      const messages = Array.isArray(telegramMessages.items) ? telegramMessages.items : [];

      communityScore = telegramGroups * weights.groupCount;
      telegramScore = (
        telegramGroups * weights.groupCount +
        telegramMessages * weights.messageFreq +
        messages.filter(m => m?.sourceData?.is_pinned).length * weights.pinnedMessages +
        messages.filter(m => m?.sourceData?.content?._ === "messagePhoto").length * weights.mediaMessages +
        messages.reduce((sum, m) => {
          return sum + (m?.sourceData?.content?.caption?.entities || []).filter(e => e?.type?._ === "textEntityTypeHashtag").length;
        }, 0) * weights.hashtags +
        (telegram.some(g => g?.sourceData?.permissions?.can_send_polls) ? weights.polls : 0) +
        (telegram.some(g => g?.sourceData?.permissions?.can_pin_messages) ? weights.leadership : 0) +
        messages.filter(m => m?.sourceData?.via_bot_user_id !== 0).length * weights.botInteractions +
        messages.filter(m => m?.sourceData?.content?._ === "messageSticker").length * weights.stickerMessages +
        messages.filter(m => m?.sourceData?.content?._ === "messageAnimation").length * weights.gifMessages +
        messages.reduce((sum, m) => {
          return sum + (m?.sourceData?.content?.entities || []).filter(e => e?.type?._ === "textEntityTypeMention").length;
        }, 0) * weights.mentionCount
      );
    } catch (err) {
      console.error("❌ Error calculating Telegram score:", err.message);
    }
  }

  // ✅ Fallbacks: If any score is 0, assign a minimum default
  const safeScores = {
    socialScore: socialScore === 0 ? 10 : socialScore,
    cryptoScore: cryptoScore === 0 ? 15 : cryptoScore,
    nftScore: nftScore === 0 ? 5 : nftScore,
    communityScore: communityScore === 0 ? 10 : communityScore,
    telegramScore: telegramScore === 0 ? 5 : telegramScore
  };




  const totalScore =
    Math.min(safeScores.socialScore, 50) +
    Math.min(safeScores.cryptoScore, 40) +
    Math.min(safeScores.nftScore, 30) +
    Math.min(safeScores.communityScore, 20) +
    Math.min(safeScores.telegramScore, 15);

  const result = {
    ...safeScores,
    totalScore
  };

  // ✅ Save or update DB
  // if (privyId) {
  //   try {
  //     console.log(`Attempting to find score record for privyId: ${privyId}`);
  //     let userScore = await Score.findOne({ privyId });

  //     if (!userScore) {
  //       console.log(`No existing score found for ${privyId}, creating new record`);
  //       userScore = new Score({
  //         privyId,
  //         email: email || "unknown@example.com", // Use email with fallback
  //         username: twitterData?.data?.user?.result?.legacy?.screen_name || "unknown",
  //         twitterScore: safeScores.socialScore,
  //         cryptoScore: safeScores.cryptoScore,
  //         nftScore: safeScores.nftScore,
  //         telegramScore: safeScores.telegramScore,
  //         communityScore: safeScores.communityScore,
  //         totalScore
  //       });
  //     } else {
  //       console.log(`Existing score found for ${privyId}, updating record`);

  //       // Update email if available
  //       if (email) userScore.email = email;

  //       // Update username if Twitter data is available
  //       if (twitterData?.data?.user?.result?.legacy?.screen_name) {
  //         userScore.username = twitterData.data.user.result.legacy.screen_name;
  //       }

  //       // Update scores based on available data
  //       if (twitterData) userScore.twitterScore = safeScores.socialScore;
  //       if (walletData) {
  //         userScore.cryptoScore = safeScores.cryptoScore;
  //         userScore.nftScore = safeScores.nftScore;
  //       }
  //       if (telegramGroups && telegramMessages) {
  //         userScore.telegramScore = safeScores.telegramScore;
  //         userScore.communityScore = safeScores.communityScore;
  //       }

  //       userScore.totalScore = totalScore;
  //     }

  //     console.log(`Saving score to database for ${privyId}`);
  //     const savedScore = await userScore.save();
  //     console.log("Score saved successfully:", savedScore);
  //   } catch (err) {
  //     console.error("❌ Error saving score to DB:", err.message);
  //     console.error("Error stack:", err.stack);

  //     // More specific error checking
  //     if (err.name === 'ValidationError') {
  //       console.error("MongoDB validation error. Details:", err.errors);
  //       // If there are specific validation issues, try to help fix them
  //       for (let field in err.errors) {
  //         console.error(`Field '${field}' error:`, err.errors[field].message);
  //       }
  //     }
  //   }
  // }


  return result;
}


/**
 * Assign badges based on thresholds
 * @param {Object} twitterData - Twitter API data
 * @param {Object} walletData - Wallet API data
 * @param {Object} telegramGroups - Telegram groups data
 * @param {Object} telegramMessages - Telegram messages data
 * @returns {Object} Assigned badges with levels and values
 */
function assignBadges(privyId, twitterData, walletData, telegramGroups, telegramMessages) {
  const badges = {};

  const assignLevel = (badge, value) => {
    const [silver, gold, platinum] = badgeThresholds[badge];
    if (value >= platinum) return { level: "Platinum", value };
    if (value >= gold) return { level: "Gold", value };
    if (value >= silver) return { level: "Silver", value };
    return null;
  };

  // ✅ Twitter-Based Badges

  if (twitterData?.data?.user?.result?.legacy) {
    const twitter = twitterData.data.user.result.legacy;
    const twitterUser = twitterData?.data?.user?.result;

    badges["Influence Investor"] = assignLevel("Influence Investor", twitter.followers_count);
    badges["Tweet Trader"] = assignLevel("Tweet Trader", twitter.statuses_count / 100);
    badges["Engagement Economist"] = assignLevel("Engagement Economist", twitter.favourites_count);
    badges["Media Mogul"] = assignLevel("Media Mogul", twitter.media_count);
    badges["List Legend"] = assignLevel("List Legend", twitter.listed_count);
    badges["Verified Visionary"] = assignLevel("Verified Visionary", twitterUser.is_blue_verified ? 1 : 0);
    badges["Pinned Post Pro"] = assignLevel("Pinned Post Pro", twitter.pinned_tweet_ids_str.length > 0 ? 1 : 0);
    badges["Super Follower"] = assignLevel("Super Follower", twitterUser.super_follow_eligible ? 1 : 0);
    badges["Creator Subscriber"] = assignLevel("Creator Subscriber", twitterUser.creator_subscriptions_count);
    badges["Twitter Veteran"] = assignLevel("Twitter Veteran", (new Date() - new Date(twitter.created_at)) / (1000 * 60 * 60 * 24 * 365));
    badges["Retweet King"] = assignLevel("Retweet King", twitter.retweet_count || 0);
    badges["Quote Master"] = assignLevel("Quote Master", twitter.quote_count || 0);
    badges["Reply Champion"] = assignLevel("Reply Champion", twitter.reply_count || 0);
  }

  // ✅ Wallet-Based Badges
  if (walletData) {
    const wallet = {
      "Native Balance Result": walletData["Native Balance Result"] || 0,
      "Token Balances Result": walletData["Token Balances Result"] || [],
      "activeChains": walletData["Active Chains Result"]?.activeChains || [],
      "DeFi Positions Summary Result": walletData["DeFi Positions Summary Result"] || [],
      "Resolved Address Result": walletData["Resolved Address Result"],
      "Wallet NFTs Result": walletData["Wallet NFTs Result"] || [],
      "transactionCount": walletData["Transaction Count"] || 0,
      "uniqueTokenInteractions": walletData["Unique Token Interactions"] || 0
    };

    badges["Chain Explorer"] = assignLevel("Chain Explorer", wallet.activeChains.length || 0);
    badges["Token Holder"] = assignLevel("Token Holder", wallet["Token Balances Result"].length || 1);
    badges["NFT Collector"] = assignLevel("NFT Collector", wallet["Wallet NFTs Result"].length || 0);
    badges["DeFi Participant"] = assignLevel("DeFi Participant", wallet["DeFi Positions Summary Result"].length ? 1 : 0);
    badges["Web3 Domain Owner"] = assignLevel("Web3 Domain Owner", wallet["Resolved Address Result"] ? 1 : 0);
    badges["Transaction Titan"] = assignLevel("Transaction Titan", wallet.transactionCount || 0);
    badges["Token Interactor"] = assignLevel("Token Interactor", wallet.uniqueTokenInteractions || []);
  }

  // ✅ Telegram-Based Badges
  if (Array.isArray(telegramGroups) && Array.isArray(telegramMessages)) {
    const messages = telegramMessages;
    const telegram = telegramGroups;

    badges["Group Guru"] = assignLevel("Group Guru", telegram.length);
    badges["Message Maestro"] = assignLevel("Message Maestro", messages.length);
    badges["Pinned Message Master"] = assignLevel("Pinned Message Master", messages.filter(m => m.sourceData.is_pinned).length);
    badges["Media Messenger"] = assignLevel("Media Messenger", messages.filter(m => m.sourceData.content._ === "messagePhoto").length);
    badges["Hashtag Hero"] = assignLevel("Hashtag Hero", messages.reduce((sum, m) => {
      return sum + (m.sourceData.content.caption?.entities || []).filter(e => e.type._ === "textEntityTypeHashtag").length;
    }, 0));
    badges["Poll Creator"] = assignLevel("Poll Creator", telegram.some(g => g.sourceData.permissions?.can_send_polls) ? 1 : 0);
    badges["Leadership Legend"] = assignLevel("Leadership Legend", telegram.some(g => g.sourceData.permissions?.can_pin_messages) ? 1 : 0);
    badges["Bot Interactor"] = assignLevel("Bot Interactor", messages.filter(m => m.sourceData.via_bot_user_id !== 0).length);
    badges["Sticker Star"] = assignLevel("Sticker Star", messages.filter(m => m.sourceData.content._ === "messageSticker").length);
    badges["GIF Guru"] = assignLevel("GIF Guru", messages.filter(m => m.sourceData.content._ === "messageAnimation").length);
    badges["Mention Magnet"] = assignLevel("Mention Magnet", messages.reduce((sum, m) => {
      return sum + (m.sourceData.content.entities || []).filter(e => e.type._ === "textEntityTypeMention").length;
    }, 0));
  }

  // 🔁 Return only badges that were actually earned (not null)
  return Object.fromEntries(Object.entries(badges).filter(([_, v]) => v));
}


/**
 * Assign a title based on badge combinations
 * @param {Object} badges - Assigned badges
 * @returns {string} Assigned title
 */
function assignTitleBasedOnBadges(badges) {
  for (const [title, requiredBadges] of Object.entries(titleRequirements)) {
    if (requiredBadges.every(badge => badge in badges)) {
      return title;
    }
  }
  return "ALL ROUNDOOR";
}

/**
 * Main evaluation function
 * @param {Object} twitterData - Twitter API data
 * @param {Object} walletData - Wallet API data
 * @param {Object} telegramGroups - Telegram groups data
 * @param {Object} telegramMessages - Telegram messages data
 * @returns {Object} Evaluation result with title, badges, and scores
 */
async function evaluateUser(privyId, twitterData, walletData, telegramGroups, telegramMessages) {
  const scores = await calculateScore(privyId, twitterData, walletData, telegramGroups, telegramMessages);
  const badges = assignBadges(privyId, twitterData, walletData, telegramGroups, telegramMessages);
  const title = assignTitleBasedOnBadges(badges);

  return {
    title,
    badges,
    scores
  };
}

// Example usage (uncomment and provide data to test)
// const twitterData = /* Your Twitter API data */;
// const walletData = /* Your Wallet API data */;
// const telegramGroups = /* Your Telegram groups data */;
// const telegramMessages = /* Your Telegram messages data */;
// const result = evaluateUser(twitterData, walletData, telegramGroups, telegramMessages);
// console.log(result);

module.exports = { refreshUserScore , TwitterScore, WalletScore, telegramScore };