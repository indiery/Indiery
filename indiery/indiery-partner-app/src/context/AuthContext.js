import { createContext, useContext, useEffect, useState } from 'react';
import authApi from '../api/auth.api';
import { onAuthStateChanged } from '../services/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get backend profile
          const user = await authApi.getMe();
          setProfile(user);
          setNeedsRoleSelection(!user?.role);
        } catch (err) {
          // If getMe fails, user might not be registered in backend yet
          setProfile(null);
          setNeedsRoleSelection(true);
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
        setProfile(null);
        setNeedsRoleSelection(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (firebaseToken, options = {}) => {
    try {
      setError(null);
      const response = await authApi.register(firebaseToken, options);
      setProfile(response);
      setNeedsRoleSelection(response.needsRoleSelection || false);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const completeRegistration = async (firebaseToken, data) => {
    try {
      setError(null);
      const response = await authApi.completeRegistration(firebaseToken, data);
      setProfile(response);
      setNeedsRoleSelection(false);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
      setNeedsRoleSelection(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const user = await authApi.getMe();
      setProfile(user);
      setNeedsRoleSelection(!user?.role);
    } catch (err) {
      console.log('Refresh profile error:', err);
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    needsRoleSelection,
    login,
    completeRegistration,
    logout,
    refreshProfile,
    isDriver: profile?.role === 'driver',
    isTransporter: profile?.role === 'transporter',
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