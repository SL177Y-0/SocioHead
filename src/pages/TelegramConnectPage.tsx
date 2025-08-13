import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import axios from 'axios'; // Import axios
import GlassmorphicCard from '@/components/GlassmorphicCard';
import CyberButton from '@/components/CyberButton';
import PageTransition from '@/components/PageTransition';
import AnimatedCheckmark from '@/components/AnimatedCheckmark';
import FloatingElements from '@/components/FloatingElements';
import ScoreDisplay from '@/components/ScoreDisplay';
import { useScore } from '@/context/ScoreContext';
import Verida from '@/components/Verida';
import ConnectionSlotMachineScore from "@/components/ConnectionSlotMachineScore";

const telegramTasks = [
  'Checking Group Memberships',
  'Analyzing Activity & Replies',
  'Measuring Influence in Key Groups',
];

const TelegramConnectPage = () => {
  const navigate = useNavigate();
  const { authenticated, user } = usePrivy();
  const [userdid,setUserDid]=useState("")
  const[authtoken,setAuthToken]= useState("")
  const { setTelegramScore, setTelegramConnected, twitterConnected } = useScore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [taskStatus, setTaskStatus] = useState<boolean[]>([false, false, false, false]);
  const [completedScan, setCompletedScan] = useState(false);
  const [score, setScore] = useState(0);
  const [scoreResponse, setScoreResponse] = useState<{telegramScore: number, totalScore: number} | null>(null);
  const [veridaStatus, setVeridaStatus] = useState<'disconnected' | 'connected'>('disconnected');
  const [userId, setUserId] = useState<string | null>(null);
  // State to track screen size
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://back.braindrop.fun";

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
  
  // Special check for userId in URL params on direct navigation/refresh
  useEffect(() => {
    // Get userId from URL parameters directly
    const urlParams = new URLSearchParams(window.location.search);
    const urlUserId = urlParams.get('userId');
    
    if (urlUserId && !userId) {
      // Set the userId but don't start the animation here
      // The animation will be started by the other useEffect that watches userId
      setUserId(urlUserId);
    }
  }, [window.location.search]); // Only run when search params change, not depending on user
  
  // Animation sequence should be triggered when userId is available
  useEffect(() => {
    // Don't require user to be authenticated, only userId
    if (user&&userdid&&authtoken && !isConnecting && !completedScan) {
      startAnimationSequence();
    }
  }, [userdid,authtoken, isConnecting, completedScan,user]);

  // Make sure fetchTelegramScore can directly take a userId parameter
  const fetchTelegramScore = async (forceUserId = null) => {
    // Use either the provided userId or the state one
    const effectiveUserId = forceUserId || userId;
    
    // Allow the function to work even if user is not authenticated, as long as we have userId
    if (authtoken&&userdid) {
      try {
        // We must set isConnecting to true here
        setIsConnecting(true);
        
        // Make sure we have the correct API base URL
        const effectiveApiBaseUrl = apiBaseUrl || 'https://back.braindrop.fun';
        
        // Create payload with all required fields
        const requestPayload = {
          // Include privyId (required)
          privyId: user?.id || '',
          // Include email (required)
          email: user?.email?.address || '',
          // Include auth token (required) - get from localStorage if available
          authToken: authtoken,
          // Include userdid (required)
          userdid:userdid
        };
        
        console.log("Sending request to get Telegram score with payload:", requestPayload);
        
        // Use the specified endpoint
        const response = await axios.post('https://back.braindrop.fun/api/score/get-telegramScore', requestPayload);
        
        // Log the full response to console
        console.log("Telegram score response:", response.data);
        
        // Store the full response in state
        if (response.data && typeof response.data === 'object') {
          setScoreResponse(response.data);
        }
        
        // Check if we received a valid score in the response
        if (response.data && response.data.telegramScore !== undefined) {
          // Use the actual score from the API
          return response.data.telegramScore;
        } else {
          return 30; // Default score
        }
      } catch (error) {
        console.error("Error fetching Telegram score:", error);
        return 30; // Default score on error
      }
    }
    
    return 30; // Default if missing required data
  };
  
  // Animation sequence for after Verida connection
  const startAnimationSequence = async () => {
    setIsConnecting(true);
    
    // Make sure we have userId when we fetch the score
    // Pass the current value directly to avoid race conditions with state
    if (!userId) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlUserId = urlParams.get('userId');
      
      if (authtoken&&userdid) {
        // Fetch the telegram score first as described in the flow document
        const telegramScore = await fetchTelegramScore(urlUserId);
        
        // Add debug logging to track the raw score
        console.log(`DEBUG TelegramConnectPage: Received raw score from API: ${telegramScore}`);
        
        // Use the returned telegram score (now fallback to 1 instead of 35)
        const finalTargetScore = telegramScore || 1;
        
        // Step 1: Animate tasks one by one as described in the flow
        let currentTask = 0;
        const taskInterval = setInterval(() => {
          if (currentTask < taskStatus.length) {
            setTaskStatus(prev => {
              const newStatus = [...prev];
              newStatus[currentTask] = true;
              return newStatus;
            });
            currentTask++;
          } else {
            clearInterval(taskInterval);
            
            setCompletedScan(true);
            
            // Store the telegram score in context for use throughout the app
            setTelegramScore(finalTargetScore);
            setTelegramConnected(true);
            
            // Set the score for the slot machine animation
            setScore(finalTargetScore);
          }
        }, 800);
      } else {
        // Fallback to regular fetch with null userId
        const telegramScore = await fetchTelegramScore();
        // Use the returned telegram score
        const finalTargetScore = telegramScore || 1;
        
        // Continue with animation sequence...
        let currentTask = 0;
        const taskInterval = setInterval(() => {
          if (currentTask < taskStatus.length) {
            setTaskStatus(prev => {
              const newStatus = [...prev];
              newStatus[currentTask] = true;
              return newStatus;
            });
            currentTask++;
          } else {
            clearInterval(taskInterval);
            
            setCompletedScan(true);
            
            // Store the telegram score in context for use throughout the app
            setTelegramScore(finalTargetScore);
            setTelegramConnected(true);
            
            // Set the score for the slot machine animation
            setScore(finalTargetScore);
          }
        }, 800);
      }
    } else {
      // Normal flow when userId is available in state
      const telegramScore = await fetchTelegramScore(userId);
      
      // Use the returned telegram score - now fallback to 1 instead of 35
      const finalTargetScore = telegramScore || 1;
      
      // Rest of the function - animate tasks etc.
      let currentTask = 0;
      const taskInterval = setInterval(() => {
        if (currentTask < taskStatus.length) {
          setTaskStatus(prev => {
            const newStatus = [...prev];
            newStatus[currentTask] = true;
            return newStatus;
          });
          currentTask++;
        } else {
          clearInterval(taskInterval);
          
          setCompletedScan(true);
          
          // Store the telegram score in context for use throughout the app
          setTelegramScore(finalTargetScore);
          setTelegramConnected(true);
          
          // Set the score for the slot machine animation
          setScore(finalTargetScore);
        }
      }, 800);
    }
  };
  
  // Handler for Verida connection status changes
  const handleVeridaStatusChange = (status: boolean) => {
    if (status) {
      setVeridaStatus('connected');
    } else {
      setVeridaStatus('disconnected');
    }
  };
  
  // Handler for Verida auth data
  const handleVeridaAuthData = (data: { userDid: string,authToken:string }) => {
    setAuthToken(data.authToken)
    setUserDid(data.userDid)
  };

  return (
    <PageTransition>
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4">
        <FloatingElements 
          type="messages" 
          count={isSmallScreen ? 15 : 25} 
          className="opacity-70" 
          positionStyle={isSmallScreen ? "spaced" : "spaced"} 
        />
        
        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-md">
          {/* Progress steps */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center gap-2 mb-6"
          >
            {[1, 2, 3, 4].map((_, i) => (
              <div 
                key={i} 
                className={`w-12 h-1 rounded-full ${i <= 2 ? 'bg-cyber-green/70' : 'bg-white/20'}`}
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
              <div className="w-12 h-12 rounded-full bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center">
                <MessageSquare size={24} className="text-cyber-blue" />
              </div>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold mb-2 text-white"
            >
              {isConnecting ? "Analyzing Your Telegram" : "Connect Your Telegram"}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/70 mb-6"
            >
              {isConnecting 
                ? "Your community engagement defines your social rank." 
                : "Your community engagement matters. Let's analyze it!"}
            </motion.p>
            
            {!isConnecting && (
              <div className="relative">
                <Verida 
                  onConnectionChange={handleVeridaStatusChange} 
                  onAuthDataReceived={handleVeridaAuthData}
                />
              </div>
            )}
            
            {/* Show Scanning Animation */}
            {isConnecting && (
              <div className="text-left">
                {telegramTasks.map((task, index) => (
                  <AnimatedCheckmark 
                    key={index} 
                    text={task} 
                    completed={taskStatus[index]} 
                    index={index} 
                  />
                ))}
              </div>
            )}

            <div className="flex flex-col items-center gap-2 mt-4">
              {!isConnecting && (
                <button
                  onClick={() => navigate("/scorecard")}
                  className="mt-4 text-white/80 hover:text-white text-sm underline transition-opacity duration-200 ease-in-out"
                >
                  Skip for now
                </button>
              )}
            </div>

            {/* Show Score After Scan */}
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
                    value={scoreResponse?.telegramScore || score} 
                    className="text-3xl font-bold text-[#33FFB8]" 
                    duration={1200}
                    onAnimationComplete={() => {
                      // Only redirect after animation completes
                      setTimeout(() => {
                        navigate('/scorecard');
                      }, 2500); // Wait 2 seconds to ensure user sees the final score
                    }}
                  />
                </div>
              </motion.div>
            )}
          </GlassmorphicCard>
          
          {/* Connector line animation */}
          {completedScan && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 40, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="w-0.5 h-10 bg-gradient-to-b from-cyber-blue to-transparent mb-4"
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default TelegramConnectPage;