// src/components/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import LogoImg from '../assets/logo.png'; 

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 p-4 bg-white shadow-md border-b border-gray-100">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logo e Nome da Empresa */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center">            
            <img 
              src={LogoImg} 
              alt="Muni Moldes Logo" 
              className="h-16 w-auto rounded-full" // Define altura e formato
            />
          </Link>
        </div>

        {/* Navegação Principal */}
        <nav className="space-x-6 hidden md:flex">
          {/* As classes de cor (munidark e munipink) estão aqui */}
          <Link to="/" className="text-munidark hover:text-munipink transition duration-200 font-sans font-medium">
            Home
          </Link>
          <Link to="/sobre" className="text-munidark hover:text-munipink transition duration-200 font-sans font-medium">
            Sobre Nós
          </Link>
          <Link to="/catalogo" className="text-munidark hover:text-munipink transition duration-200 font-sans font-medium">
            Catálogo
          </Link>
          <Link to="/contato" className="text-munidark hover:text-munipink transition duration-200 font-sans font-medium">
            Contato
          </Link>
        </nav>

        {/* Ícone de Menu para Mobile */}
        <div className="md:hidden">
          <button className="text-munidark text-xl">☰</button>
        </div>
        
      </div>
    </header>
  );
};

export default Header;