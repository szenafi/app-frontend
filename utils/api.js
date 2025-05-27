import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL, API_BASE_URL } from '../constants';

// Instance principale pour les routes sous /api
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Instance pour les routes racines (e.g. /test-db)
const rootApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Intercepteur : injecte le token dans chaque requête API (instance api)
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
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

// ----------- FONCTIONS UTILISATEUR ET AUTH -----------

// Test la connexion DB (route racine)
export async function testDB() {
  const res = await rootApi.get('/test-db');
  return res.data;
}

// Connexion utilisateur
export async function login({ email, password }) {
  try {
    const res = await api.post('/auth/login', { email, password });
    return res.data; // { token, user }
  } catch (error) {
    if (error.response?.data?.message?.toLowerCase().includes('invalid credentials')) {
      throw new Error('Invalid credentials');
    } else {
      throw new Error(error.response?.data?.message || 'Erreur lors de la connexion');
    }
  }
}

// Inscription utilisateur
export async function signup({ firstName, lastName, email, password }) {
  const payload = { firstName, email, password };
  if (lastName) payload.lastName = lastName;
  try {
    const res = await api.post('/auth/signup', payload);
    return res.data; // { token, user }
  } catch (error) {
    if (error.response?.data?.error?.includes('Unique constraint failed')) {
      throw new Error("Cet email est déjà utilisé. Veuillez en choisir un autre.");
    } else if (error.response?.data?.message?.includes('validation')) {
      throw new Error("Certains champs sont manquants ou invalides.");
    } else {
      throw new Error(error.response?.data?.message || 'Erreur lors de l’inscription');
    }
  }
}

// Infos utilisateur connecté
export async function fetchUserInfo(passedToken) {
  if (passedToken) {
    api.defaults.headers.common.Authorization = `Bearer ${passedToken}`;
  }
  const res = await api.get('/user/info');
  return res.data;
}

// Mise à jour du profil
export async function updateProfile(data) {
  const res = await api.put('/user/profile', data);
  return res.data;
}

// ----------- CONSENTEMENTS -----------

// Récupérer la charte
export async function getConsentCharter() {
  const res = await api.get('/consent/charter');
  return res.data;
}

// Créer un consentement
export async function createConsent(payload) {
  const res = await api.post('/consent', payload);
  return res.data;
}

// Accepter un consentement
export async function acceptConsent(consentId, userId) {
  const res = await api.put(`/consent/${consentId}/accept`, { userId });
  return res.data;
}

// Refuser un consentement
export async function declineConsent(consentId, userId) {
  const res = await api.put(`/consent/${consentId}/decline`, { userId });
  return res.data;
}

// Confirmer consentement biométrique
export async function confirmConsentBiometric(consentId, userId) {
  const res = await api.put(`/consent/${consentId}/confirm-biometric`, { userId });
  return res.data;
}

// Historique des consentements
export async function getConsentHistory() {
  const res = await api.get('/consent/history');
  return res.data;
}

// ----------- NOTIFICATIONS -----------

// Notifications non lues
export async function getUnreadNotifications() {
  const res = await api.get('/notifications/unread');
  return res.data;
}

// Notifications non lues (autre variante)
export async function fetchUnreadNotifications() {
  const res = await api.get('/notifications/unread');
  return res.data;
}

// Marquer plusieurs notifications comme lues
export async function markNotificationsAsRead(ids = []) {
  const res = await api.put('/notifications/mark-as-read', { notificationIds: ids });
  return res.data;
}

// Marquer plusieurs notifications comme lues (autre variante)
export async function markReadNotifications(ids = []) {
  const res = await api.put('/notifications/mark-read', { ids });
  return res.data;
}

// Marquer une notification comme lue (cas individuel)
export async function markNotificationAsRead(notificationId) {
  const res = await api.put(`/notifications/${notificationId}/read`);
  return res.data;
}

// ----------- PAIEMENT -----------

// Création du payment sheet (packs)
export async function createPaymentSheet(quantity) {
  try {
    try {
      const response = await api.post('/packs/payment-sheet', { quantity });
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) {
        const response = await api.post('/api/packs/payment-sheet', { quantity });
        return response.data;
      }
      throw err;
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la création du Payment Sheet');
  }
}

// ----------- EXPORTS -----------

export default api;
export { api, rootApi };
