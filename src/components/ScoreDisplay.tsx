import { motion } from 'framer-motion';
import SlotMachineScore from './SlotMachineScore';

interface ScoreDisplayProps {
  score: number;
  label: string;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const ScoreDisplay = ({ 
  score, 
  label, 
  variant = 'primary', 
  size = 'md',
  animate = true
}: ScoreDisplayProps) => {
  
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green';
      case 'secondary':
        return 'bg-cyber-pink/10 border-cyber-pink/30 text-cyber-pink';
      case 'accent':
        return 'bg-cyber-blue/10 border-cyber-blue/30 text-cyber-blue';
      default:
        return 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green';
    }
  };
  
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1 text-sm';
      case 'md':
        return 'px-4 py-2';
      case 'lg':
        return 'px-5 py-3 text-lg';
      default:
        return 'px-4 py-2';
    }
  };

  return (
    <div className={`rounded-lg border ${getVariantClass()} ${getSizeClass()}`}>
      <div className="text-xs uppercase tracking-wider opacity-70 mb-1">{label}</div>
      <div className="font-bold">
        {animate ? (
          <SlotMachineScore value={score} showAnimation={true} />
        ) : (
          <div>{score.toLocaleString()}</div>
        )}
      </div>
    </div>
  );
};

export default ScoreDisplay;
