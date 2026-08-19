import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('trustscore_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('trustscore_user', JSON.stringify(userData));
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('trustscore_user');
  };

  const loginDemo = (role = 'Engineering Recruiter') => {
    const demoUser = {
      name: 'Alex Morgan',
      email: 'alex.recruiter@example.com',
      role: role,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      isDemo: true,
    };
    login(demoUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loginDemo,
      isAuthModalOpen,
      setIsAuthModalOpen
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
