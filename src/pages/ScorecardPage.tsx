import React, { useState, useRef, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { usePrivy } from '@privy-io/react-auth';
import { RadarVisualization } from '@/components/radar-visualization';
import totalbadges from '@/badges/badges.json';
import { ProfileSection } from '@/components/profile-section';
import { useReferral } from '../context/ReferralContext';
import { ShareModal } from '@/components/share-modal';
import { ClusterLogo } from '@/components/cluster-logo';
import { TokenBadge } from '@/components/token-badge';
import { Twitter, MessageSquare, Wallet, Share2, Clock, Zap, Trophy, ArrowUpRight, ListFilter, Users, Copy, Check, X, ChevronRight, Star, Sparkles, Shield, Gift, Mail, Send, MessageCircle, Award, Activity, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import html2canvas from 'html2canvas';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import CustomProgressBar from '@/components/CustomProgressBar';
import SlotMachineScore from '@/components/SlotMachineScore';
import { CircularProgress } from '@/components/ChakraScoreCard';
import RadarScoreIndicators from '@/components/radar-score-indicator';
import LeaderboardModal from '@/components/LeaderboardModal';
import axios from 'axios';
import { useScore } from "@/context/ScoreContext";
import AnimatedCheckmark from '@/components/AnimatedCheckmark';
import ConnectionSlotMachineScore from '@/components/ConnectionSlotMachineScore';
import CyberButton from '@/components/CyberButton';

// Define interface for score history entries
interface ScoreHistoryEntry {
  timestamp: number;
  totalScore: number;
}

interface LeaderboardUser {
  rank: number;
  user: string;
  handle: string;
  telegramScore: number;
  walletScore: number;
  twitterScore: number;
  twitterFollowers: number;
  totalScore: number;
  timestamp: number;
  isUser?: boolean;
  scoreHistory?: ScoreHistoryEntry[];
  previousScore?: number;
  scoreChange?: number;
  scoreChangePercent?: string;
}

// Fixing the linter errors by explicitly converting the result to string
const calculateProgressBarWidth = (score: number, maxScore: number): string => {
  return `${Math.min(100, (score / maxScore) * 100)}%`;
};

// Define the maximum scores according to the formula
const MAX_SCORES = {
  TWITTER: 50,
  TELEGRAM: 15,
  WALLET: 40,
  TOTAL: 155
};

const ScorecardPage = () => {

  const { user } = usePrivy();
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState(undefined);
  const [showShareAnimation, setShowShareAnimation] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [showBadges, setShowBadges] = useState(false);
  const [activeTimeFilter, setActiveTimeFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [resetCooldown, setResetCooldown] = useState({
    canReset: true,
    hoursRemaining: 0,
    minutesRemaining: 0
  });
  // Add state for refresh animation popup
  const [showRefreshAnimation, setShowRefreshAnimation] = useState(false);
  const [refreshTasks, setRefreshTasks] = useState([
    { text: 'Fetching Twitter Engagement Data', completed: false },
    { text: 'Analyzing Telegram Activity', completed: false },
    { text: 'Retrieving Wallet Transactions', completed: false },
    { text: 'Recalculating Final Score', completed: false }
  ]);
  const [refreshTaskStatus, setRefreshTaskStatus] = useState<boolean[]>([false, false, false, false]);
  const contentRef = useRef(null);
  const shareCardRef = useRef(null);
  const [twitterScore, setTwitterScore] = useState(0);
  const [telegramScore, setTelegramScore] = useState(0);
  const [walletScore, setWalletScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [fetchedLeaderboardData, setFetchedLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [rank, setrank] = useState(0)
  const [apiUserInfo, setApiUserInfo] = useState({
    username: "",
    email: "",
    title: "",
    profileImageUrl: ""
  });
  const [userProfile, setUserProfile] = useState({ username: '', twitterHandle: '', telegramHandle: '' });
  const [randomRefCode] = useState(() => {
    // Generate a random 5-letter word
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  });
  const [userBadges, setUserBadges] = useState([]);

  // Add state for small screen detection
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [referralInfo, setReferralInfo] = useState({
    referredBy: null,
    referredTo: []
  });

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://back.braindrop.fun";

  const fetchReferralInfo = async () => {
    if (!user?.id) return;

    try {
      const response = await axios.post(
        `${apiBaseUrl}/reffral/user`,
        { privyId: user.id }
      );

      if (response.data && response.data.success) {
        setReferralInfo({
          referredBy: response.data.data.referredBy,
          referredTo: response.data.data.referredTo || []
        });
        console.log("✅ Referral info fetched:", response.data.data);
      }
    } catch (err) {
      console.error("❌ Error fetching referral info:", err);
    }
  };

  // Step 3: Call the fetch function in useEffect, add this after other useEffects
  useEffect(() => {
    fetchReferralInfo();
  }, [user?.id, apiBaseUrl]);


  const { scores } = useScore();

  //refresh



  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 874 || window.innerHeight < 724);
      setNeedsScroll(window.innerWidth < 752 || window.innerHeight < 680);
    };

    // Initial check
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  //for user info like username,badges, email, etc.

  useEffect(() => {
    const fetchUserInfoFromBackend = async () => {
      try {
        if (!user?.id) return;

        const response = await axios.post(
          `${apiBaseUrl}/score-fetch/users`,
          { privyId: user.id }
        );

        const data = response.data;



        setApiUserInfo({
          username: data.username || "",
          email: data.email || "",
          title: data.title || "",
          profileImageUrl: data.profileImageUrl || ""
        });
        const matchedBadges = totalbadges.filter(badge =>
          data.badges.includes(badge.id)
        );

        setUserBadges(matchedBadges);

        console.log("✅ User info fetched from backend:", data);
      } catch (err) {
        console.error("❌ Error fetching user info from backend:", err);
      }
    };

    fetchUserInfoFromBackend();
  }, [user?.id]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Keep your existing endpoint since it's working in Postman
        const response = await axios.get(`${apiBaseUrl}/leaderboard/data`);
        if (response.status === 200) {
          const data: LeaderboardUser[] = response.data;
          console.log("✅ Leaderboard data fetched successfully:", data);


          // Set the fetched data
          setFetchedLeaderboardData(data);
          if (user?.id) {
            const userHandle = apiUserInfo.username ? `@${apiUserInfo.username}` : '';
            const userEmailPrefix = user.email?.address?.split('@')[0] || '';

            // Find the user's entry in the leaderboard
            const userEntry = data.find(entry =>
              entry.handle === userHandle ||
              entry.user === apiUserInfo.username ||
              entry.handle === `@${userEmailPrefix}`
            );

            // Update the rank if found
            if (userEntry) {
              console.log("✅ Found user in leaderboard at rank:", userEntry.rank);
              setrank(userEntry.rank);
            }
          }

          // Only call handleTimeFilterChange AFTER we have data
          if (data && data.length > 0) {
            handleTimeFilterChange("ALL");
          }
        }
      } catch (err) {
        console.error("❌ Failed to fetch leaderboard data:", err);
      }
    };

    fetchLeaderboard();
  }, [user?.id, apiUserInfo.username]);


  // Updated useEffect to fetch user profile info along with scores
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const privyId = user.id;

        // Fetch scores and user profile in parallel
        const [twitterRes, telegramRes, walletRes, totalRes] = await Promise.all([
          fetch(`${apiBaseUrl}/score-fetch/score/twitter`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ privyId }),
          }),
          fetch(`${apiBaseUrl}/score-fetch/score/telegram`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ privyId }),
          }),
          fetch(`${apiBaseUrl}/score-fetch/score/wallet`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ privyId }),
          }),
          fetch(`${apiBaseUrl}/score-fetch/score/total`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ privyId }),
          }),

        ]);

        const twitterData = await twitterRes.json();
        const telegramData = await telegramRes.json();
        const walletData = await walletRes.json();
        const totalData = await totalRes.json();


        // // Get user profile data if available
        // let userProfile = { username: 'User', twitterHandle: '', telegramHandle: '' };
        // if (userProfileRes.ok) {
        //   const profileData = await userProfileRes.json();
        //   if (profileData) {
        //     userProfile = {
        //       username: profileData.username || user?.email?.address || 'User',
        //       twitterHandle: profileData.twitterHandle || '',
        //       telegramHandle: profileData.telegramHandle || ''
        //     };
        //   }
        // }

        // Update state with user profile
        setUserProfile(userProfile);

        // Update score states
        setTwitterScore(twitterData.twitterScore || 0);
        setTelegramScore(telegramData.telegramScore || 0);
        setWalletScore(walletData.walletScore || 0);

        // Calculate total from individual scores or use the total from API
        const total = totalData.totalScore ||
          (twitterData.twitterScore || 0) +
          (telegramData.telegramScore || 0) +
          (walletData.walletScore || 0);

        setTotalScore(total);

        // Fetch user badges if available
        try {
          const badgesRes = await fetch(`https://back.braindrop.fun`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },

          });

          if (badgesRes.ok) {
            const badgesData = await badgesRes.json();
            if (badgesData && badgesData.badges) {
              setUserBadges(badgesData.badges);
            }
          }
        } catch (badgesErr) {
          console.error("Error fetching badges:", badgesErr);
          // Keep default badges if fetch fails
        }

      } catch (err) {
        console.error("❌ Error fetching scores:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, apiBaseUrl]);

  const { getUserReferralLink } = useReferral();

  const referralLink = getUserReferralLink(apiUserInfo.username);

  // Fixed demo score data (fallback)
  const defaultScoreData = {
    twitterScore: 0,
    telegramScore: 0,
    walletScore: 0,
    totalScore: 0,
    percentile: 0,
    rank: 0
  };



  // Function to handle copying link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setCopied(true);
        toast({
          title: "Link copied to clipboard",
          description: "Share your DeFi score with friends!",
          duration: 3000,
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast({
          title: "Failed to copy link",
          description: "Please try again",
          variant: "destructive",
          duration: 3000,
        });
      });
  };

  // Copy the referral link to clipboard
  const copyReferralLink = () => {
    navigator.clipboard.writeText(getUserReferralLink(apiUserInfo.username));
    setCopyStatus("copied");
    setTimeout(() => setCopyStatus(""), 2000);
    toast({
      title: "Referral link copied!",
      description: "Share it with your friends to earn rewards.",
      duration: 3000,
    });
  };

  // Function to handle share button click and generate image
  const handleShare = async () => {
    // Show animation feedback
    setShowShareAnimation(true);

    // Start share process after short delay for visual feedback
    setTimeout(async () => {
      // First open the share modal so it renders in the DOM
      setIsShareModalOpen(true);
      setIsGeneratingImage(true);
      setCapturedImageUrl(undefined);

      try {
        // Give more time for the modal to fully render
        await new Promise(resolve => setTimeout(resolve, 800));

        // Find the actual card element in the DOM
        const cardElement = document.querySelector('.flip-card-front');
        if (!cardElement) {
          throw new Error("Could not find card element to capture");
        }

        // Capture the image with high quality settings
        const canvas = await html2canvas(cardElement as HTMLElement, {
          scale: 3, // Higher scale for better quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#030A0F',
          logging: false,
          onclone: (clonedDoc) => {
            // If there are any modifications needed to the cloned element before capture
            const clonedCard = clonedDoc.querySelector('.flip-card-front');
            if (clonedCard) {
              // Remove any elements that shouldn't be in the image
              const flipHint = clonedCard.querySelector('[style*="Click to flip"]');
              if (flipHint) {
                flipHint.remove();
              }
            }
          }
        });

        // Convert canvas to image URL with high quality
        const contentImageUrl = canvas.toDataURL('image/png', 1.0);
        setCapturedImageUrl(contentImageUrl);

      } catch (error) {
        console.error('Error generating share image:', error);
        toast({
          title: "Failed to generate image",
          description: "Please try again later",
          variant: "destructive",
          duration: 5000,
        });
      } finally {
        setIsGeneratingImage(false);
        setShowShareAnimation(false);
      }
    }, 500);
  };

  // Function to open the leaderboard modal
  const handleOpenLeaderboard = () => {
    setIsLeaderboardOpen(true);
  };

  // Function to handle refer button click
  const handleReferClick = () => {
    setShowReferralModal(true);
  };

  // Function to handle badges click
  const handleBadgesClick = () => {
    setShowBadges(true);
  };

  // Updated share data for the modal using actual user information
  const shareData = {
    username: userProfile?.username || user?.email?.address || "Crypto User",
    score: totalScore,
    rank: rank,
    level: Math.floor(totalScore / 500).toString(), // Calculate level based on score
    twitterScore: twitterScore,
    telegramScore: telegramScore,
    walletScore: walletScore,
    twitterHandle: userProfile?.twitterHandle || '',
    telegramHandle: userProfile?.telegramHandle || ''
  };

  // Improvement tips from dashboard
  const improvementTips = [
    { id: 1, name: "Twitter Boost", icon: Twitter, color: "text-[#00acee]", description: "Post more viral tweets for +10% boost" },
    { id: 2, name: "Engagement Pro", icon: MessageCircle, color: "text-[#0088cc]", description: "Join high-quality groups for extra points" },
  ];

  // Extended leaderboard data for pagination demonstration
  const leaderboardData = fetchedLeaderboardData;

  // Create a state for filtered data
  const [filteredData, setFilteredData] = useState<LeaderboardUser[]>(leaderboardData);

  // Pagination configuration
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  // Function to handle time filter change
  const handleTimeFilterChange = (filter) => {
    setActiveTimeFilter(filter);

    // Guard against empty data
    if (!fetchedLeaderboardData || fetchedLeaderboardData.length === 0) {
      console.warn("No leaderboard data available for filtering");
      setFilteredData([]);
      return;
    }

    // Use current timestamp instead of hardcoded date
    const now = new Date().getTime();
    let cutoffTime;

    switch (filter) {
      case "24H":
        cutoffTime = now - (24 * 60 * 60 * 1000); // 24 hours ago
        break;
      case "48H":
        cutoffTime = now - (48 * 60 * 60 * 1000); // 48 hours ago
        break;
      case "7D":
        cutoffTime = now - (7 * 24 * 60 * 60 * 1000); // 7 days ago
        break;
      case "30D":
        cutoffTime = now - (30 * 24 * 60 * 60 * 1000); // 30 days ago
        break;
      case "ALL":
        cutoffTime = 0; // All time
        break;
      default:
        cutoffTime = now - (24 * 60 * 60 * 1000); // Default to 24H
    }

    // Filter the leaderboard data based on the timestamp
    const newFilteredData = filter === "ALL"
      ? fetchedLeaderboardData
      : fetchedLeaderboardData.filter(user => user.timestamp >= cutoffTime);

    // Calculate score changes based on the selected time period
    const updatedData = newFilteredData.map(user => {
      // Find previous score from history based on time filter
      let previousScore = user.totalScore;
      let scoreChange = 0;

      if (user.scoreHistory && user.scoreHistory.length > 0) {
        // Find the oldest score entry that is still within our time window
        const historicalEntries = user.scoreHistory.filter(entry =>
          entry.timestamp >= cutoffTime && entry.timestamp < user.timestamp
        ).sort((a, b) => a.timestamp - b.timestamp);

        if (historicalEntries.length > 0) {
          // Get the oldest entry within our time window
          previousScore = historicalEntries[0].totalScore;
          scoreChange = user.totalScore - previousScore;
        }
      }

      return {
        ...user,
        previousScore,
        scoreChange,
        scoreChangePercent: previousScore > 0 ? ((scoreChange / previousScore) * 100).toFixed(1) : '0'
      };
    });

    // Update the filtered data state with score changes included
    setFilteredData(updatedData.map((user, index) => ({
      ...user,
      rank: index + 1 // Re-rank users after filtering
    })));

    // Reset to first page when filter changes
    setCurrentPage(1);
  };

  // Function to handle pagination
  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Initialize filtering on first render
  useEffect(() => {
    if (fetchedLeaderboardData.length > 0) {
      handleTimeFilterChange("ALL");
    }
  }, [fetchedLeaderboardData]);

  // Start animations on page load
  useEffect(() => {
    // Trigger animations on first load
    const timer = setTimeout(() => {
      const scoreElements = document.querySelectorAll('.animate-on-load');
      scoreElements.forEach((el, i) => {
        setTimeout(() => {
          el.classList.add('animate');
        }, i * 300);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Add global style to body to hide all scrollbars
  useEffect(() => {
    if (needsScroll) {
      // Enable scrolling but hide scrollbars
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';

      // Add CSS to hide scrollbars but keep functionality
      const style = document.createElement('style');
      style.textContent = `
        body::-webkit-scrollbar, html::-webkit-scrollbar { 
          display: none; 
        }
        body, html {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.head.removeChild(style);
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      };
    } else {
      // Keep previous behavior for larger screens
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      };
    }
  }, [needsScroll]);

  // Add this useEffect to check reset cooldown after other useEffects
  useEffect(() => {
    // Check if user has reset within the last 24 hours
    const checkResetCooldown = () => {
      const lastResetTime = localStorage.getItem('lastScoreReset');
      if (!lastResetTime) {
        setResetCooldown({ canReset: true, hoursRemaining: 0, minutesRemaining: 0 });
        return;
      }

      const now = new Date().getTime();
      const cooldownPeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const timeSinceReset = now - parseInt(lastResetTime);

      if (timeSinceReset < cooldownPeriod) {
        // Still in cooldown period
        const timeRemaining = cooldownPeriod - timeSinceReset;
        const hoursRemaining = Math.floor(timeRemaining / (60 * 60 * 1000));
        const minutesRemaining = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));

        setResetCooldown({
          canReset: false,
          hoursRemaining,
          minutesRemaining
        });
      } else {
        // Cooldown period has passed
        setResetCooldown({ canReset: true, hoursRemaining: 0, minutesRemaining: 0 });
      }
    };

    checkResetCooldown();
    // Check cooldown status every minute
    const intervalId = setInterval(checkResetCooldown, 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Function to handle refresh button click
  const handleRefreshScore = () => {
    checkRefreshCooldown();

    if (!resetCooldown.canReset) {
      toast({
        title: "Score refresh limit reached",
        description: `Try again in ${resetCooldown.hoursRemaining}h ${resetCooldown.minutesRemaining}m`,
        duration: 5000,
      });
      return;
    }

    setShowResetConfirmation(true);
  };

  // Perform the refresh with animation and fetch fresh data
  const performRefresh = async () => {
    try {
      setShowResetConfirmation(false);
      setShowRefreshAnimation(true);

      // Animate through the tasks with timing
      let currentTask = 0;
      const taskInterval = setInterval(() => {
        if (currentTask < refreshTaskStatus.length) {
          setRefreshTaskStatus(prev => {
            const newStatus = [...prev];
            newStatus[currentTask] = true;
            return newStatus;
          });
          currentTask++;
        } else {
          clearInterval(taskInterval);

          // Only update the database after all animations are complete
          setTimeout(async () => {
            if (user?.id) {
              try {
                // Use our new combined refresh-score endpoint
                const privyId = user.id;

                const response = await fetch(`${apiBaseUrl}/api/score/refresh-score`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ privyId }),
                });

                if (!response.ok) {
                  throw new Error('Failed to refresh score');
                }

                // Get the response with total score
                const data = await response.json();

                // Update total score
                setTotalScore(data.totalScore);

                // Store current time in localStorage to track cooldown
                localStorage.setItem('lastResetTime', Date.now().toString());

                // Close animation after a short delay
                setTimeout(() => {
                  setShowRefreshAnimation(false);

                  // Show success toast
                  toast({
                    title: "Scores refreshed successfully!",
                    description: "Your scores have been updated with the latest data.",
                    duration: 5000,
                  });

                  // Reset task status for next time
                  setRefreshTaskStatus([false, false, false, false]);
                }, 1500);
              } catch (error) {
                console.error("Error refreshing scores:", error);
                setShowRefreshAnimation(false);
                toast({
                  title: "Error refreshing scores",
                  description: "There was a problem refreshing your scores. Please try again later.",
                  variant: "destructive",
                  duration: 5000,
                });
              }
            }
          }, 1000);
        }
      }, 800);
    } catch (error) {
      console.error("Error in reset:", error);
      setShowRefreshAnimation(false);
      toast({
        title: "Error refreshing scores",
        description: "There was a problem refreshing your scores. Please try again later.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Check if user can refresh scores (once per 24 hours)
  useEffect(() => {
    checkRefreshCooldown();

    // Check cooldown every minute
    const intervalId = setInterval(checkRefreshCooldown, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Function to check refresh cooldown
  const checkRefreshCooldown = () => {
    const lastResetTime = localStorage.getItem('lastResetTime');
    if (!lastResetTime) {
      setResetCooldown({
        canReset: true,
        hoursRemaining: 0,
        minutesRemaining: 0
      });
      return;
    }

    const lastResetDate = new Date(parseInt(lastResetTime));
    const now = new Date();
    const diffMs = now.getTime() - lastResetDate.getTime();
    const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (diffMs < cooldownMs) {
      const remainingMs = cooldownMs - diffMs;
      const hoursRemaining = Math.floor(remainingMs / (60 * 60 * 1000));
      const minutesRemaining = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

      setResetCooldown({
        canReset: false,
        hoursRemaining,
        minutesRemaining
      });
    } else {
      setResetCooldown({
        canReset: true,
        hoursRemaining: 0,
        minutesRemaining: 0
      });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#071219] text-white flex flex-col overflow-hidden">
        {/* Background effect */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 to-black"></div>
        </div>

        <Navbar>
          <div className="flex-1"></div>
          <div className={`flex items-center ${isSmallScreen ? 'gap-1' : 'gap-1'}`}>
            <button
              onClick={handleOpenLeaderboard}
              className="bg-[#00FFB8] hover:bg-[#00FFB8]/90 text-black font-bold rounded-full px-5 py-1.5 flex items-center gap-2 transition-colors text-xs uppercase"
            >
              <ListFilter size={14} />
              {!isSmallScreen && <span>LEADERBOARD</span>}
            </button>
            <button
              onClick={() => {
                // Clear all storage
                localStorage.clear();
                sessionStorage.clear();

                // Clear all cookies
                document.cookie.split(";").forEach(function (c) {
                  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                });

                // Logout from Privy if available
                if (user) {
                  try {
                    // Using any to bypass TypeScript error since we know the method exists
                    (user as any).logout?.();
                  } catch (e) {
                    console.error("Error logging out from Privy:", e);
                  }
                }

                // Redirect to index page after a short delay to allow logout to complete
                setTimeout(() => {
                  window.location.href = "/index";
                }, 100);
              }}
              className="bg-[#D10000] hover:bg-[#FF0000] text-black font-bold rounded-full px-3 py-1.5 flex items-center gap-1 transition-colors text-xs uppercase border border-red-400/30 shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>

            </button>
          </div>
        </Navbar>

        <main className="flex-1 container mx-auto px-4 py-4 max-w-7xl relative z-10">
          {/* Hidden div for share card reference */}
          <div className="hidden">
            <div ref={shareCardRef} className="w-[1200px]">
              {/* Share card content will be rendered here */}
            </div>
          </div>

          <div ref={contentRef} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            {/* Left Column */}
            <div className="md:col-span-4 lg:col-span-3 space-y-4">
              <div className="bg-[#071219] border-2 border-[#33FFB8] rounded-xl p-5 shadow-[0_0_20px_rgba(51,255,184,0.2)]">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-[#0F1B24] border border-[#33FFB8]/30 flex items-center justify-center text-lg font-medium overflow-hidden">
                    <img
                      src={apiUserInfo.profileImageUrl || `https://unavatar.io/twitter/${apiUserInfo.username}`}
                      alt={`${apiUserInfo.username || "User"}'s profile`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-bold font-['Space_Grotesk']">{apiUserInfo.username || "User"}</h2>
                    <div className="flex items-center gap-1">
                      <span className="text-green-400 text-xs">@{apiUserInfo.email || "email"}</span>
                    </div>
                  </div>
                </div>

                {apiUserInfo.username && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Twitter className="h-4 w-4 text-[#00acee]" />
                      <span className="text-white/80 text-sm">@{apiUserInfo.username}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[#1E2A32] text-white/60">VERIFIED</span>
                    </div>
                  </div>
                )}


              </div>

              <div
                className="bg-[#071219] border-2 border-[#33FFB8] rounded-xl p-5 space-y-4 hover:bg-[#071219]/90 transition-colors cursor-pointer shadow-[0_0_20px_rgba(51,255,184,0.2)]"
                onClick={handleBadgesClick}
              >
                {userBadges.length > 0 ? (
                  <>
                    <div className="flex items-center mt-4">
                      <div className="flex -space-x-3">
                        {userBadges.slice(0, 3).map((badge, index) => (
                          <div
                            key={index}
                            className={`bg-[#0A1F1C] p-2 rounded-full border border-[#33FFB8]/30 z-${30 - index * 10}`}
                          >
                            <img
                              src={badge.path}
                              alt={badge.label}
                              className="h-5 w-5 object-contain"
                            />
                          </div>
                        ))}
                        {userBadges.length > 3 && (
                          <div className="bg-[#0A1F1C] p-2 rounded-full border border-[#33FFB8]/30 flex items-center justify-center z-0 w-9 h-9">
                            <span className="text-xs font-bold">+{userBadges.length - 3}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold ml-4">View All Badges</span>
                    </div>
                    <div className="flex items-center mt-2 text-[#33FFB8]/70">
                      <span>Click to see details</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center mt-4 text-white/50">
                    <span>No badges earned yet</span>
                  </div>
                )}
              </div>

              {/* Best Badges Panel */}
              <div className="bg-[#071219] border-2 border-[#33FFB8] rounded-xl p-5 shadow-[0_0_20px_rgba(51,255,184,0.2)]">
                <div className="flex items-center space-x-2 mb-4">
                  <Award className="h-4 w-4 text-[#33FFB8]" />
                  <span className="text-white text-sm font-bold font-['Space_Grotesk']">SCORE BOOSTERS</span>
                </div>

                <div className="space-y-3">
                  {improvementTips.map((tip) => (
                    <div key={tip.id} className="flex items-center p-2 rounded-lg bg-[#0A1F1C] border border-[#33FFB8]/20">
                      <div className="bg-[#071219] p-2 rounded-full border border-[#33FFB8]/30 mr-3">
                        <tip.icon className={`h-5 w-5 ${tip.color}`} />
                      </div>
                      <div>
                        <div className="text-white text-sm font-semibold">{tip.name}</div>
                        <div className="text-gray-400 text-xs">{tip.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Refer Button */}
              <button
                onClick={handleReferClick}
                className="w-full bg-[#33FFB8] hover:bg-[#33FFB8]/90 text-black font-bold rounded-xl px-5 py-4 flex items-center justify-center gap-2 transition-colors text-sm uppercase shadow-[0_0_20px_rgba(51,255,184,0.2)]"
              >
                <Users size={16} />
                <span>REFER FRIENDS</span>
              </button>
            </div>

            {/* Center Column (Radar Visualization) - modified above */}
            <div className="md:col-span-4 lg:col-span-6 flex flex-col items-center justify-center">
              <div className="w-full max-w-md relative">
                {/* Add fixed aspect ratio container for radar */}
                <div className="aspect-square w-full max-w-[420px] mx-auto relative">
                  <div className="absolute inset-0">
                    <RadarVisualization />
                  </div>
                  <div className="absolute inset-0">
                    <RadarScoreIndicators
                      twitterScore={twitterScore}
                      telegramScore={telegramScore}
                      walletScore={walletScore}
                    />
                  </div>
                </div>

                <div className="mt-6 bg-[#071219] border-2 border-[#33FFB8] rounded-xl shadow-[0_0_20px_rgba(51,255,184,0.2)]">
                  {/* 3D Card flip container */}
                  <div className="flip-card">
                    <div className="flip-card-inner">
                      {/* Front side - Score */}
                      <div className="flip-card-front p-4 text-center">
                        <h3 className="text-xl font-bold text-white mb-2 font-['Space_Grotesk']"> RANKING</h3>
                        <motion.p
                          className="text-2xl font-bold text-[#33FFB8] mb-2"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          {apiUserInfo.title}
                        </motion.p>

                        <div className="mt-4 flex justify-center gap-8">
                          <div className="flex flex-col items-center">
                            <p className="text-xs text-white/50">RANK</p>
                            <div className="animate-on-load">
                              <SlotMachineScore
                                value={rank}
                                className="text-xl font-bold text-white"
                                digits={rank < 10 ? 1 : rank < 100 ? 2 : rank < 1000 ? 3 : 4}
                                showAnimation={true}
                                duration={1000}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="md:col-span-4 lg:col-span-3 space-y-4">
              <div className="bg-[#071219] border-2 border-[#33FFB8] rounded-xl p-5 shadow-[0_0_20px_rgba(51,255,184,0.2)]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-[#33FFB8] mr-2"></div>
                    <h3 className="text-white font-bold font-['Space_Grotesk']">TOTAL SCORE</h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRefreshScore}
                    className={`flex items-center justify-center h-11 w-[4rem] rounded-full ${resetCooldown.canReset
                        ? 'bg-[#1A2C3D] border-2 border-[#33FFB8] text-[#33FFB8] hover:bg-[#243A4E] shadow-[0_0_15px_rgba(51,255,184,0.25)]'
                        : 'bg-[#1A2C3D] border border-[#33FFB8]/30 text-white cursor-not-allowed shadow-[0_0_10px_rgba(51,255,184,0.1)]'
                      } transition-all duration-200`}
                    title={resetCooldown.canReset ? 'Refresh scores' : `Available in ${resetCooldown.hoursRemaining}h ${resetCooldown.minutesRemaining}m`}
                  >
                    {resetCooldown.canReset ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw size={18} className="text-[#33FFB8]" />

                      </div>
                    ) : (
                      <div className="flex items-center text-xs font-medium">
                        <Clock size={14} className="mr-1 text-white" />
                        <span className="text-white">{resetCooldown.hoursRemaining}h</span>
                      </div>
                    )}
                  </motion.button>
                </div>

                <div className="flex justify-center mb-8">
                  <div className="relative flex items-center justify-center">
                    <svg height="150" width="150">
                      {/* Background circle */}
                      <circle
                        cx="75"
                        cy="75"
                        r="70"
                        stroke="#1E2A32"
                        strokeWidth="4"
                        fill="transparent"
                      />
                      {/* Progress circle with improved animation */}
                      <motion.circle
                        cx="75"
                        cy="75"
                        r="70"
                        stroke="#33FFB8"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray="439.8"
                        initial={{ strokeDashoffset: 439.8 }}
                        animate={{
                          strokeDashoffset: 439.8 * (1 - Math.min(1, totalScore / MAX_SCORES.TOTAL))
                        }}
                        transition={{
                          duration: 1.8,
                          ease: [0.34, 1.56, 0.64, 1], // Custom spring-like easing
                          delay: 0.2
                        }}
                        transform="rotate(-90 75 75)"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <SlotMachineScore value={totalScore} className="text-3xl font-bold text-white" />
                      <span className="text-sm text-[#33FFB8] font-medium mt-1">OVERALL</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleShare}
                  className={`w-full px-4 py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold uppercase transition-all 
              ${showShareAnimation
                      ? "bg-gradient-to-r from-[#2A3E38] to-[#3B6A4B] text-white"
                      : "bg-[#33FFB8] text-[#071219] hover:bg-[#33FFB8]/90"}`}
                  style={{
                    boxShadow: showShareAnimation ? "0 0 15px rgba(51, 255, 184, 0.3)" : "",
                    transform: showShareAnimation ? "scale(1.02)" : "scale(1)",
                    transition: "all 0.3s ease-out"
                  }}
                >
                  {showShareAnimation ? (
                    <div className="flex items-center justify-center">
                      <div className="mr-2 relative">
                        <div className="absolute -inset-1 rounded-full bg-[#33FFB8]/20 animate-ping"></div>
                        <Share2 size={16} className="relative z-10 text-[#33FFB8]" />
                      </div>
                      <span className="relative">
                        <span className="absolute inset-0 flex items-center justify-center blur-sm text-[#33FFB8]/70">GENERATING...</span>
                        <span className="relative">GENERATING...</span>
                      </span>
                    </div>
                  ) : (
                    <>
                      <Share2 size={16} />
                      <span>FLAUNT YOUR SCORE</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-[#071219] border-2 border-[#33FFB8] rounded-xl p-4 shadow-[0_0_20px_rgba(51,255,184,0.2)]">
                <h3 className="text-white font-bold font-['Space_Grotesk'] mb-4 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-[#33FFB8] mr-2"></div>
                  PERFORMANCE METRICS
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0A1F1C] border border-[#33FFB8]/30 flex items-center justify-center">
                      <Twitter className="h-5 w-5 text-[#00acee]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white/90 text-sm font-medium font-['Space_Grotesk']">Twitter Score</h3>
                      <SlotMachineScore value={twitterScore} className="text-xl text-white" />
                    </div>
                    <div className="w-32">
                      <div className="h-2 bg-[#1E2A32] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#33FFB8]"
                          initial={{ width: 0 }}
                          animate={{ width: calculateProgressBarWidth(twitterScore, MAX_SCORES.TWITTER) }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0A1F1C] border border-[#33FFB8]/30 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-[#0088cc]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white/90 text-sm font-medium font-['Space_Grotesk']">TG Score</h3>
                      <SlotMachineScore value={telegramScore} className="text-xl text-white" />
                    </div>
                    <div className="w-32">
                      <div className="h-2 bg-[#1E2A32] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#33FFB8]"
                          initial={{ width: 0 }}
                          animate={{ width: calculateProgressBarWidth(telegramScore, MAX_SCORES.TELEGRAM) }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0A1F1C] border border-[#33FFB8]/30 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-[#9747FF]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white/90 text-sm font-medium font-['Space_Grotesk']">Wallet Score</h3>
                      <SlotMachineScore value={walletScore} className="text-xl text-white" />
                    </div>
                    <div className="w-32">
                      <div className="h-2 bg-[#1E2A32] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-[#33FFB8]"
                          initial={{ width: 0 }}
                          animate={{ width: calculateProgressBarWidth(walletScore, MAX_SCORES.WALLET) }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Share modal */}
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          username={apiUserInfo.username}
          score={totalScore}
          rank={String(rank)}
          level={shareData.level}
          twitterScore={twitterScore}
          telegramScore={telegramScore}
          walletScore={walletScore}
          title={apiUserInfo.title}
          twitterHandle={shareData.twitterHandle}
          telegramHandle={shareData.telegramHandle}
          imageUrl={apiUserInfo.profileImageUrl}
          userBadges={userBadges}
          isGenerating={isGeneratingImage}
          referredBy={referralInfo.referredBy}
          referredTo={referralInfo.referredTo}
        />

        {/* Badges Modal */}
        {
          showBadges && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 overflow-hidden">
              <div className="bg-[#030A0F] border-2 border-[#33FFB8] rounded-xl p-6 max-w-2xl w-full shadow-[0_0_20px_rgba(51,255,184,0.2)] relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">YOUR EARNED BADGES</h3>
                  <button
                    onClick={() => setShowBadges(false)}
                    className="text-gray-400 hover:text-white transition-colors bg-black/40 rounded-full p-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2 overflow-x-hidden">
                  {userBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="bg-[#0A1217]/80 rounded-xl p-4 border border-[#1E2A32] flex items-start hover:bg-[#0A1217] transition-all"
                    >
                      <div
                        className="bg-[#030A0F] p-3 rounded-full border border-[#33FFB8]/30 mr-3 flex-shrink-0"
                        style={{
                          boxShadow: "0 0 10px rgba(51, 255, 184, 0.2)",
                        }}
                      >
                        <img src={`/${badge.path}`} alt={badge.label} className="w-16 h-16 mb-2" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-white">{badge.label}</h4>
                        <p className="text-white/70 text-sm mt-1">{badge.description}</p>
                        {/* <p className="text-[#33FFB8] text-xs mt-2">
                        Earned on{" "}
                        {new Date(badge.earnedDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p> */}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => setShowBadges(false)}
                    className="bg-[#030A0F] hover:bg-[#0A1217] text-[#33FFB8] px-4 py-2 rounded-lg flex items-center justify-center transition-colors border border-[#33FFB8]/30 text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* Referral Modal */}
        {
          showReferralModal && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50">
              <div className="bg-[#030A0F] border-2 border-[#33FFB8] rounded-xl p-6 max-w-2xl w-full relative shadow-[0_0_20px_rgba(51,255,184,0.2)]">
                <button onClick={() => setShowReferralModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                  <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Refer & Earn Rewards</h3>
                  <p className="text-gray-400 mt-2">Invite your friends and earn exciting rewards!</p>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {/* Left: Benefits */}
                  <div>
                    <div className="bg-[#0A1217] rounded-xl p-5 border border-[#1E2A32]">
                      <div className="flex items-center justify-center mb-4">
                        <Gift className="h-10 w-10 text-[#33FFB8]" />
                      </div>
                      <h4 className="text-lg font-bold text-center mb-3 text-white">Earn Exclusive Rewards</h4>
                      <ul className="text-white/70 text-sm space-y-2">
                        <li className="flex items-start">
                          <span className="mr-2">🎉</span>
                          <span>50 points per successful referral</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">🎁</span>
                          <span>Bonus 100 points when they connect their wallet</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">🏅</span>
                          <span>Unlock the "Network Builder" badge after 5 referrals</span>
                        </li>
                      </ul>
                    </div>

                    {/* Referral Stats */}
                    <div className="mt-5 bg-[#0A1217] rounded-xl p-4 border border-[#1E2A32]">
                      <h5 className="text-base font-bold text-white mb-3 ml-12">Your Referral Stats</h5>
                      <div className="flex justify-around">
                        <div className="mt-4 text-center">
                          <span className="inline-block text-xs text-white/60 px-3 py-1 rounded-full bg-[#1E2A32] animate-pulse tracking-wide uppercase">
                            More rewards coming soon!
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Share Link & Buttons */}
                  <div className="flex flex-col">
                    <div className="bg-[#0A1217] rounded-xl p-5 border border-[#1E2A32] h-full">
                      <h4 className="text-base font-semibold text-white mb-3">Your Referral Link</h4>
                      <div className="flex items-center bg-[#030A0F] rounded-lg border border-[#1E2A32] p-2">
                        <input
                          type="text"
                          value={referralLink}
                          readOnly
                          className="bg-transparent border-none outline-none flex-1 text-sm text-white/70"
                        />
                        <button
                          className="ml-2 p-1.5 rounded-lg bg-[#030A0F] hover:bg-[#0A1A22] border border-[#33FFB8]/30 transition-colors"
                          onClick={copyReferralLink}
                        >
                          {copyStatus === "copied" ? (
                            <Check className="h-4 w-4 text-[#33FFB8]" />
                          ) : (
                            <Copy className="h-4 w-4 text-[#33FFB8]" />
                          )}
                        </button>
                      </div>
                      {/* Referral Info Section */}
                      <div className="mt-4 mb-4">
                        <div className="flex flex-col space-y-2">
                          {referralInfo.referredBy ? (
                            <div className="bg-[#0A1F1C]/50 rounded-lg p-2 border border-[#33FFB8]/20">
                              <div className="flex items-center">
                                <Users size={14} className="text-[#33FFB8] mr-2" />
                                <span className="text-xs text-white/60">REFERRED BY</span>
                              </div>
                              <div className="flex items-center mt-1">
                                <div className="w-6 h-6 rounded-full bg-[#0A1F1C] border border-[#33FFB8]/30 flex items-center justify-center text-[#33FFB8] text-xs mr-2">
                                  {referralInfo.referredBy.username ? referralInfo.referredBy.username.charAt(0).toUpperCase() : '?'}
                                </div>
                                <span className="text-white text-sm font-medium">
                                  {referralInfo.referredBy.username || 'Anonymous'}
                                </span>
                              </div>
                            </div>
                          ) : null}

                          {referralInfo.referredTo && referralInfo.referredTo.length > 0 ? (
                            <div className="bg-[#0A1F1C]/50 rounded-lg p-2 border border-[#33FFB8]/20">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Users size={14} className="text-[#33FFB8] mr-2" />
                                  <span className="text-xs text-white/60">MY REFERRALS</span>
                                </div>
                                <div className="bg-[#1E2A32] px-2 py-0.5 rounded-full text-[10px] text-[#33FFB8]">
                                  {referralInfo.referredTo.length}
                                </div>
                              </div>

                              <div className="max-h-24 overflow-y-auto mt-1 pr-1 space-y-1.5">
                                {referralInfo.referredTo.slice(0, 3).map((user, index) => (
                                  <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div className="w-5 h-5 rounded-full bg-[#0A1F1C] border border-[#33FFB8]/30 flex items-center justify-center text-xs text-white mr-2">
                                        {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                                      </div>
                                      <span className="text-white text-xs truncate max-w-[100px]">
                                        {user.username || 'User'}
                                      </span>
                                    </div>
                                    <span className="text-[#33FFB8] text-xs">
                                      {user.totalScore || 0} pts
                                    </span>
                                  </div>
                                ))}

                                {referralInfo.referredTo.length > 3 && (
                                  <div className="text-center mt-1">
                                    <span className="text-[10px] text-white/50">+{referralInfo.referredTo.length - 3} more referrals</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-[#0A1F1C]/30 rounded-lg p-2.5 border border-[#33FFB8]/10">
                              <div className="flex items-center justify-center text-white/40 text-xs">
                                <Users size={14} className="mr-1.5" />
                                <span>No referrals yet</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Social Share Buttons */}
                      <h4 className="text-base font-semibold text-white mt-4 mb-3">Share with Friends</h4>
                      <div className="grid grid-cols-4 gap-3">
                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("@ClusterProtocol is connecting AI, attention, and capital with BrainDrop. It is fun. I just claimed my social card, and I'm accumulating BrainDrop fun points in real time.\n\nClaim yours 👉")}${referralLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center p-2 bg-[#030A0F] rounded-lg border border-[#1E2A32] hover:bg-[#0A1A22] transition-colors"
                        >
                          <Twitter className="h-5 w-5 text-[#33FFB8]" />

                        </a>
                        <a
                          href={`https://t.me/share/url?url=${referralLink}&text=Check out Braindrop.fun Score!`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center p-3 bg-[#030A0F] rounded-lg border border-[#1E2A32] hover:bg-[#0A1A22] transition-colors"
                        >
                          <Send className="h-5 w-5 text-[#33FFB8]" />

                        </a>
                        <a
                          href={`https://api.whatsapp.com/send?text=Check out my Braindrop.fun Score! Use my referral link: ${referralLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center p-2 bg-[#030A0F] rounded-lg border border-[#1E2A32] hover:bg-[#0A1A22] transition-colors"
                        >
                          <MessageCircle className="h-5 w-5 text-[#33FFB8]" />

                        </a>
                        <a
                          href={`mailto:?subject=Check out my DeFi score&body=Check out my Braindrop.fun Score! Use my referral link: ${referralLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center p-2 bg-[#030A0F] rounded-lg border border-[#1E2A32] hover:bg-[#0A1A22] transition-colors"
                        >
                          <Mail className="h-5 w-5 text-[#33FFB8]" />

                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setShowReferralModal(false)}
                    className="px-5 py-2 bg-[#030A0F] text-[#33FFB8] rounded-xl font-medium border border-[#33FFB8]/30 hover:bg-[#0A1A22] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* Leaderboard modal */}
        {
          isLeaderboardOpen && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-2 overflow-hidden">
              <div className="bg-[#030A0F] border-2 border-[#33FFB8] rounded-xl max-w-[90%] w-full shadow-[0_0_20px_rgba(51,255,184,0.2)]">
                <div className="flex items-center justify-between p-4 border-b border-[#1E2A32]">
                  <h2 className="text-xl font-bold text-white font-['Space_Grotesk'] ml-3">LEADERBOARD</h2>
                  <button
                    onClick={() => setIsLeaderboardOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-4 flex flex-col">
                  {/* Time filters */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex-1"></div>
                    <div className="flex flex-wrap bg-[#0A1217] rounded-lg overflow-hidden border border-[#1E2A32]">
                      {["24H", "48H", "7D", "30D", "ALL"].map((filter) => {
                        // Calculate user count for this filter
                        const now = new Date().getTime();
                        let cutoffTime;

                        switch (filter) {
                          case "24H": cutoffTime = now - (24 * 60 * 60 * 1000); break;
                          case "48H": cutoffTime = now - (48 * 60 * 60 * 1000); break;
                          case "7D": cutoffTime = now - (7 * 24 * 60 * 60 * 1000); break;
                          case "30D": cutoffTime = now - (30 * 24 * 60 * 60 * 1000); break;
                          case "ALL": cutoffTime = 0; break;
                          default: cutoffTime = now - (24 * 60 * 60 * 1000);
                        }

                        const count = filter === "ALL"
                          ? fetchedLeaderboardData.length
                          : fetchedLeaderboardData.filter(user => user.timestamp >= cutoffTime).length;

                        return (
                          <button
                            key={filter}
                            onClick={() => handleTimeFilterChange(filter)}
                            className={`${isSmallScreen ? 'px-2 py-1 text-[10px]' : 'px-4 py-2 text-xs'} font-bold ${filter === activeTimeFilter
                                ? 'bg-[#33FFB8] text-[#030A0F]'
                                : 'text-white/70 hover:bg-[#0A1A22]'
                              } transition-colors uppercase relative`}
                          >
                            <div className="flex flex-col items-center">
                              <span>{filter}</span>
                              {!isSmallScreen && filter !== "ALL" && <span className="text-[9px] mt-0.5 opacity-80">({count || 0})</span>}
                            </div>
                            {filter === activeTimeFilter && (
                              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#33FFB8]/80"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Leaderboard table - with responsiveness */}
                  <div className="overflow-visible">
                    {isSmallScreen ? (
                      // Simple 3-column layout for small screens
                      <table className="w-full">
                        <thead className="bg-[#030A0F] z-10">
                          <tr className="border-b border-[#1E2A32]">
                            <th className="py-2 px-2 text-left text-white text-xs font-medium w-[15%]">RANK</th>
                            <th className="py-2 px-2 text-left text-white text-xs font-medium w-[55%]">NAME</th>
                            <th className="py-2 px-2 text-right text-white text-xs font-medium w-[30%]">TOTAL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getCurrentPageData().map((user) => (
                            <tr
                              key={user.rank}
                              className={`border-b border-[#1E2A32]/30 hover:bg-[#0A1217] transition-colors ${user.isUser ? 'bg-[#33FFB8]/5' : ''}`}
                            >
                              <td className="py-2 px-2 text-white text-xs">{user.rank}</td>
                              <td className="py-2 px-2">
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-6 h-6 rounded-full ${user.isUser ? 'bg-[#0A1F1C] border border-[#33FFB8]' : 'bg-[#0A1217] border border-[#1E2A32]'} flex items-center justify-center text-white text-xs`}>
                                    {user.user.charAt(0)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className={`${user.isUser ? 'text-[#33FFB8]' : 'text-white'} font-bold text-xs truncate`}>{user.user}</div>
                                    <div className="text-white/70 text-[10px] flex items-center truncate">
                                      <Twitter className="h-2.5 w-2.5 mr-1 flex-shrink-0 text-[#00acee]" />
                                      <span className="truncate">{user.handle}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2 px-2 font-semibold text-xs">
                                <div className="flex items-center justify-between gap-1">
                                  {user.scoreChange !== 0 ? (
                                    <div className="flex items-center">
                                      {user.scoreChange > 0 ? (
                                        <div className="flex flex-col items-start bg-[#0A1F1C]/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md border border-green-400/20">
                                          <span className="text-green-400 text-[10px] flex items-center">
                                            <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" />
                                            +{user.scoreChange.toLocaleString()}
                                          </span>
                                          <span className="text-green-400/70 text-[8px]">
                                            +{user.scoreChangePercent}%
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="flex flex-col items-start bg-[#240A0A]/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md border border-red-400/20">
                                          <span className="text-red-400 text-[10px] flex items-center">
                                            <ArrowUpRight className="h-2.5 w-2.5 mr-0.5 transform rotate-90" />
                                            {user.scoreChange.toLocaleString()}
                                          </span>
                                          <span className="text-red-400/70 text-[8px]">
                                            {user.scoreChangePercent}%
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div></div>
                                  )}
                                  <span className="text-[#33FFB8]">{user.totalScore.toLocaleString()}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      // Full table for larger screens
                      <table className="w-full table-fixed">
                        <thead className="bg-[#030A0F] z-10">
                          <tr className="border-b border-[#1E2A32]">
                            <th className="py-4 px-5 text-left text-white text-sm font-medium w-[6%]">RANK</th>
                            <th className="py-4 px-5 text-left text-white text-sm font-medium w-[20%]">NAME</th>
                            <th className="py-4 px-5 text-left text-white text-sm font-medium w-[12%]">TELEGRAM</th>
                            <th className="py-4 px-5 text-left text-white text-sm font-medium w-[12%]">WALLET</th>
                            <th className="py-4 px-5 text-left text-white text-sm font-medium w-[12%]">TWITTER</th>

                            <th className="py-4 px-5 text-left text-white text-sm font-medium w-[14%]">TOTAL</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getCurrentPageData().map((user) => (
                            <tr
                              key={user.rank}
                              className={`border-b border-[#1E2A32]/30 hover:bg-[#0A1217] transition-colors ${user.isUser ? 'bg-[#33FFB8]/5' : ''}`}
                            >
                              <td className="py-4 px-5 text-white text-sm">{user.rank}</td>
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-full ${user.isUser ? 'bg-[#0A1F1C] border border-[#33FFB8]' : 'bg-[#0A1217] border border-[#1E2A32]'} flex items-center justify-center text-white text-sm`}>
                                    {user.user.charAt(0)}
                                  </div>
                                  <div>
                                    <div className={`${user.isUser ? 'text-[#33FFB8]' : 'text-white'} font-bold text-sm`}>{user.user}</div>
                                    <div className="text-white/70 text-xs flex items-center">
                                      <Twitter className="h-3 w-3 mr-1 text-[#00acee]" />
                                      {user.handle}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-5 text-white text-sm">{user.telegramScore.toLocaleString()}</td>
                              <td className="py-4 px-5 text-white text-sm">{user.walletScore.toLocaleString()}</td>
                              <td className="py-4 px-5 text-white text-sm">{user.twitterScore.toLocaleString()}</td>

                              <td className="py-4 px-5 font-semibold text-[#33FFB8] text-sm">
                                <div className="flex items-center gap-2">
                                  <span>{user.totalScore.toLocaleString()}</span>
                                  {user.scoreChange !== 0 && (
                                    <div className="flex items-center">
                                      {user.scoreChange > 0 ? (
                                        <div className="flex flex-col">
                                          <span className="text-green-400 text-xs flex items-center whitespace-nowrap">
                                            <ArrowUpRight className="h-3 w-3 mr-0.5" />
                                            +{user.scoreChange.toLocaleString()}
                                          </span>
                                          <span className="text-green-400/70 text-[10px]">
                                            +{user.scoreChangePercent}%
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="flex flex-col">
                                          <span className="text-red-400 text-xs flex items-center whitespace-nowrap">
                                            <ArrowUpRight className="h-3 w-3 mr-0.5 transform rotate-90" />
                                            {user.scoreChange.toLocaleString()}
                                          </span>
                                          <span className="text-red-400/70 text-[10px]">
                                            {user.scoreChangePercent}%
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* Pagination Controls - Improved layout */}
                  <div className="flex justify-center items-center mt-6 mb-4 gap-4">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center justify-center h-10 w-10 bg-[#0A1217] border border-[#1E2A32]/50 rounded-md 
                            disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#14212A] transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5 text-white" />
                    </button>

                    <div className="flex gap-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`h-10 w-10 rounded-md flex items-center justify-center font-medium transition-colors
                              ${currentPage === i + 1
                              ? 'bg-[#33FFB8] text-black'
                              : 'bg-[#0A1217] border border-[#1E2A32]/50 text-white hover:bg-[#14212A]'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center justify-center h-10 w-10 bg-[#0A1217] border border-[#1E2A32]/50 rounded-md 
                            disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#14212A] transition-colors"
                    >
                      <ArrowRight className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* Reset Confirmation Modal */}
        {showResetConfirmation && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#0F1923] border border-[#1A2C3D] rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-white mb-3">Refresh Your Score?</h3>
              <p className="text-white/70 mb-6">
                This will update your scores with the latest data from your connected accounts.
                You can only refresh scores once every 24 hours.
              </p>
              <div className="flex gap-3 justify-end">
                <CyberButton
                  onClick={() => setShowResetConfirmation(false)}
                  variant="secondary"
                >
                  Cancel
                </CyberButton>
                <CyberButton
                  onClick={performRefresh}
                  variant="accent"
                >
                  Refresh Scores
                </CyberButton>
              </div>
            </motion.div>
          </div>
        )}

        {/* Refresh Animation Popup */}
        {showRefreshAnimation && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#030A0F] border-2 border-[#33FFB8] rounded-xl p-6 max-w-md w-full shadow-[0_0_20px_rgba(51,255,184,0.2)]"
            >
              <h3 className="text-xl font-bold text-white mb-5 text-center flex items-center justify-center">
                <RefreshCw size={20} className="text-[#33FFB8] mr-2 animate-spin" />
                Refreshing Your Score
              </h3>

              <div className="mb-6">
                {refreshTasks.map((task, index) => (
                  <AnimatedCheckmark
                    key={index}
                    text={task.text}
                    completed={refreshTaskStatus[index]}
                    index={index}
                  />
                ))}
              </div>

              {refreshTaskStatus[3] && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex justify-center"
                >
                  <div className="bg-[#0A1F1C] border border-[#33FFB8]/30 rounded-xl p-4 text-center w-full shadow-[0_0_15px_rgba(51,255,184,0.15)]">
                    <p className="text-sm text-[#33FFB8]/80 mb-1 font-medium">SCORES UPDATED</p>
                    <ConnectionSlotMachineScore
                      value={totalScore}
                      className="text-2xl font-bold text-[#33FFB8]"
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </div >
    </PageTransition >
  );
};

export default ScorecardPage;