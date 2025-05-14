import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Token ajouté à la requête :', config.url, token);
      } else {
        console.log('Aucun token trouvé dans SecureStore pour la requête :', config.url);
      }
      return config;
    } catch (error) {
      console.error('Erreur lors de la récupération du token dans SecureStore :', error);
      return config;
    }
  },
  (error) => {
    console.error('Erreur Axios :', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Export de l'instance api
export { api };

// Fonction pour gérer la connexion
export const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    const { token, user } = response.data;
    return { token, user };
  } catch (error) {
    console.error('Erreur lors de la connexion :', {
      message: error.message,
      data: error.response?.data,
    });
    throw error;
  }
};

// Récupération des informations de l'utilisateur
export const fetchUserInfo = async () => {
  try {
    const response = await api.get('/api/user/info');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des infos utilisateur :', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des infos utilisateur');
  }
};

// Récupération de l'historique des consentements
export const fetchConsentHistory = async () => {
  try {
    const response = await api.get('/api/consent/history');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l’historique des consentements :', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l’historique des consentements');
  }
};

// Accepter un nouveau consentement
export const acceptConsent = async (consentId, userId) => {
  try {
    const response = await api.put(`/api/consent/${consentId}/accept`, { userId });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l’acceptation du consentement :', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error(error.response?.data?.message || 'Erreur lors de l’acceptation du consentement');
  }
};

// Refuser un consentement
export const declineConsent = async (consentId, userId) => {
  try {
    const response = await api.put(`/api/consent/${consentId}/decline`, { userId });
    return response.data;
  } catch (error) {
    console.error('Erreur lors du refus du consentement :', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error(error.response?.data?.message || 'Erreur lors du refus du consentement');
  }
};

// Création du payment sheet pour les packs
export const createPaymentSheet = async (quantity) => {
  try {
    // Tente toujours la route /api/packs/payment-sheet puis fallback /packs/payment-sheet si besoin
    try {
      const response = await api.post('/api/packs/payment-sheet', { quantity });
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const response = await api.post('/packs/payment-sheet', { quantity });
        return response.data;
      }
      throw err;
    }
  } catch (error) {
    console.error('Erreur lors de la création du Payment Sheet :', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error(error.response?.data?.message || 'Erreur lors de la création du Payment Sheet');
  }
};

// Récupération des notifications non lues
export const fetchUnreadNotifications = async () => {
  try {
    const response = await api.get('/api/notifications/unread');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications :', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des notifications');
  }
};

// Marquer une notification comme lue
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors du marquage de la notification :', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error(error.response?.data?.message || 'Erreur lors du marquage de la notification');
  }
};

// Confirmer un consentement par biométrie
export const confirmConsentBiometric = async (consentId, userId) => {
  try {
    const response = await api.put(`/api/consent/${consentId}/confirm-biometric`, { userId });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la validation biométrique :', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw new Error(error.response?.data?.message || 'Erreur lors de la validation biométrique');
  }
};
