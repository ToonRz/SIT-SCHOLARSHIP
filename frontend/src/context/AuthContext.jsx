import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentToken) => {
    try {
      const res = await axiosInstance.get('/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (error) {
      console.error('Failed to fetch profile', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));
      return receivedUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/register', formData);
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));
      return receivedUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAdmin = () => user?.role === 'admin';
  const isStudent = () => user?.role === 'student';
  const isCommittee = () => user?.role === 'committee';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      fetchProfile: () => fetchProfile(token),
      isAdmin,
      isStudent,
      isCommittee
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
