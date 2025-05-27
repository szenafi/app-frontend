import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { fetchUserInfo, login as loginApi } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  const loadUserFromToken = useCallback(async (token) => {
    if (!token) {
      setUser(null);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchUserInfo(token);
      if (data.user) {
        setUser({ ...data.user, packQuantity: data.packQuantity }); // packQuantity bien injecté
      } else if (data) {
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      try {
        const token = await SecureStore.getItemAsync('authToken');
        setAuthToken(token || null);
        if (token) {
          await loadUserFromToken(token);
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [loadUserFromToken]);

  // FONCTION login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { token, user: userData } = await loginApi({ email, password });
      await SecureStore.setItemAsync('authToken', token);
      setAuthToken(token);
      await loadUserFromToken(token); // Force le reload du user pour avoir le packQuantity
      return userData;
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // FONCTION logout
  const logout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    setAuthToken(null);
    setUser(null);
  };

  // FONCTION **reloadUser** à utiliser après achat
  const reloadUser = useCallback(async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      setAuthToken(token || null);
      if (token) {
        await loadUserFromToken(token);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [loadUserFromToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        logout,
        reloadUser,
        authToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
