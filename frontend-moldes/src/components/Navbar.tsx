import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import type { NavItem } from '../types';


const navItems: NavItem[] = [
  { label: 'Home', href: '#home' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Catálogo', href: '#catalogo' },
  { label: 'Notícias', href: '#noticias' },
  { label: 'Contato', href: '#contato' },
];

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-munilight/95 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo Section - CSS Recreated Stamp Style */}
        <a href="#" className="flex items-center gap-4 group">
            {/* Logo Container - Mimics the circular brand stamp */}
            <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 transition-transform duration-500 group-hover:rotate-6">
                {/* Layer 1: Outer Thin Pink Ring */}
                <div className="absolute inset-0 rounded-full border border-munipink opacity-80 bg-munilight shadow-sm"></div>
                
                {/* Layer 2: Thick Green Ring */}
                <div className="absolute inset-1 rounded-full border-[4px] border-munigreen opacity-90"></div>
                
                {/* Layer 3: Inner Thin Pink Dashed Ring */}
                <div className="absolute inset-3 rounded-full border border-dashed border-munipink/70 z-10"></div>
                
                {/* Center Icon Container */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                    {/* Cupcake Icon Placeholder */}
                    <img 
                        src="https://cdn-icons-png.flaticon.com/512/4525/4525833.png" 
                        alt="Muni Moldes Ícone" 
                        className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                    />
                </div>
                
                {/* Decorative Sparkles (CSS only) */}
                <div className="absolute top-4 right-4 w-1 h-1 bg-munipink rounded-full animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-munigreen/50 rounded-full"></div>
            </div>

            {/* Brand Typography */}
            <div className="hidden sm:flex flex-col justify-center">
                <span className={`font-serif text-2xl md:text-3xl font-bold tracking-tight text-munidark leading-none group-hover:text-munigreen transition-colors duration-300`}>
                    Muni Moldes
                </span>
                <div className="flex items-center gap-2 mt-1">
                    <span className="h-px w-4 bg-munipink"></span>
                    <span className="text-[0.65rem] md:text-[0.75rem] uppercase tracking-[0.2em] text-munidark/60 font-medium">
                        Fábrica de Moldes
                    </span>
                </div>
            </div>
        </a>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-munidark text-sm uppercase tracking-widest font-medium hover:text-munipink transition-colors relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-munipink after:left-0 after:-bottom-1 after:transition-all hover:after:w-full"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contato"
            className="px-8 py-3 bg-munigreen text-white rounded-full font-bold hover:bg-munipink transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs uppercase tracking-widest border border-white/20"
          >
            Área B2B
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-munidark p-2 hover:text-munipink transition-colors bg-white/50 rounded-full backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-munilight/98 backdrop-blur-xl shadow-xl lg:hidden flex flex-col py-8 px-6 gap-6 border-t border-munipink/20 animate-in slide-in-from-top-5 duration-300 h-screen z-40">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-munidark text-2xl font-serif font-medium border-b border-munidark/5 pb-4 flex justify-between items-center group"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
              <span className="text-munipink opacity-0 group-hover:opacity-100 transition-opacity text-lg">→</span>
            </a>
          ))}
          <a
            href="#contato"
            className="text-center bg-munigreen text-white py-4 rounded-xl font-bold uppercase tracking-widest mt-4 shadow-lg"
            onClick={() => setMobileMenuOpen(false)}
          >
            Acesso B2B
          </a>
        </div>
      )}
    </nav>
  );
};