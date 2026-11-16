import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Mail, Menu, X } from 'lucide-react';
import { InstagramIcon } from '../icons/InstagramIcon';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';
import { defaultQuoteMessage, site, whatsappLink } from '../../config/site';

const navItems = [
  { to: '/', label: 'Início', end: true },
  { to: '/catalogo', label: 'Catálogo', end: false },
  { to: '/sobre', label: 'Sobre nós', end: false },
  { to: '/noticias', label: 'Notícias', end: false },
  { to: '/contato', label: 'Contato', end: false },
];

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const quoteUrl = whatsappLink(defaultQuoteMessage);

  return (
    <div className="flex min-h-screen flex-col bg-surface font-sans text-ink selection:bg-primary-soft selection:text-primary-dark">
      <header className="sticky top-0 z-40 border-b border-line-soft bg-surface shadow-soft">
        <div className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img src="/logo.png" alt="" className="h-10 w-10 shrink-0 md:h-11 md:w-11" />
            <span className="truncate text-base font-bold uppercase tracking-[0.18em] md:text-xl">
              {site.name}
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex lg:gap-10" aria-label="Principal">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `border-b-2 pb-1 text-[15px] transition-colors duration-300 ${
                    isActive
                      ? 'border-primary-soft font-bold text-primary'
                      : 'border-transparent text-ink-soft hover:text-primary'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <a
            href={quoteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary hidden min-h-11 py-2.5 md:inline-flex"
          >
            Solicitar orçamento
          </a>

          {/* No celular: atalho de orçamento e menu, com área de toque de 44px */}
          <div className="flex shrink-0 items-center gap-1 md:hidden">
            <a
              href={quoteUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Solicitar orçamento pelo WhatsApp"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
            <button
              type="button"
              className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="border-t border-line-soft bg-surface md:hidden" aria-label="Principal">
            <div className="container-page flex flex-col pb-5 pt-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `border-b border-line-soft py-4 font-serif text-lg ${
                      isActive ? 'font-semibold text-primary' : 'text-ink'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <a href={quoteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-5">
                <WhatsAppIcon className="h-4 w-4" />
                Solicitar orçamento
              </a>
            </div>
          </nav>
        )}
      </header>

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-line-soft bg-surface-high">
        <div className="container-page grid gap-10 py-12 md:grid-cols-3 md:gap-12 md:py-16">
          <div>
            <p className="font-serif text-xl italic">{site.name}</p>
            <p className="mt-4 max-w-sm font-serif text-sm leading-relaxed text-ink-soft">
              Fábrica de moldes para chocolate e confeitaria. Atendemos pedidos em quantidade
              para confeitarias, lojistas e revendedores.
            </p>
            <div className="mt-6 flex gap-2">
              <a href={quoteUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-11 w-11 items-center justify-center rounded-full text-outline transition-colors hover:bg-white hover:text-primary">
                <WhatsAppIcon className="h-5 w-5" />
              </a>
              <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full text-outline transition-colors hover:bg-white hover:text-primary">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href={`mailto:${site.email}`} aria-label="E-mail" className="flex h-11 w-11 items-center justify-center rounded-full text-outline transition-colors hover:bg-white hover:text-primary">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-[2fr_3fr] gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">Navegação</p>
              <ul className="mt-5 space-y-3 text-sm">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="text-ink-soft underline-offset-4 hover:underline hover:decoration-primary-soft">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">Atendimento</p>
              <ul className="mt-5 space-y-3 text-sm text-ink-soft">
                <li>
                  <a href={quoteUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline hover:decoration-primary-soft">
                    {site.phoneDisplay}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${site.email}`} className="text-[13px] underline-offset-4 hover:underline hover:decoration-primary-soft">
                    {site.email}
                  </a>
                </li>
                <li>{site.businessHours}</li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-soft sm:p-8">
            <p className="heading-3">Peça seu orçamento</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Fale direto com a fábrica pelo WhatsApp e receba o orçamento da sua lista de moldes.
            </p>
            <a href={quoteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-5 w-full">
              <WhatsAppIcon className="h-4 w-4" />
              Chamar no WhatsApp
            </a>
          </div>
        </div>

        <div className="border-t border-line-soft">
          <div className="container-page flex flex-col justify-between gap-2 py-6 font-serif text-xs text-outline sm:flex-row">
            <p>&copy; {new Date().getFullYear()} {site.name}. Todos os direitos reservados.</p>
            <Link to="/admin" className="hover:text-ink">Área restrita</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
