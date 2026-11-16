import { PageHeader } from '../../components/public/PageHeader';
import { QuoteBand } from '../../components/public/QuoteBand';

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
  return (
    <div className="flex-1">
      <PageHeader eyebrow="A fábrica" title="Moldes feitos por quem conhece a rotina da confeitaria.">
        A Muni Moldes nasceu dentro de uma cozinha e hoje fabrica moldes para confeitarias,
        lojistas e revendedores.
      </PageHeader>

      <section className="border-b border-line">
        <div className="container-page grid gap-10 py-16 md:grid-cols-[1fr_1.6fr] md:gap-16">
          <div>
            <p className="eyebrow">Nossa história</p>
            <img src="/logo.png" alt="Selo Muni Moldes, fábrica de moldes" className="mt-6 hidden w-48 md:block" />
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-ink-soft">
            <p>
              A história da Muni Moldes não começou em uma fábrica, e sim em uma cozinha. A
              Mariluci, confeiteira, queria criar doces com detalhes únicos e percebeu que faltavam
              no mercado moldes que fossem bonitos, bem acabados e duráveis.
            </p>
            <p>
              Ela passou a testar e produzir os próprios moldes de silicone. O que era uma
              ferramenta para uso próprio chamou a atenção de outras confeiteiras, e os pedidos
              começaram a chegar.
            </p>
            <p className="text-ink">
              Hoje a Muni Moldes é uma fábrica dedicada a moldes para confeitaria e artesanato,
              com o mesmo cuidado no detalhe que deu origem a tudo.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-page py-16">
          <p className="eyebrow">Como trabalhamos</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            O que você recebe em cada molde
          </h2>
          <div className="mt-10 grid gap-px border border-line bg-line md:grid-cols-3">
            {principles.map((item, index) => (
              <div key={item.title} className="bg-white p-6">
                <span className="font-mono text-sm text-rose">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <QuoteBand />
    </div>
  );
}
