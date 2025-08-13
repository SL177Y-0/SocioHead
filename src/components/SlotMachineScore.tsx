import React, { useRef, useEffect, useState } from 'react';
import '../styles/slot-counter.css';

interface SlotMachineScoreProps {
  value: number;
  duration?: number;
  className?: string;
  showAnimation?: boolean;
  onAnimationComplete?: () => void;
  containerStyle?: React.CSSProperties;
  digits?: number; // New prop to specify how many digits to display (default: 5)
}

const SlotMachineScore: React.FC<SlotMachineScoreProps> = ({ 
  value, 
  duration = 700, 
  className = "",
  showAnimation = true,
  onAnimationComplete,
  containerStyle = {},
  digits = 3 // Default to 4 digits (00000)
}) => {
  const [displayValue, setDisplayValue] = useState<string>(value.toString());
  const [isAnimating, setIsAnimating] = useState(false);
  const [digitsList, setDigitsList] = useState<string[]>([]);
  const reelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const initialRender = useRef(true);
  
  // Format the number without commas and add leading zeros
  const formatNumber = (num: number): string => {
    // Convert to string without commas
    const numStr = num.toString();
    
    // If digits is 3 and the number is less than 10, add two leading zeros
    if (digits === 3 && num < 10) {
      return `00${numStr}`;
    }
    // If digits is 3 and the number is less than 100, add one leading zero
    else if (digits === 3 && num < 100) {
      return `0${numStr}`;
    }
    
    // Add leading zeros
    return numStr.padStart(digits, '0');
  };
  
  // Prepare digits to display
  useEffect(() => {
    const formattedValue = formatNumber(value);
    setDisplayValue(formattedValue);
    setDigitsList(formattedValue.split(''));
  }, [value, digits]);
  
  // Animate when component mounts or value changes
  useEffect(() => {
    // Always animate on first render if showAnimation is true
    if (initialRender.current) {
      initialRender.current = false;
      if (showAnimation) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          animateToValue();
        }, 100);
      }
      return;
    }
    
    // Animate when displayValue changes
    if (showAnimation) {
      animateToValue();
    }
  }, [displayValue, showAnimation]);
  
  // Generate an array of numbers 0-9 for the reel
  const getReelDigits = () => {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  };
  
  const animateToValue = () => {
    setIsAnimating(true);
    
    // Schedule animation completion
    const timer = setTimeout(() => {
      setIsAnimating(false);
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, duration);
    
    return () => clearTimeout(timer);
  };
  
  // Render a single digit's reel
  const renderDigitReel = (digit: string, index: number) => {
    // All characters should be digits in our new format
    const digitValue = parseInt(digit, 10);
    const reelDigits = getReelDigits();
    const delayFactor = 0.1; // Slight delay between digits for cascading effect
    
    return (
      <div 
        key={`digit-${index}`}
        className="reel-container"
        ref={el => reelsRef.current[index] = el}
      >
        <div 
          className={`reel ${isAnimating ? 'spinning' : ''}`} 
          style={{
            transform: isAnimating ? 'translateY(0)' : `translateY(-${digitValue * 10}%)`,
            transitionDelay: `${index * delayFactor}s`,
            transitionDuration: `${duration}ms`
          }}
        >
          {reelDigits.map(num => (
            <div key={num} className="reel-digit">
              {num}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Center alignment container style
  const defaultContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'left',
    width: '100%',
    textAlign: 'center'
  };
  
  const mergedStyles = { ...defaultContainerStyle, ...containerStyle };
  
  return (
    <div 
      className={`slot-machine-container ${className} ${isAnimating ? 'animating' : ''}`}
      style={mergedStyles}
    >
      {digitsList.map((digit, index) => renderDigitReel(digit, index))}
    </div>
  );
};

export default SlotMachineScore; 