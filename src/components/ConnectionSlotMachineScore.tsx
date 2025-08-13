import React, { useRef, useEffect, useState } from 'react';
import '../styles/connection-slot-counter.css';
import { useLocation } from 'react-router-dom';

interface ConnectionSlotMachineScoreProps {
  value: number;
  duration?: number;
  className?: string;
  onAnimationComplete?: () => void;
  containerStyle?: React.CSSProperties;
  digits?: number; // New prop to specify how many digits to display (default: 5)
}

const ConnectionSlotMachineScore: React.FC<ConnectionSlotMachineScoreProps> = ({ 
  value, 
  duration = 700, 
  className = "",
  onAnimationComplete,
  containerStyle = {},
  digits = 2 //00
}) => {
  // Limit the value to 15 (this is the maximum telegram score)
  const limitedValue = value
  
  const [displayValue, setDisplayValue] = useState<string>(limitedValue.toString());
  const [isAnimating, setIsAnimating] = useState(false);
  const [digitsList, setDigitsList] = useState<string[]>([]);
  const reelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialRender = useRef(true);
  
  // Use location to ensure component re-renders on route changes
  const location = useLocation();
  
  // Format the number without commas and add leading zeros
  const formatNumber = (num: number): string => {
    // Convert to string without commas
    const numStr = num.toString();
    
    // If value is less than 10, add leading zero(s)
    if (digits === 2 && num < 10) {
      return `0${numStr}`;
    }
    
    // Add leading zeros
    return numStr.padStart(digits, '0');
  };
  
  // Prepare digits to display
  useEffect(() => {
    const formattedValue = formatNumber(limitedValue);
    console.log(`ConnectionSlotMachineScore: Raw value=${value}, limitedValue=${limitedValue}, formatted="${formattedValue}"`);
    
    setDisplayValue(formattedValue);
    setDigitsList(formattedValue.split(''));
    
    // Always trigger animation on mount or when route changes
    if (location.pathname) {
      // Reset the initialRender flag to force animation on route changes
      initialRender.current = false;
      animateToValue();
    }
  }, [value, location.pathname, digits]);
  
  // Animate when value changes
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    
    animateToValue();
  }, [displayValue]);
  
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
        className="connection-reel-container"
        ref={el => reelsRef.current[index] = el}
      >
        <div 
          className={`connection-reel ${isAnimating ? 'spinning' : ''}`} 
          style={{
            transform: isAnimating ? 'translateY(0)' : `translateY(-${digitValue * 10}%)`,
            transitionDelay: `${index * delayFactor}s`,
            transitionDuration: `${duration}ms`
          }}
        >
          {reelDigits.map(num => (
            <div key={num} className="connection-reel-digit">
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
    justifyContent: 'center',
    width: '100%',
    textAlign: 'center'
  };
  
  const mergedStyles = { ...defaultContainerStyle, ...containerStyle };
  
  return (
    <div 
      ref={containerRef}
      // Add key with location.pathname to force re-mount on route changes
      key={location.pathname}
      className={`connection-slot-machine-container ${className} ${isAnimating ? 'animating' : ''}`}
      style={mergedStyles}
    >
      {digitsList.map((digit, index) => renderDigitReel(digit, index))}
    </div>
  );
};

export default ConnectionSlotMachineScore; 