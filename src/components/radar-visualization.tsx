import React, { useEffect, useRef, useState } from 'react';

export function RadarVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const [dimension, setDimension] = useState(0);
  
  // Handle component resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setDimension(Math.min(rect.width, rect.height));
      }
    };
    
    // Initial size setting
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions correctly for the device
    const dpr = window.devicePixelRatio || 1;
    
    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = dimension * dpr;
    canvas.height = dimension * dpr;
    
    // Set the "drawn" size
    canvas.style.width = `${dimension}px`;
    canvas.style.height = `${dimension}px`;
    
    // Scale context to ensure correct drawing operations
    ctx.scale(dpr, dpr);
    
    // Animation variables
    let rotation = 0;
    
    // Green theme colors
    const accentColor = '#33FFB8'; // Bright green
    
    const createRadialGradient = () => {
      const centerX = dimension / 2;
      const centerY = dimension / 2;
      const radius = Math.min(centerX, centerY);
      
      // Create gradient with proper dimensions
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, radius
      );
      
      gradient.addColorStop(0, `rgba(51, 255, 184, 0.8)`); // #33FFB8 with alpha
      gradient.addColorStop(0.2, `rgba(51, 255, 184, 0.5)`);
      gradient.addColorStop(0.4, `rgba(51, 255, 184, 0.2)`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      return gradient;
    };
    
    const draw = () => {
      ctx.clearRect(0, 0, dimension, dimension);
      
      const centerX = dimension / 2;
      const centerY = dimension / 2;
      const radius = Math.min(centerX, centerY) * 0.9;
      
      // Draw outer circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(51, 255, 184, 0.3)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw middle circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(51, 255, 184, 0.4)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw inner circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(51, 255, 184, 0.5)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw center point
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.05, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(51, 255, 184, 0.8)`;
      ctx.fill();
      
      // Draw text around the outer circle
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      
      const text = "SOTLX E00 OOEE5 RAOF . BET TBPI IA . MCH ESCDEERE ΦSB5 . JBELELEVI 1 0C 00 EE65 TL PRGOBI XA5DS . 8S0 . ELICOI VGR GSB3EEFEBABOT75B";
      
      // Scale font size based on radius
      const fontSize = Math.max(6, dimension / 60);
      ctx.font = `${fontSize}px monospace`;
      ctx.fillStyle = `rgba(51, 255, 184, 0.7)`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      for (let i = 0; i < text.length; i++) {
        const angle = (i / text.length) * Math.PI * 2;
        const x = Math.cos(angle) * (radius + fontSize * 1.5);
        const y = Math.sin(angle) * (radius + fontSize * 1.5);
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillText(text[i], 0, 0);
        ctx.restore();
      }
      
      // Draw spikes
      const spikeCount = Math.min(12, Math.max(8, dimension / 30));
      for (let i = 0; i < spikeCount; i++) {
        const angle = (i / spikeCount) * Math.PI * 2;
        const innerRadius = radius * 0.4;
        const outerRadius = radius * 0.9;
        
        const startX = Math.cos(angle) * innerRadius;
        const startY = Math.sin(angle) * innerRadius;
        const endX = Math.cos(angle) * outerRadius;
        const endY = Math.sin(angle) * outerRadius;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = `rgba(51, 255, 184, ${0.3 + Math.random() * 0.2})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        
        // Draw smaller lines branching from the spikes - fewer for better performance
        const branchCount = Math.min(5, Math.max(2, dimension / 100));
        for (let j = 0; j < branchCount; j++) {
          const t = j / branchCount;
          const branchX = startX + (endX - startX) * t;
          const branchY = startY + (endY - startY) * t;
          
          const branchLength = radius * 0.1 * Math.random();
          const branchAngle = angle + Math.PI / 2 * (Math.random() - 0.5);
          
          const branchEndX = branchX + Math.cos(branchAngle) * branchLength;
          const branchEndY = branchY + Math.sin(branchAngle) * branchLength;
          
          ctx.beginPath();
          ctx.moveTo(branchX, branchY);
          ctx.lineTo(branchEndX, branchEndY);
          ctx.strokeStyle = `rgba(51, 255, 184, ${0.2 + Math.random() * 0.1})`;
          ctx.lineWidth = 0.2;
          ctx.stroke();
        }
      }
      
      ctx.restore();
      
      // Apply radial gradient more efficiently
      ctx.fillStyle = createRadialGradient();
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillRect(0, 0, dimension, dimension);
      ctx.globalCompositeOperation = 'source-over';
      
      // Update animation with consistent speed
      rotation += 0.001;
      
      // Request next frame with reference for cleanup
      requestRef.current = requestAnimationFrame(draw);
    };
    
    // Start the animation
    requestRef.current = requestAnimationFrame(draw);
    
    // Clean up animation on unmount
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [dimension]); // Re-run effect when dimension changes

  return (
    <div className="relative w-full aspect-square mx-auto animate-fade-in">
      <div className="absolute inset-0 bg-[#33FFB8]/10 rounded-full blur-[50px] animate-pulse-slow"></div>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ 
          transform: 'translateZ(0)', // Hardware acceleration
          willChange: 'transform',
          position: 'relative',
          zIndex: 1
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-[#33FFB8]/10 flex items-center justify-center animate-pulse-slow">
          <div className="w-8 h-8 rounded-full bg-[#33FFB8]/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-[#33FFB8]/60"></div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3 bg-[#33FFB8]/50"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-3 bg-[#33FFB8]/50"></div>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-px w-3 bg-[#33FFB8]/50"></div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-px w-3 bg-[#33FFB8]/50"></div>
    </div>
  );
}
