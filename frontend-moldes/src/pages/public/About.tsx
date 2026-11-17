import { QuoteBand } from '../../components/public/QuoteBand';
import { paragraphs } from '../../config/site';
import { useSite } from '../../contexts/SiteContext';

const principles = [
  {
    title: 'Acabamento manual',
    text: 'Cada molde é finalizado à mão e conferido antes de sair da fábrica.',
  },
  {
    title: 'Silicone de qualidade',
    text: 'Material escolhido para desmoldar bem e aguentar o uso repetido da produção.',
  },
  {
    title: 'Detalhe fiel',
    text: 'Vincos, curvas e texturas saem definidos na peça final, molde após molde.',
  },
];

export function About() {
  const site = useSite();
  const story = paragraphs(site.aboutStory);

  return (
    <div className="flex-1">
      <div className="container-page py-10 sm:py-16">
        {/* Abertura */}
        <section className="grid items-center gap-8 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-6 lg:col-span-5">
            <p className="eyebrow">Sobre nós</p>
            <h1 className="heading-1 mt-4">{site.aboutTitle}</h1>
            <p className="mt-5 text-base leading-relaxed text-ink-soft sm:text-lg">
              {site.aboutIntro}
            </p>
          </div>
          <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-white shadow-soft md:col-span-6 md:aspect-auto md:h-[26rem] lg:col-span-7">
            <img src="/logo.png" alt="Selo Muni Moldes, fábrica de moldes" className="h-3/5 object-contain" />
          </div>
        </section>

        {/* A fundadora */}
        <section className="mt-12 rounded-2xl border border-line/40 bg-surface-low p-6 sm:mt-16 sm:p-10 lg:p-16">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                <span className="h-px w-8 bg-secondary" />
                A fundadora
              </p>
              <h2 className="heading-2 mt-4">{site.aboutStoryTitle}</h2>
            </div>
            <div className="space-y-5 leading-relaxed text-ink-soft sm:text-lg">
              {/* Com mais de um parágrafo, o último ganha destaque. */}
              {story.map((paragraph, index) => (
                <p
                  key={index}
                  className={`whitespace-pre-line ${
                    story.length > 1 && index === story.length - 1 ? 'border-l-2 border-primary-soft pl-4 text-ink' : ''
                  }`}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Como trabalhamos */}
        <section className="mt-14 sm:mt-24">
          <div className="text-center">
            <h2 className="heading-2">Como trabalhamos</h2>
            <p className="mx-auto mt-3 max-w-2xl text-ink-soft">O que você recebe em cada molde.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:mt-12 md:grid-cols-3 md:gap-6">
            {principles.map((item, index) => (
              <div
                key={item.title}
                className={`rounded-2xl p-6 sm:p-10 ${
                  index === 1 ? 'border border-primary-soft/40 bg-primary-soft/10' : 'card'
                }`}
              >
                <span className={`font-serif text-2xl font-semibold ${index === 1 ? 'text-primary' : 'text-secondary'}`}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="heading-3 mt-2">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <QuoteBand />
    </div>
  );
}
