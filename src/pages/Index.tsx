import { useLocation, useNavigate } from 'react-router-dom';
import { useReferral } from '../context/ReferralContext';
import { motion } from 'framer-motion';
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import { ChevronRight, Twitter, Zap, Trophy, Award, Cpu, BarChart3, Shield, Share2, MessageCircle } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import GlassmorphicCard from '@/components/GlassmorphicCard';
import CyberButton from '@/components/CyberButton';
import GradientText from '@/components/GradientText';
import { Badge } from '@/components/ui/badge';
import ScoreDisplay from '@/components/ScoreDisplay';
import FloatingElements from '@/components/FloatingElements';
import { useScore } from '@/context/ScoreContext';
import SlotMachineScore from '@/components/SlotMachineScore';
import { useEffect, useState } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { referralCode } = useReferral();
  const [apiUserInfo, setApiUserInfo] = useState({
    username: "",
    email: "",
    title: "",
    twitterscore:"",
    walletscore:"",
    telegramscore:"",
    totalscore:""
  });
  const { login, authenticated, user } = usePrivy();
  const { 
    resetScores,
    twitterConnected,
    telegramConnected,
    walletConnected
  } = useScore();
  
  // State to track screen size
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://back.braindrop.fun";

  useEffect(() => {
    const fetchUserInfoFromBackend = async () => {
      try {
        
  
        if (!user?.id) return;
    
          const response = await axios.post(
            `${apiBaseUrl}/score-fetch/users`,
            { privyId: user.id }
          );
    
          const data = response.data;
  
         


        console.log("See the data",data)
  
        setApiUserInfo({
          username: data.username || "",
          email: data.email || "",
          title: data.title || "",
          twitterscore:data.twitterScore||"",
          walletscore:data.walletScore||"",
          telegramscore:data.telegramScore||"",
          totalscore:data.totalScore||"",
        });
  
        console.log("✅ User info fetched from backend:", data);
      } catch (err) {
        console.error("❌ Error fetching user info from backend:", err);
      }
    };
  
    fetchUserInfoFromBackend();
  }, [user?.id]);
  
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
  
  // Check if user has completed the full onboarding flow
  const hasCompletedFlow = twitterConnected && telegramConnected && walletConnected;
  
 

  const handleStartJourney = async () => {
    try {
      const searchParams = new URLSearchParams(location.search);
      const urlRefCode = searchParams.get('ref');
      const refCode = urlRefCode || referralCode;
      if (!authenticated) {
        // Open Privy login modal and wait for authentication
        await login();
        if (refCode) {
          navigate(`/connect/twitter?ref=${encodeURIComponent(refCode)}`);
        } else {
          navigate('/connect/twitter');
        }
        return; // Don't proceed until authenticated
      }

      // User is already authenticated with Privy, proceed to Twitter page
      resetScores();
      if (refCode) {
        navigate(`/connect/twitter?ref=${encodeURIComponent(refCode)}`);
      } else {
        navigate('/connect/twitter');
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };
  
  // Navigate to dashboard if flow is completed
  const handleViewDashboard = () => {
    navigate("/scorecard");
  };
  
  // Continue journey from where they left off
  const handleContinueJourney = () => {
    if (!twitterConnected) {
      navigate("/connect/twitter");
    } else if (!telegramConnected) {
      navigate("/connect/telegram");
    } else if (!walletConnected) {
      navigate("/connect/wallet");
    } else {
      navigate("/scorecard");
    }
  };
  
  return (
    <PageTransition>
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4">
        {/* Improved background gradient - more subtle and elegant - now handled by PageTransition component */}
        
        {/* Better distributed floating elements with improved visibility */}
        <FloatingElements 
          type="tweets" 
          count={isSmallScreen ? 5 : 10} 
          className="opacity-75 z-0" 
          positionStyle={isSmallScreen ? "wide" : "spaced"} 
        />
        <FloatingElements 
          type="messages" 
          count={isSmallScreen ? 5 : 10} 
          className="opacity-70 z-0" 
          positionStyle={isSmallScreen ? "spaced" : "wide"} 
        />
        <FloatingElements 
          type="wallets" 
          count={isSmallScreen ? 5 : 10} 
          className="opacity-68 z-0" 
          positionStyle="scattered" 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl w-full items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="relative flex justify-center"
          >
            <div className="relative max-w-md w-full rounded-lg overflow-hidden glassmorphic p-2">
              <img 
                src="https://i.pinimg.com/originals/e0/74/93/e074932c6e8378b79da0b5c512f054a2.gif" 
                alt="Cyberpunk Animation" 
                className="w-full rounded shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent pointer-events-none rounded" />
              <div className="absolute top-4 left-4 bg-cyber-pink/20 px-3 py-1 rounded-full border border-cyber-pink/30">
                <span className="text-xs text-cyber-pink cyber-glow-pink">SYSTEM ONLINE</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-xs text-white/70 mb-1">// CONNECTION SECURE</div>
                <div className="h-1 bg-black/50 rounded overflow-hidden">
                  <motion.div 
                    className="h-full bg-cyber-green"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.3 }}
                className="bg-cyber-blue/10 border border-cyber-blue/30 p-2 rounded-full"
              >
                <Trophy size={18} className="text-cyber-blue" />
              </motion.div>
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.7, duration: 0.3 }}
                className="bg-cyber-pink/10 border border-cyber-pink/30 p-2 rounded-full"
              >
                <Award size={18} className="text-cyber-pink" />
              </motion.div>
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.9, duration: 0.3 }}
                className="bg-cyber-green/10 border border-cyber-green/30 p-2 rounded-full"
              >
                <Zap size={18} className="text-cyber-green" />
              </motion.div>
            </div>
          </motion.div>

          <div className="flex flex-col items-center md:items-start z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-2 px-3 py-1 rounded-full bg-cyber-green/10 border border-cyber-green/30"
            >
              <span className="text-xs text-cyber-green cyber-glow">BrainDrop</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 cyber-glow text-white text-center md:text-left"
            >
              Brain.fun <GradientText from="cyber-pink" to="cyber-blue">Score</GradientText> Checker
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-lg md:text-xl mb-8 text-white/70 max-w-lg text-center md:text-left"
            >
              Measure your crypto influence and discover where you rank in the digital frontier.
            </motion.p>

            {user?.email && (
              <motion.div
                className="max-w-md w-full mb-8 relative overflow-hidden group backdrop-blur-md bg-black/25 border border-[rgba(51,255,184,0.15)] rounded-2xl p-6"
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 25px rgba(51, 255, 184, 0.2)",
                  border: "1px solid rgba(51, 255, 184, 0.3)",
                  backgroundColor: "rgba(0, 0, 0, 0.45)",
                  backdropFilter: "blur(15px)"
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className="bg-cyber-green/10 text-cyber-green border-cyber-green/30 px-2 py-1">
                    <Cpu size={12} className="mr-1" />{apiUserInfo.title || "Title"}
                  </Badge>
                </div>
                
                <div className="mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-cyber-blue/20 flex items-center justify-center">
                    <Shield size={16} className="text-cyber-blue" />
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{apiUserInfo.username || "User"}</div>
                    <div className="text-white/50 text-xs flex items-center">
                      <Twitter size={10} className="mr-1" />{apiUserInfo.email || "email"}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <ScoreDisplay score={apiUserInfo.twitterscore||0} label="Twitter" variant="accent" size="sm" animate={false} />
                  <ScoreDisplay score={apiUserInfo.telegramscore||0} label="Telegram" variant="secondary" size="sm" animate={false} />
                  <ScoreDisplay score={apiUserInfo.walletscore||0} label="On-chain" variant="primary" size="sm" animate={false} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-white/70 text-sm">Total Influence</div>
                  <div className="text-cyber-green text-xl font-bold cyber-glow">{apiUserInfo.totalscore||0}</div>
                </div>
                
                <motion.div 
                  className="absolute -bottom-12 -right-12 w-24 h-24 bg-cyber-green/10 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                
              </motion.div>
            )}

            <div className="space-y-4 w-full max-w-md">  

                    
              {!authenticated ? (
                <CyberButton 
                  onClick={handleStartJourney} 
                  className="w-full"
                  icon={<ChevronRight size={16} />}
                >
                  Start Your Journey
                </CyberButton>
              ) : hasCompletedFlow ? (
                <CyberButton 
                  onClick={handleViewDashboard} 
                  className="w-full"
                  icon={<BarChart3 size={16} />}
                >
                  View Your Dashboard
                </CyberButton>
              ) : (
                <CyberButton 
                  onClick={handleViewDashboard} 
                  className="w-full"
                  icon={<ChevronRight size={16} />}
                >
                  Continue Your Journey
                </CyberButton>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="text-white/50 text-sm max-w-lg text-center md:text-left mt-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-px bg-white/10 flex-grow"></div>
                <span className="text-xs text-white/30">TRUSTED BY DEGENS WORLDWIDE</span>
                <div className="h-px bg-white/10 flex-grow"></div>
              </div>
              
              <div className="flex justify-center md:justify-start space-x-4">
                <Badge className="bg-transparent border border-white/20 text-white/40 hover:bg-white/5">
                  <MessageCircle size={12} className="mr-1" /> 2.4k+ Users
                </Badge>
                <Badge className="bg-transparent border border-white/20 text-white/40 hover:bg-white/5">
                  <Trophy size={12} className="mr-1" /> 87k+ Scores
                </Badge>
              </div>
            </motion.div>
          </div>
        </div>
       </div>

      {/* Footer with logos in corner */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-4 left-4 z-20 flex flex-row items-center"
      >
        <img src="/02_WHITE (1) (1).png" alt="BrainDrop Logo" className="h-10" />
        <img src="/02_WHITE (2).png" alt="BrainDrop Text" className="h-6" />
      </motion.div>
    </PageTransition>
  );
};

export default Index;
