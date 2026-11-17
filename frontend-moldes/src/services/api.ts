import axios from 'axios';
import { clearSession } from './session';

// Sem VITE_API_URL, usa o mesmo endereço pelo qual o site foi aberto (localhost, IP da rede etc.).
export const API_URL: string =
  import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:3333`;

export const api = axios.create({
  baseURL: API_URL,
  // A sessão do painel vai em cookie HttpOnly; sem isto o navegador não o envia.
  withCredentials: true,
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
  // Pede à API para apagar o cookie. keepalive deixa o pedido terminar mesmo
  // com a página mudando; se falhar, o cookie vence sozinho em poucos minutos.
  void fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include', keepalive: true }).catch(
    () => undefined,
  );
  clearSession();
  if (window.location.pathname === '/admin/login') return;
  window.location.href = reason ? `/admin/login?motivo=${reason}` : '/admin/login';
};
