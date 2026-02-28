/**
 * GoviConnect SL - API Service
 * Connects mobile app to the Node.js backend
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// ─── Configuration ───────────────────────────────────────────
// Change this to your backend URL
// For local development with Android emulator: http://10.0.2.2:5000
// For local development with iOS simulator: http://localhost:5000
// For physical device on same WiFi: http://<your-local-ip>:5000
const BASE_URL = __DEV__
  ? 'http://10.0.2.2:5000/api'   // Android emulator
  : 'https://your-production-url.com/api';

const SOCKET_URL = __DEV__
  ? 'http://10.0.2.2:5000'
  : 'https://your-production-url.com';

// ─── Storage Keys ────────────────────────────────────────────
const TOKEN_KEY = '@goviconnect_token';
const USER_KEY = '@goviconnect_user';
const ROLE_KEY = '@goviconnect_role';
const OFFLINE_QUEUE_KEY = '@goviconnect_offline_queue';

// ─── Axios Instance ──────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth data
      await clearAuthData();
    }
    return Promise.reject(error);
  }
);

// ─── Auth Storage Helpers ────────────────────────────────────
export const saveAuthData = async (token: string, user: any, role: string) => {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, token],
    [USER_KEY, JSON.stringify(user)],
    [ROLE_KEY, role],
  ]);
};

export const getAuthData = async () => {
  const [[, token], [, user], [, role]] = await AsyncStorage.multiGet([
    TOKEN_KEY,
    USER_KEY,
    ROLE_KEY,
  ]);
  return {
    token,
    user: user ? JSON.parse(user) : null,
    role,
  };
};

export const clearAuthData = async () => {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, ROLE_KEY]);
};

// ─── Offline Queue ───────────────────────────────────────────
export const addToOfflineQueue = async (action: any) => {
  const queue = await getOfflineQueue();
  queue.push({ ...action, timestamp: new Date().toISOString() });
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

export const getOfflineQueue = async (): Promise<any[]> => {
  const data = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
  return data ? JSON.parse(data) : [];
};

export const clearOfflineQueue = async () => {
  await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
};

export const syncOfflineQueue = async () => {
  const queue = await getOfflineQueue();
  if (queue.length === 0) return;

  try {
    const response = await api.post('/sync', { actions: queue });
    if (response.data.success) {
      await clearOfflineQueue();
    }
    return response.data;
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
};

// ─── Network-Aware Request Helper ────────────────────────────
const networkAwareRequest = async (requestFn: () => Promise<any>, offlineAction?: any) => {
  const netInfo = await NetInfo.fetch();

  if (!netInfo.isConnected && offlineAction) {
    await addToOfflineQueue(offlineAction);
    return { success: true, offline: true, message: 'Saved for sync when online' };
  }

  return requestFn();
};

// ═══════════════════════════════════════════════════════════════
//  AUTH API
// ═══════════════════════════════════════════════════════════════

export const authAPI = {
  // Farmer auth
  registerFarmer: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    district: string;
    crops?: string[];
  }) => api.post('/auth/farmer/register', data),

  loginFarmer: (data: { email: string; password: string }) =>
    api.post('/auth/farmer/login', data),

  forgotPassword: (email: string) =>
    api.post('/auth/farmer/forgot-password', { email }),

  resetPassword: (data: { token: string; password: string }) =>
    api.put(`/auth/reset-password/${data.token}`, { password: data.password }),

  // Expert auth
  registerExpert: (data: any) => api.post('/auth/expert/register', data),
  loginExpert: (data: { email: string; password: string }) =>
    api.post('/auth/expert/login', data),

  // Shop auth
  registerShop: (data: any) => api.post('/auth/shop/register', data),
  loginShop: (data: { email: string; password: string }) =>
    api.post('/auth/shop/login', data),

  // Get current user
  getMe: () => api.get('/auth/me'),
};

// ═══════════════════════════════════════════════════════════════
//  USER / PROFILE API
// ═══════════════════════════════════════════════════════════════

export const userAPI = {
  updateFarmerProfile: (data: any) => api.put('/users/farmer/profile', data),

  updateFarmerAvatar: (formData: FormData) =>
    api.put('/users/farmer/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateExpertProfile: (data: any) => api.put('/users/expert/profile', data),

  updateExpertAvatar: (formData: FormData) =>
    api.put('/users/expert/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateShopProfile: (data: any) => api.put('/users/shop/profile', data),

  updateShopAvatar: (formData: FormData) =>
    api.put('/users/shop/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updatePushToken: (expoPushToken: string) =>
    api.put('/users/push-token', { expoPushToken }),
};

// ═══════════════════════════════════════════════════════════════
//  AI / DIAGNOSIS API
// ═══════════════════════════════════════════════════════════════

export const aiAPI = {
  cropDiagnosis: (formData: FormData) =>
    api.post('/ai/diagnosis', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60s for ML processing
    }),

  getDiagnosisHistory: () => api.get('/ai/diagnosis/history'),

  saveDiagnosisResult: (data: any) => api.post('/ai/diagnosis/save', data),

  pricePrediction: (data: {
    crop: string;
    cropSi?: string;
    landSize: number;
    landUnit: string;
    district: string;
    season?: string;
  }) => api.post('/ai/price-prediction', data),

  getPredictionHistory: () => api.get('/ai/price-prediction/history'),

  savePredictionResult: (data: any) => api.post('/ai/price-prediction/save', data),
};

// ═══════════════════════════════════════════════════════════════
//  CHAT API
// ═══════════════════════════════════════════════════════════════

export const chatAPI = {
  getChats: () => api.get('/chats'),

  getMessages: (chatId: string, page: number = 1, limit: number = 50) =>
    api.get(`/chats/${chatId}/messages`, { params: { page, limit } }),

  sendMessage: (chatId: string, data: { content: string; type?: string }) =>
    api.post(`/chats/${chatId}/messages`, data),

  createChat: (data: { expertId: string }) =>
    api.post('/chats', data),

  markChatRead: (chatId: string) =>
    api.put(`/chats/${chatId}/read`),

  sendImageMessage: (chatId: string, formData: FormData) =>
    api.post(`/chats/${chatId}/messages/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ═══════════════════════════════════════════════════════════════
//  MEETINGS API
// ═══════════════════════════════════════════════════════════════

export const meetingAPI = {
  getSessions: (params?: { type?: string; status?: string }) =>
    api.get('/meetings/sessions', { params }),

  getSessionById: (id: string) => api.get(`/meetings/sessions/${id}`),

  getMyMeetings: () => api.get('/meetings/my-meetings'),

  bookMeeting: (data: {
    expertId: string;
    dateTime: string;
    duration?: number;
    topic: string;
    topicSi?: string;
  }) => api.post('/meetings/book', data),

  toggleReminder: (meetingId: string) =>
    api.put(`/meetings/${meetingId}/reminder`),

  joinMeeting: (meetingId: string) =>
    api.post(`/meetings/${meetingId}/join`),

  getExpertAvailability: (expertId: string, date: string) =>
    api.get(`/meetings/availability/${expertId}`, { params: { date } }),

  registerForSession: (sessionId: string) =>
    api.post(`/meetings/sessions/${sessionId}/register`),
};

// ═══════════════════════════════════════════════════════════════
//  LEARNHUB API
// ═══════════════════════════════════════════════════════════════

export const learnhubAPI = {
  getGuides: (params?: {
    search?: string;
    category?: string;
    crop?: string;
    page?: number;
    limit?: number;
  }) => api.get('/learnhub/guides', { params }),

  getGuideById: (id: string) => api.get(`/learnhub/guides/${id}`),

  saveGuide: (guideId: string) => api.post(`/learnhub/guides/${guideId}/save`),

  unsaveGuide: (guideId: string) =>
    api.delete(`/learnhub/guides/${guideId}/save`),

  getSavedGuides: () => api.get('/learnhub/saved'),

  submitUserGuide: (data: any) => api.post('/learnhub/user-guides', data),

  getUserGuides: () => api.get('/learnhub/user-guides'),

  updateUserGuide: (id: string, data: any) =>
    api.put(`/learnhub/user-guides/${id}`, data),

  deleteUserGuide: (id: string) => api.delete(`/learnhub/user-guides/${id}`),
};

// ═══════════════════════════════════════════════════════════════
//  NOTIFICATIONS API
// ═══════════════════════════════════════════════════════════════

export const notificationAPI = {
  getNotifications: (params?: { page?: number; limit?: number }) =>
    api.get('/notifications', { params }),

  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),

  markAllAsRead: () => api.put('/notifications/read-all'),

  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// ═══════════════════════════════════════════════════════════════
//  FEED API
// ═══════════════════════════════════════════════════════════════

export const feedAPI = {
  getFeed: () => api.get('/feed'),
  getCrops: () => api.get('/feed/crops'),
  getTips: (params?: { category?: string; crop?: string }) =>
    api.get('/feed/tips', { params }),
};

// ═══════════════════════════════════════════════════════════════
//  EXPERTS API (for farmers browsing experts)
// ═══════════════════════════════════════════════════════════════

export const expertsAPI = {
  listExperts: (params?: { specialty?: string; district?: string }) =>
    api.get('/experts', { params }),

  getExpertById: (id: string) => api.get(`/experts/${id}`),
};

// ═══════════════════════════════════════════════════════════════
//  EXPERT DASHBOARD API (for expert users)
// ═══════════════════════════════════════════════════════════════

export const expertDashboardAPI = {
  getDashboard: () => api.get('/experts/me/dashboard'),

  getFarmerRequests: (params?: { status?: string }) =>
    api.get('/experts/me/requests', { params }),

  respondToRequest: (requestId: string, data: { status: string; response?: string }) =>
    api.put(`/experts/me/requests/${requestId}`, data),

  getDiagnosisReviews: (params?: { status?: string }) =>
    api.get('/experts/me/diagnosis-reviews', { params }),

  submitDiagnosisReview: (diagnosisId: string, data: any) =>
    api.put(`/experts/me/diagnosis-reviews/${diagnosisId}`, data),

  getFarmerDirectory: (params?: { search?: string; district?: string }) =>
    api.get('/experts/me/farmers', { params }),

  getKnowledgeBase: () => api.get('/experts/me/knowledge'),

  createKnowledgeArticle: (data: any) =>
    api.post('/experts/me/knowledge', data),

  updateKnowledgeArticle: (id: string, data: any) =>
    api.put(`/experts/me/knowledge/${id}`, data),

  getExpertMeetings: () => api.get('/experts/me/meetings'),

  createMeeting: (data: any) => api.post('/experts/me/meetings', data),

  updateMeeting: (id: string, data: any) =>
    api.put(`/experts/me/meetings/${id}`, data),
};

// ═══════════════════════════════════════════════════════════════
//  SHOP API
// ═══════════════════════════════════════════════════════════════

export const shopAPI = {
  getDashboard: () => api.get('/shop/dashboard'),

  getProducts: (params?: { category?: string; search?: string }) =>
    api.get('/shop/products', { params }),

  getProductById: (id: string) => api.get(`/shop/products/${id}`),

  addProduct: (formData: FormData) =>
    api.post('/shop/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateProduct: (id: string, data: any) =>
    api.put(`/shop/products/${id}`, data),

  deleteProduct: (id: string) => api.delete(`/shop/products/${id}`),

  getOrders: (params?: { status?: string }) =>
    api.get('/shop/orders', { params }),

  updateOrderStatus: (orderId: string, data: { status: string }) =>
    api.put(`/shop/orders/${orderId}`, data),

  createOrder: (data: any) => api.post('/shop/orders', data),
};

// ═══════════════════════════════════════════════════════════════
//  SYNC API
// ═══════════════════════════════════════════════════════════════

export const syncAPI = {
  sync: (actions: any[]) => api.post('/sync', { actions }),
};

// ═══════════════════════════════════════════════════════════════
//  EXPORTS
// ═══════════════════════════════════════════════════════════════

export { BASE_URL, SOCKET_URL };
export default api;
