import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';
import axios from 'axios';

// Define types
type ReferralContextType = {
  referralCode: string | null;
  referredBy: string | null;
  referralLink: string;
  isReferralApplied: boolean;
  applyReferralCode: (code: string) => Promise<boolean>;
  getUserReferralLink: (username?: string) => string;
};

// Create context
const ReferralContext = createContext<ReferralContextType | null>(null);

// Custom hook to use the referral context
export const useReferral = () => useContext(ReferralContext) as ReferralContextType;

// ReferralProvider component
export const ReferralProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const location = useLocation();
  const { user, authenticated } = usePrivy();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referredBy, setReferredBy] = useState<string | null>(null);
  const [referralLink, setReferralLink] = useState<string>('');
  const [isReferralApplied, setIsReferralApplied] = useState<boolean>(false);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://back.braindrop.fun';

  // This effect runs on initial mount and when URL changes to detect referral codes
  // This effect runs on initial mount and when URL changes to detect referral codes
useEffect(() => {
  // Parse the URL search params to check for referral code
  const searchParams = new URLSearchParams(location.search);
  const refCode = searchParams.get('ref');
  
  if (refCode) {
    // Store the referral code in localStorage
    localStorage.setItem('pendingReferralCode', refCode);
    
    // If user is already logged in, apply the referral code
    if (authenticated && user?.id) {
      applyReferralCode(refCode);
    }
  }
}, [location, authenticated, user]);

  // This effect runs when the user authenticates to fetch their referral info
  useEffect(() => {
    if (authenticated && user?.id) {
      fetchReferralInfo();
      
      // Check for pending referral code to apply
      const pendingCode = localStorage.getItem('pendingReferralCode');
      if (pendingCode) {
        applyReferralCode(pendingCode).then(() => {
          localStorage.removeItem('pendingReferralCode');
        });
      }
    }
  }, [authenticated, user]);

  // Fetch referral info from the backend
  const fetchReferralInfo = async () => {
    if (!user?.id) return;
    
    try {
      const response = await axios.get(`${apiBaseUrl}`, {
        // privyId: user.id
      });
      
      if (response.data) {
        setReferralCode(response.data.referralCode);
        setReferralLink(response.data.referralLink || '');
        setReferredBy(response.data.referredBy?.referralCode || null);
        setIsReferralApplied(!!response.data.referredBy);
      }
    } catch (error) {
      console.error("Error fetching referral info:", error);
      
      // If we can't get a referral code, try to generate one
      tryGenerateReferralCode();
    }
  };

  // Try to generate a referral code if we don't have one
  const tryGenerateReferralCode = async () => {
    if (!user?.id) return;
    
    try {
      const response = await axios.get(`${apiBaseUrl}`, {
       
      });
      
      if (response.data && response.data.code) {
        setReferralCode(response.data.code);
        setReferralLink(response.data.referralLink);
      }
    } catch (error) {
      console.error("Error generating referral code:", error);
    }
  };

  // Apply a referral code
  const applyReferralCode = async (code: string): Promise<boolean> => {
    if (!user?.id || !code) return false;
    
    // Skip if already referred
    if (isReferralApplied || referredBy) return false;
    
    try {
      const response = await axios.post(`${apiBaseUrl}/referral/apply`, {
        privyId: user.id,
        referralCode: code
      });
      
      if (response.data && response.data.success) {
        setReferredBy(code);
        setIsReferralApplied(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error applying referral code:", error);
      return false;
    }
  };

  // Function to get the user's personal referral link
  const getUserReferralLink = (username?: string): string => {
    const baseUrl = "https://braindrop.fun/?ref=";
    
    // If we have a referral code from the backend, use it
    if (referralCode) {
      return `${baseUrl}${referralCode}`;
    }
    
    // If username is provided and we don't have a code yet
    if (username) {
      return `${baseUrl}${username}`;
    }
    
    // Default case - use a placeholder until we get a real code
    return baseUrl + "signup";
  };

  // Context value
  const value: ReferralContextType = {
    referralCode,
    referredBy,
    referralLink,
    isReferralApplied,
    applyReferralCode,
    getUserReferralLink,
  };

  return (
    <ReferralContext.Provider value={value}>
      {children}
    </ReferralContext.Provider>
  );
};

export default ReferralProvider;