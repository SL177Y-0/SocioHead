import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { auth, twitterProvider } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Twitter } from "lucide-react";
import axios from "axios";
import GlassmorphicCard from "@/components/GlassmorphicCard";
import CyberButton from "@/components/CyberButton";
import PageTransition from "@/components/PageTransition";
import AnimatedCheckmark from "@/components/AnimatedCheckmark";
import FloatingElements from "@/components/FloatingElements";
import ScoreDisplay from "@/components/ScoreDisplay";
import { useScore } from "@/context/ScoreContext";
import ConnectionSlotMachineScore from "@/components/ConnectionSlotMachineScore";
import { useReferral } from "@/context/ReferralContext"; // Import useReferral

const twitterTasks = [
  "Checking Crypto Twitter Presence",
  "Analyzing Engagement & Activity",
  "Measuring Follower Quality & Growth",
  "Detecting Viral Impact Score",
];
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://back.braindrop.fun";
// Default score to use if API fails or returns no score
const DEFAULT_SCORE = 30;

const TwitterConnectPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setTwitterScore, setTwitterConnected } = useScore();
  const { referralCode } = useReferral(); // Get referral code from context
  const [isConnecting, setIsConnecting] = useState(false);
  const [taskStatus, setTaskStatus] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);
  const [completedScan, setCompletedScan] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [targetScore, setTargetScore] = useState(0);
  const [score, setScore] = useState(0);
  // State to track screen size
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  // Use Privy authentication
  const { authenticated, user: privyUser } = usePrivy();
  
  // Get referral code from URL or localStorage
  const [currentReferralCode, setCurrentReferralCode] = useState(null);
  
  // Extract referral code on component mount
  useEffect(() => {
    // Check URL first
    const searchParams = new URLSearchParams(location.search);
    const urlRefCode = searchParams.get('ref');
    
    // Check localStorage as fallback
    const storedRefCode = localStorage.getItem('pendingReferralCode');
    
    // Check context as another option
    const contextRefCode = referralCode;
    
    // Use the first available code
    const refCode = urlRefCode || storedRefCode || contextRefCode;
    
    if (refCode) {
      console.log("Found referral code:", refCode);
      setCurrentReferralCode(refCode);
    }
  }, [location, referralCode]);
  
  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 765 || window.innerHeight < 932);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  useEffect(() => {
    console.log("Privy user:", privyUser);
  }, [privyUser]);

  // Login with Twitter
  const loginWithTwitter = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, twitterProvider);
      setUser(result.user);
      setError(null);
      
      // Get user details from Privy user and Twitter auth
      const privyId = privyUser?.id || "guest";
      const email = privyUser?.email?.address || "";
      const username = result._tokenResponse.screenName || "unknown";
      
      try {
        // Prepare API request payload
        const payload = {
          privyId,
          email,
          username
        };
        
        // Only add referral code if it exists
        if (currentReferralCode) {
          payload.referralCode = currentReferralCode;
          console.log("Fetching score with referral code:", { ...payload });
        } else {
          console.log("Fetching score without referral code:", { ...payload });
        }
        
        // Make API call
        const response = await axios.post(`${apiBaseUrl}/api/score/get-twitterscore`, payload);
        
        console.log("API response:", response);
        
        // Extract score safely with fallback to default
        let twitterScore = response.data.twitterScore || 30;
        
        // If no valid score found, use default
        if (!twitterScore || twitterScore <= 0) {
          console.log("No valid score in API response, using default:", DEFAULT_SCORE);
          twitterScore = DEFAULT_SCORE;
        }
        
        console.log("Setting target score to:", twitterScore);
        setTargetScore(twitterScore);
      } catch (apiError) {
        console.error("API error:", apiError);
        console.log("API failed, using default score:", DEFAULT_SCORE);
        setTargetScore(DEFAULT_SCORE);
      }
      
      setLoading(false);
    } catch (authErr) {
      console.error("Auth error:", authErr);
      setError(authErr.message);
      setLoading(false);
    }
  };

  // Animation sequence - runs tasks, shows score, then redirects
  const startAnimationSequence = () => {
    console.log("🚀 Starting Twitter score animation sequence...");
    setIsConnecting(true);
    
    // Step 1: Task animation - show each task being completed sequentially
    let currentTask = 0;
    const taskInterval = setInterval(() => {
      if (currentTask < twitterTasks.length) {
        setTaskStatus((prev) => {
          const newStatus = [...prev];
          newStatus[currentTask] = true;
          return newStatus;
        });
        currentTask++;
      } else {
        // All tasks completed
        clearInterval(taskInterval);
        
        // Set the Twitter data in context
        setTwitterScore(targetScore);
        setTwitterConnected(true);
        
        // Show completed scan with small delay
        setTimeout(() => {
          setCompletedScan(true);
          
          // Set the score directly - the SlotMachineScore component will handle the animation
          setScore(targetScore);
          
          // Add a guaranteed navigation failsafe - will navigate after max 6 seconds
          // regardless of animation completion
          setTimeout(() => {
            console.log("⏰ Failsafe navigation triggered");
            // Pass the referral code to the next page
            if (currentReferralCode) {
              navigate(`/connect/wallet?ref=${encodeURIComponent(currentReferralCode)}`);
            } else {
              navigate("/connect/wallet");
            }
          }, 6000);
        }, 500);
      }
    }, 800); // Show each task completing every 800ms
  };

  // Start animation when user is authenticated and score is available
  useEffect(() => {
    if (user && !isConnecting && !completedScan) {
      if (targetScore > 0) {
        console.log("User authenticated and score received, starting animation");
        startAnimationSequence();
      } else {
        console.log("User authenticated but no score yet");
      }
    }
  }, [user, targetScore, isConnecting, completedScan]);

  // Function to navigate to next page with referral code if available
  const navigateToNextPage = () => {
    if (currentReferralCode) {
      navigate(`/connect/wallet?ref=${encodeURIComponent(currentReferralCode)}`);
    } else {
      navigate("/connect/wallet");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4">
        <FloatingElements 
          type="tweets" 
          count={isSmallScreen ? 15 : 20} 
          className="opacity-70 " 
          positionStyle={isSmallScreen ? "spaced" : "spaced"}  
        />

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-2 mb-6"
          >
            {[1, 2, 3, 4].map((_, i) => (
              <div
                key={i}
                className={`w-12 h-1 rounded-full ${
                  i === 0 ? "bg-cyber-green/70" : "bg-white/20"
                }`}
              />
            ))}
          </motion.div>

          <GlassmorphicCard className="w-full mb-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <div className="w-12 h-12 rounded-full bg-cyber-green/10 border border-cyber-green/30 flex items-center justify-center">
                <Twitter size={24} className="text-cyber-green" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold mb-2 text-white"
            >
              {isConnecting ? "Analyzing Your Twitter" : "Connect Your Twitter"}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/70 mb-6"
            >
              {isConnecting 
                ? "Calculating your Crypto Twitter influence..." 
                : "Let's analyze your CT engagement, influence & activity."}
            </motion.p>

            {!user ? (
              <div className="flex flex-col items-center gap-2">
                <CyberButton
                  onClick={loginWithTwitter}
                  className="w-full"
                  variant="primary"
                  icon={<Twitter size={18} />}
                  disabled={loading}
                >
                  {loading ? "Connecting..." : "Connect Twitter"}
                </CyberButton>
                <button
                  onClick={navigateToNextPage}
                  className="mt-4 text-white/80 hover:text-white text-sm underline transition-opacity duration-200 ease-in-out"
                >
                  Skip for now
                </button>
              </div>
            ) : (
              <p className="text-green-500"></p>
            )}

            {isConnecting && (
              <div className="text-left">
                {twitterTasks.map((task, index) => (
                  <AnimatedCheckmark
                    key={index}
                    text={task}
                    completed={taskStatus[index]}
                    index={index}
                  />
                ))}
              </div>
            )}

            {completedScan && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="mt-6"
              >
                <div className="bg-[#0F1B24] border border-[#1E2A32] rounded-xl p-5 text-center">
                  <h3 className="text-lg font-bold text-white/90 mb-2">POINTS EARNED</h3>
                  <ConnectionSlotMachineScore 
                    value={score} 
                    className="text-3xl font-bold text-[#33FFB8]" 
                    duration={1200}
                    onAnimationComplete={() => {
                      // Only redirect after animation completes
                      console.log("✅ Animation complete, redirecting to /connect/wallet with score:", targetScore);
                      
                      // Data is already set, just navigate after a brief delay
                      setTimeout(() => {
                        console.log("🔄 Executing navigation to /connect/wallet");
                        navigateToNextPage();
                      }, 2500); // Reduced wait time to 2 seconds for more reliable navigation
                    }}
                  />
                </div>
              </motion.div>
            )}
            
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 mt-4 text-sm"
              >
                Error: {error}
              </motion.p>
            )}
          </GlassmorphicCard>
          
        </div>
      </div>
    </PageTransition>
  );
};

export default TwitterConnectPage;