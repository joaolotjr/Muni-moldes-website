import { useSyncExternalStore } from 'react';
import type { Permission } from '../config/permissions';

// Dados de quem está logado, guardados no navegador só para montar a tela.
// O token de acesso NÃO fica aqui: ele vai em um cookie HttpOnly, que o
// JavaScript não consegue ler. A API confere tudo de novo a cada requisição.
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  permissions: Permission[];
}

export interface SessionResponse {
  idle_minutes: number;
  user: SessionUser;
}

const KEYS = {
  user: 'session_user',
  idleMinutes: 'session_idle_minutes',
  renewedAt: 'session_renewed_at',
  lastActivity: 'session_last_activity',
} as const;

const DEFAULT_IDLE_MINUTES = 5;
const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedUser: SessionUser | null = null;

function notify() {
  listeners.forEach((listener) => listener());
}

export function getSessionUser(): SessionUser | null {
  const raw = localStorage.getItem(KEYS.user);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedUser = raw ? (JSON.parse(raw) as SessionUser) : null;
    } catch {
      cachedUser = null;
    }
  }
  return cachedUser;
}

export function getIdleMs() {
  const minutes = Number(localStorage.getItem(KEYS.idleMinutes));
  return (minutes > 0 ? minutes : DEFAULT_IDLE_MINUTES) * 60_000;
}

/** Há quanto tempo a sessão foi aberta ou renovada pela última vez. */
export function getSessionAge() {
  return Date.now() - Number(localStorage.getItem(KEYS.renewedAt) ?? 0);
}

export function getLastActivity() {
  return Number(localStorage.getItem(KEYS.lastActivity) ?? 0);
}

export function touchActivity() {
  localStorage.setItem(KEYS.lastActivity, String(Date.now()));
}

/** Guarda o resultado do login ou da renovação. */
export function saveSession(session: SessionResponse, { activity = false } = {}) {
  localStorage.setItem(KEYS.user, JSON.stringify(session.user));
  localStorage.setItem(KEYS.idleMinutes, String(session.idle_minutes));
  localStorage.setItem(KEYS.renewedAt, String(Date.now()));
  if (activity) touchActivity();
  notify();
}

export function clearSession() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  // Chaves de versões anteriores, quando o token ainda ficava no navegador.
  ['token', 'user_name', 'session_token_at'].forEach((key) => localStorage.removeItem(key));
  notify();
}

export function hasPermission(permission: Permission) {
  return getSessionUser()?.permissions.includes(permission) ?? false;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Outra aba entrou, saiu ou renovou a sessão.
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

/** Usuário logado, atualizado quando a sessão muda (inclusive em outra aba). */
export function useSessionUser() {
  return useSyncExternalStore(subscribe, getSessionUser);
}
