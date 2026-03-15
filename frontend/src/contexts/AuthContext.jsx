import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const data = response.data;
    const access_token = data?.access_token ?? data?.accessToken;
    const refresh_token = data?.refresh_token ?? data?.refreshToken;
    const user = data?.user;

    if (access_token && typeof access_token === 'string') {
      localStorage.setItem('access_token', access_token);
    }
    if (refresh_token && typeof refresh_token === 'string') {
      localStorage.setItem('refresh_token', refresh_token);
    }
    if (user) setUser(user);

    return user;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const data = response.data;
    const access_token = data?.access_token ?? data?.accessToken;
    const refresh_token = data?.refresh_token ?? data?.refreshToken;
    const user = data?.user;

    if (access_token && typeof access_token === 'string') {
      localStorage.setItem('access_token', access_token);
    }
    if (refresh_token && typeof refresh_token === 'string') {
      localStorage.setItem('refresh_token', refresh_token);
    }
    if (user) setUser(user);

    return user;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const updateUserProgress = (progress) => {
    setUser(prev => prev ? { ...prev, progress } : null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading,
      updateUserProgress 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);