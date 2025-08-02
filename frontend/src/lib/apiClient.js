// src/lib/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  timeout: 15000, // Increased timeout
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// --- Authentication & User Profile ---
export const registerUser = (userData) => apiClient.post('/api/auth/register', userData);
export const loginUser = (credentials) => apiClient.post('/api/auth/login', credentials);
export const logoutUser = () => apiClient.post('/api/auth/logout');
export const getProfile = () => apiClient.get('/api/profile');
export const updateProfile = (profileData) => apiClient.put('/api/profile', profileData);
export const getStatus = () => apiClient.get('/api/profile/status');
export const updateStatus = (statusData) => apiClient.put('/api/profile/status', statusData);
export const getWaterIntake = (date) => apiClient.get(`/api/water-intake/${date}`);
export const updateWaterIntake = (date, waterData) => apiClient.put(`/api/water-intake/${date}`, waterData);

// --- Chatbot ---
export const sendChatMessage = (payload) => apiClient.post('/api/chatbot/message', payload);

// --- Google Calendar ---
export const getGoogleCalendarAuthStatus = () => apiClient.get('/api/google-calendar/status');
export const listGoogleCalendarEvents = () => apiClient.get('/api/google-calendar/events');
export const createGoogleCalendarEvent = (eventData) => apiClient.post('/api/google-calendar/events', eventData);
export const updateGoogleCalendarEvent = (eventId, eventData) => apiClient.put(`/api/google-calendar/events/${eventId}`, eventData);

// === PHASE TWO ENDPOINTS ===

// --- Dashboard ---
export const getTodaySummary = () => apiClient.get('/api/dashboard/today-summary');

// --- External APIs (Proxy) ---
export const searchFoodNutrition = (query) => apiClient.get(`/api/external-apis/food-nutrition`, { params: { query } });
export const getCaloriesBurnedForActivity = (activity, duration_min, weight_kg) => apiClient.get(`/api/external-apis/calories-burned`, { params: { activity, duration_min, weight_kg } });

// --- Meal Plans (New Structure) ---
export const getMealPlanForDate = (date) => apiClient.get(`/api/meal-plans/${date}`);
export const saveMealPlanForDate = (date, mealPlanData) => apiClient.put(`/api/meal-plans/${date}`, mealPlanData);

// --- Workout Logs ---
export const getWorkoutLogForDate = (date) => apiClient.get(`/api/workouts/${date}`);
export const addExerciseToLog = (date, exerciseData) => apiClient.post(`/api/workouts/${date}`, exerciseData);
export const removeExerciseFromLog = (date, exerciseId) => apiClient.delete(`/api/workouts/${date}/${exerciseId}`);
export const updateExerciseInLog = (date, exerciseId, exerciseData) => apiClient.put(`/api/workouts/${date}/${exerciseId}`, exerciseData);

// --- Admin ---
export const getAdminAnalytics = () => apiClient.get('/api/admin/analytics');
export const getAllUsers = () => apiClient.get('/api/admin/users');
export const deleteUserById = (userId) => apiClient.delete(`/api/admin/users/${userId}`);
export const resetUserPassword = (userId, newPassword) => apiClient.put(`/api/admin/users/${userId}/reset-password`, { newPassword });

// --- Global Error Handling Interceptor ---
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401 && window.location.pathname !== '/login') {
      // Automatically log out on 401 from server if not on the login page
      console.error("Unauthorized (401). Token may be invalid. Forcing logout.");
      // This is an aggressive but safe strategy
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default apiClient;