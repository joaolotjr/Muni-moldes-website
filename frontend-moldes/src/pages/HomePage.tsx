import React from 'react';
import { Hero } from '../components/Hero';
import { SocialProof } from '../components/SocialProof';
import { Catalog } from '../components/Catalog'; // Opcional: Mostrar catálogo na home ou só o botão

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      {/* Podemos reutilizar o componente Catalog aqui ou criar um componente "FeaturedProducts" menor */}
      <Catalog /> 
      <SocialProof />
    </>
  );
};

export default HomePage;