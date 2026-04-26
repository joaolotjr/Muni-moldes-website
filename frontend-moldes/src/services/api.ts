import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3333',
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/admin/login';
};
