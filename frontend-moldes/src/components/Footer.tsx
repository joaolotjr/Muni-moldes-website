import React from 'react';
import { Instagram, Facebook, Linkedin, MapPin, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-munidark text-white/60 py-16 border-t-4 border-munipink">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
            {/* Brand Column */}
            <div className="col-span-1 md:col-span-1">
                <div className="flex items-center gap-4 mb-8 text-white">
                     {/* Logo Container Stamp Style - Dark Mode Version */}
                     <div className="relative w-20 h-20 flex-shrink-0 group">
                        {/* Rings adapted for Dark Background */}
                        <div className="absolute inset-0 rounded-full border border-munipink/40 bg-white/5"></div>
                        <div className="absolute inset-1 rounded-full border-[3px] border-munigreen/60"></div>
                        <div className="absolute inset-3 rounded-full border border-dashed border-munipink/30"></div>
                        
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img 
                                src="https://cdn-icons-png.flaticon.com/512/4525/4525833.png" 
                                alt="Muni Moldes Logo" 
                                className="w-10 h-10 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                        </div>
                     </div>

                     <div className="flex flex-col">
                        <span className="font-serif text-xl font-bold tracking-wide text-munilight">Muni Moldes</span>
                        <span className="text-[0.6rem] uppercase tracking-widest text-munigreen mt-1">Indústria Brasileira</span>
                     </div>
                </div>
                <p className="text-sm leading-relaxed opacity-80 mb-6 font-light">
                    Desde 2018 transformando silicone de platina em ferramentas de precisão para confeitaria e artesanato. Qualidade que se sente no toque e se vê no resultado.
                </p>
                <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-munipink hover:text-white transition-all duration-300 hover:scale-110"><Instagram size={18} /></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-munipink hover:text-white transition-all duration-300 hover:scale-110"><Facebook size={18} /></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-munipink hover:text-white transition-all duration-300 hover:scale-110"><Linkedin size={18} /></a>
                </div>
            </div>
            
            {/* Navigation */}
            <div>
                <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-8 border-l-2 border-munipink pl-3">Navegação</h4>
                <ul className="space-y-4 text-sm">
                    <li><a href="#home" className="hover:text-munipink transition-colors block transform hover:translate-x-1 duration-200">Home</a></li>
                    <li><a href="#sobre" className="hover:text-munipink transition-colors block transform hover:translate-x-1 duration-200">A Fábrica</a></li>
                    <li><a href="#catalogo" className="hover:text-munipink transition-colors block transform hover:translate-x-1 duration-200">Catálogo 2024/25</a></li>
                    <li><a href="#noticias" className="hover:text-munipink transition-colors block transform hover:translate-x-1 duration-200">Blog & Dicas</a></li>
                </ul>
            </div>

            {/* Legal */}
            <div>
                <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-8 border-l-2 border-munipink pl-3">Legal & Suporte</h4>
                <ul className="space-y-4 text-sm">
                    <li><a href="#" className="hover:text-munipink transition-colors block">Política de Atacado</a></li>
                    <li><a href="#" className="hover:text-munipink transition-colors block">Termos de Uso</a></li>
                    <li><a href="#" className="hover:text-munipink transition-colors block">Política de Privacidade</a></li>
                    <li><a href="#" className="hover:text-munipink transition-colors block">Rastrear Pedido</a></li>
                </ul>
            </div>

            {/* Contact Mini */}
            <div>
                <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-8 border-l-2 border-munipink pl-3">Atendimento</h4>
                <ul className="space-y-4 text-sm opacity-80">
                    <li className="flex items-start gap-3">
                        <MapPin size={16} className="text-munigreen mt-1" />
                        <span>Rua das Indústrias, 123<br/>São Paulo - SP</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <Mail size={16} className="text-munigreen" />
                        <span>contato@munimoldes.com.br</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <Phone size={16} className="text-munigreen" />
                        <span>(11) 99999-9999</span>
                    </li>
                </ul>
            </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs opacity-50">
            <p>&copy; {new Date().getFullYear()} Muni Moldes Ltda. CNPJ: 00.000.000/0001-00</p>
            <p className="flex items-center gap-2">
                <span className="w-2 h-2 bg-munigreen rounded-full animate-pulse"></span>
                Sistema Operacional Normal
            </p>
        </div>
      </div>
    </footer>
  );
};