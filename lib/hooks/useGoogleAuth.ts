import { useState, useEffect } from 'react';

interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
}

interface GoogleAuthState {
  isAuthenticated: boolean;
  userInfo: GoogleUserInfo | null;
  isLoading: boolean;
  error: string | null;
}

export function useGoogleAuth() {
  const [state, setState] = useState<GoogleAuthState>({
    isAuthenticated: false,
    userInfo: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        // Check if user info cookie exists
        const userInfoCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('google_user_info='));
        
        if (userInfoCookie) {
          const userInfoValue = userInfoCookie.split('=')[1];
          const userInfo = JSON.parse(decodeURIComponent(userInfoValue));
          
          setState({
            isAuthenticated: true,
            userInfo,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            isAuthenticated: false,
            userInfo: null,
            isLoading: false,
            error: null,
          });
        }
      } catch {
        setState({
          isAuthenticated: false,
          userInfo: null,
          isLoading: false,
          error: 'Failed to check authentication status',
        });
      }
    };

    checkAuthStatus();
  }, []);

  const authenticate = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/auth/google');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get authentication URL');
      }
      
      // Redirect to Google OAuth
      window.location.href = data.authUrl;
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Authentication failed',
      }));
    }
  };

  const logout = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to logout');
      }
      
      // Reload the page to clear client-side state
      window.location.reload();
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Logout failed',
      }));
    }
  };

  return {
    ...state,
    authenticate,
    logout,
  };
}
