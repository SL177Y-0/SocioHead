import React from 'react';
import { DefiLogo } from './cluster-logo';
import { TokenBadge } from './token-badge';
import { Share2, Bell, BarChart2, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useScore } from '@/context/ScoreContext';

interface NavbarProps {
  children?: React.ReactNode;
}

export function Navbar({ children }: NavbarProps) {
  const navigate = useNavigate();
  const { twitterConnected, telegramConnected, walletConnected } = useScore();
  
  const hasCompletedFlow = twitterConnected && telegramConnected && walletConnected;
  
  const handleAnalyticsClick = () => {
    navigate('/analysis');
  };
  
  
  const handleDashboardClick = () => {
    navigate('/scorecard');
  };
  
  return (
    <div className="w-full flex items-center justify-between py-1 px-2 pr-5 border-b border-[#1E2A32] bg-[#0F1B24]/80 backdrop-blur-md">
      <div className="flex items-center">
        <DefiLogo />
      </div>
      
      <div className="flex items-center space-x-0.5">
        <button 
          onClick={handleAnalyticsClick}
          className="bg-[#00FFB8] hover:bg-[#00FFB8]/90 text-black font-bold rounded-full px-5 py-1.5 flex items-center gap-2 transition-colors text-xs uppercase"
        >
          <BarChart2 size={14} />
        </button>
        
        {hasCompletedFlow && (
          <button 
            onClick={handleDashboardClick}
            className="bg-[#00FFB8] hover:bg-[#00FFB8]/90 text-black font-bold rounded-full px-5 py-1.5 flex items-center gap-2 transition-colors text-xs uppercase"
          >
            <LayoutDashboard size={14} />
            <span>VIEW YOUR DASHBOARD</span>
          </button>
        )}
        
        {children}
        <div className="text-[#33FFB8] hover:text-[#33FFB8]/80 transition-colors cursor-pointer">
          
        </div>
      </div>
    </div>
  );
}
