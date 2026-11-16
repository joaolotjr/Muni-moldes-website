import { Link } from 'react-router-dom';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';
import { defaultQuoteMessage, whatsappLink } from '../../config/site';

// Faixa de chamada para orçamento, usada no fim das páginas.
export function QuoteBand() {
  return (
    <section className="bg-ink text-white">
      <div className="container-page flex flex-col items-start justify-between gap-8 py-14 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Vai comprar em quantidade?
          </h2>
          <p className="mt-3 max-w-xl text-white/70">
            Envie a lista de moldes e as quantidades. Respondemos com valores e prazo de produção.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <a
            href={whatsappLink(defaultQuoteMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-quote"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Pedir orçamento
          </a>
          <Link to="/catalogo" className="btn border-white/30 text-white hover:border-white">
            Ver catálogo
          </Link>
        </div>
      </div>
    </section>
  );
}
