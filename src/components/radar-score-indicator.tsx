import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Twitter, MessageSquare, Wallet } from 'lucide-react';

interface ScoreIndicatorProps {
  type: 'twitter' | 'telegram' | 'wallet';
  score: number;
  distance: number;
  angle: number;
}

const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({ type, score, distance, angle }) => {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const requestRef = useRef<number>();
  const rotationRef = useRef<number>(0);
  
  // Effect to handle rotation animation (synchronized with radar)
  useEffect(() => {
    // Use requestAnimationFrame for smoother rotation
    const animate = () => {
      // Increment rotation slowly for smooth animation
      rotationRef.current = (rotationRef.current + 0.05) % 360;
      
      // Calculate new position
      const currentAngle = (angle + rotationRef.current) * (Math.PI / 180);
      const x = 50 + distance * Math.cos(currentAngle);
      const y = 50 + distance * Math.sin(currentAngle);
      
      setPosition({ x, y });
      
      // Request next frame
      requestRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    requestRef.current = requestAnimationFrame(animate);
    
    // Clean up animation on unmount
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [angle, distance]);

  const getIcon = () => {
    switch (type) {
      case 'twitter':
        return <Twitter size={24} className="text-[#1DA1F2]" />;
      case 'telegram':
        return <MessageSquare size={24} className="text-[#0088CC]" />;
      case 'wallet':
        return <Wallet size={24} className="text-[#9747FF]" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'twitter':
        return 'border-[#1DA1F2]/30 bg-[#1DA1F2]/10';
      case 'telegram':
        return 'border-[#0088CC]/30 bg-[#0088CC]/10';
      case 'wallet':
        return 'border-[#9747FF]/30 bg-[#9747FF]/10';
    }
  };

  const getPulseColor = () => {
    switch (type) {
      case 'twitter':
        return 'bg-[#1DA1F2]/20';
      case 'telegram':
        return 'bg-[#0088CC]/20';
      case 'wallet':
        return 'bg-[#9747FF]/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`absolute px-3 py-2 rounded-full border ${getColor()} backdrop-blur-sm z-10`}
      style={{ 
        left: `${position.x}%`, 
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%) translateZ(0)', // Add hardware acceleration
        willChange: 'transform, left, top' // Optimize for animation
      }}
    >
      <div className="flex items-center gap-2">
        <div className="relative">
          {getIcon()}
          <div 
            className={`absolute inset-0 rounded-full ${getPulseColor()} animate-ping opacity-50`}
            style={{ animationDuration: '3s' }} 
          />
        </div>
        <div className="text-sm font-medium text-white">
          {score.toLocaleString()}
        </div>
      </div>
    </motion.div>
  );
};

interface RadarScoreIndicatorsProps {
  twitterScore: number;
  telegramScore: number;
  walletScore: number;
}

export const RadarScoreIndicators: React.FC<RadarScoreIndicatorsProps> = ({
  twitterScore,
  telegramScore,
  walletScore
}) => {
  return (
    <div className="absolute inset-0" style={{ willChange: 'contents' }}>
      {/* Twitter Score Indicator - Bottom */}
      <ScoreIndicator 
        type="twitter" 
        score={twitterScore} 
        distance={35} 
        angle={270} 
      />
      
      {/* Telegram Score Indicator - Top Left */}
      <ScoreIndicator 
        type="telegram" 
        score={telegramScore} 
        distance={32} 
        angle={135} 
      />
      
      {/* Wallet Score Indicator - Top Right */}
      <ScoreIndicator 
        type="wallet" 
        score={walletScore} 
        distance={32} 
        angle={45} 
      />
    </div>
  );
};

export default RadarScoreIndicators; 