import React, { useEffect, useState } from 'react';
import { setAuthToken, getToken } from '../../sheetsFunctions'; 

const GoogleSignIn = ({ onUserLoaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  useEffect(() => {
    const loadScript = (src, id) => {
      return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          console.log(`Script loaded: ${src}`);
          resolve();
        };
        
        script.onerror = () => {
          console.error(`Failed to load script: ${src}`);
          reject(new Error(`Failed to load ${src}`));
        };
        
        document.head.appendChild(script);
      });
    };

    // Load Google Scripts
    const initializeGoogleAPIs = async () => {
      try {
        console.log('Loading Google API scripts...');
        
        // Load Google Identity Services (for new OAuth2)
        await loadScript('https://accounts.google.com/gsi/client', 'gsi-client');
        
        // Wait a bit for the script to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (window.google?.accounts?.oauth2) {
          console.log('Google Identity Services loaded successfully');
          setScriptsLoaded(true);
        } else {
          throw new Error('Google Identity Services failed to initialize');
        }
        
      } catch (error) {
        console.error('Error loading Google scripts:', error);
        setError(`Failed to load Google authentication: ${error.message}`);
      }
    };

    initializeGoogleAPIs();
  }, []);

  const handleSignIn = async () => {
    if (!scriptsLoaded) {
      setError('Google APIs not loaded yet. Please wait and try again.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting sign-in process...');
      
      // Get access token using the Google Identity Services
      const accessToken = await getToken();
      console.log('Access token received');
      
      // Get user info using the access token
      let user;
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          user = {
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            imageUrl: userInfo.picture || '',
            accessToken: accessToken
          };
          console.log('User info retrieved:', userInfo);
        } else {
          // Fallback if userinfo fails
          console.warn('Failed to get user info, using fallback');
          user = {
            id: 'user_' + Date.now(),
            name: 'User',
            email: 'user@example.com',
            imageUrl: '',
            accessToken: accessToken
          };
        }
      } catch (userInfoError) {
        console.warn('Error getting user info:', userInfoError);
        // Fallback user object
        user = {
          id: 'user_' + Date.now(),
          name: 'User',
          email: 'user@example.com',
          imageUrl: '',
          accessToken: accessToken
        };
      }
      
      console.log('User signed in successfully');
      onUserLoaded(user);
      
    } catch (error) {
      console.error('Sign-in failed:', error);
      setError(`Sign-in failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    // Clear the token
    setAuthToken(null);
    onUserLoaded(null);
    console.log('User signed out');
  };

  return (
    <div className="google-signin-container flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign in to Project JN</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="font-medium">Error:</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
        )}
        
        {!scriptsLoaded && (
          <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Loading Google APIs...
            </div>
          </div>
        )}
        
        <button
          onClick={handleSignIn}
          disabled={isLoading || !scriptsLoaded}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Signing in...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </>
          )}
        </button>
        
        {!scriptsLoaded && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Waiting for Google APIs to load...
          </p>
        )}
      </div>
    </div>
  );
};

export default GoogleSignIn;