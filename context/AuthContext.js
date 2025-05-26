import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { fetchUserInfo, login as loginApi } from '../utils/api';

// Création du contexte d'authentification
const AuthContext = createContext();

// Provider Auth pour englober ton app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  // Fonction pour récupérer et stocker le user à partir du token
  const loadUserFromToken = useCallback(async (token) => {
    if (!token) {
      setUser(null);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchUserInfo(token);
      if (data.user) {
        setUser(data.user);
      } else if (data) {
        setUser(data); // fallback si la clé est "user"
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Chargement automatique du user au lancement de l'app
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

  // Fonction login classique
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { token, user: userData } = await loginApi({ email, password });
      await SecureStore.setItemAsync('authToken', token);
      setAuthToken(token);
      setUser(userData);
      return userData;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour déconnexion (logout)
  const logout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    setAuthToken(null);
    setUser(null);
  };

  // Fonction de rechargement manuel du user (utile après update profil par ex)
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

// Hook pour utiliser le contexte dans les composants
export const useAuth = () => useContext(AuthContext);
