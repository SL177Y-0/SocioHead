import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CustomProgressBarProps {
  value: number;
  max: number;
  className?: string;
  children?: ReactNode;
}

const CustomProgressBar = ({ value, max, className = '', children }: CustomProgressBarProps) => {
  return (
    <div className={`h-2 rounded-full overflow-hidden bg-blue-900/30 ${className}`}>
      {children || (
        <motion.div 
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (value/max)*100)}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      )}
    </div>
  );
};

export default CustomProgressBar; 