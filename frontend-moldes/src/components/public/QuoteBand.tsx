import { Link } from 'react-router-dom';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';
import { useSite } from '../../contexts/SiteContext';

// Bloco de chamada para orçamento, usado no fim das páginas.
export function QuoteBand() {
  const site = useSite();
  return (
    <section className="container-page pb-16 pt-4 sm:pb-24">
      <div className="relative flex flex-col gap-8 overflow-hidden rounded-3xl bg-ink px-6 py-10 text-white sm:px-12 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:px-20 lg:py-20">
        <div className="relative z-10 max-w-xl">
          <h2 className="heading-2">Vai comprar em quantidade?</h2>
          <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
            Envie a lista de moldes e as quantidades. Respondemos com valores e prazo de produção.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={site.quoteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-primary-soft text-primary-dark hover:bg-primary-pale"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Pedir orçamento
            </a>
            <Link to="/catalogo" className="btn border-white/30 text-white hover:border-white">
              Ver catálogo
            </Link>
          </div>
        </div>

        {/* Amostras de cor, só decorativas */}
        <div className="relative z-10 hidden shrink-0 gap-6 md:flex" aria-hidden="true">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/5 lg:h-32 lg:w-32">
            <div className="h-20 w-20 rounded-full bg-linear-to-br from-primary-soft to-primary lg:h-24 lg:w-24" />
          </div>
          <div className="mt-12 flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/5 lg:h-32 lg:w-32">
            <div className="h-20 w-20 rounded-full bg-linear-to-br from-[#accec5] to-secondary lg:h-24 lg:w-24" />
          </div>
        </div>
      </div>
    </section>
  );
}
