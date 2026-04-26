import React, { createContext, useContext, useEffect, useState } from 'react';
import authApi from '../api/auth.api';
import { onAuthStateChanged } from '../services/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get backend profile
          const response = await authApi.getMe();
          setProfile(response.data);
        } catch (err) {
          // If getMe fails, user might not be registered in backend yet
          setProfile(null);
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (firebaseToken, options = {}) => {
    try {
      setError(null);
      const response = await authApi.register(firebaseToken, options);
      setProfile(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.log('Logout error:', err);
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await authApi.getMe();
      setProfile(response.data);
    } catch (err) {
      console.log('Refresh profile error:', err);
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    login,
    logout,
    refreshProfile,
    isDriver: profile?.role === 'driver',
    isIndividual: profile?.role === 'individual',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;