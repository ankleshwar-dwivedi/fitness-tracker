// src/lib/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
//----Admin Endpoints----------
export const getAdminStats = () => apiClient.get('/api/admin/stats');
export const getAllAdminUsers = () => apiClient.get('/api/admin/users');
export const getAdminUserById = (userId) => apiClient.get(`/api/admin/users/${userId}`);
export const updateAdminUser = (userId, userData) => apiClient.put(`/api/admin/users/${userId}`, userData);
export const adminResetUserPassword = (userId) => apiClient.post(`/api/admin/users/${userId}/reset-password`);
export const deleteAdminUser = (userId) => apiClient.delete(`/api/admin/users/${userId}`);
// --- Authentication Endpoints ---
export const registerUser = (userData) => apiClient.post('/api/auth/register', userData);
export const loginUser = (credentials) => apiClient.post('/api/auth/login', credentials);
export const logoutUser = () => apiClient.post('/api/auth/logout');

// --- User Profile Endpoints ---
export const getProfile = () => apiClient.get('/api/profile');
export const updateProfile = (profileData) => apiClient.put('/api/profile', profileData);

// --- User Status Endpoints ---
export const getStatus = () => apiClient.get('/api/profile/status');
export const updateStatus = (statusData) => apiClient.put('/api/profile/status', statusData);

// --- User Meal Plan Endpoints ---
export const getMealPlan = (date) => apiClient.get(`/api/profile/meal-plans/${date}`);
export const updateMealPlan = (date, mealPlanData) => apiClient.put(`/api/profile/meal-plans/${date}`, mealPlanData);

// --- User Water Intake Endpoints ---
export const getWaterIntake = (date) => apiClient.get(`/api/profile/water-intake/${date}`);
export const updateWaterIntake = (date, waterIntakeData) => apiClient.put(`/api/profile/water-intake/${date}`, waterIntakeData);

// --- Chatbot Endpoints ---
export const sendChatMessage = (payload) => apiClient.post('/api/chatbot/message', payload);

// --- Google Calendar Endpoints ---
// Note: Authorization is a redirect, so no direct apiClient call, but we need the status.
export const getGoogleCalendarAuthStatus = () => apiClient.get('/api/google-calendar/status');
// The /api/google-calendar/authorize endpoint will be used as a direct link href
export const listGoogleCalendarEvents = () => apiClient.get('/api/google-calendar/events');
export const createGoogleCalendarEvent = (eventData) => apiClient.post('/api/google-calendar/events', eventData);
export const updateGoogleCalendarEvent = (eventId, eventData) => apiClient.put(`/api/google-calendar/events/${eventId}`, eventData);
// export const deleteGoogleCalendarEvent = (eventId) => apiClient.delete(`/api/google-calendar/events/${eventId}`);


// --- Error Handling (Optional Interceptor) ---
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized access - potentially redirecting to login.");
      // Consider how to handle this globally, e.g., AuthContext might clear user
      // if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      //    window.location.href = '/login';
      // }
    }
    return Promise.reject(error);
  }
);

export default apiClient;