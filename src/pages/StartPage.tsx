import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReferral } from '../context/ReferralContext';
import { motion } from 'framer-motion';
import GlassmorphicCard from '@/components/GlassmorphicCard';
import CyberButton from '@/components/CyberButton';
import PageTransition from '@/components/PageTransition';
import { useScore } from '@/context/ScoreContext';

const StartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { referralCode } = useReferral();
  const {
    resetScores
  } = useScore();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleStart = () => {
    setIsAnimating(true);
    resetScores();
    const searchParams = new URLSearchParams(location.search);
    const urlRefCode = searchParams.get('ref');
    const refCode = urlRefCode || referralCode;

    // Delay navigation to allow animation to complete
    if (refCode) {
      navigate(`/index?ref=${encodeURIComponent(refCode)}`);
    } else {
      setTimeout(() => {
        navigate('/index');
      }, 1000);
    }
};  
  
  return (
    <PageTransition>
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({
          length: 30
        }).map((_, i) => <motion.div key={i} className="absolute w-1 h-1 bg-cyber-green rounded-full" style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`
        }} animate={{
          opacity: [0.1, 0.5, 0.1],
          scale: [1, 1.5, 1]
        }} transition={{
          duration: 3 + Math.random() * 5,
          repeat: Infinity,
          delay: Math.random() * 5
        }} />)}
        </div>

        {/* Main content */}
        <motion.div animate={isAnimating ? {
        scale: [1, 1.1, 0.5],
        opacity: [1, 1, 0],
        filter: ["blur(0px)", "blur(5px)"]
      } : {}} transition={{
        duration: 1,
        ease: "easeInOut"
      }} className="relative z-10 flex flex-col items-center justify-center text-center px-4">
          
          <motion.h1 initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.4,
          duration: 0.5
        }} className="text-5xl mb-4 text-white font-thin md:text-6xl">
            Start Your Journey
          </motion.h1>

          <motion.p initial={{
          opacity: 0,
          y: -20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.6,
          duration: 0.5
        }} className="text-xl md:text-2xl mb-8 text-white/70 max-w-2xl">
            Connect, Analyze, and Discover Your Crypto Score.
          </motion.p>

          <GlassmorphicCard className="max-w-md w-full mb-8">
            <p className="text-white/70 mb-6">
             Check Where You Rank Among BrainDroppers ?
            </p>

            <CyberButton onClick={handleStart} size="lg" className="w-full">
              Start Now
            </CyberButton>
          </GlassmorphicCard>

          <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 1,
          duration: 1
        }} className="text-white/50 text-sm max-w-lg">
            By continuing, you agree to share your social and on-chain data for score calculation.
          </motion.div>
        </motion.div>
        
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
      </div>
    </PageTransition>
  );
};

export default StartPage;
