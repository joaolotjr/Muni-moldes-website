import axios from 'axios';
import { clearSession, getToken } from './session';

// Sem VITE_API_URL, usa o mesmo endereço pelo qual o site foi aberto (localhost, IP da rede etc.).
export const API_URL: string =
  import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:3333`;

export const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use((config) => {
  const token = getToken();
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
      logout('expirada');
    }
    return Promise.reject(error);
  }
);

export type LogoutReason = 'inatividade' | 'expirada';

/** Encerra a sessão e volta para o login. O motivo vira um aviso na tela. */
export const logout = (reason?: LogoutReason) => {
  clearSession();
  if (window.location.pathname === '/admin/login') return;
  window.location.href = reason ? `/admin/login?motivo=${reason}` : '/admin/login';
};
