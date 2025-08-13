import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Twitter, Download, Copy, Check, X, Trophy, MessageSquare, Wallet, Star, Share2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import html2canvas from 'html2canvas';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
  score?: string;
  title?: string;
  rank?: string;
  level?: string;
  imageUrl?: string;
  isGenerating?: boolean;
  isLoading?: boolean;
  twitterScore?: number;
  telegramScore?: number;
  walletScore?: number;
  twitterHandle?: string;
  userBadges?: Array<{
    id: string;
    label: string;
    description: string;
    path: string;
  }>;
  telegramHandle?: string;
  // New properties for referrals
  referredBy?: {
    username?: string;
    privyId?: string;
    totalScore?: number;
  } | null;
  referredTo?: Array<{
    username?: string;
    privyId?: string;
    totalScore?: number;
  }>;
}

export function ShareModal({
  isOpen,
  onClose,
  username = "0xSolidity.eth",
  score = "1,035",
  rank = "42",
  level = "18",
  imageUrl,
  isGenerating = false,
  isLoading = false,
  twitterScore = 0,
  telegramScore = 0,
  walletScore = 0,
  title = "",
  twitterHandle = '',
  userBadges = [],
  telegramHandle = '',
  referredBy = null,
  referredTo = []
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState("");
  const [scoreCardFlipped, setScoreCardFlipped] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [showFlipHint, setShowFlipHint] = useState(false);
  const [gradientAngle, setGradientAngle] = useState(135);
  const [gradientIntensity, setGradientIntensity] = useState(0.5);
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const referralInfo = {
    referredBy,
    referredTo
  };

  // Use isLoading or isGenerating (for backwards compatibility)
  const isProcessing = isLoading || isGenerating;

  // Inspirational quotes
  const inspirationalQuotes = [
    "Innovation distinguishes between a leader and a follower.",
  ];
  const [currentQuote, setCurrentQuote] = useState(inspirationalQuotes[0]);

  // Mock data


  const currentUser = {
    name: username,
    handle: twitterHandle || `@${username.toLowerCase().replace('.eth', '')}`,
    rank: rank,
    twitterScore: twitterScore.toLocaleString(),
    telegramScore: telegramScore.toLocaleString(),
    walletScore: walletScore.toLocaleString(),
    Title: title,
    userBadges: userBadges,
    totalScore: score,
    profileImage: imageUrl,
    topPercentage: "8.7%"
  };

  // Generate random quote when card is flipped
  useEffect(() => {
    if (scoreCardFlipped) {
      const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
      setCurrentQuote(inspirationalQuotes[randomIndex]);
    }
  }, [scoreCardFlipped, inspirationalQuotes]);

  // Reset download status after 2 seconds
  useEffect(() => {
    if (downloadStatus) {
      const timer = setTimeout(() => {
        setDownloadStatus("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [downloadStatus]);

  // Animate gradient effect
  useEffect(() => {
    let animationFrameId: number;

    const animateGradient = () => {
      // Animate gradient angle
      setGradientAngle((prev) => (prev + 0.2) % 360);

      // Animate gradient intensity
      setGradientIntensity((prev) => {
        const newValue = prev + 0.005;
        return newValue > 0.8 ? 0.5 : newValue;
      });

      animationFrameId = requestAnimationFrame(animateGradient);
    };

    if (isHovering) {
      animationFrameId = requestAnimationFrame(animateGradient);
    } else {
      // Reset to default values when not hovering
      setGradientAngle(135);
      setGradientIntensity(0.5);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isHovering]);

  const shareToTwitter = () => {
    try {
      const text = `Check out my Braindrop.fun -${score}! AND Rank #${rank} \n if you want to join click on this link-`;
      const hashtags = 'DeFi,Web3,Crypto';
      const url = `https://braindrop.fun/${currentUser.name}\n`; // Should be updated to your actual site URL

      // Construct Twitter share URL with all parameters
      const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`;

      // Open in a new window
      window.open(twitterShareUrl, '_blank', 'width=550,height=420');

      toast({
        title: "Sharing to Twitter",
        description: "A Twitter window has opened to share your score.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
      toast({
        title: "Failed to share to Twitter",
        description: "Please try another sharing method.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const downloadImage = async () => {
    try {
      setDownloadStatus("downloading");

      // Always use the front card ref, regardless of which side is showing
      const cardRef = frontCardRef;

      if (cardRef.current) {
        // Wait a moment to ensure any state updates are reflected in the DOM
        await new Promise(resolve => setTimeout(resolve, 100));

        // Get original card dimensions to maintain the aspect ratio
        const originalCard = cardRef.current.querySelector('.relative.rounded-2xl');
        const originalRect = originalCard ? originalCard.getBoundingClientRect() : { width: 500, height: 350 };
        const aspectRatio = originalRect.height / originalRect.width;
        const cardWidth = 500; // Fixed card width
        const cardHeight = Math.round(cardWidth * aspectRatio);

        // Create a wrapper div with the exact styling we want in the screenshot
        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.top = '-9999px';
        wrapper.style.left = '-9999px';
        wrapper.style.width = `${cardWidth}px`;
        wrapper.style.height = `${cardHeight}px`;
        wrapper.style.padding = '0';
        wrapper.style.backgroundColor = '#011013'; // Exact dark background from modal
        wrapper.style.borderRadius = '16px';
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        wrapper.style.border = '2px solid rgba(51, 255, 184, 0.4)';
        wrapper.style.boxShadow = '0 0 15px rgba(51, 255, 184, 0.2)';
        wrapper.style.overflow = 'hidden';

        // Clone the card content
        const cardContent = cardRef.current.cloneNode(true) as HTMLElement;

        // Find the actual card element (the div with the gradient background)
        const actualCard = cardContent.querySelector('div.relative.rounded-2xl');
        if (actualCard) {
          // Make sure we get the full card with proper styling
          (actualCard as HTMLElement).style.position = 'relative';
          (actualCard as HTMLElement).style.transform = 'none';
          (actualCard as HTMLElement).style.backfaceVisibility = 'visible';
          (actualCard as HTMLElement).style.webkitBackfaceVisibility = 'visible';
          (actualCard as HTMLElement).style.boxShadow = 'none';
          (actualCard as HTMLElement).style.borderRadius = '16px';
          (actualCard as HTMLElement).style.width = '100%';
          (actualCard as HTMLElement).style.height = '100%';

          // Ensure we use dark theme styling 
          const mainContentDiv = actualCard.querySelector('div.relative.p-5');
          if (mainContentDiv) {
            (mainContentDiv as HTMLElement).style.background = '#011013'; // Dark background
            (mainContentDiv as HTMLElement).style.backgroundImage = 'none'; // Remove any gradient
            (mainContentDiv as HTMLElement).style.padding = '24px'; // Ensure consistent padding

            // Ensure all panels have dark backgrounds with proper opacity
            const panels = actualCard.querySelectorAll('.bg-\\[\\#0A1217\\]\\/80');
            panels.forEach((panel) => {
              (panel as HTMLElement).style.backgroundColor = 'rgba(10, 18, 23, 1)'; // Solid dark panel background
              (panel as HTMLElement).style.border = '1px solid #1E2A32'; // Keep border visible
            });

            // Ensure text colors are properly set
            const tealText = actualCard.querySelectorAll('.text-\\[\\#33FFB8\\]');
            tealText.forEach((el) => {
              (el as HTMLElement).style.color = '#33FFB8'; // Ensure teal text
            });

            // Make sure headings and score values stand out properly
            const whiteText = actualCard.querySelectorAll('.text-white, .font-bold');
            whiteText.forEach((el) => {
              (el as HTMLElement).style.color = '#FFFFFF'; // Bright white text
            });
          }

          // Remove hover effects and shine overlays for cleaner image
          const shineEffects = actualCard.querySelectorAll('.absolute.inset-0.z-10, .absolute.inset-0.rounded-2xl');
          shineEffects.forEach((effect) => {
            (effect as HTMLElement).style.opacity = '0';
          });

          // Remove flip hint if it exists
          const flipHint = actualCard.querySelector('div.absolute.bottom-2.right-2');
          if (flipHint) {
            (flipHint as HTMLElement).style.display = 'none';
          }

          // Add the content to the wrapper
          wrapper.appendChild(actualCard);
          document.body.appendChild(wrapper);

          // Capture the card with exact dimensions
          const canvas = await html2canvas(wrapper, {
            backgroundColor: '#011013', // Match the card background
            width: cardWidth,
            height: cardHeight,
            scale: 2, // Higher quality
            logging: false,
            allowTaint: true,
            useCORS: true,
          });

          // Clean up DOM
          document.body.removeChild(wrapper);

          // Create a temporary link to trigger download
          const link = document.createElement("a");
          const cleanUsername = username.replace(/[^a-zA-Z0-9]/g, "").substring(0, 10);
          link.download = `defi-scorecard.png`;

          // Convert canvas to blob to avoid data URL size limitations
          canvas.toBlob((blob) => {
            if (!blob) {
              throw new Error("Failed to create image blob");
            }

            // Create a URL for the blob
            const url = URL.createObjectURL(blob);
            link.href = url;

            // Append to body, click, and clean up
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Release the URL object
            setTimeout(() => URL.revokeObjectURL(url), 100);

            setDownloadStatus("downloaded");

            toast({
              title: "Score card downloaded",
              description: "Your score card has been saved to your device.",
              duration: 3000,
            });
          }, 'image/png', 1.0); // 100% quality for better image
        } else {
          throw new Error("Could not find card content");
        }
      }
    } catch (err) {
      console.error("Error downloading image:", err);
      setDownloadStatus("error");

      toast({
        title: "Failed to download",
        description: "Please try copying the image instead.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      // Get the current active card ref
      const activeCardRef = scoreCardFlipped ? backCardRef : frontCardRef;

      if (activeCardRef.current) {
        setCopied(true);

        // Capture the current card to ensure it's the latest
        const canvas = await html2canvas(activeCardRef.current, {
          backgroundColor: null,
          scale: 2, // Higher quality
          logging: false,
          allowTaint: true,
          useCORS: true,
        });

        // Convert to blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create image blob"));
          }, 'image/png', 0.9);
        });

        // For modern browsers - write directly to clipboard
        if (navigator.clipboard && navigator.clipboard.write) {
          await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob
            })
          ]);
        } else {
          // Fallback for older browsers
          const data = canvas.toDataURL('image/png');
          const textArea = document.createElement("textarea");
          textArea.value = data;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }

        toast({
          title: "Copied to clipboard",
          description: "Your score card has been copied and is ready to paste.",
          duration: 3000,
        });

        setTimeout(() => setCopied(false), 2000);
      } else if (imageUrl) {
        // Fallback to old method
        const blob = await fetch(imageUrl).then(r => r.blob());
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);

        setCopied(true);
        toast({
          title: "Copied to clipboard",
          description: "Your score card has been copied and is ready to paste.",
          duration: 3000,
        });

        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy image:', err);
      toast({
        title: "Failed to copy",
        description: "Please try downloading the image instead.",
        variant: "destructive",
        duration: 3000,
      });
      setCopied(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const ref = scoreCardFlipped ? backCardRef.current : frontCardRef.current;
    if (!ref) return;

    const rect = ref.getBoundingClientRect();

    // Only handle events within the card area, not the button area
    if (e.clientY > rect.bottom - 40) return;

    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    setMousePosition({ x, y });
    setIsHovering(true);
    setShowFlipHint(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
    setTimeout(() => {
      setShowFlipHint(false);
    }, 300);
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const ref = scoreCardFlipped ? backCardRef.current : frontCardRef.current;
    if (!ref) return;

    const rect = ref.getBoundingClientRect();

    // Don't flip the card if clicked near the bottom where buttons are
    if (e.clientY > rect.bottom - 40) return;

    setScoreCardFlipped(!scoreCardFlipped);
  };

  // Styling for the card
  const getCardStyle = () => {
    return {
      background: "linear-gradient(140deg, #030A0F, #0A1217, #030A0F)",
      border: "2px solid rgba(51, 255, 184, 0.4)", // Thicker, more visible border
      transform: isHovering
        ? `scaleX(1.001) scaleY(1.001) rotateX(${-mousePosition.y * 3}deg) rotateY(${mousePosition.x * 3}deg)`
        : "scaleX(1) scaleY(1) rotateX(0deg) rotateY(0deg)",
      borderRadius: "1.2rem",
      overflow: "hidden",
      transition: ".5s ease",
      boxShadow: isHovering ? "0 10px 30px rgba(3, 10, 15, 0.8), 0 0 15px rgba(51, 255, 184, 0.3)" : "0 5px 15px rgba(3, 10, 15, 0.4)",
    }
  };

  const getGradientStyle = () => {
    const baseColor1 = "rgba(3, 10, 15, 0.95)";
    const baseColor2 = "rgba(10, 18, 23, 0.9)";
    const accentColor = `rgba(15, 30, 25, ${gradientIntensity})`;

    return {
      backgroundImage: `linear-gradient(${gradientAngle}deg, ${baseColor1}, ${baseColor2}, ${accentColor})`,
      backgroundSize: "200% 200%",
      transition: "all 0.5s ease-out",
      backdropFilter: "blur(8px)",
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl glass-panel border-2 border-[#33FFB8] bg-[#030A0F] p-0 shadow-[0_0_20px_rgba(51,255,184,0.2)]">
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors bg-black/40 rounded-full p-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 flex flex-col pb-6" style={{ minHeight: "480px" }}>
          {isProcessing ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-t-[#33FFB8] border-[#1E2A32] rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/70">Generating your score card...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Card container with fixed height */}
              <div className="flex-1" style={{ minHeight: "400px", maxHeight: "420px" }}>
                {/* 3D Card Container */}
                <div className="perspective-[2000px] w-full h-full relative overflow-hidden">
                  <div
                    className="relative w-full h-full transition-transform duration-700"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: scoreCardFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                      transformOrigin: "center center",
                      height: "calc(100% - 30px)" // Make space for buttons
                    }}
                  >
                    {/* Front of the card */}
                    <div
                      ref={frontCardRef}
                      className="w-full h-full"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        zIndex: scoreCardFlipped ? 0 : 1,
                        transform: "translateZ(0.1px)",
                      }}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Modern card design with reflection effect */}
                      <div
                        className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                        style={{
                          ...getCardStyle(),
                          transformStyle: "preserve-3d",
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                        }}
                        onClick={handleCardClick}
                      >
                        {/* Shine effect overlay */}
                        <div
                          className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-2xl"
                          style={{
                            opacity: isHovering ? 1 : 0,
                            transition: "opacity 0.3s ease-out",
                          }}
                        >
                          <div
                            className="absolute -inset-[200%] pointer-events-none"
                            style={{
                              background: "linear-gradient(80deg, transparent 20%, rgba(255, 255, 255, 0.1) 35%, rgba(255, 255, 255, 0.15) 40%, rgba(255, 255, 255, 0.05) 45%, transparent 70%)",
                              transform: isHovering ? "translateX(120%)" : "translateX(-120%)",
                              transition: "transform 1.2s ease-in-out",
                            }}
                          ></div>
                        </div>

                        {/* Black reflection effect on hover */}
                        <div
                          className="absolute inset-0 rounded-2xl pointer-events-none"
                          style={{
                            background: isHovering
                              ? "linear-gradient(135deg, transparent, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.5) 100%)"
                              : "transparent",
                            opacity: isHovering ? 1 : 0,
                            transition: "opacity 0.5s ease",
                          }}
                        ></div>

                        {/* Card background with pseudo element for reflection */}
                        <div className="relative p-5" style={getGradientStyle()}>
                          {/* Border glow effect */}
                          <div
                            className="absolute inset-0 rounded-2xl pointer-events-none"
                            style={{
                              border: "1px solid rgba(51, 255, 184, 0.5)",
                              boxShadow: "inset 0 0 10px rgba(51, 255, 184, 0.3)",
                            }}
                          ></div>

                          {/* Subtle flip hint notification */}
                          {showFlipHint && (
                            <div
                              className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm text-[10px] text-white/70 px-2 py-1 rounded-full"
                              style={{
                                opacity: showFlipHint ? "0.8" : "0",
                                transition: "opacity 0.3s ease",
                              }}
                            >
                              Click to flip
                            </div>
                          )}

                          {/* Header area */}
                          <div className="relative flex justify-between items-center mb-4">
                            <div className="text-sm font-bold text-[#33FFB8]">
                              BrainDrop Score
                            </div>
                          </div>

                          {/* User info row */}
                          <div className="flex items-center mb-4">
                            <div className="h-12 w-12 bg-[#0A1217] rounded-full flex items-center justify-center border border-[#1E2A32] overflow-hidden">
                              {currentUser.profileImage ? (
                                <img
                                  src={currentUser.profileImage}
                                  alt={`${currentUser.name}'s profile`}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-lg font-bold text-[#33FFB8]">
                                  {currentUser.name?.charAt(0) || ''}
                                </span>
                              )}
                            </div>
                            <div className="ml-3">
                              <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
                              <div className="flex items-center">
                                <span className="text-sm text-[#33FFB8]">{currentUser.handle}</span>
                                <span className="mx-2 text-white/50">•</span>
                                <span className="text-xs uppercase text-white">{title}</span>
                              </div>
                              <div className="text-xs text-[#33FFB8] mt-0.5">Rank#{rank}</div>
                            </div>
                          </div>

                          {/* Two column layout */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {/* Left column - Score Summary */}
                            <div className="bg-[#0A1217]/80 rounded-xl p-3 border border-[#1E2A32]">
                              <h4 className="text-sm font-medium mb-1 text-white">Score Summary</h4>
                              <div className="flex items-center mb-1.5">
                                <Trophy className="h-4 w-4 text-[#33FFB8] mr-2" />
                                <span className="text-xl font-bold text-white">{currentUser.totalScore}</span>
                                <span className="ml-auto text-xs text-[#33FFB8]/90">Total Score</span>
                              </div>
                              <div className="h-px w-full bg-[#1E2A32] my-1.5"></div>
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <Twitter className="h-3 w-3 text-[#33FFB8] mr-1" />
                                    <span className="text-xs text-white/70">Twitter Score:</span>
                                  </div>
                                  <span className="text-xs font-bold text-white">{currentUser.twitterScore}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <MessageSquare className="h-3 w-3 text-[#33FFB8] mr-1" />
                                    <span className="text-xs text-white/70">Telegram Score:</span>
                                  </div>
                                  <span className="text-xs font-bold text-white">{currentUser.telegramScore}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <Wallet className="h-3 w-3 text-[#33FFB8] mr-1" />
                                    <span className="text-xs text-white/70">Wallet Score:</span>
                                  </div>
                                  <span className="text-xs font-bold text-white">{currentUser.walletScore}</span>
                                </div>
                              </div>
                            </div>

                            {/* Right column - Badge Collection & Network Influence */}
                            <div className="space-y-3">
                              {/* Badge Collection */}
                              <div className="bg-[#0A1217]/80 rounded-xl p-3 border border-[#1E2A32]">
                                <h4 className="text-sm font-medium mb-1 text-white">Badge Collection</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <span className="text-white/70">Total Badges:</span>
                                      <span className="font-bold text-white">{userBadges.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-white/70">Latest Badge:</span>
                                      <span className="font-bold text-[#33FFB8]">{userBadges.length > 0 ? userBadges[userBadges.length - 1].label : "None"}</span>
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    {userBadges.slice(0, 2).map((badge) => (
                                      <div
                                        key={badge.id}
                                        className="bg-[#030A0F] rounded-full border border-[#33FFB8]/30 flex items-center justify-center overflow-hidden"
                                        style={{
                                          width: "28px",
                                          height: "28px",
                                        }}
                                      >
                                        <img
                                          src={`/${badge.path}`}
                                          alt={badge.label}
                                          className="h-5 w-5 object-contain"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Network Influence */}
                              {/* Network Influence */}
                              <div className="bg-[#0A1217]/80 rounded-xl p-3 border border-[#1E2A32]">
                                <h4 className="text-sm font-medium mb-1 text-white">Network Influence</h4>
                                <div className="space-y-1.5 text-xs">
                                  {referredBy ? (
                                    <div className="flex justify-between items-center">
                                      <span className="text-white/70">Referred By:</span>
                                      <span className="font-bold text-[#33FFB8]">{referredBy.username || 'User'}</span>
                                    </div>
                                  ) : (
                                    <div className="flex justify-between items-center">
                                      <span className="text-white/70">Referred By:</span>
                                      <span className="font-bold text-white/50">None</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between items-center">
                                    <span className="text-white/70">Referrals:</span>
                                    <span className="font-bold text-white">{referredTo?.length || 0}</span>
                                  </div>
                                  {referredTo && referredTo.length > 0 && (
                                    <div className="border-t border-[#1E2A32]/50 pt-1 mt-1">
                                      <div className="flex items-center gap-1 justify-end">
                                        {referredTo.slice(0, 2).map((user, idx) => (
                                          <div key={idx} className="w-4 h-4 rounded-full bg-[#0A1F1C] border border-[#33FFB8]/30 flex items-center justify-center text-white text-[8px]">
                                            {user.username?.charAt(0).toUpperCase() || '?'}
                                          </div>
                                        ))}
                                        {referredTo.length > 2 && (
                                          <div className="w-4 h-4 rounded-full bg-[#0A1F1C] border border-[#33FFB8]/30 flex items-center justify-center text-white text-[8px]">
                                            +{referredTo.length - 2}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Back of the card (Inspirational Quote) */}
                    <div
                      ref={backCardRef}
                      className="w-full h-full"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        transform: "rotateY(180deg) translateZ(0.1px)",
                        zIndex: scoreCardFlipped ? 1 : 0,
                      }}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Modern card design with reflection effect */}
                      <div
                        className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                        style={{
                          ...getCardStyle(),
                          transformStyle: "preserve-3d",
                          backfaceVisibility: "hidden",
                          WebkitBackfaceVisibility: "hidden",
                        }}
                        onClick={handleCardClick}
                      >
                        {/* Shine effect overlay */}
                        <div
                          className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-2xl"
                          style={{
                            opacity: isHovering ? 1 : 0,
                            transition: "opacity 0.3s ease-out",
                          }}
                        >
                          <div
                            className="absolute -inset-[200%] pointer-events-none"
                            style={{
                              background: "linear-gradient(80deg, transparent 20%, rgba(255, 255, 255, 0.1) 35%, rgba(255, 255, 255, 0.15) 40%, rgba(255, 255, 255, 0.05) 45%, transparent 70%)",
                              transform: isHovering ? "translateX(120%)" : "translateX(-120%)",
                              transition: "transform 1.2s ease-in-out",
                            }}
                          ></div>
                        </div>

                        {/* Black reflection effect on hover */}
                        <div
                          className="absolute inset-0 rounded-2xl pointer-events-none"
                          style={{
                            background: isHovering
                              ? "linear-gradient(135deg, transparent, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.5) 100%)"
                              : "transparent",
                            opacity: isHovering ? 1 : 0,
                            transition: "opacity 0.5s ease",
                          }}
                        ></div>

                        {/* Card background with pseudo element for reflection */}
                        <div className="relative p-5 h-full" style={{ ...getGradientStyle(), background: '#011013' }}>
                          {/* Border glow effect */}
                          <div
                            className="absolute inset-0 rounded-2xl pointer-events-none"
                            style={{
                              border: "1px solid rgba(51, 255, 184, 0.5)",
                              boxShadow: "inset 0 0 10px rgba(51, 255, 184, 0.3)",
                            }}
                          ></div>

                          {/* Subtle flip hint notification */}
                          {showFlipHint && (
                            <div
                              className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm text-[10px] text-white/70 px-2 py-1 rounded-full"
                              style={{
                                opacity: showFlipHint ? "0.8" : "0",
                                transition: "opacity 0.3s ease",
                              }}
                            >
                              Click to flip
                            </div>
                          )}

                          {/* Main content area */}
                          <div className="flex flex-col items-center justify-center h-full py-8">


                            <div className="w-14 h-14 mb-4">
                              <Star className="text-[#33FFB8] w-full h-full"
                                style={{
                                  filter: "drop-shadow(0 0 8px rgba(51, 255, 184, 0.6))",
                                }}
                              />
                            </div>

                            <h3 className="text-xl font-bold text-center mb-4 text-white">Daily Inspiration</h3>

                            {/* Quote container with border styling */}
                            <div className="bg-[#0A1217]/40 rounded-xl p-4 mb-4 w-[85%] border border-[#1E2A32]/50">
                              <p className="text-sm text-center mx-auto leading-relaxed text-[#33FFB8]/80">
                                "{currentQuote}"
                              </p>
                            </div>

                            <div className="flex justify-center gap-2 mt-2">
                            </div>


                          </div>

                          {/* Footer area */}
                          <div className="flex items-center absolute bottom-5 left-5">
                            <Star className="h-3.5 w-3.5 text-[#33FFB8] mr-1" />
                            <span className="text-xs text-[#33FFB8]">braindrop.fun</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Much larger negative margin to remove space */}
              <div className="grid grid-cols-2 gap-2 -mt-8 relative z-20">
                <button
                  className="bg-[#030A0F] hover:bg-[#0A1217] text-[#33FFB8] px-3 py-1 rounded-lg flex items-center justify-center transition-colors border border-[#33FFB8]/30 text-xs font-medium"
                  onClick={shareToTwitter}
                >
                  <Twitter className="h-3.5 w-3.5 mr-1.5" />
                  Share on Twitter
                </button>
                <button
                  className="bg-[#030A0F] hover:bg-[#0A1217] text-[#33FFB8] px-3 py-1 rounded-lg flex items-center justify-center transition-colors border border-[#33FFB8]/30 text-xs font-medium"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                  {copied ? "Copied!" : "Copy Image"}
                </button>
                <button
                  className="bg-[#030A0F] hover:bg-[#0A1217] text-[#33FFB8] px-3 py-1 rounded-lg flex items-center justify-center transition-colors border border-[#33FFB8]/30 text-xs font-medium"
                  onClick={async () => {
                    try {
                      // Check if Web Share API is available
                      if (navigator.share) {
                        // Try to get a blob from the current card
                        const activeCardRef = scoreCardFlipped ? backCardRef : frontCardRef;
                        let shareData: any = {
                          title: `DeFi Score - Rank #${rank}`,
                          text: `Check out my braindrop.fun Score of ${score}! Rank #${rank} - Level ${level}\nTo Join braindrop.fun Click on this Link https://braindrop.fun/?ref=${currentUser.name}`,
                          url: `https://braindrop.fun/?ref=${currentUser.name}` // Updated with referral link
                        };

                        // If we can get an image, include it
                        if (activeCardRef.current) {
                          try {
                            const canvas = await html2canvas(activeCardRef.current, {
                              backgroundColor: null,
                              scale: 2,
                              logging: false,
                              allowTaint: true,
                              useCORS: true,
                            });

                            const blob = await new Promise<Blob>((resolve, reject) => {
                              canvas.toBlob((blob) => {
                                if (blob) resolve(blob);
                                else reject(new Error("Failed to create image blob"));
                              }, 'image/png', 0.9);
                            });

                            // Include the image file in share data
                            const file = new File([blob], 'defi-score.png', { type: 'image/png' });
                            shareData = {
                              ...shareData,
                              files: [file]
                            };
                          } catch (err) {
                            console.warn('Failed to include image in share:', err);
                            // Continue without image
                          }
                        }

                        await navigator.share(shareData);

                        toast({
                          title: "Shared successfully",
                          description: "Your score has been shared.",
                          duration: 3000,
                        });
                      } else {
                        // Fallback for browsers without Web Share API
                        toast({
                          title: "Share options",
                          description: "Try using Twitter share or copy the image instead.",
                          duration: 3000,
                        });
                      }
                    } catch (error) {
                      console.error('Error sharing:', error);
                      toast({
                        title: "Sharing cancelled or failed",
                        description: "Please try another sharing method.",
                        duration: 3000,
                      });
                    }
                  }}
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5" />
                  Share
                </button>
                <button
                  className="bg-[#030A0F] hover:bg-[#0A1217] text-[#33FFB8] px-3 py-1 rounded-lg flex items-center justify-center transition-colors border border-[#33FFB8]/30 text-xs font-medium"
                  onClick={downloadImage}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  {downloadStatus === "downloaded" ? "Downloaded!" :
                    downloadStatus === "downloading" ? "Downloading..." :
                      downloadStatus === "error" ? "Download Failed" :
                        "Download Score Card"}
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
