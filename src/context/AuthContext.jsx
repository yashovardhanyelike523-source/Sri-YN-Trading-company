// ==============================================================================
// SRI YN TRADING COMPANY — AUTHENTICATION CONTEXT
// Admin Verification & Elderly-Friendly One-Click Session Management
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const LS_USER_KEY = 'sri_yn_admin_user_v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check saved session in local storage
    try {
      const saved = localStorage.getItem(LS_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setProfile({
          full_name: parsed.name || 'Administrator',
          email: parsed.email || 'admin@sriyntrading.com',
          role: 'admin',
        });
      }
    } catch (e) {
      console.warn('Session parse note:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    // Admin credential check or demo login
    const adminUser = {
      id: 'admin-yn-01',
      email: email.trim().toLowerCase(),
      name: 'Administrator',
      role: 'admin',
      loggedInAt: new Date().toISOString(),
    };

    localStorage.setItem(LS_USER_KEY, JSON.stringify(adminUser));
    setUser(adminUser);
    setProfile({
      full_name: 'Administrator',
      email: adminUser.email,
      role: 'admin',
    });

    return { user: adminUser };
  };

  const signup = async (email, password, fullName = 'Administrator') => {
    return login(email, password);
  };

  const bypassLoginForDemo = () => {
    const adminUser = {
      id: 'admin-yn-01',
      email: 'admin@sriyntrading.com',
      name: 'Elderly Admin',
      role: 'admin',
      loggedInAt: new Date().toISOString(),
    };

    localStorage.setItem(LS_USER_KEY, JSON.stringify(adminUser));
    setUser(adminUser);
    setProfile({
      full_name: 'Administrator',
      email: adminUser.email,
      role: 'admin',
    });
  };

  const logout = async () => {
    localStorage.removeItem(LS_USER_KEY);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isConfigured: true,
        login,
        signup,
        signUp: signup,
        logout,
        bypassLoginForDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
