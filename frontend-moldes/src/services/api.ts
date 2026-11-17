import axios from 'axios';

// Sem VITE_API_URL, usa o mesmo endereço pelo qual o site foi aberto (localhost, IP da rede etc.).
export const API_URL: string =
  import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:3333`;

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
    // No próprio login, o 401 é só "credenciais inválidas": a tela mostra a mensagem.
    const isLoginAttempt = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginAttempt) {
      logout();
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

// Nome de quem entrou, só para mostrar no cabeçalho do painel.
export const setUserName = (name: string | undefined) => {
  if (name) localStorage.setItem('user_name', name);
};
export const getUserName = () => localStorage.getItem('user_name');

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user_name');
  window.location.href = '/admin/login';
};
