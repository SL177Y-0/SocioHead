import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { useConnect, Connector, useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios"; // Import axios for API calls
import GlassmorphicCard from "@/components/GlassmorphicCard";
import CyberButton from "@/components/CyberButton";
import PageTransition from "@/components/PageTransition";
import AnimatedCheckmark from "@/components/AnimatedCheckmark";
import FloatingElements from "@/components/FloatingElements";
import ScoreDisplay from "@/components/ScoreDisplay";
import ConnectionSlotMachineScore from "@/components/ConnectionSlotMachineScore";
import { useScore } from "@/context/ScoreContext";

const walletTasks: string[] = [
  "Checking DEX Trades & Interactions",
  "Analyzing NFT Flip Performance",
  "Measuring DeFi Exposure & Farming Activity",
  "Detecting Blue-Chip Token Holdings",
];

// Default score to use if API fails
const DEFAULT_SCORE = 35;

const WalletConnectPage: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected, isConnecting, status } = useAccount();
  const { connect, connectors } = useConnect();
  const { authenticated, user: privyUser } = usePrivy();
  const { setWalletScore, setWalletConnected } = useScore();
  
  const [taskStatus, setTaskStatus] = useState<boolean[]>(Array(walletTasks.length).fill(false));
  const [completedScan, setCompletedScan] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [targetScore, setTargetScore] = useState<number>(0);
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

  // Animation sequence - runs tasks, shows score, then redirects
  const startAnimationSequence = async () => {
    console.log("🚀 Starting animation sequence...");
    setIsAnalyzing(true);
    
    // Step 1: Task animation - show each task being completed sequentially
    let currentTask = 0;
    const taskInterval = setInterval(() => {
      if (currentTask < walletTasks.length) {
        setTaskStatus((prev) => {
          const newStatus = [...prev];
          newStatus[currentTask] = true;
          return newStatus;
        });
        currentTask++;
      } else {
        // All tasks completed
        clearInterval(taskInterval);
        
        // Step 2: Fetch score from the backend
        fetchWalletScore();
      }
    }, 800); // Show each task completing every 800ms
  };

  // Function to fetch wallet score from backend
  const fetchWalletScore = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get user details from Privy user
      const privyId = privyUser?.id || "guest";
      const email = privyUser?.email?.address || "";
      
      console.log("Fetching score with data:", { privyId, email, address });
      
      const response = await axios.post(`${apiBaseUrl}/api/score/get-walletScore`, {
        privyId,
        email,
        address
      });
      
      console.log("API response:", response.data);
      
      // Extract score safely with fallback to default
      let walletScore = response.data.WalletScore || 0;
      
      // If no valid score found, use default
      if (!walletScore || walletScore <= 0) {
        console.log("No valid score in API response, using default:", DEFAULT_SCORE);
        walletScore = DEFAULT_SCORE;
      }
      
      console.log("Setting target score to:", walletScore);
      setScore(walletScore);
      
      // Store the wallet score in context
      setWalletScore(walletScore);
      setWalletConnected(true);
      
      // Show completed scan UI
      setCompletedScan(true);
      
      // Set score for display
      setScore(walletScore);
      
    } catch (err) {
      console.error("❌ Error fetching wallet score:", err);
      setError("Failed to fetch wallet score. Using default value.");
      
      // If error, use a fallback score for animation
      console.log("API failed, using default score:", DEFAULT_SCORE);
      setTargetScore(DEFAULT_SCORE);
      setWalletScore(DEFAULT_SCORE);
      setWalletConnected(true);
      setCompletedScan(true);
      setScore(DEFAULT_SCORE);
    } finally {
      setIsLoading(false);
    }
  };

  // Log Privy user for debugging
  useEffect(() => {
    console.log("Privy user:", privyUser);
  }, [privyUser]);

  // Start animation immediately when wallet is connected
  useEffect(() => {
    // If we're connected via wagmi and animation hasn't started yet
    if (isConnected && !isAnalyzing && !completedScan) {
      console.log("🔄 Wallet Connected:", address);
      
      // Store wallet address
      if (address) {
        // Validate that the wallet address is not empty or undefined
        if (typeof address === 'string' && address.trim() !== '') {
          console.log("Storing wallet address:", address);
          localStorage.setItem("walletAddress", address);
        }
      }
      
      // Start animation sequence immediately when connected
      console.log("🚀 Starting animation for connected wallet");
      startAnimationSequence();
    }
  }, [isConnected, address, isAnalyzing, completedScan]);

  // Function to Connect Wallet via WalletConnect
  const connectWallet = async () => {
    try {
      const wcConnector: Connector | undefined = connectors.find((c) => c.id === "walletConnect");
      if (!wcConnector) {
        alert("WalletConnect is not available.");
        return;
      }

      console.log("⏳ Connecting wallet...");
      
      // Don't set isAnalyzing here - we'll let the useEffect trigger it
      // when isConnected becomes true
      
      await connect({ connector: wcConnector });
      // After successful connection, isConnected will be true
      // The useEffect will automatically trigger the animation sequence
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("❌ WalletConnect Error:", err.message);
      }
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4">
        <FloatingElements 
          type="wallets" 
          count={isSmallScreen ? 15 : 20} 
          className="opacity-75" 
          positionStyle={isSmallScreen ? "spaced" : "spaced"} 
        />

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
                className={`w-12 h-1 rounded-full ${i <= 1 ? "bg-cyber-green/70" : "bg-white/20"}`}
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
              <div className="w-12 h-12 rounded-full bg-cyber-pink/10 border border-cyber-pink/30 flex items-center justify-center">
                <Wallet size={24} className="text-cyber-pink" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold mb-2 text-white"
            >
              {isConnecting ? "Connecting Wallet" : 
               isAnalyzing ? "Analyzing Your Wallet" : 
               completedScan ? "Analysis Complete" : 
               "Connect Your Wallet"}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/70 mb-6"
            >
              {isConnecting ? "Please confirm the connection in your wallet app..." :
               isAnalyzing ? "Your on-chain activity defines your degen rank." :
               completedScan ? "Your degen score has been calculated!" :
               "Tap below to connect and verify your on-chain presence."}
            </motion.p>

            {/* Connect Wallet Button - only show when wallet is not connected or connecting */}
            {!isConnected && !isConnecting && !isAnalyzing && (
              <div className="flex flex-col items-center gap-2 mt-4">
                <CyberButton
                  onClick={connectWallet}
                  className="w-full"
                  variant="secondary" 
                  icon={<Wallet size={18} />}
                >
                  Connect Wallet
                </CyberButton>
                <button
                  onClick={() => navigate("/connect/telegram")}
                  className="mt-4 text-white/80 hover:text-white text-sm underline transition-opacity duration-200 ease-in-out"
                >
                  Skip for now
                </button>
              </div>
            )}
            
            {/* Show connecting message when wallet is connecting */}
            {isConnecting && !isAnalyzing && (
              <div className="text-center py-2">
                <div className="flex justify-center mb-4">
                  <div className="w-6 h-6 border-2 border-cyber-pink border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-white/70">Waiting for wallet connection...</p>
              </div>
            )}

            {/* Show Scanning Animation when analyzing (after connection is established) */}
            {isAnalyzing && (
              <div className="text-left">
                {walletTasks.map((task, index) => (
                  <AnimatedCheckmark
                    key={index}
                    text={task}
                    completed={taskStatus[index]}
                    index={index}
                  />
                ))}
              </div>
            )}

            {/* Show Score After Scan */}
            {completedScan && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="mt-6"
              >
                {error && (
                  <div className="text-red-400 text-sm mb-2">
                    {error}
                  </div>
                )}
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-cyber-pink border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="bg-[#0F1B24] border border-[#1E2A32] rounded-xl p-5 text-center">
                    <h3 className="text-lg font-bold text-white/90 mb-2">POINTS EARNED</h3>
                    <ConnectionSlotMachineScore 
                      value={score} 
                      className="text-3xl font-bold text-[#33FFB8]" 
                      duration={1200}
                      onAnimationComplete={() => {
                        // Only redirect after animation completes
                        console.log("✅ Animation complete, redirecting to /connect/telegram");
                        setTimeout(() => {
                          navigate("/connect/telegram");
                        }, 2500); // Wait 2 seconds to ensure user sees the final score
                      }}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </GlassmorphicCard>

          {/* Connector line animation */}
          {completedScan && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 40, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="w-0.5 h-10 bg-gradient-to-b from-cyber-pink to-transparent mb-4"
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default WalletConnectPage;