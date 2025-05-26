<<<<<<< HEAD
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
=======
import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, fetchUserInfo } from '../utils/api';

const AuthContext = createContext();

/**
 * @typedef {object} AuthProviderProps
 * @property {React.ReactNode=} children
 */

/**
 * @param {AuthProviderProps} props
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // plus de loading initial à true
  const [onboardingDone, setOnboardingDone] = useState(false);

  // On ne restaure plus la session automatiquement, 
  // donc on peut considérer loading=false dès le départ
  useEffect(() => {
    setLoading(false);
  }, []);

  /**
   * login : appelle l'API, stocke l'utilisateur en contexte seulement en mémoire
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { token, user } = await apiLogin(email, password);
      if (!token) {
        throw new Error('Aucun token reçu');
      }
      // On ne persiste PAS le token : 
      // on le garde juste en mémoire pendant la session
      // (on pourrait le conserver dans un useRef si besoin d’y accéder)
      setUser(user);
      return { token, user };
    } catch (error) {
      console.error('❌ Erreur lors de la connexion :', error.message);
      setUser(null);
      throw error;
>>>>>>> 71f8ca93224cd32c282706bb41c115fabecfd470
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
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
=======
  /**
   * logout : efface uniquement le contexte (pas de SecureStore à purger)
   */
  const logout = () => {
    setUser(null);
  };

  const completeOnboarding = async () => {
    setOnboardingDone(true);
  };
>>>>>>> 71f8ca93224cd32c282706bb41c115fabecfd470

  return (
    <AuthContext.Provider
      value={{
        user,
<<<<<<< HEAD
        setUser,
        loading,
        login,
        logout,
        reloadUser,
        authToken,
=======
        login,
        logout,
        loading,
        onboardingDone,
        completeOnboarding,
>>>>>>> 71f8ca93224cd32c282706bb41c115fabecfd470
      }}
    >
      {children}
    </AuthContext.Provider>
  );
<<<<<<< HEAD
};

// Hook pour utiliser le contexte dans les composants
export const useAuth = () => useContext(AuthContext);
=======
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return ctx;
}
>>>>>>> 71f8ca93224cd32c282706bb41c115fabecfd470
