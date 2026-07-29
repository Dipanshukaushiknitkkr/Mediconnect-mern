import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useSocket } from './SocketContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const socket = useSocket();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [token]);

  const connectUserSocket = (userToken, userName) => {
    if (socket && userToken) {
      socket.auth = { token: userToken, userName };
      if (!socket.connected) {
        socket.connect();
      }
    }
  };

  const fetchMe = async () => {
    try {
      setLoading(true);
      const res = await API.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        connectUserSocket(token, res.data.user.name);
      }
    } catch (err) {
      console.error('[AuthContext] Session fetch error:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      connectUserSocket(res.data.token, res.data.user.name);
    }
    return res.data;
  };

  const register = async (formData) => {
    const res = await API.post('/auth/register', formData);
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      connectUserSocket(res.data.token, res.data.user.name);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
    if (socket) {
      socket.disconnect();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
