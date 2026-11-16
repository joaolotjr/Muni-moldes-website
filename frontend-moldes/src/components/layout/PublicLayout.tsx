import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { InstagramIcon } from '../icons/InstagramIcon';
import { WhatsAppIcon } from '../icons/WhatsAppIcon';
import { defaultQuoteMessage, site, whatsappLink } from '../../config/site';

const navItems = [
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/sobre', label: 'A fábrica' },
  { to: '/contato', label: 'Contato' },
];

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const quoteUrl = whatsappLink(defaultQuoteMessage);

  return (
    <div className="flex min-h-screen flex-col bg-paper font-sans text-ink">
      {/* Faixa de atendimento */}
      <div className="bg-ink text-white">
        <div className="container-page flex h-9 items-center justify-between gap-4 text-xs">
          <p className="truncate text-white/75">
            Atendimento a confeitarias, lojistas e revendedores
          </p>
          <a
            href={quoteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1.5 font-medium hover:underline"
          >
            <WhatsAppIcon className="h-3.5 w-3.5" />
            {site.phoneDisplay}
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="container-page flex h-16 items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-11 w-11" />
            <span className="leading-none">
              <span className="block text-[17px] font-bold tracking-tight">{site.name}</span>
              <span className="eyebrow mt-1 block text-[10px]">{site.tagline}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `border-b-2 py-5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-ink text-ink'
                      : 'border-transparent text-ink-soft hover:text-ink'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <a href={quoteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-quote py-2.5">
              Solicitar orçamento
            </a>
          </nav>

          <button
            type="button"
            className="-mr-2 p-2 md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="border-t border-line bg-white md:hidden" aria-label="Principal">
            <div className="container-page flex flex-col py-3">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-line py-3.5 text-base font-medium"
                >
                  {item.label}
                </Link>
              ))}
              <a href={quoteUrl} target="_blank" rel="noopener noreferrer" className="btn btn-quote mt-4">
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

      <footer className="mt-auto bg-ink text-white">
        <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-lg font-bold tracking-tight">{site.name}</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">
              Fábrica de moldes para chocolate e confeitaria. Atendemos pedidos em quantidade
              para confeitarias, lojistas e revendedores.
            </p>
          </div>

          <div>
            <p className="eyebrow text-white/50">Navegação</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link to="/catalogo" className="text-white/80 hover:text-white">Catálogo de moldes</Link></li>
              <li><Link to="/sobre" className="text-white/80 hover:text-white">A fábrica</Link></li>
              <li><Link to="/contato" className="text-white/80 hover:text-white">Contato</Link></li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-white/50">Atendimento</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/80">
              <li>
                <a href={quoteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                  <WhatsAppIcon className="h-4 w-4" />
                  {site.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a>
              </li>
              <li>
                <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-white">
                  <InstagramIcon className="h-4 w-4" />
                  {site.instagramHandle}
                </a>
              </li>
              <li className="text-white/50">{site.businessHours}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container-page flex flex-col justify-between gap-2 py-5 text-xs text-white/45 sm:flex-row">
            <p>&copy; {new Date().getFullYear()} {site.name}. Todos os direitos reservados.</p>
            <Link to="/admin" className="hover:text-white/80">Área restrita</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
