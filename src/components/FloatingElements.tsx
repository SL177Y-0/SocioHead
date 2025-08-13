import React, { useEffect } from 'react';
import { Twitter, MessageCircle, Wallet } from 'lucide-react';

type FloatingElement = {
  id: number;
  left: number;
  top: number;
  scale: number;
  opacity: number;
  delay: number;
  duration: number;
};

interface FloatingElementsProps {
  count?: number;
  type: 'tweets' | 'messages' | 'wallets';
  className?: string;
  positionStyle?: 'default' | 'scattered' | 'wide' | 'spaced';
}

// Updated tweet content with real tweets from tech and crypto leaders
const tweetContents = [
  { handle: "@VitalikButerin", text: "The internet of money should not cost more than 5 cents per transaction.", img: "/VitalikButerin.jpg" },
  { handle: "@elonmusk", text: "AI will be the best or worst thing ever for humanity.", img: "/elonmusk.jpg" },
  { handle: "@sama", text: "AGI will probably be the most important technological development in human history.", img: "/sama.jpg" },
  { handle: "@aeyakovenko", text: "Speed and scale are everything in blockchain.", img: "/aeyakovenko.jpg" },
  { handle: "@demishassabis", text: "Understanding intelligence is the greatest scientific challenge of our time.", img: "/demishassabis.jpg" },
  { handle: "@brian_armstrong", text: "Creating an open financial system for the world.", img: "/brian_armstrong.png" },
  { handle: "@gdb", text: "Building safe AGI that benefits all of humanity.", img: "/gdb.jpg" },
  { handle: "@balajis", text: "The internet is becoming the world's most important jurisdiction.", img: "/balajis.jpg" },
  { handle: "@AndrewYNg", text: "AI is the new electricity.", img: "/AndrewYNg.jpg" },
  { handle: "@gavofyork", text: "Web3: A decentralized and fair internet where users control their own data, identity, and destiny.", img: "/gavofyork.jpg" },
  { handle: "@BrendanEich", text: "The web needs a better business model.", img: "/BrendanEich.png" },
  { handle: "@jack", text: "Bitcoin changes everything... for the better.", img: "/jack.jpg" },
  { handle: "@cz_binance", text: "If you can't hold, you won't be rich.", img: "/cz_binance.jpg" },
  { handle: "@punk6529", text: "The metaverse is not a place, it's a moment in time.", img: "/punk6529.jpg" },
  { handle: "@cdixon", text: "The next big thing will start out looking like a toy.", img: "/cdixon.png" },
  { handle: "@pmarca", text: "Software is eating the world.", img: "/pmarca.jpg" },
  { handle: "@paulg", text: "Live in the future, then build what's missing.", img: "/paulg.jpg" },
  { handle: "@laurashin", text: "Unchained: Your no-hype resource for all things crypto.", img: "/laurashin.png" },
  { handle: "@tydanielsmith", text: "Web3 marketing is not about hype; it's about community.", img: "/TyDanielSmith.jpg" },
  { handle: "@ErikVoorhees", text: "Money is just a ledger. Bitcoin is the best ledger.", img: "/ErikVoorhees.jpg" }
];

// Updated message content with Web3 influencer content
const messageContents = [
  { name: "Vitalik Buterin", handle: "@VitalikButerin", text: "ETH gas fees? Never heard of them.", img: "/VitalikButerin.jpg" },
  { name: "Changpeng Zhao (CZ)", handle: "@cz_binance", text: "Centralization is the future.", img: "/cz_binance.jpg" },
  { name: "Justin Sun", handle: "@justinsuntron", text: "I promise, no announcement of an announcement today.", img: "/justinsuntron.jpg" },
  { name: "Charles Hoskinson", handle: "@IOHK_Charles", text: "Cardano's roadmap ends tomorrow.", img: "/IOHK_Charles.jpg" },
  { name: "Michael Saylor", handle: "@saylor", text: "Bitcoin is a bubble; sell while you can.", img: "/saylor.jpg" },
  { name: "Sam Bankman-Fried", handle: "@SBF_FTX", text: "Trust me, I'm fully solvent.", img: "/SBF_FTX.jpg" },
  { name: "Gary Gensler", handle: "@GaryGensler", text: "Crypto clarity is our top priority.", img: "/GaryGensler.jpg" },
  { name: "Elon Musk", handle: "@elonmusk", text: "DOGE has no utility; stop buying memes.", img: "/elonmusk.jpg" },
  { name: "Brian Armstrong", handle: "@brian_armstrong", text: "Decentralized exchanges are clearly superior.", img: "/brian_armstrong.png" },
  { name: "Arthur Hayes", handle: "@CryptoHayes", text: "Always use 100x leverage—it's risk-free.", img: "/CryptoHayes.jpg" },
  { name: "Jack Dorsey", handle: "@jack", text: "Bitcoin maximalism is overrated.", img: "/jack.jpg" },
  { name: "Gavin Wood", handle: "@gavofyork", text: "Honestly, we don't need another blockchain.", img: "/gavofyork.jpg" },
  { name: "Anatoly Yakovenko", handle: "@aeyakovenko", text: "We love downtime—it gives validators a nice break.", img: "/aeyakovenko.jpg" },
  { name: "Alex Mashinsky", handle: "@Mashinsky", text: "Not your keys, still your crypto.", img: "/Mashinsky.png" },
  { name: "Richard Heart", handle: "@RichardHeartWin", text: "HEX is a Ponzi.", img: "/RichrdHeartWin.jpg" },
  { name: "Do Kwon", handle: "@stablekwon", text: "Stablecoins should fluctuate wildly.", img: "/stablekwon.jpg" },
  { name: "Raoul Pal", handle: "@RaoulGMI", text: "Crypto cycles? Just astrology for tech bros.", img: "/RaoulGMI.jpg" },
  { name: "Kevin O'Leary", handle: "@kevinolearytv", text: "Diversification is dumb; go all-in on meme coins.", img: "/kevinolearytv.jpg" },
  { name: "Anthony Pompliano", handle: "@APompliano", text: "Bitcoin adoption is slowing down.", img: "/APompliano.jpg" },
  { name: "Roger Ver", handle: "@rogerkver", text: "Bitcoin Cash was actually a bad idea.", img: "/rogerkver.jpg" }
];

// Updated wallet addresses to include owner names
const walletAddresses = [
  { address: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045", owner: "Vitalik Buterin (Ethereum Co-founder)" },
  { address: "0x3ddfa8ec3052539b6c9549f12cea2c295cff5296", owner: "Justin Sun (TRON Founder)" },
  { address: "0xf5fb27b912d987b5b6e02a1b1be0c1f0740e2c6f", owner: "Stani Kulechov (Aave Founder)" },
  { address: "0xF977814e90dA44bFA03b6295A0616a897441aceC", owner: "Changpeng Zhao (Binance CEO)" },
  { address: "0xa679c6154b8d4619Af9F83f0bF9a13A680e01eCf", owner: "Mark Cuban (Entrepreneur and Investor)" },
  { address: "0x3C6aEFF92b4B35C2e1b196B57d0f8FFB56884A17", owner: "Gary Vaynerchuk (Entrepreneur and NFT Collector)" },
  { address: "0x5E575279bf9f4acf0A130c186861454247394C06", owner: "Balaji Srinivasan (Entrepreneur and Investor)" },
  { address: "0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13", owner: "Brian Armstrong (Coinbase CEO)" },
  { address: "0x7a250d5630b4cf539739df2c5dacb4c659f2488d", owner: "Charles Hoskinson (Cardano Founder)" },
  { address: "0x7386df2f93f5730e28e2f636e6e46d96fe5ded16", owner: "Sam Bankman-Fried (FTX Founder, Pre-Collapse)" },
  { address: "0x8a4f1b1e5e7b5e7f2e7e8b2e5e7b5e7f2e7e8b2e", owner: "Tyler Winklevoss (Gemini Co-Founder)" },
  { address: "0x5b1b68f6a4414642bc613f67877a82e101fe173c", owner: "Erik Voorhees (ShapeShift Founder)" }
];

// Helper function to get position based on style
const getPositions = (count: number, style: string = 'default', type: string = '') => {
  const elements: FloatingElement[] = [];
  
  for (let i = 0; i < count; i++) {
    let left: number;
    let top: number;
    
    // Different position strategies
    switch (style) {
      case 'scattered':
        // More randomized distribution
        left = 5 + Math.random() * 90; // 5% to 95%
        top = 5 + Math.random() * 90;  // 5% to 95%
        break;
      case 'wide':
        // Spread elements across the width, but clustered vertically
        left = (i * (100 / count)) + (Math.random() * 15 - 7.5);
        top = 20 + Math.random() * 60;
        break;
      case 'spaced':
        // Special handling for wallet type to fill top and middle, leaving bottom empty
        if (type === 'wallets') {
          const cols = Math.ceil(Math.sqrt(count));
          const rows = Math.ceil(count / cols);
          const col = i % cols;
          const row = Math.floor(i / cols);
          left = 5 + (col * (90 / (cols - 1 || 1))) + (Math.random() * 10 - 5);
          
          // Position wallets in top 70% of the screen
          top = 5 + (row * (60 / (rows - 1 || 1))) + (Math.random() * 10 - 5);
        } else {
          // Well-distributed grid-like layout for other types
          const cols = Math.ceil(Math.sqrt(count));
          const rows = Math.ceil(count / cols);
          const col = i % cols;
          const row = Math.floor(i / cols);
          left = 5 + (col * (90 / (cols - 1 || 1))) + (Math.random() * 10 - 5);
          top = 5 + (row * (90 / (rows - 1 || 1))) + (Math.random() * 10 - 5);
        }
        break;
      default:
        // Default positioning (similar to original)
        left = Math.random() * 100;
        top = Math.random() * 100;
    }
    
    // Ensure positions are within bounds (0-100%)
    left = Math.max(0, Math.min(100, left));
    top = Math.max(0, Math.min(100, top));
    
    elements.push({
      id: i,
      left,
      top,
      scale: 0.1 + Math.random() * 0.2, // Slightly reduced scale for less clutter
      opacity: 0.2 + Math.random() * 0.3, // Increased opacity range for better visibility
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 6,
    });
  }
  
  return elements;
};

const FloatingElements = ({ count = 15, type, className = '', positionStyle = 'default' }: FloatingElementsProps) => {
  const [elements, setElements] = React.useState<FloatingElement[]>([]);

  useEffect(() => {
    // Generate elements with positions based on the selected style
    const generatedElements = getPositions(count, positionStyle, type);
    setElements(generatedElements);
  }, [count, positionStyle, type]);
  
  // Helper function to get unique random content
  const getUniqueContent = (contentArray: any[], totalNeeded: number) => {
    // Create a copy of the content array to avoid modifying the original
    const availableContent = [...contentArray];
    
    // If requested count exceeds available items, return all items
    if (totalNeeded >= availableContent.length) {
      return availableContent;
    }
    
    // Select unique random items
    const selectedContent = [];
    for (let i = 0; i < totalNeeded; i++) {
      const randomIndex = Math.floor(Math.random() * availableContent.length);
      selectedContent.push(availableContent[randomIndex]);
      availableContent.splice(randomIndex, 1); // Remove selected item to avoid repetition
    }
    
    return selectedContent;
  };
  
  // Generate unique content for all elements
  const getContentForElements = (elementType: string, elementCount: number) => {
    switch (elementType) {
      case 'tweets':
        return getUniqueContent(tweetContents, elementCount);
      case 'messages':
        return getUniqueContent(messageContents, elementCount);
      case 'wallets':
        // Allow wallets to repeat rather than showing only unique ones
        return Array(elementCount).fill(null).map(() => 
          walletAddresses[Math.floor(Math.random() * walletAddresses.length)]
        );
      default:
        return [];
    }
  };
  
  // Get content for each element
  const [contentItems, setContentItems] = React.useState<any[]>([]);
  
  useEffect(() => {
    const items = getContentForElements(type, elements.length);
    setContentItems(items);
  }, [elements, type]);
  
  const renderContent = (elementType: string, elementId: number) => {
    // Use pre-selected content rather than random selection
    const contentItem = contentItems[elementId];
    if (!contentItem) return null;
    
    switch (elementType) {
      case 'tweets':
        return (
          <div className="w-48 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col space-y-2 shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <img src={contentItem.img} alt={contentItem.handle} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-white/90 font-medium">{contentItem.handle}</div>
                <div className="flex items-center">
                  <Twitter size={10} className="text-blue-400 mr-1" />
                  <span className="text-[10px] text-white/50">Twitter</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-white/70 font-medium line-clamp-2 text-left">
              {contentItem.text}
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="w-64 backdrop-blur-sm bg-[#1E2D3A]/80 border border-[#0088CC]/30 rounded-xl p-3 flex flex-col space-y-2 shadow-md">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-[#0088CC]/40">
                <img src={contentItem.img} alt={contentItem.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-white font-medium">{contentItem.name}</div>
                <div className="flex items-center">
                  <MessageCircle size={10} className="text-[#0088CC] mr-1" />
                  <span className="text-[10px] text-[#0088CC]/80">{contentItem.handle}</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-white/90 font-medium line-clamp-2 text-left bg-[#0088CC]/10 p-2 rounded">
              {contentItem.text}
            </div>
          </div>
        );
      case 'wallets':
        return (
          <div className="max-w-[220px] backdrop-blur-sm bg-white/5 border border-white/10 rounded-md text-xs text-white/60 truncate font-mono shadow-sm">
            <div className="px-3 py-2 flex items-center space-x-2">
              <Wallet size={12} className="text-degen-glow flex-shrink-0" />
              <span>{contentItem.address}</span>
            </div>
            <div className="border-t border-white/5 px-3 py-1 text-[10px] text-white/40">
              {contentItem.owner}
            </div>
          </div>
        );
      default:
        return <div className="w-8 h-8 glass rounded-full"></div>;
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {elements.map((element, index) => (
        <div
          key={element.id}
          className="absolute animate-float"
          style={{
            left: `${element.left}%`,
            top: `${element.top}%`,
            transform: `scale(${element.scale})`,
            opacity: element.opacity,
            animationDelay: `${element.delay}s`,
            animationDuration: `${element.duration}s`
          }}
        >
          {contentItems.length > 0 && renderContent(type, index)}
        </div>
      ))}
    </div>
  );
};

export default FloatingElements;
