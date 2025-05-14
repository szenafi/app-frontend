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
    } finally {
      setLoading(false);
    }
  };

  /**
   * logout : efface uniquement le contexte (pas de SecureStore à purger)
   */
  const logout = () => {
    setUser(null);
  };

  const completeOnboarding = async () => {
    setOnboardingDone(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        onboardingDone,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return ctx;
}
