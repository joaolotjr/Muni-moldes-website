import React from 'react';

const Header: React.FC = () => {
  return (
    <header style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
      <h1>Muni Moldes</h1>
      <nav>
        <a href="/">Home</a> | <a href="/sobre">Sobre Nós</a> | <a href="/catalogo">Catálogo</a> | <a href="/contato">Contato</a>
      </nav>
    </header>
  );
};

export default Header;