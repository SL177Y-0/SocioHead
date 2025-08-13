const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const Moralis = require("moralis").default;
const Score = require("./models/Score");
const scoreRoutes= require('./routes/scoreRoutes.js')
const blockchainRoutes = require("./routes/blockchainRoutes");
const twitterRoutes = require("./routes/twitterRoutes");
const apiRoutes = require('./routes/api.js')
const connectDB = require('./db.js')
const veridaService = require('./Services/veridaService.js');
const chartRoutes = require('./routes/chart.js')
const scoreFetchingroutes= require('./routes/scoreFetchingroutes.js')
const ReffralRoutes= require('./routes/ReffralRoutes.js')
const LeaderboardRoutes= require('./routes/Leaderboard.js')
const axios = require('axios');
const { data } = require("autoprefixer");

dotenv.config(); // Load .env variables

const app = express();
app.use(cors());
app.use(express.json());

// API Routes

app.use("/api/chart", chartRoutes);
app.use("/api/twitter", twitterRoutes);

// Load blockchain routes
app.use("/api/blockchain", blockchainRoutes);

app.use('/reffral',ReffralRoutes)

app.use('/api', apiRoutes);
app.use("/score-fetch", scoreFetchingroutes);
app.use('/leaderboard', LeaderboardRoutes)

// In-memory storage for auth tokens
const userTokens = {};
app.set('userTokens', userTokens); // Make userTokens accessible to routes

// Add detailed token debugging
// Log every 10 seconds

// Extended debug endpoint with more details
app.get('/debug/tokens', (req, res) => {
  console.log('🔍 DEBUG: /debug/tokens endpoint accessed');
  
  // Create a detailed summary of stored tokens
  const tokenSummary = Object.entries(userTokens).map(([userId, token]) => ({
    userId,
    tokenPreview: token ? `${token.substring(0, 10)}...${token.substring(token.length - 5)}` : 'null',
    tokenLength: token ? token.length : 0,
    tokenType: token ? (token.startsWith('ey') ? 'JWT-like' : 'Unknown') : 'None',
    createdApprox: userId.includes('-') ? new Date(parseInt(userId.split('-')[1])).toISOString() : 'Unknown'
  }));
  
  console.log('🔍 DEBUG: Token storage details:');
  console.log(JSON.stringify(tokenSummary, null, 2));
  
  res.json({
    tokenCount: Object.keys(userTokens).length,
    tokens: tokenSummary,
    memory: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// Force token endpoint for testing
app.get('/debug/force-token', (req, res) => {
  const { userId, token } = req.query;
  
  if (!userId || !token) {
    return res.status(400).json({ success: false, error: 'userId and token parameters required' });
  }
  
  userTokens[userId] = token;
  console.log(`🔧 MANUAL: Force-added token for userId: ${userId}`);
  console.log(`🔧 MANUAL: Token preview: ${token.substring(0, 10)}...`);
  
  return res.json({ 
    success: true, 
    message: `Token added for userId: ${userId}`,
    tokenCount: Object.keys(userTokens).length,
    activeUserIds: Object.keys(userTokens)
  });
});

app.get('/auth/callback', async (req, res) => {
  try {
    
    console.log('\n======== AUTH CALLBACK RECEIVED ========');
    console.log('🔍 AUTH: auth_token present:', !!req.query.auth_token);
    console.log('🔍 AUTH: query params:', JSON.stringify(req.query, (key, value) => {
      // Mask auth_token for security
      if (key === 'auth_token' && value) {
        return value.substring(0, 10) + '...[MASKED]...';
      }
      return value;
    }, 2));
    console.log('🔍 AUTH: full URL:', req.originalUrl);
    console.log('🔍 AUTH: headers:', JSON.stringify(req.headers, null, 2));
    
    const { auth_token } = req.query;
    
    if (!auth_token) {
      console.error('❌ AUTH: No auth token provided in callback');
      return res.status(400).json({ success: false, error: 'No auth token provided' });
    }
    
    // Store token with a unique userId - 'user-${timestamp}' as specified in the flow
    const userId = 'user-' + Date.now();
    userTokens[userId] = auth_token;
    console.log('✅ AUTH: Stored auth token for user:', userId);
    console.log('🔑 AUTH: Token preview:', auth_token.substring(0, 10) + '...');
    console.log('📊 AUTH: Token length:', auth_token.length);
    console.log('📊 AUTH: Current token count:', Object.keys(userTokens).length);
    console.log('📝 AUTH: All userIds:', Object.keys(userTokens));
    
    // Test token immediately to validate it works
    try {
      console.log('🧪 AUTH: Testing token validity...');
      const schemaUrl = 'https://common.schemas.verida.io/social/chat/group/v0.1.0/schema.json';
      const schemaUrlEncoded = btoa(schemaUrl);
      
      const testResponse = await axios({
        method: 'POST',
        url: `${process.env.API_ENDPOINT}/ds/query/${schemaUrlEncoded}`,
        data: {
          query: {
            sourceApplication: "https://telegram.com"
          },
          options: {
            sort: [{ _id: "desc" }],
            limit: 1
          }
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth_token}`
        }
      });
      
      console.log('✅ AUTH: Token test successful! API responded with status:', testResponse.status);
      console.log('📊 AUTH: API response contains data:', !!testResponse.data);
    } catch (testError) {
      console.error('❌ AUTH: Token test failed!', testError.message);
      if (testError.response) {
        console.error('❌ AUTH: API responded with status:', testError.response.status);
        console.error('❌ AUTH: API error data:', JSON.stringify(testError.response.data));
      }
    }
    
      const userDid = await veridaService.getUserDID(auth_token)
      console.log("User did", userDid)
   
    // Get frontend URL from environment variables or fallback to default
    const frontendUrl = process.env.FRONTEND_URL || 'https://braindrop.fun/connect/telegram';
    
    // Redirect to frontend with the userId as specified in the flow
    const redirectUrl = `${frontendUrl}?authToken=${encodeURIComponent(auth_token)}&userDid=${userDid}`;
    
    console.log('🔄 AUTH: Redirecting to frontend with userId:', redirectUrl);
    
    // Set Cache-Control header to prevent caching issues
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    console.log('========== AUTH CALLBACK COMPLETE ==========\n');
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ AUTH: Error in auth callback:', error);
    
    // Get frontend URL from environment variables or fallback to default
    const frontendUrl = process.env.FRONTEND_URL || 'https://braindrop.fun/connect/telegram';
    
    // Redirect to frontend with error information
    res.redirect(`${frontendUrl}?error=auth_error&message=${encodeURIComponent(error.message || 'Unknown error')}`);
  }
});

// Default route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running fine." });
});
connectDB();

app.use("/api/score", scoreRoutes); 

//reffral

// Registration endpoint that handles referrals
app.post("/register", async (req, res) => {
  try {
    const { privyId, email, username, referralCode } = req.body;
    
    // Check if user already exists
    let user = await Score.findOne({ privyId });
    
    if (user) {
      // User exists, update if needed
      if (username && !user.username) {
        user.username = username;
        await user.save();
      }
      
      // Check if user doesn't have a referral code yet
      if (!user.referralCode) {
        // Generate one based on username or random
        user.referralCode = username || generateRandomCode();
        await user.save();
      }
      
      // If referral code is provided and user doesn't have a referrer yet
      if (referralCode && !user.referredBy) {
        // Check if referral code is valid
        const referrer = await Score.findOne({ referralCode });
        
        if (referrer && referrer.privyId !== privyId) {
          user.referredBy = referralCode;
          await user.save();
        }
      }
      
      return res.status(200).json({
        success: true,
        message: "User already exists",
        user: {
          privyId: user.privyId,
          username: user.username,
          email: user.email,
          totalScore: user.totalScore,
          referralCode: user.referralCode,
          referredBy: user.referredBy
        }
      });
    }
    
    // Create new user
    let referralCodeToUse = username;
    
    // Check if username is already used as a referral code
    if (username) {
      const existingUser = await Score.findOne({ referralCode: username });
      if (existingUser) {
        // If username is taken as a referral code, generate a random one
        referralCodeToUse = generateRandomCode();
      }
    } else {
      // No username, generate random code
      referralCodeToUse = generateRandomCode();
    }
    
    user = new Score({
      privyId,
      email,
      username,
      title: "Crypto Novice", // Default title for new users
      referralCode: referralCodeToUse
    });
    
    // If referral code provided, check and set it
    if (referralCode) {
      const referrer = await Score.findOne({ referralCode });
      if (referrer && referrer.privyId !== privyId) {
        user.referredBy = referralCode;
      }
    }
    
    await user.save();
    
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        privyId: user.privyId,
        username: user.username,
        email: user.email,
        totalScore: user.totalScore,
        referralCode: user.referralCode,
        referredBy: user.referredBy
      }
    });
  } catch (error) {
    console.error("Error in registration:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// Helper function to generate random code
function generateRandomCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Helper function for base64 encoding
function btoa(str) {
  return Buffer.from(str).toString('base64');
}

// ===== TELEGRAM DATA ROUTES =====

// Get Telegram groups
app.get('/api/telegram/groups', async (req, res) => {
  try {
    const { userId } = req.query;
    const authToken = userTokens[userId];
    
    if (!authToken) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    // Use the correct schema URL and encode it in base64
    const schemaUrl = 'https://common.schemas.verida.io/social/chat/group/v0.1.0/schema.json';
    const schemaUrlEncoded = btoa(schemaUrl);
    
    console.log('Making request to:', `${process.env.API_ENDPOINT}/ds/query/${schemaUrlEncoded}`);
    
    // Make request to Verida API with POST to ds/query
    const response = await axios({
      method: 'POST',
      url: `${process.env.API_ENDPOINT}/ds/query/${schemaUrlEncoded}`,
      data: {
        query: {
          sourceApplication: "https://telegram.com"
        },
        options: {
          sort: [{ _id: "desc" }],
          limit: 100000
        }
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    // Check if response.data exists and has the expected structure
    const groups = response.data && response.data.items ? response.data.items : [];
    console.log(`Fetched ${groups.length} Telegram groups`);
    
    res.json({ 
      success: true, 
      count: groups.length,
      groups: groups
    });
  } catch (error) {
    console.error('Error fetching Telegram groups:', error);
    
    // Log more details if it's an Axios error
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Telegram messages
app.get('/api/telegram/messages', async (req, res) => {
  try {
    const { userId } = req.query;
    const authToken = userTokens[userId];
    
    if (!authToken) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    // Use the correct schema URL and encode it in base64
    const schemaUrl = 'https://common.schemas.verida.io/social/chat/message/v0.1.0/schema.json';
    const schemaUrlEncoded = btoa(schemaUrl);
    
    console.log('Making request to:', `${process.env.API_ENDPOINT}/ds/query/${schemaUrlEncoded}`);
    
    // Make request to Verida API with POST to ds/query
    const response = await axios({
      method: 'POST',
      url: `${process.env.API_ENDPOINT}/ds/query/${schemaUrlEncoded}`,
      data: {
        query: {
          sourceApplication: "https://telegram.com"
        },
        options: {
          sort: [{ _id: "desc" }],
          limit: 100000
        }
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    // Check if response.data exists and has the expected structure
    const messages = response.data && response.data.items ? response.data.items : [];
    console.log(`Fetched ${messages.length} Telegram messages`);
    
    res.json({ 
      success: true, 
      count: messages.length,
      messages: messages
    });
  } catch (error) {
    console.error('Error fetching Telegram messages:', error);
    
    // Log more details if it's an Axios error
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get keyword stats for messages (counts for specified keywords)
app.get('/api/telegram/stats', async (req, res) => {
  try {
    const { userId } = req.query;
    const authToken = userTokens[userId];
    
    if (!authToken) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    // Keywords to check for bonus points
    const ENGAGE_KEYWORDS = ['cluster', 'protocol', 'ai', 'defi', 'crypto', 'web3'];
    
    // Get all messages to analyze keywords
    const schemaUrl = 'https://common.schemas.verida.io/social/chat/message/v0.1.0/schema.json';
    const schemaUrlEncoded = btoa(schemaUrl);
    
    console.log('Making message request to:', `${process.env.API_ENDPOINT}/ds/query/${schemaUrlEncoded}`);
    
    const response = await axios({
      method: 'POST',
      url: `${process.env.API_ENDPOINT}/ds/query/${schemaUrlEncoded}`,
      data: {
        query: {
          sourceApplication: "https://telegram.com"
        },
        options: {
          sort: [{ _id: "desc" }],
          limit: 100000
        }
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    // Check if response.data exists and has the expected structure
    const messages = response.data && response.data.items ? response.data.items : [];
    
    // Count occurrences of keywords
    const keywordCounts = {};
    ENGAGE_KEYWORDS.forEach(keyword => {
      keywordCounts[keyword] = 0;
    });
    
    let totalMatches = 0;
    
    // Process messages for keywords
    messages.forEach(message => {
      // Extract text content from message
      let allTextFields = [];
      
      // Add all string fields from the message object
      Object.entries(message).forEach(([key, value]) => {
        if (typeof value === 'string') {
          allTextFields.push(value);
        } else if (typeof value === 'object' && value !== null) {
          // Check nested objects (like "body" or "data")
          Object.values(value).forEach(nestedValue => {
            if (typeof nestedValue === 'string') {
              allTextFields.push(nestedValue);
            }
          });
        }
      });
      
      const messageText = allTextFields.join(' ').toLowerCase();
      
      // Check for keywords
      ENGAGE_KEYWORDS.forEach(keyword => {
        if (messageText.includes(keyword.toLowerCase())) {
          keywordCounts[keyword]++;
          totalMatches++;
        }
      });
    });
    
    console.log(`Analyzed ${messages.length} messages, found ${totalMatches} keyword matches`);
    
    res.json({
      success: true,
      keywordStats: {
        totalMatches,
        keywords: keywordCounts
      }
    });
  } catch (error) {
    console.error('Error fetching keyword stats:', error);
    
    // Log more details if it's an Axios error
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to count datastore items
async function getDatastoreCount(authToken, schemaUrl) {
  try {
    const schemaUrlEncoded = btoa(schemaUrl);
    
    // Make request to Verida API with POST to ds/query
    const response = await axios({
      method: 'POST',
      url: `${process.env.API_ENDPOINT}/ds/query/${schemaUrlEncoded}`,
      data: {
        query: {
          sourceApplication: "https://telegram.com"
        },
        options: {
          sort: [{ _id: "desc" }],
          limit: 1  // Just need count
        }
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    return response.data && response.data.meta && response.data.meta.totalItems ? response.data.meta.totalItems : 0;
  } catch (error) {
    console.error(`Error getting count for schema ${schemaUrl}:`, error);
    return 0;
  }
}

// Get Telegram count endpoint
app.get('/api/telegram/count', async (req, res) => {
  try {
    const { userId } = req.query;
    const authToken = userTokens[userId];
    
    if (!authToken) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    const groupSchemaUrl = 'https://common.schemas.verida.io/social/chat/group/v0.1.0/schema.json';
    const messageSchemaUrl = 'https://common.schemas.verida.io/social/chat/message/v0.1.0/schema.json';
    
    const groupCount = await getDatastoreCount(authToken, groupSchemaUrl);
    const messageCount = await getDatastoreCount(authToken, messageSchemaUrl);
    
    res.json({
      success: true,
      counts: {
        groups: groupCount,
        messages: messageCount
      }
    });
  } catch (error) {
    console.error('Error fetching Telegram counts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search endpoint for Telegram messages
app.get('/api/telegram/search', async (req, res) => {
  try {
    const { userId, keyword } = req.query;
    const authToken = userTokens[userId];
    
    if (!authToken) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    if (!keyword) {
      return res.status(400).json({ success: false, error: 'Keyword is required' });
    }
    
    const schemaUrl = 'https://common.schemas.verida.io/social/chat/message/v0.1.0/schema.json';
    const schemaUrlEncoded = btoa(schemaUrl);
    
    console.log(`Making search request for keyword "${keyword}" to: ${process.env.API_ENDPOINT}/ds/query/${schemaUrlEncoded}`);
    
    const response = await axios({
      method: 'POST',
      url: `${process.env.API_ENDPOINT}/ds/query/${schemaUrlEncoded}`,
      data: {
        query: {
          sourceApplication: "https://telegram.com"
        },
        options: {
          sort: [{ _id: "desc" }],
          limit: 100000
        }
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const messages = response.data && response.data.items ? response.data.items : [];
    console.log(`Searching ${messages.length} messages for keyword: "${keyword}"`);
    
    // Search for keyword in message content
    const matchingMessages = messages.filter(message => {
      // Extract text content from possible message fields
      let content = '';
      if (message.messageText) content = message.messageText;
      else if (message.message) content = message.message;
      else if (message.text) content = message.text;
      else if (message.content) content = message.content;
      else if (typeof message === 'object') {
        // Try to extract from nested objects
        Object.values(message).forEach(value => {
          if (typeof value === 'string') content += ' ' + value;
        });
      }
      
      // Convert to string and lowercase for case-insensitive search
      content = String(content).toLowerCase();
      return content.includes(keyword.toLowerCase());
    });
    
    console.log(`Found ${matchingMessages.length} messages containing keyword "${keyword}"`);
    
    res.json({
      success: true,
      count: matchingMessages.length,
      messages: matchingMessages
    });
  } catch (error) {
    console.error('Error searching Telegram messages:', error);
    
    // Log more details if it's an Axios error
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const startServer = async () => {
  try {
    await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });
    
  } catch (error) {
    console.error(" Error starting server:", error);
  }
};

startServer();