import React from 'react';

const CatalogPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-munidark mb-6">Nosso Catálogo</h2>
      <p className="text-gray-600 mb-8">Confira nossas coleções mais recentes.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Placeholder de produtos - futuramente virão do Backend */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300">
            <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
              Foto Molde {item}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-munidark mb-1">Nome do Molde {item}</h3>
              <p className="text-sm text-gray-500 mb-3">Coleção Especial</p>
              <div className="flex justify-between items-center">
                <span className="text-munipink font-bold">R$ 29,90</span>
                <button className="text-xs bg-munidark text-white px-3 py-1 rounded hover:bg-gray-700">
                  Ver Detalhes
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CatalogPage;