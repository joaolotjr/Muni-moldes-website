import { useEffect, useState, type AnimationEvent, type CSSProperties } from 'react';
import { siteName } from '../../config/site';
import { INTRO_MS, markIntroSeen } from '../../utils/intro';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

/**
 * Abertura da home: selo da marca, anel desenhado, nome e traço, depois some.
 * Qualquer toque, clique, rolagem ou tecla pula a abertura.
 */
export function IntroSplash({ onDone }: { onDone: () => void }) {
  const [skipping, setSkipping] = useState(false);

  useEffect(() => {
    markIntroSeen();

    const skip = () => setSkipping(true);
    const events = ['keydown', 'wheel', 'touchstart'] as const;
    events.forEach((event) => window.addEventListener(event, skip, { passive: true, once: true }));
    // Reserva: se a animação não avisar o fim (aba em segundo plano), encerra mesmo assim.
    const fallback = window.setTimeout(onDone, INTRO_MS + 800);
    return () => {
      events.forEach((event) => window.removeEventListener(event, skip));
      window.clearTimeout(fallback);
    };
  }, [onDone]);

  const handleEnd = (event: AnimationEvent<HTMLDivElement>) => {
    // Só a animação da própria cobertura encerra; as dos filhos também disparam este evento.
    if (event.target === event.currentTarget) onDone();
  };

  return (
    <div
      aria-hidden="true"
      onPointerDown={() => setSkipping(true)}
      onAnimationEnd={handleEnd}
      className={`intro-cover fixed inset-0 z-[100] flex cursor-pointer items-center justify-center bg-surface ${
        skipping ? 'is-skipping' : ''
      }`}
    >
      <div className="flex flex-col items-center px-6 text-center">
        <div className="relative h-36 w-36 sm:h-44 sm:w-44">
          <svg viewBox="0 0 100 100" className="intro-ring absolute inset-0 h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="48" pathLength={1} style={delay(150)} />
          </svg>
          <img
            src="/logo.png"
            alt=""
            className="intro-seal absolute inset-[9%] h-[82%] w-[82%] object-contain"
            style={delay(0)}
          />
        </div>

        <p
          className="intro-step mt-7 font-serif text-3xl font-semibold uppercase tracking-[0.18em] text-primary-dark sm:text-4xl"
          style={delay(350)}
        >
          {siteName}
        </p>
        <span className="intro-line mt-4 block h-px w-28 bg-primary-soft sm:w-36" style={delay(750)} />
        <p
          className="intro-step mt-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-ink-soft"
          style={delay(900)}
        >
          Fábrica de moldes
        </p>
      </div>
    </div>
  );
}
