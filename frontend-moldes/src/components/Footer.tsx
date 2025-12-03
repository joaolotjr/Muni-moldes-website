import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-sand pt-16 pb-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold mb-4 text-slate-main">MUNI MOLDES</h3>
            <p className="text-slate-light text-sm leading-relaxed">
              Especialistas em moldes de silicone de alta performance para artesãos e indústrias criativas. Qualidade e durabilidade garantidas.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-slate-main">Navegação</h4>
            <ul className="space-y-2 text-sm text-slate-light">
              <li><Link to="/catalogo" className="hover:text-accent-coral transition-colors">Catálogo Completo</Link></li>
              <li><Link to="/sobre" className="hover:text-accent-coral transition-colors">Quem Somos</Link></li>
              <li><Link to="/noticias" className="hover:text-accent-coral transition-colors">Blog e Novidades</Link></li>
              <li><Link to="/contato" className="hover:text-accent-coral transition-colors">Fale Conosco</Link></li>
              <li><Link to="/admin/login" className="hover:text-accent-coral transition-colors opacity-70">Área do Parceiro</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-slate-main">Contato</h4>
            <ul className="space-y-3 text-sm text-slate-light">
              <li className="flex items-start gap-2">
                <MapPin size={18} className="mt-0.5 text-accent-coral" />
                <span>São Paulo, SP - Brasil</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={18} className="text-accent-coral" />
                <span>contato@munimoldes.com.br</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-slate-main">WhatsApp:</span> (11) 99999-9999
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-slate-main">Siga-nos</h4>
            <div className="flex space-x-4">
              <a href="#" className="bg-white p-3 rounded-full hover:bg-accent-coral hover:text-white text-slate-light transition-all shadow-sm">
                <Instagram size={20} />
              </a>
              <a href="#" className="bg-white p-3 rounded-full hover:bg-accent-coral hover:text-white text-slate-light transition-all shadow-sm">
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-300/30 mt-12 pt-8 text-center text-xs text-slate-light">
          <p>&copy; {new Date().getFullYear()} Muni Moldes. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};