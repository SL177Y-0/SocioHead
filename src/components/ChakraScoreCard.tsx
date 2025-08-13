import React, { ReactNode } from 'react';
import SlotMachineScore from './SlotMachineScore';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  value: number;
  max: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'cyan' | 'blue' | 'purple';
  label?: string;
}

export const CircularProgress = ({ 
  value, 
  max, 
  size = 'md', 
  color = 'cyan', 
  label = '' 
}: CircularProgressProps) => {
  const percentage = Math.min(100, Math.round((value / max) * 100));
  const radius = size === 'sm' ? 24 : size === 'md' ? 32 : 40;
  const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
  const circumference = 2 * Math.PI * radius;
  
  const colorClasses = {
    cyan: 'text-cyan-400 stroke-cyan-400',
    blue: 'text-blue-400 stroke-blue-400',
    purple: 'text-indigo-400 stroke-indigo-400'
  };
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <svg width={(radius + strokeWidth) * 2} height={(radius + strokeWidth) * 2} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
          />
          {/* Foreground circle - animated */}
          <motion.circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={colorClasses[color]}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <SlotMachineScore value={value} className={`${sizeClasses[size]} ${colorClasses[color]}`} />
          {percentage > 0 && (
            <span className="text-xs text-white/50">{percentage}%</span>
          )}
        </div>
      </div>
      {label && <div className="mt-2 text-sm text-white/70">{label}</div>}
    </div>
  );
};

interface ChakraScoreCardProps {
  icon: ReactNode;
  label: string;
  score: string | number;
  color?: 'cyan' | 'blue' | 'purple';
  maxValue?: number;
}

const ChakraScoreCard = ({ 
  icon, 
  label, 
  score, 
  color = 'cyan',
  maxValue = 5000
}: ChakraScoreCardProps) => {
  // Convert string score to number if needed
  const numericScore = typeof score === 'string' 
    ? parseInt(score.replace(/,/g, "")) 
    : score;
    
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 rounded-xl border border-cyan-500/20 p-5 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
    >
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          color === 'cyan' ? 'bg-cyan-500/20' : 
          color === 'blue' ? 'bg-blue-500/20' : 
          'bg-indigo-500/20'
        }`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-white/90 text-sm font-medium">{label}</h3>
          <SlotMachineScore value={numericScore} className="text-xl" />
        </div>
        <CircularProgress 
          value={numericScore} 
          max={maxValue} 
          size="md" 
          color={color} 
        />
      </div>
    </motion.div>
  );
};

export default ChakraScoreCard; 