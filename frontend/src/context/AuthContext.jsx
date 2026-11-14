import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, register as apiRegister, getMe as apiGetMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const userData = await apiGetMe();
          const activeUser = userData.user || userData;
          setUser(activeUser);
          localStorage.setItem('user', JSON.stringify(activeUser));
        } catch (err) {
          console.warn('Failed to restore session:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      const userToken = data.token || data.access_token;
      const userData = data.user || data;

      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);

      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, full_name) => {
    setLoading(true);
    try {
      const data = await apiRegister(email, password, full_name);
      const userToken = data.token || data.access_token;
      const userData = data.user || data;

      if (userToken) {
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const isAdmin = Boolean(user && user.role === 'admin');

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAdmin,
    setUser,
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
