const SEEN_KEY = 'muni_intro_seen';
/** Duração total da abertura, em ms. Igual à animação muni-cover-out (index.css). */
export const INTRO_MS = 2000;
/** Quando o conteúdo da página começa a entrar, para cruzar com a saída da abertura. */
export const INTRO_HERO_OFFSET_MS = 1300;

/**
 * Decide se a abertura aparece: só na primeira visita da sessão e nunca para
 * quem pediu menos movimento ao sistema. `?intro` na URL força a exibição.
 */
export function shouldShowIntro(): boolean {
  if (typeof window === 'undefined') return false;
  if (new URLSearchParams(window.location.search).has('intro')) return true;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return sessionStorage.getItem(SEEN_KEY) !== '1';
  } catch {
    return false;
  }
}

/** Marca a abertura como vista nesta sessão do navegador. */
export function markIntroSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    // Navegação privada sem armazenamento: a abertura só reaparece ao recarregar.
  }
}
