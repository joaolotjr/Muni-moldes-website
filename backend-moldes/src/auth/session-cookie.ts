import type { CookieOptions, Request, Response } from 'express';
import { isProduction } from '../security';

/**
 * A sessão do painel vai em um cookie HttpOnly: o JavaScript da página não
 * consegue ler o token, então um script malicioso não tem como roubá-lo.
 * SameSite=Strict impede que outro site dispare ações usando o cookie.
 */
export const SESSION_COOKIE = 'mm_session';

function cookieOptions(): CookieOptions {
  // COOKIE_SECURE=false só faz sentido em desenvolvimento, sem HTTPS.
  const secure =
    process.env.COOKIE_SECURE !== undefined
      ? process.env.COOKIE_SECURE === 'true'
      : isProduction();
  return { httpOnly: true, sameSite: 'strict', secure, path: '/' };
}

export function setSessionCookie(
  res: Response,
  token: string,
  maxAgeMinutes: number,
) {
  res.cookie(SESSION_COOKIE, token, {
    ...cookieOptions(),
    maxAge: maxAgeMinutes * 60_000,
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, cookieOptions());
}

/** Lê o token do cookie da requisição. */
export function sessionTokenFromRequest(req: Request): string | null {
  const header = req.headers?.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) continue;
    if (part.slice(0, index).trim() === SESSION_COOKIE) {
      try {
        return decodeURIComponent(part.slice(index + 1).trim()) || null;
      } catch {
        return null;
      }
    }
  }
  return null;
}
