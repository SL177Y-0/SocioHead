import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Twitter } from 'lucide-react';

// Custom CSS class approach instead of inline styles
const scrollbarHidingClass = "scrollbar-hide";

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data for leaderboard
const leaderboardData = [
  { rank: 184, user: "User 184", handle: "@user184", telegramScore: 177, walletScore: 54, twitterScore: 1206, twitterFollowers: 72462, totalScore: 163 },
  { rank: 185, user: "User 185", handle: "@user185", telegramScore: 193, walletScore: 171, twitterScore: 2119, twitterFollowers: 23965, totalScore: 74 },
  { rank: 186, user: "User 186", handle: "@user186", telegramScore: 105, walletScore: 23, twitterScore: 2678, twitterFollowers: 93623, totalScore: 30 },
  { rank: 187, user: "User 187", handle: "@user187", telegramScore: 218, walletScore: 79, twitterScore: 1291, twitterFollowers: 84808, totalScore: 98 },
  { rank: 188, user: "User 188", handle: "@user188", telegramScore: 160, walletScore: 187, twitterScore: 121, twitterFollowers: 14745, totalScore: 25 },
  { rank: 189, user: "User 189", handle: "@user189", telegramScore: 140, walletScore: 168, twitterScore: 2808, twitterFollowers: 93443, totalScore: 83 },
  { rank: 190, user: "User 190", handle: "@user190", telegramScore: 22, walletScore: 23, twitterScore: 1281, twitterFollowers: 35710, totalScore: 20 },
  { rank: 191, user: "User 191", handle: "@user191", telegramScore: 104, walletScore: 53, twitterScore: 561, twitterFollowers: 94499, totalScore: 27 },
];

// Time filter options
const timeFilters = ["24H", "48H", "7D", "30D", "ALL"];

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const [activeTimeFilter, setActiveTimeFilter] = useState("24H");
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isVerySmallScreen, setIsVerySmallScreen] = useState(false);
  const [isExtremelySmallScreen, setIsExtremelySmallScreen] = useState(false);
  
  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsExtremelySmallScreen(width < 675 || height < 500);
      setIsVerySmallScreen(width < 874 || height < 724);
      setIsSmallScreen(width < 930 || height < 734);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#071219] border border-[#33FFB8]/30 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        style={{ maxWidth: 'calc(100% - 20px)', maxHeight: 'calc(100% - 20px)' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#1E2A32]">
          <h2 className="text-2xl font-bold text-white">LEADERBOARD</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className={`${isExtremelySmallScreen ? 'p-2' : isVerySmallScreen ? 'p-3' : 'p-5'}`}>
          <div className="flex justify-end mb-4">
            <div className={`flex ${isSmallScreen ? 'flex-wrap justify-center' : ''} bg-[#0F1B24] rounded-lg overflow-hidden border border-[#1E2A32]`}>
              {timeFilters.map((filter) => (
                <button
                  key={filter}
                  className={`${isExtremelySmallScreen ? 'px-1.5 py-0.5 text-[10px]' : isVerySmallScreen ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'} font-medium ${activeTimeFilter === filter 
                    ? 'bg-[#33FFB8] text-[#071219]' 
                    : 'text-white/70 hover:bg-[#0A1A22]'} transition-colors`}
                  onClick={() => setActiveTimeFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className={`overflow-x-auto ${scrollbarHidingClass}`}>
            {isExtremelySmallScreen ? (
              // Extremely simplified table with only 3 columns
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1E2A32]">
                    <th className="py-2 px-2 text-xs text-left text-white font-medium">RANK</th>
                    <th className="py-2 px-2 text-xs text-left text-white font-medium">NAME</th>
                    <th className="py-2 px-2 text-xs text-right text-white font-medium">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((user) => (
                    <tr 
                      key={user.rank} 
                      className="border-b border-[#1E2A32]/50 hover:bg-[#0F1B24]/80 transition-colors"
                    >
                      <td className="py-1.5 px-2 text-xs text-white">{user.rank}</td>
                      <td className="py-1.5 px-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-[#0F1B24] border border-[#1E2A32] flex items-center justify-center text-white text-[10px]">
                            {user.user.charAt(0)}
                          </div>
                          <div className="max-w-[120px]">
                            <div className="text-white text-xs truncate">{user.user}</div>
                            <div className="text-white/70 text-[10px] truncate">{user.handle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-1.5 px-2 text-xs font-semibold text-[#33FFB8] text-right">{user.totalScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : !isSmallScreen ? (
              // Full table for larger screens
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1E2A32]">
                    <th className={`py-3 ${isVerySmallScreen ? 'px-2 text-xs' : 'px-4'} text-left text-white font-medium`}>RANK</th>
                    <th className={`py-3 ${isVerySmallScreen ? 'px-2 text-xs' : 'px-4'} text-left text-white font-medium`}>NAME</th>
                    <th className={`py-3 ${isVerySmallScreen ? 'px-2 text-xs' : 'px-4'} text-left text-white font-medium`}>TELEGRAM</th>
                    <th className={`py-3 ${isVerySmallScreen ? 'px-2 text-xs' : 'px-4'} text-left text-white font-medium`}>WALLET</th>
                    <th className={`py-3 ${isVerySmallScreen ? 'px-2 text-xs' : 'px-4'} text-left text-white font-medium`}>TWITTER</th>
                    <th className={`py-3 ${isVerySmallScreen ? 'px-2 text-xs' : 'px-4'} text-left text-white font-medium`}>FOLLOWERS</th>
                    <th className={`py-3 ${isVerySmallScreen ? 'px-2 text-xs' : 'px-4'} text-left text-white font-medium`}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((user) => (
                    <tr 
                      key={user.rank} 
                      className="border-b border-[#1E2A32]/50 hover:bg-[#0F1B24]/80 transition-colors"
                    >
                      <td className={`py-2 ${isVerySmallScreen ? 'px-2 text-xs' : 'px-4 py-3'} text-white`}>{user.rank}</td>
                      <td className={`${isVerySmallScreen ? 'px-2 py-2' : 'px-4 py-3'}`}>
                        <div className="flex items-center gap-2">
                          <div className={`${isVerySmallScreen ? 'w-6 h-6 text-xs' : 'w-8 h-8'} rounded-full bg-[#0F1B24] border border-[#1E2A32] flex items-center justify-center text-white`}>
                            {user.user.charAt(0)}
                          </div>
                          <div>
                            <div className={`text-white ${isVerySmallScreen ? 'text-xs' : ''}`}>{user.user}</div>
                            <div className={`text-white/70 ${isVerySmallScreen ? 'text-[10px]' : 'text-xs'}`}>{user.handle}</div>
                          </div>
                        </div>
                      </td>
                      <td className={`${isVerySmallScreen ? 'px-2 py-2 text-xs' : 'px-4 py-3'} text-white`}>{user.telegramScore}</td>
                      <td className={`${isVerySmallScreen ? 'px-2 py-2 text-xs' : 'px-4 py-3'} text-white`}>{user.walletScore}</td>
                      <td className={`${isVerySmallScreen ? 'px-2 py-2 text-xs' : 'px-4 py-3'} text-white`}>{user.twitterScore}</td>
                      <td className={`${isVerySmallScreen ? 'px-2 py-2 text-xs' : 'px-4 py-3'} text-white`}>{user.twitterFollowers.toLocaleString()}</td>
                      <td className={`${isVerySmallScreen ? 'px-2 py-2 text-xs' : 'px-4 py-3'} font-semibold text-[#33FFB8]`}>{user.totalScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              // Card view for medium-small screens
              <div className="space-y-4">
                {leaderboardData.map((user) => (
                  <div 
                    key={user.rank} 
                    className="bg-[#0F1B24]/30 rounded-lg p-3 border border-[#1E2A32]/50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#0F1B24] border border-[#1E2A32] flex items-center justify-center text-white text-xs">
                          {user.user.charAt(0)}
                        </div>
                        <div className="max-w-[120px]">
                          <div className="text-white text-sm font-semibold truncate">{user.user}</div>
                          <div className="text-white/70 text-xs truncate">{user.handle}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="text-xs text-white/50 mr-1">RANK</div>
                        <div className="text-white font-semibold">{user.rank}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-[#071219] p-1 rounded">
                        <div className="text-white/50 text-[10px]">TELEGRAM</div>
                        <div className="text-white">{user.telegramScore}</div>
                      </div>
                      <div className="bg-[#071219] p-1 rounded">
                        <div className="text-white/50 text-[10px]">WALLET</div>
                        <div className="text-white">{user.walletScore}</div>
                      </div>
                      <div className="bg-[#071219] p-1 rounded">
                        <div className="text-white/50 text-[10px]">TWITTER</div>
                        <div className="text-white">{user.twitterScore}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-white/70 truncate max-w-[120px]">Followers: {user.twitterFollowers.toLocaleString()}</div>
                      <div className="text-[#33FFB8] font-bold text-sm">TOTAL: {user.totalScore}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center gap-2 mt-5">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0F1B24] border border-[#1E2A32] text-white/70 hover:bg-[#0A1A22] transition-colors">
              &lt;
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#33FFB8] text-[#071219] font-medium">
              1
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0F1B24] border border-[#1E2A32] text-white/70 hover:bg-[#0A1A22] transition-colors">
              2
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0F1B24] border border-[#1E2A32] text-white/70 hover:bg-[#0A1A22] transition-colors">
              3
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0F1B24] border border-[#1E2A32] text-white/70 hover:bg-[#0A1A22] transition-colors">
              &gt;
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default LeaderboardModal; 