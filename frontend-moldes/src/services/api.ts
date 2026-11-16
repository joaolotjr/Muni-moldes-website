import axios from 'axios';

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

export const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/admin/login';
};
