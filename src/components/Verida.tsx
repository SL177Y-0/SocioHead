import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { usePrivy } from "@privy-io/react-auth";
import CyberButton from '@/components/CyberButton';

interface VeridaProps {
  onConnectionChange?: (isConnected: boolean) => void;
  onAuthDataReceived?: (data: { authToken?: string, userDid?: string }) => void;
}

function Verida({ onConnectionChange, onAuthDataReceived }: VeridaProps) {
  const location = useLocation();
  const { logout, user } = usePrivy();
  const [connected, setConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userDid, setUserDid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
   const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://back.braindrop.fun";

  // Notify parent component when connection status changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(connected);
    }
  }, [connected, onConnectionChange]);

  // Check for connection params in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const userId = searchParams.get('userId');
    const token = searchParams.get('authToken');
    const did = searchParams.get('userDid');
    const errorParam = searchParams.get('error');
    const errorMessage = searchParams.get('message');



    if (errorParam) {
      console.error('Authentication error:', errorParam, errorMessage);
      setError(errorMessage || 'Failed to authenticate with Verida.');
      return;
    }

    if (token&&did) {
      if (token) setAuthToken(token);
      if (did) setUserDid(did);
      setConnected(true);
      
      // Pass authentication data to parent component
      if (onAuthDataReceived) {
        onAuthDataReceived({ 
          authToken: token || undefined,
          userDid: did || undefined
        });
      } else {
        console.warn('⚠️ onAuthDataReceived prop is not provided - cannot pass auth data to parent');
      }
    } else {
      console.log('ℹ️ No userId found in URL');
    }
  }, [location, onAuthDataReceived]);

  const connectWithVerida = () => {
    setLoading(true);
    
    const backendUrl = apiBaseUrl || 'https://back.braindrop.fun';
    const callbackUrl = `${backendUrl}/auth/callback`;
    
    // Define scopes exactly as in reference implementation
    const scopesList = [
      'api:ds-query',
      'api:search-universal',
      'ds:social-email',
      'api:connections-profiles',
      'api:connections-status',
      'api:db-query',
      'api:ds-get-by-id',
      'api:db-get-by-id',
      'api:ds-update',
      'api:search-ds',
      'api:search-chat-threads',
      'ds:r:social-chat-group',
      'ds:r:social-chat-message'
    ];
    
    // Construct URL with multiple scope parameters
    let authUrl = 'https://app.verida.ai/auth?';
    
    // Add each scope individually
    scopesList.forEach(scope => {
      authUrl += `scopes=${encodeURIComponent(scope)}&`;
    });
    
    // Add redirect URL and appDID
    authUrl += `redirectUrl=${encodeURIComponent(callbackUrl)}&appDID=did%3Avda%3Amainnet%3A0x87AE6A302aBf187298FC1Fa02A48cFD9EAd2818D`;

    console.log('Redirecting to Verida:', authUrl);
    window.location.href = authUrl;
  };

  return (
    <div className="w-full px-4">
      <div className="w-full border-cyan-400/30 transition-all duration-300">
        {!connected ? (
          <CyberButton
            onClick={connectWithVerida}
            variant="accent"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Connect Telegram'}
          </CyberButton>
        ) : (
          <div className="text-center text-cyan-300 font-semibold text-lg py-2">
           
          </div>
        )}
      </div>
      
      {loading && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin h-5 w-5 border-t-2 border-cyan-400 rounded-full"></div>
        </div>
      )}
      
      {error && (
        <div className="mt-2 text-red-400 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
}

export default Verida;