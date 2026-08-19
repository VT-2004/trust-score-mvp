import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const RENDER_BACKEND = 'https://trust-score-mvp.onrender.com';
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE = isLocal
  ? (window.location.port === '3001' ? '' : 'http://localhost:3001')
  : (window.location.hostname.includes('onrender.com') ? '' : RENDER_BACKEND);

export const MAX_FREE_ATTEMPTS = 5;

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

  const [guestUsageCount, setGuestUsageCount] = useState(() => {
    try {
      const count = localStorage.getItem('trustscore_usage_count');
      return count ? parseInt(count, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [localAudits, setLocalAudits] = useState(() => {
    try {
      const saved = localStorage.getItem('trustscore_local_audits');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState(null);

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
            logout();
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const canPerformTest = () => {
    if (user) return true; // Logged-in users have unlimited tests
    return guestUsageCount < MAX_FREE_ATTEMPTS;
  };

  const requireAuthForLimit = (customMessage) => {
    setAuthModalReason(customMessage || `You have used your ${MAX_FREE_ATTEMPTS} free tests. Please create a free account to continue unlimited testing.`);
    setIsAuthModalOpen(true);
  };

  const recordTest = (auditData) => {
    if (!auditData) return;

    // Save to private local audits
    const newAudit = {
      id: auditData.reportId || auditData.id || `local-${Date.now()}`,
      username: auditData.username || 'unknown',
      score: auditData.trustScore || auditData.score || 75,
      createdAt: new Date().toISOString(),
      report: auditData
    };

    const updated = [newAudit, ...localAudits.filter(a => a.username !== newAudit.username)].slice(0, 50);
    setLocalAudits(updated);
    try {
      localStorage.setItem('trustscore_local_audits', JSON.stringify(updated));
    } catch (e) {}

    // Increment guest usage if not authenticated
    if (!user) {
      const newCount = guestUsageCount + 1;
      setGuestUsageCount(newCount);
      try {
        localStorage.setItem('trustscore_usage_count', newCount.toString());
      } catch (e) {}
    }
  };

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
    setAuthModalReason(null);
    return data.user;
  };

  const signupWithCredentials = async (name, email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
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
    setAuthModalReason(null);
    return data.user;
  };

  const resetPasswordWithCredentials = async (email, newPassword) => {
    const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Password reset failed. Please check your email.');
    }
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('trustscore_user', JSON.stringify(data.user));
    localStorage.setItem('trustscore_token', data.token);
    setIsAuthModalOpen(false);
    setAuthModalReason(null);
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('trustscore_user');
    localStorage.removeItem('trustscore_token');
  };

  const openLogin = () => {
    setAuthModalReason(null);
    setIsAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      guestUsageCount,
      remainingFreeTests: Math.max(0, MAX_FREE_ATTEMPTS - guestUsageCount),
      canPerformTest,
      requireAuthForLimit,
      recordTest,
      localAudits,
      loginWithCredentials,
      signupWithCredentials,
      resetPasswordWithCredentials,
      logout,
      isAuthModalOpen,
      setIsAuthModalOpen,
      authModalReason,
      openLogin,
      apiBase: API_BASE
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
