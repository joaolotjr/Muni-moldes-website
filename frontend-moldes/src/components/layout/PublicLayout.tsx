import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Instagram, Phone, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-munibg font-sans selection:bg-munipink/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-munipink/20 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-transparent group-hover:border-munipink/30 transition-all duration-300">
                <img src="/logo.png" alt="Muni Moldes" className="w-full h-full object-cover bg-white" onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=MM&background=bd8d8a&color=fff';
                }}/>
              </div>
              <span className="font-heading font-bold text-2xl tracking-tight text-munidark transition-colors">
                Muni Moldes
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-munidark/80 hover:text-munigreen transition-colors">Home</Link>
              <Link to="/catalogo" className="text-sm font-medium text-munidark/80 hover:text-munigreen transition-colors">Catálogo</Link>
              <Link to="/sobre" className="text-sm font-medium text-munidark/80 hover:text-munigreen transition-colors">Sobre Nós</Link>
              <Link to="/contato" className="text-sm font-medium text-munidark/80 hover:text-munigreen transition-colors">Contato</Link>
              <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-munipink hover:bg-[#a67c79] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-md shadow-munipink/20 hover:-translate-y-0.5">
                <MessageCircle className="w-4 h-4" />
                Orçamento
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-munidark hover:text-munigreen transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-munipink/20 absolute w-full animate-in slide-in-from-top-4 duration-200">
            <div className="px-4 pt-2 pb-6 flex flex-col gap-4">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-munidark p-2 hover:bg-munibg rounded-lg">Home</Link>
              <Link to="/catalogo" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-munidark p-2 hover:bg-munibg rounded-lg">Catálogo de Moldes</Link>
              <Link to="/sobre" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-munidark p-2 hover:bg-munibg rounded-lg">Sobre Nós</Link>
              <Link to="/contato" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-munidark p-2 hover:bg-munibg rounded-lg">Contato</Link>
              <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-munipink text-white p-3 rounded-xl font-medium mt-2">
                <MessageCircle className="w-5 h-5" />
                Solicitar Orçamento
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 pt-20 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-munipink/20 pt-16 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-munibg border border-munipink/20">
                  <img src="/logo.png" alt="Muni Moldes Logo" className="w-full h-full object-cover" onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}/>
                </div>
                <h3 className="text-2xl font-heading font-bold text-munidark tracking-tight">Muni Moldes</h3>
              </div>
              <p className="text-munidark/70 text-sm leading-relaxed max-w-xs font-sans">
                Fábrica de moldes artesanais com qualidade premium. Transformando sua criatividade com detalhes perfeitos.
              </p>
            </div>
            
            <div>
              <h4 className="text-munidark font-heading font-semibold text-lg mb-4">Links Rápidos</h4>
              <ul className="space-y-3">
                <li><Link to="/catalogo" className="text-munidark/70 hover:text-munipink text-sm transition-colors">Ver Catálogo</Link></li>
                <li><Link to="/sobre" className="text-munidark/70 hover:text-munipink text-sm transition-colors">Nossa História</Link></li>
                <li><Link to="/contato" className="text-munidark/70 hover:text-munipink text-sm transition-colors">Fale Conosco</Link></li>
                <li><Link to="/admin" className="text-munidark/40 hover:text-munipink text-xs transition-colors mt-2 inline-block">Área Restrita</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-munidark font-heading font-semibold text-lg mb-4">Contato</h4>
              <ul className="space-y-3">
                <li className="text-munidark/70 text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4 text-munigreen" />
                  (11) 99999-9999
                </li>
                <li>
                  <a href="#" className="text-munidark/70 hover:text-munipink text-sm transition-colors flex items-center gap-2 w-fit">
                    <Instagram className="w-4 h-4" />
                    @munimoldes
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-munipink/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-munidark/50 text-sm">
              &copy; {new Date().getFullYear()} Muni Moldes. Todos os direitos reservados.
            </p>
            <p className="text-munidark/40 text-xs">
              Criado com excelência.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/5511999999999" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        aria-label="Fale conosco no WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute right-full mr-4 bg-white text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Fale com a gente!
        </span>
      </a>
    </div>
  );
}
