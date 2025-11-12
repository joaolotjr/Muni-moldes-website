// src/pages/HomePage.tsx
import React from 'react';

const HomePage: React.FC = () => {
  return (
    // Container principal: Garante que o conteúdo ocupe a altura mínima da tela
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      
      {/* Seção HERO: Destaque principal */}
      <section className="w-full py-20 px-4 text-center bg-white shadow-lg mb-10">
        
        {/* Título Principal */}
        <h2 className="text-5xl md:text-6xl font-extrabold text-pink-600 mb-4 tracking-tight">
          Crie a Magia com Muni Moldes ✨
        </h2>
        
        {/* Subtítulo */}
        <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
          Sua fábrica de moldes de silicone de alta qualidade para artesanato e confeitaria, com tradição desde **2018**. Transforme ideias em arte!
        </p>
        
        {/* Call to Action */}
        <a 
          href="/catalogo" 
          className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold text-lg py-3 px-10 rounded-full shadow-xl transition duration-300 transform hover:scale-105"
        >
          Ver Catálogo Completo
        </a>
      </section>

      {/* Seção de Diferenciais / Por que Escolher a Muni Moldes */}
      <section className="w-full max-w-6xl py-12 px-4">
        <h3 className="text-3xl font-bold text-gray-800 mb-10 text-center">
          Qualidade, Tradição e Inovação
        </h3>
        
        {/* Grid de Cards de Diferenciais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-6 bg-white shadow-xl rounded-lg border-t-4 border-pink-500 hover:shadow-2xl transition duration-300">
            <span className="text-3xl text-pink-600 mb-3 block">🛠️</span>
            <h4 className="text-xl font-semibold mb-2">Qualidade Premium</h4>
            <p className="text-gray-600">Moldes de silicone de grau alimentício, flexíveis e ultra-resistentes, feitos para durar.</p>
          </div>

          <div className="p-6 bg-white shadow-xl rounded-lg border-t-4 border-pink-500 hover:shadow-2xl transition duration-300">
            <span className="text-3xl text-pink-600 mb-3 block">📜</span>
            <h4 className="text-xl font-semibold mb-2">Tradição desde 2018</h4>
            <p className="text-gray-600">Confiança de quem está no mercado há anos, aperfeiçoando cada peça e design.</p>
          </div>

          <div className="p-6 bg-white shadow-xl rounded-lg border-t-4 border-pink-500 hover:shadow-2xl transition duration-300">
            <span className="text-3xl text-pink-600 mb-3 block">💡</span>
            <h4 className="text-xl font-semibold mb-2">Coleções Exclusivas</h4>
            <p className="text-gray-600">Design inovador com novos modelos lançados a cada estação para seu artesanato e doces.</p>
          </div>
          
        </div>
      </section>
      
    </div>
  );
};

export default HomePage;