import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL, API_BASE_URL } from '../constants';

// instance pour toutes les routes sous /api
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// instance pour les routes racines (e.g. /test-db)
const rootApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Intercepteur : injecte le token dans chaque requête API
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('authToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// — Diagnostic —
// GET GET https://…/test-db
export async function testDB() {
  console.log('→ TEST DB URL =', `${API_BASE_URL}/test-db`);
  const res = await rootApi.get('/test-db');
  return res.data; // { success, users }
}

// — Authentification —
// POST https://…/api/auth/login
export async function login({ email, password }) {
  console.log('→ LOGIN URL =', `${API_URL}/auth/login`);
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

// POST https://…/api/auth/signup
export async function signup({ firstName, lastName, email, password }) {
  console.log('→ SIGNUP URL =', `${API_URL}/auth/signup`);
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

// GET https://…/api/user/info
export async function fetchUserInfo(passedToken) {
  console.log('→ FETCH USER INFO URL =', `${API_URL}/user/info`);
  if (passedToken) {
    api.defaults.headers.common.Authorization = `Bearer ${passedToken}`;
  }
  const res = await api.get('/user/info');
  return res.data; // { user: {...}, packQuantity }
}

// — Consentements —
// GET https://…/api/consent/charter
export async function getConsentCharter() {
  console.log('→ CONSENT CHARTER URL =', `${API_URL}/consent/charter`);
  const res = await api.get('/consent/charter');
  return res.data;
}

// POST https://…/api/consent
export async function createConsent(payload) {
  console.log('→ CREATE CONSENT URL =', `${API_URL}/consent`, 'payload=', payload);
  const res = await api.post('/consent', payload);
  return res.data; // { message, consentId }
}

// PUT https://…/api/consent/:id/confirm-biometric
export async function confirmConsentBiometric(consentId, payload) {
  console.log('→ CONFIRM BIOMETRIC URL =', `${API_URL}/consent/${consentId}/confirm-biometric`);
  const res = await api.put(`/consent/${consentId}/confirm-biometric`, { userId: payload.userId });
  return res.data;
}

// GET https://…/api/consent/history
export async function getConsentHistory() {
  console.log('→ CONSENT HISTORY URL =', `${API_URL}/consent/history`);
  const res = await api.get('/consent/history');
  return res.data; // array of consents
}

// — Notifications —
// GET https://…/api/notifications/unread
export async function getUnreadNotifications() {
  console.log('→ UNREAD NOTIFICATIONS URL =', `${API_URL}/notifications/unread`);
  const res = await api.get('/notifications/unread');
  return res.data;
}

// PUT https://…/api/notifications/mark-as-read
export async function markNotificationsAsRead(ids = []) {
  console.log('→ MARK NOTIFICATIONS AS READ URL =', `${API_URL}/notifications/mark-as-read`, 'ids=', ids);
  const res = await api.put('/notifications/mark-as-read', { notificationIds: ids });
  return res.data;
}

// PUT https://…/api/notifications/mark-read
export async function markReadNotifications(ids = []) {
  console.log('→ MARK-READ NOTIFICATIONS URL =', `${API_URL}/notifications/mark-read`, 'ids=', ids);
  const res = await api.put('/notifications/mark-read', { ids });
  return res.data;
}

// — Profil utilisateur —
// PUT https://…/api/user/profile
export async function updateProfile(data) {
  console.log('→ UPDATE PROFILE URL =', `${API_URL}/user/profile`, 'data=', data);
  const res = await api.put('/user/profile', data);
  return res.data;
}

export default api;
