import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// --- Componentes Fixos (Layout) ---
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AiAssistant } from './components/AiAssistant';

// --- Páginas (Conteúdo Dinâmico) ---
// Certifique-se de que estes arquivos estão na pasta src/pages/
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import CatalogPage from './pages/CatalogPage';
import ContactPage from './pages/ContactPage';

// --- Utilitário: Rolar para o topo ao mudar de página ---
// Sem isso, ao clicar em um link no rodapé, a nova página abriria no final
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  return (
    // Container principal:
    // - min-h-screen: Garante altura mínima da tela
    // - flex flex-col: Organiza elementos verticalmente
    // - bg-munilight: Cor de fundo padrão
    <div className="font-sans antialiased selection:bg-munipink selection:text-white min-h-screen flex flex-col bg-munilight text-munidark">
      <Router>
        {/* Utilitário de Scroll */}
        <ScrollToTop />
        
        {/* Navbar Fixa no topo (aparece em todas as páginas) */}
        <Navbar />
        
        {/* Área de Conteúdo que muda conforme a URL */}
        {/* flex-grow: Faz esta área crescer para ocupar todo o espaço disponível, empurrando o footer para baixo */}
        {/* pt-20: Padding top para compensar a altura da Navbar que é 'fixed' */}
        <main className="flex-grow pt-20">
          <Routes>
            {/* Rota da Home */}
            <Route path="/" element={<HomePage />} />
            
            {/* Rota Sobre Nós */}
            <Route path="/sobre" element={<AboutPage />} />
            
            {/* Rota Catálogo */}
            <Route path="/catalogo" element={<CatalogPage />} />
            
            {/* Rota Contato */}
            <Route path="/contato" element={<ContactPage />} />
            
            {/* Rota 404 (Página não encontrada) - Captura qualquer URL desconhecida */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
                <h1 className="text-4xl font-serif text-munidark mb-4">Página não encontrada</h1>
                <p className="text-munidark/60 mb-8">O conteúdo que você procura não existe ou mudou de lugar.</p>
                <a href="/" className="text-munipink font-bold hover:underline">Voltar para a Home</a>
              </div>
            } />
          </Routes>
        </main>

        {/* Rodapé e Assistente Virtual (Fixos em todas as páginas) */}
        <Footer />
        <AiAssistant />
      </Router>
    </div>
  );
}

export default App;