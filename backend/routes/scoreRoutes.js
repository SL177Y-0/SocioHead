const express = require("express");
const {refreshUserScore ,TwitterScore,WalletScore,telegramScore}= require('../controllers/NewScoreController.js')
const Score = require('../models/Score')

const router = express.Router();

// ✅ Use GET request & dynamic parameters

router.post("/refresh-score", refreshUserScore );

router.post("/get-twitterScore", TwitterScore);

router.post("/get-walletScore", WalletScore);

// Get Telegram score using userId from token store
router.post('/get-telegramScore', telegramScore);

module.exports = router;




// async (req, res) => {
//   try {
//     console.log('\n====== TELEGRAM SCORE API CALL STARTED ======');
//     const { privyId, email, userId, authToken, userDid } = req.body;
    
//     console.log('📥 SCORE API: Request received at:', new Date().toISOString());
//     console.log('📥 SCORE API: Request body:', {
//       privyId: privyId ? privyId.substring(0, 10) + '...' : 'undefined',
//       email: email || 'undefined',
//       userId,
//       hasAuthToken: !!authToken,
//       tokenLength: authToken ? authToken.length : 0,
//       userDid: userDid || 'undefined'
//     });
    
//     // Debug the userTokens state
//     const userTokens = req.app.get('userTokens');
//     console.log('🔑 SCORE API: Available userIds in userTokens:', Object.keys(userTokens || {}));
    
//     // For debugging: detailed token storage info
//     if (userTokens && Object.keys(userTokens).length > 0) {
//       const tokenInfo = Object.entries(userTokens).map(([id, token]) => ({
//         userId: id,
//         tokenPreview: token ? token.substring(0, 10) + '...' : 'null',
//         tokenLength: token ? token.length : 0,
//         match: id === userId ? 'MATCH' : ''
//       }));
//       console.log('🔑 SCORE API: Token storage details:');
//       console.table(tokenInfo);
//     }
    
//     // We can use either userId-based or direct authToken approach
//     let effectiveAuthToken = null;
//     let tokenSource = 'none';
    
//     // First check if we have a direct auth token from the request
//     if (authToken) {
//       console.log('🔑 SCORE API: Using direct auth token from request');
//       effectiveAuthToken = authToken;
//       tokenSource = 'direct';
//     }
//     // Then check if we have a userId to lookup token from userTokens 
//     else if (userId) {
//       console.log('🔍 SCORE API: Looking up auth token for userId:', userId);
//       effectiveAuthToken = req.app.get('userTokens')?.[userId];
      
//       if (!effectiveAuthToken) {
//         console.error('❌ SCORE API: No auth token found for userId:', userId);
//         console.log('🔍 SCORE API: Keys in userTokens:', Object.keys(userTokens || {}));
//         console.log('🔍 SCORE API: userTokens match check:', userId in (userTokens || {}));
//         return res.json({ telegramScore: 35, error: 'token_not_found' }); // Default score
//       } else {
//         console.log('✅ SCORE API: Found auth token for userId:', userId);
//         console.log('🔑 SCORE API: Token preview:', effectiveAuthToken.substring(0, 10) + '...');
//         console.log('📊 SCORE API: Token length:', effectiveAuthToken.length);
//         tokenSource = 'userTokens';
//       }
//     }
//     // If we have neither, return default score
//     else {
//       console.error('❌ SCORE API: No userId or authToken provided');
//       return res.status(400).json({ error: 'userId or authToken is required', telegramScore: 35 });
//     }
    
//     // Find or create user if we have privyId
//     let user = null;
//     let shouldSaveScore = false;
//     if (privyId) {
//       console.log('👤 SCORE API: Looking up user by privyId:', privyId);
//       user = await Score.findOne({ privyId });
      
//       if (!user) {
//         console.log('👤 SCORE API: User not found, creating new user');
//         // Create new user if not found
//         user = new Score({
//           privyId,
//           email,
//           title: "Crypto Novice"
//         });
//         await user.save();
//         console.log('✅ SCORE API: New user created with ID:', user._id);
//       } else {
//         console.log('✅ SCORE API: Found existing user');
//       }
//       shouldSaveScore = true;
//     } else {
//       console.log('⚠️ SCORE API: No privyId provided, will not save score to database');
//     }
    
//     // Use direct Verida API calls according to the reference implementation
//     try {
//       console.log('🌐 SCORE API: Starting Verida API calls');
//       const axios = require('axios');
      
//       // Helper function for base64 encoding
//       function btoa(str) {
//         return Buffer.from(str).toString('base64');
//       }
      
//       // Get groups data
//       const groupSchemaUrl = 'https://common.schemas.verida.io/social/chat/group/v0.1.0/schema.json';
//       const groupSchemaUrlEncoded = btoa(groupSchemaUrl);
      
//       // Get messages data
//       const messageSchemaUrl = 'https://common.schemas.verida.io/social/chat/message/v0.1.0/schema.json';
//       const messageSchemaUrlEncoded = btoa(messageSchemaUrl);
      
//       console.log('🌐 SCORE API: Fetching Telegram data directly from Verida API');
//       console.log('🌐 SCORE API: API_ENDPOINT:', process.env.API_ENDPOINT);
//       console.log('🌐 SCORE API: Token source:', tokenSource);
//       console.log('🌐 SCORE API: Token preview:', effectiveAuthToken ? effectiveAuthToken.substring(0, 10) + '...' : 'null');
      
//       // Log the headers we'll be using
//       const headers = {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${effectiveAuthToken}`
//       };
//       console.log('🌐 SCORE API: Request headers:', JSON.stringify(headers, (key, value) => {
//         if (key === 'Authorization' && value) {
//           const parts = value.split(' ');
//           return parts[0] + ' ' + parts[1].substring(0, 10) + '...';
//         }
//         return value;
//       }, 2));
      
//       // Keywords to check for bonus points - using the same as reference implementation
//       const ENGAGE_KEYWORDS = ['cluster', 'protocol', 'ai', 'defi', 'crypto', 'web3'];
      
//       // Fetch groups
//       const groupRequestConfig = {
//         method: 'POST',
//         url: `${process.env.API_ENDPOINT}/ds/query/${groupSchemaUrlEncoded}`,
//         data: {
//           query: {
//             sourceApplication: "https://telegram.com"
//           },
//           options: {
//             sort: [{ _id: "desc" }],
//             limit: 100000
//           }
//         },
//         headers
//       };
      
//       console.log('🌐 SCORE API: Group request config:', JSON.stringify(groupRequestConfig, (key, value) => {
//         if (key === 'headers' && value.Authorization) {
//           return {
//             ...value,
//             Authorization: value.Authorization.substring(0, 15) + '...'
//           };
//         }
//         return value;
//       }, 2));
      
//       let groupResponse;
//       try {
//         const startTime = Date.now();
//         groupResponse = await axios(groupRequestConfig);
        
//         const duration = Date.now() - startTime;
//         console.log(`✅ SCORE API: Groups API responded in ${duration}ms with status:`, groupResponse.status);
//         console.log('✅ SCORE API: Groups API response headers:', JSON.stringify(groupResponse.headers, null, 2));
//       } catch (groupError) {
//         console.error('❌ SCORE API: Groups API request failed:', groupError.message);
//         if (groupError.response) {
//           console.error('❌ SCORE API: Groups API response status:', groupError.response.status);
//           console.error('❌ SCORE API: Groups API response data:', JSON.stringify(groupError.response.data));
//         }
//         throw groupError; // Re-throw to handle in the outer catch
//       }
      
//       // Fetch messages
//       const messageRequestConfig = {
//         method: 'POST',
//         url: `${process.env.API_ENDPOINT}/ds/query/${messageSchemaUrlEncoded}`,
//         data: {
//           query: {
//             sourceApplication: "https://telegram.com"
//           },
//           options: {
//             sort: [{ _id: "desc" }],
//             limit: 100000
//           }
//         },
//         headers
//       };
      
//       console.log('🌐 SCORE API: Message request config:', JSON.stringify(messageRequestConfig, (key, value) => {
//         if (key === 'headers' && value.Authorization) {
//           return {
//             ...value,
//             Authorization: value.Authorization.substring(0, 15) + '...'
//           };
//         }
//         return value;
//       }, 2));
      
//       let messageResponse;
//       try {
//         const startTime = Date.now();
//         messageResponse = await axios(messageRequestConfig);
        
//         const duration = Date.now() - startTime;
//         console.log(`✅ SCORE API: Messages API responded in ${duration}ms with status:`, messageResponse.status);
//         console.log('✅ SCORE API: Messages API response headers:', JSON.stringify(messageResponse.headers, null, 2));
//       } catch (messageError) {
//         console.error('❌ SCORE API: Messages API request failed:', messageError.message);
//         if (messageError.response) {
//           console.error('❌ SCORE API: Messages API response status:', messageError.response.status);
//           console.error('❌ SCORE API: Messages API response data:', JSON.stringify(messageError.response.data));
//         }
//         throw messageError; // Re-throw to handle in the outer catch
//       }
      
//       // Extract data
//       const groups = groupResponse.data && groupResponse.data.items ? groupResponse.data.items : [];
//       const messages = messageResponse.data && messageResponse.data.items ? messageResponse.data.items : [];
      
//       console.log(`📊 SCORE API: Fetched ${groups.length} Telegram groups and ${messages.length} messages`);
      
//       // Log response metadata to understand pagination and total counts
//       console.log('📊 SCORE API: Group response metadata:', JSON.stringify(groupResponse.data.meta || {}, null, 2));
//       console.log('📊 SCORE API: Message response metadata:', JSON.stringify(messageResponse.data.meta || {}, null, 2));
      
//       // Log full structures to understand the data schema
//       if (groups.length > 0) {
//         console.log('📊 SCORE API: Sample group data (first item):', JSON.stringify(groups[0], null, 2));
        
//         // Log all groups (limited to avoid console overflow)
//         console.log('📊 SCORE API: All groups (up to 10):');
//         groups.slice(0, 10).forEach((group, index) => {
//           console.log(`Group ${index + 1}:`, {
//             id: group.id || group._id,
//             name: group.name || group.title || group.groupName || 'Unnamed',
//             type: group.type || group.groupType || 'Unknown',
//             memberCount: group.memberCount || group.members?.length || 'Unknown',
//             sourceApplication: group.sourceApplication || 'Unknown',
//             // Extract other relevant fields
//             ...Object.entries(group)
//               .filter(([key]) => !['id', '_id', 'name', 'title', 'groupName', 'type', 'groupType', 'memberCount', 'members', 'sourceApplication'].includes(key))
//               .reduce((acc, [key, value]) => {
//                 if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
//                   acc[key] = value;
//                 } else if (value && typeof value === 'object') {
//                   acc[key] = 'Object/Array';
//                 }
//                 return acc;
//               }, {})
//           });
//         });
        
//         // Log group statistics if available
//         const groupTypes = {};
//         groups.forEach(group => {
//           const type = group.type || group.groupType || 'Unknown';
//           groupTypes[type] = (groupTypes[type] || 0) + 1;
//         });
//         console.log('📊 SCORE API: Group statistics by type:', groupTypes);
//       } else {
//         console.log('⚠️ SCORE API: No groups data found in response');
//         console.log('📊 SCORE API: Raw group response data:', JSON.stringify(groupResponse.data, null, 2));
//       }
      
//       if (messages.length > 0) {
//         console.log('📊 SCORE API: Sample message data (first item):', JSON.stringify(messages[0], null, 2));
        
//         // Log a few messages (limited to avoid console overflow)
//         console.log('📊 SCORE API: Sample messages (up to 5):');
//         messages.slice(0, 5).forEach((message, index) => {
//           console.log(`Message ${index + 1}:`, {
//             id: message.id || message._id,
//             text: message.messageText || message.text || message.body || message.content || 'No text',
//             sender: message.sender || message.from || 'Unknown',
//             timestamp: message.timestamp || message.createdAt || message.date || 'Unknown',
//             sourceApplication: message.sourceApplication || 'Unknown',
//             // Include other fields that might be important
//             ...Object.entries(message)
//               .filter(([key]) => !['id', '_id', 'messageText', 'text', 'body', 'content', 'sender', 'from', 'timestamp', 'createdAt', 'date', 'sourceApplication'].includes(key))
//               .reduce((acc, [key, value]) => {
//                 if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
//                   acc[key] = value;
//                 } else if (value && typeof value === 'object') {
//                   acc[key] = 'Object/Array';
//                 }
//                 return acc;
//               }, {})
//           });
//         });
        
//         // Analyze message content to understand what we're working with
//         let textCount = 0;
//         let emptyTextCount = 0;
//         let mediaCount = 0;
//         let messageStats = {
//           avgTextLength: 0,
//           totalTextLength: 0,
//           lengthDistribution: {
//             short: 0, // 0-50 chars
//             medium: 0, // 51-200 chars
//             long: 0 // 200+ chars
//           }
//         };
        
//         messages.forEach(message => {
//           const text = message.messageText || message.text || message.body || message.content || '';
          
//           if (text && typeof text === 'string' && text.trim().length > 0) {
//             textCount++;
//             messageStats.totalTextLength += text.length;
            
//             // Categorize message length
//             if (text.length <= 50) messageStats.lengthDistribution.short++;
//             else if (text.length <= 200) messageStats.lengthDistribution.medium++;
//             else messageStats.lengthDistribution.long++;
//           } else {
//             emptyTextCount++;
//           }
          
//           // Check for media
//           if (message.hasMedia || message.media || message.photo || message.video || message.file) {
//             mediaCount++;
//           }
//         });
        
//         if (textCount > 0) {
//           messageStats.avgTextLength = Math.round(messageStats.totalTextLength / textCount);
//         }
        
//         console.log('📊 SCORE API: Message analysis:', {
//           totalMessages: messages.length,
//           messagesWithText: textCount,
//           messagesWithoutText: emptyTextCount,
//           messagesWithMedia: mediaCount,
//           averageTextLength: messageStats.avgTextLength,
//           lengthDistribution: messageStats.lengthDistribution
//         });
//       } else {
//         console.log('⚠️ SCORE API: No messages data found in response');
//         console.log('📊 SCORE API: Raw message response data:', JSON.stringify(messageResponse.data, null, 2));
//       }
      
//       // Check for keywords in messages
//       let keywordMatches = {
//         totalCount: 0,
//         keywords: {}
//       };
      
//       // Initialize keyword counts
//       ENGAGE_KEYWORDS.forEach(keyword => {
//         keywordMatches.keywords[keyword] = 0;
//       });
      
//       // Analyze messages for keywords
//       console.log('🔍 SCORE API: Analyzing messages for keywords');
//       console.log('🔍 SCORE API: Keywords being searched for:', ENGAGE_KEYWORDS);
      
//       let processedMessageCount = 0;
//       let matchedMessagesCount = 0;
//       let exampleMatches = []; // Store examples of matching messages
      
//       messages.forEach(message => {
//         processedMessageCount++;
//         // Extract text content from message
//         let allTextFields = [];
        
//         // Add all string fields from the message object
//         Object.entries(message).forEach(([key, value]) => {
//           if (typeof value === 'string') {
//             allTextFields.push(value);
//           } else if (typeof value === 'object' && value !== null) {
//             // Check nested objects (like "body" or "data")
//             Object.values(value).forEach(nestedValue => {
//               if (typeof nestedValue === 'string') {
//                 allTextFields.push(nestedValue);
//               }
//             });
//           }
//         });
        
//         const messageText = allTextFields.join(' ').toLowerCase();
        
//         // For debugging, store the message fields we extracted
//         if (processedMessageCount <= 3) {
//           console.log(`🔍 SCORE API: Message #${processedMessageCount} extracted fields:`, allTextFields);
//           console.log(`🔍 SCORE API: Message #${processedMessageCount} combined text:`, messageText.substring(0, 100) + (messageText.length > 100 ? '...' : ''));
//         }
        
//         // Check for keywords
//         let foundKeywordsInThisMessage = false;
//         let matchedKeywords = [];
        
//         ENGAGE_KEYWORDS.forEach(keyword => {
//           if (messageText.includes(keyword.toLowerCase())) {
//             keywordMatches.keywords[keyword]++;
//             keywordMatches.totalCount++;
//             matchedKeywords.push(keyword);
//             foundKeywordsInThisMessage = true;
//           }
//         });
        
//         // Log matched keywords in this message
//         if (foundKeywordsInThisMessage) {
//           matchedMessagesCount++;
          
//           // Store a few examples of matches
//           if (exampleMatches.length < 5) {
//             // Find 20 characters before and after each keyword match
//             const matchExamples = matchedKeywords.map(keyword => {
//               const keywordLower = keyword.toLowerCase();
//               const index = messageText.indexOf(keywordLower);
//               if (index >= 0) {
//                 const start = Math.max(0, index - 20);
//                 const end = Math.min(messageText.length, index + keywordLower.length + 20);
//                 return {
//                   keyword,
//                   context: messageText.substring(start, end).replace(keywordLower, `[${keywordLower}]`)
//                 };
//               }
//               return null;
//             }).filter(Boolean);
            
//             exampleMatches.push({
//               messageId: message.id || message._id || `msg-${processedMessageCount}`,
//               matchedKeywords,
//               examples: matchExamples
//             });
//           }
//         }
//       });
      
//       console.log(`📊 SCORE API: Processed ${processedMessageCount} messages for keyword analysis`);
//       console.log(`📊 SCORE API: Found ${matchedMessagesCount} messages containing keywords`);
//       console.log('📊 SCORE API: Keyword match totals:', JSON.stringify(keywordMatches.keywords, null, 2));
//       console.log('📊 SCORE API: Example keyword matches:', JSON.stringify(exampleMatches, null, 2));
//       console.log('📊 SCORE API: Total keyword matches:', keywordMatches.totalCount);
      
//       // Calculate engagement score according to the final flow document:
//       // - Groups: 10 points each
//       // - Messages: 1 point each
//       // - Keywords: 5 bonus points per match
//       const groupBonus = groups.length * 10;
//       const messageBonus = messages.length;
//       const keywordBonus = keywordMatches.totalCount * 5;
      
//       // Calculate total score (min 35, max 5000)
//       let totalScore = groupBonus + messageBonus + keywordBonus;
//       totalScore = Math.max(35, Math.min(5000, totalScore));
      
//       console.log(`📊 SCORE API: Score calculation:
//         Groups: ${groups.length} × 10 = ${groupBonus} points
//         Messages: ${messages.length} × 1 = ${messageBonus} points
//         Keywords: ${keywordMatches.totalCount} × 5 = ${keywordBonus} points
//         Raw total: ${groupBonus + messageBonus + keywordBonus} points
//         Final (capped) score: ${totalScore} points
//       `);
      
//       // If user exists, update their score
//       if (user && shouldSaveScore) {
//         user.telegramScore = totalScore;
//         await user.save();
//         console.log(`✅ SCORE API: Updated user ${user.privyId} with telegramScore: ${totalScore}`);
//       } else if (!user && privyId) {
//         console.log('⚠️ SCORE API: User object not available but privyId provided - strange condition');
//       } else {
//         console.log('ℹ️ SCORE API: No user to save score for, returning score without saving');
//       }
      
//       console.log('====== TELEGRAM SCORE API CALL COMPLETE ======\n');
//       return res.json({ 
//         telegramScore: totalScore,
//         stats: {
//           groups: groups.length,
//           messages: messages.length,
//           keywordMatches
//         }
//       });
      
//     } catch (error) {
//       console.error('❌ SCORE API: Error fetching Telegram data:', error);
      
//       // Log more details if it's an Axios error
//       if (error.response) {
//         console.error('❌ SCORE API: Response status:', error.response.status);
//         console.error('❌ SCORE API: Response data:', JSON.stringify(error.response.data));
//       }
      
//       console.log('====== TELEGRAM SCORE API CALL FAILED ======\n');
//       return res.json({ 
//         telegramScore: 35,
//         error: error.message,
//         errorType: error.name
//       }); // Default score on error
//     }
//   } catch (error) {
//     console.error('❌ SCORE API: Unexpected error in get-telegramScore endpoint:', error);
//     console.log('====== TELEGRAM SCORE API CALL FAILED ======\n');
//     return res.status(500).json({ error: 'Server error', telegramScore: 35 });
//   }
// }


