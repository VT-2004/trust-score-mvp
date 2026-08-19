import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const RENDER_BACKEND = 'https://trust-score-mvp.onrender.com';
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE = isLocal
  ? (window.location.port === '3001' ? '' : 'http://localhost:3001')
  : (window.location.hostname.includes('onrender.com') ? '' : RENDER_BACKEND);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('trustscore_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('trustscore_token') || null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Validate existing session on mount
  useEffect(() => {
    if (token) {
      fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('trustscore_user', JSON.stringify(data.user));
          } else {
            // Token expired
            logout();
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const loginWithCredentials = async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Login failed. Please check credentials.');
    }
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('trustscore_user', JSON.stringify(data.user));
    localStorage.setItem('trustscore_token', data.token);
    setIsAuthModalOpen(false);
    return data.user;
  };

  const signupWithCredentials = async (name, email, password, role) => {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Signup failed. Please try again.');
    }
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('trustscore_user', JSON.stringify(data.user));
    localStorage.setItem('trustscore_token', data.token);
    setIsAuthModalOpen(false);
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('trustscore_user');
    localStorage.removeItem('trustscore_token');
  };

  const loginDemo = (role = 'Engineering Recruiter') => {
    const demoUser = {
      id: 'demo-auditor',
      name: 'Alex Morgan',
      email: 'alex.recruiter@trustscore.ai',
      role: role,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      isDemo: true,
    };
    setUser(demoUser);
    localStorage.setItem('trustscore_user', JSON.stringify(demoUser));
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loginWithCredentials,
      signupWithCredentials,
      logout,
      loginDemo,
      isAuthModalOpen,
      setIsAuthModalOpen,
      apiBase: API_BASE
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
