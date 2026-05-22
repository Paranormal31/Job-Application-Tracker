import React, { useState, useEffect } from 'react';
import type { User } from '../types';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
        };
      };
    };
  }
}

interface Props {
  onLoginSuccess: (user: User) => void;
}

const GOOGLE_CLIENT_ID = '954080191562-2ornv1pps2vbu878he1mhss3euhbo158.apps.googleusercontent.com';

export const AuthPage: React.FC<Props> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  // Parse JWT tokens received from Google credential response
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleGoogleCredentialResponse = (response: any) => {
    setError(null);
    try {
      const payload = parseJwt(response.credential);
      if (!payload) {
        setError('Failed to authenticate with Google. Invalid token.');
        return;
      }

      const googleUser: User = {
        id: `google-${payload.sub}`,
        username: payload.name || payload.email.split('@')[0],
        email: payload.email,
      };

      // Register Google Profile in Mock DB if first time
      const users = getRegisteredUsers();
      const existingUser = users.find(u => u.email.toLowerCase() === payload.email.toLowerCase());
      if (!existingUser) {
        const newUser = {
          id: googleUser.id,
          username: googleUser.username,
          email: googleUser.email.toLowerCase(),
          password: 'google-auth-no-password'
        };
        localStorage.setItem('careerpath_users', JSON.stringify([...users, newUser]));
      }

      onLoginSuccess(googleUser);
    } catch (err) {
      setError('An error occurred during Google authentication.');
      console.error(err);
    }
  };

  const initializeGoogleSignIn = () => {
    if (!window.google) return;

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
      });

      const btnContainer = document.getElementById('google-signin-btn');
      if (btnContainer) {
        // Calculate width or use default
        const width = btnContainer.clientWidth || 380;
        
        window.google.accounts.id.renderButton(btnContainer, {
          theme: 'outline',
          size: 'large',
          width: Math.min(Math.max(width, 200), 400),
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left'
        });
      }
    } catch (err) {
      console.error('Error initializing Google Sign-In:', err);
    }
  };

  // Inject Google GIS script dynamically
  useEffect(() => {
    if (document.getElementById('google-sdk-script')) {
      setIsGoogleLoaded(true);
      initializeGoogleSignIn();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-sdk-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsGoogleLoaded(true);
      initializeGoogleSignIn();
    };
    script.onerror = () => {
      console.warn('Google SDK could not load. Rendering premium mock fallback.');
      setIsGoogleLoaded(false);
    };
    document.body.appendChild(script);
  }, []);

  // Re-initialize standard Google button if view mode changes or window resizes
  useEffect(() => {
    if (isGoogleLoaded) {
      initializeGoogleSignIn();
    }

    const handleResize = () => {
      if (isGoogleLoaded) {
        initializeGoogleSignIn();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mode, isGoogleLoaded]);

  const triggerGoogleSimulatedLogin = () => {
    setError(null);
    setSuccess(null);

    const mockGoogleProfile = {
      sub: 'mock-google-10101',
      name: 'Google Sarthak',
      email: 'sarthak.google@gmail.com',
    };

    const googleUser: User = {
      id: `google-${mockGoogleProfile.sub}`,
      username: mockGoogleProfile.name,
      email: mockGoogleProfile.email,
    };

    const users = getRegisteredUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === mockGoogleProfile.email.toLowerCase());
    if (!existingUser) {
      const newUser = {
        id: googleUser.id,
        username: googleUser.username,
        email: googleUser.email.toLowerCase(),
        password: 'google-auth-no-password'
      };
      localStorage.setItem('careerpath_users', JSON.stringify([...users, newUser]));
    }

    onLoginSuccess(googleUser);
  };

  const getRegisteredUsers = (): any[] => {
    const saved = localStorage.getItem('careerpath_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const users = getRegisteredUsers();
    const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (userExists) {
      setError('An account with this email already exists.');
      return;
    }

    const newUser = {
      id: crypto.randomUUID(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: password
    };

    localStorage.setItem('careerpath_users', JSON.stringify([...users, newUser]));
    setSuccess('Registration successful! Please login.');
    setMode('login');
    setPassword('');
    setConfirmPassword('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    const users = getRegisteredUsers();
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      setError('Invalid email or password.');
      return;
    }

    onLoginSuccess({
      id: user.id,
      username: user.username,
      email: user.email
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-wrapper">
            <svg className="logo-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <h2>Job Application Tracker</h2>
          </div>
          <p className="auth-subtitle">Track your job applications with absolute structure</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setError(null);
            }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="auth-alert alert-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-alert alert-success">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{success}</span>
          </div>
        )}

        <div className="google-auth-wrapper">
          <div id="google-signin-btn" style={{ display: isGoogleLoaded ? 'block' : 'none' }}></div>
          {!isGoogleLoaded && (
            <button
              type="button"
              className="google-test-fallback-btn"
              onClick={triggerGoogleSimulatedLogin}
            >
              <svg className="google-icon-svg" width="18" height="18" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </button>
          )}
        </div>

        <div className="auth-divider">
          <span>or use email</span>
        </div>

        {mode === 'login' ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn">
              Sign In
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="register-username">Full Name</label>
              <input
                id="register-username"
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Alex Morgan"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-email">Email Address</label>
              <input
                id="register-email"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-password">Password (6+ characters)</label>
              <input
                id="register-password"
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a strong password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="register-confirm">Confirm Password</label>
              <input
                id="register-confirm"
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Verify password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn">
              Create Account
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
