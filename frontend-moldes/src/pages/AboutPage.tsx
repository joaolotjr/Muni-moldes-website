import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-munidark mb-6">Nossa História</h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        Fundada em 2018, a Muni Moldes nasceu da paixão pelo artesanato e confeitaria.
        Somos um negócio familiar dedicado a fornecer ferramentas de alta qualidade para que você possa criar com excelência.
      </p>
      <p className="text-gray-700 leading-relaxed">
        Nossa missão é facilitar o trabalho de artesãs e confeiteiras com moldes duráveis, criativos e exclusivos.
      </p>
    </div>
  );
};

export default AboutPage;