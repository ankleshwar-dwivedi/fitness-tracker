// src/lib/apiClient.js
import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
  // The Vite proxy handles the base URL during development.
  // For production builds, you might need to set baseURL explicitly
  // or configure your production server similarly.
  // baseURL: '/api', // Using relative path because of Vite proxy
  timeout: 10000, // Request timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // IMPORTANT: This sends cookies (like JWT) with requests
});

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

// --- Error Handling (Optional Interceptor) ---
// You can add interceptors to handle responses globally, e.g., redirect on 401
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      // Be careful not to create redirect loops
      console.error("Unauthorized access - potentially redirecting to login.");
      // window.location.href = '/login'; // Or use React Router navigation
    }
    return Promise.reject(error);
  }
);


export default apiClient;