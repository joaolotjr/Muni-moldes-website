// src/components/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-munidark text-munilight py-8 mt-10">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Coluna 1: Informações da Empresa */}
        <div>
          <h4 className="text-xl font-bold mb-4 font-heading">Muni Moldes</h4>
          <p className="text-sm font-sans mb-2">Qualidade e Tradição desde 2018.</p>
          <p className="text-sm font-sans">Transformando suas ideias em realidade.</p>
        </div>
        

        {/* Coluna 2: Navegação Rápida */}
        <div>
          <h4 className="text-lg font-semibold mb-4 border-b border-munipink pb-1">Navegação</h4>
          <ul className="space-y-2 text-sm font-sans">
            <li><Link to="/sobre" className="hover:text-munipink transition">Sobre Nós</Link></li>
            <li><Link to="/catalogo" className="hover:text-munipink transition">Catálogo</Link></li>
            <li><Link to="/contato" className="hover:text-munipink transition">Fale Conosco</Link></li>
            {/* Opcional: Política de Privacidade */}
          </ul>
        </div>

        {/* Coluna 3: Contato */}
        <div>
          <h4 className="text-lg font-semibold mb-4 border-b border-munipink pb-1">Contato</h4>
          <p className="text-sm font-sans">Email: contato@munimoldes.com</p>
          <p className="text-sm font-sans">Telefone: (XX) XXXX-XXXX</p>
          {/* Adicione o endereço aqui se for relevante */}
        </div>

        {/* Coluna 4: Redes Sociais */}
        <div>
          <h4 className="text-lg font-semibold mb-4 border-b border-munipink pb-1">Siga-nos</h4>
          <div className="flex space-x-3 text-2xl">
            {/* Ícones de Redes Sociais (Substitua por SVGs reais) */}
            <a href="#" className="hover:text-munipink transition">📸</a> {/* Instagram */}
            <a href="#" className="hover:text-munipink transition">📘</a> {/* Facebook */}
            <a href="#" className="hover:text-munipink transition">💬</a> {/* WhatsApp */}
          </div>
        </div>
      </div>
      
      <div className="text-center text-xs mt-8 pt-4 border-t border-munipink/50">
        &copy; {new Date().getFullYear()} Muni Moldes. Todos os direitos reservados.
      </div>
    </footer>
  );
};

export default Footer;