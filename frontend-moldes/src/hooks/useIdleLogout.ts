import { useEffect } from 'react';
import { api, logout } from '../services/api';
import {
  getIdleMs,
  getLastActivity,
  getToken,
  getTokenAge,
  saveSession,
  touchActivity,
  type SessionResponse,
} from '../services/session';

const ACTIVITY_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'scroll', 'touchstart'] as const;
const CHECK_EVERY_MS = 5_000;
const ACTIVITY_THROTTLE_MS = 2_000;
const REFRESH_AFTER_MS = 60_000;

/**
 * Encerra a sessão depois do tempo de inatividade (5 minutos por padrão).
 *
 * Atividade é mexer o mouse, tocar, rolar ou digitar em qualquer aba do painel.
 * Enquanto houver atividade, o token é renovado em segundo plano; sem
 * atividade ele vence sozinho no servidor, um minuto depois desse prazo.
 */
export function useIdleLogout() {
  useEffect(() => {
    let lastWrite = 0;
    let refreshing = false;

    const expired = () => Date.now() - getLastActivity() >= getIdleMs();

    // Voltou depois de muito tempo com a aba fechada: a sessão já não vale.
    if (getLastActivity() > 0 && expired()) {
      logout('inatividade');
      return;
    }
    touchActivity();

    const onActivity = () => {
      const now = Date.now();
      if (now - lastWrite < ACTIVITY_THROTTLE_MS) return;
      // Quem ficou ausente além do limite não "revive" a sessão ao mexer o mouse.
      if (expired()) return;
      lastWrite = now;
      touchActivity();
      void refreshIfNeeded();
    };

    const refreshIfNeeded = async () => {
      if (refreshing || getTokenAge() < REFRESH_AFTER_MS) return;
      // Só renova se a pessoa usou o painel depois que o token atual foi emitido.
      if (Date.now() - getLastActivity() > getTokenAge()) return;
      refreshing = true;
      try {
        const { data } = await api.post<SessionResponse>('/auth/refresh');
        saveSession(data);
      } catch {
        // 401 já encerra a sessão no interceptador; falha de rede tenta de novo depois.
      } finally {
        refreshing = false;
      }
    };

    const check = () => {
      if (!getToken()) return;
      if (expired()) {
        logout('inatividade');
        return;
      }
      void refreshIfNeeded();
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') check();
    };

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));
    document.addEventListener('visibilitychange', onVisible);
    const timer = window.setInterval(check, CHECK_EVERY_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, onActivity));
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
    };
  }, []);
}
