import axios from 'axios';

const API_BASE = '/api/admin';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const login = (email: string, password: string) =>
  api.post('/login', { email, password });

export const getMe = () => api.get('/me');

// Dashboard
export const getDashboard = () => api.get('/dashboard');

// Farmers
export const getFarmers = (params?: Record<string, string | number>) =>
  api.get('/farmers', { params });
export const getFarmer = (id: string) => api.get(`/farmers/${id}`);
export const updateFarmer = (id: string, data: Record<string, unknown>) =>
  api.put(`/farmers/${id}`, data);
export const deleteFarmer = (id: string) => api.delete(`/farmers/${id}`);

// Experts
export const getExperts = (params?: Record<string, string | number>) =>
  api.get('/experts', { params });
export const getExpert = (id: string) => api.get(`/experts/${id}`);
export const updateExpert = (id: string, data: Record<string, unknown>) =>
  api.put(`/experts/${id}`, data);
export const deleteExpert = (id: string) => api.delete(`/experts/${id}`);

// Shops
export const getShops = (params?: Record<string, string | number>) =>
  api.get('/shops', { params });
export const updateShop = (id: string, data: Record<string, unknown>) =>
  api.put(`/shops/${id}`, data);
export const deleteShop = (id: string) => api.delete(`/shops/${id}`);

// Crops
export const getCrops = (params?: Record<string, string | number>) =>
  api.get('/crops', { params });
export const createCrop = (data: Record<string, unknown>) =>
  api.post('/crops', data);
export const updateCrop = (id: string, data: Record<string, unknown>) =>
  api.put(`/crops/${id}`, data);
export const deleteCrop = (id: string) => api.delete(`/crops/${id}`);

// Guides
export const getGuides = (params?: Record<string, string | number>) =>
  api.get('/guides', { params });
export const createGuide = (data: Record<string, unknown>) =>
  api.post('/guides', data);
export const updateGuide = (id: string, data: Record<string, unknown>) =>
  api.put(`/guides/${id}`, data);
export const deleteGuide = (id: string) => api.delete(`/guides/${id}`);

// Tips
export const getTips = (params?: Record<string, string | number>) =>
  api.get('/tips', { params });
export const createTip = (data: Record<string, unknown>) =>
  api.post('/tips', data);
export const updateTip = (id: string, data: Record<string, unknown>) =>
  api.put(`/tips/${id}`, data);
export const deleteTip = (id: string) => api.delete(`/tips/${id}`);

// Meetings
export const getMeetings = (params?: Record<string, string | number>) =>
  api.get('/meetings', { params });
export const updateMeeting = (id: string, data: Record<string, unknown>) =>
  api.put(`/meetings/${id}`, data);
export const deleteMeeting = (id: string) => api.delete(`/meetings/${id}`);

// AI
export const getDiagnoses = (params?: Record<string, string | number>) =>
  api.get('/diagnoses', { params });
export const getPredictions = (params?: Record<string, string | number>) =>
  api.get('/predictions', { params });

// Notifications
export const getNotifications = (params?: Record<string, string | number>) =>
  api.get('/notifications', { params });
export const broadcastNotification = (data: {
  title: string;
  message: string;
  targetRole: string;
}) => api.post('/notifications/broadcast', data);

// Products
export const getProducts = (params?: Record<string, string | number>) =>
  api.get('/products', { params });

// Orders
export const getOrders = (params?: Record<string, string | number>) =>
  api.get('/orders', { params });

// User Guides
export const getUserGuides = (params?: Record<string, string | number>) =>
  api.get('/user-guides', { params });
export const approveUserGuide = (id: string) =>
  api.put(`/user-guides/${id}/approve`);
export const rejectUserGuide = (id: string, reason: string) =>
  api.put(`/user-guides/${id}/reject`, { reason });

export default api;
