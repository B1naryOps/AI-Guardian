import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global errors (like 401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid/expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Ideally redirect to login or trigger context logout
      // For now, reloading forces the AuthContext to re-evaluate
      if (window.location.pathname !== '/auth' && window.location.pathname !== '/') {
        window.location.reload();
      }
    }
    const message = error.response?.data?.detail || "Erreur de connexion";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;