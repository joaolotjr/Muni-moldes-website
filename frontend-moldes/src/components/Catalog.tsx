import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Layers } from 'lucide-react';
import type { Collection } from '../types';

// Updated collections to match the "Silicone Mold" vs "Finished Result" request
// Images are optimized (w=600) for better performance.
const collections: Collection[] = [
  {
    id: 'natal-classico',
    title: 'Coleção Natal',
    description: 'Guirlandas, Papai Noel e Renas. Detalhes profundos para pintura fácil.',
    // Result: Red/Green Christmas wreath styling
    resultImage: 'https://images.unsplash.com/photo-1543255006-d6395b6f1171?auto=format&fit=crop&w=600&q=80',
    // Mold: White plaster/silicone texture look
    moldImage: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cameos-vintage',
    title: 'Clássicos & Cameos',
    description: 'A elegância dos camafeus vitorianos. Perfeitos para molduras de chocolate.',
    // Result: Elegant relief/sculpture
    resultImage: 'https://images.unsplash.com/photo-1598551379804-4b8a75488f55?auto=format&fit=crop&w=600&q=80',
    // Mold: Smooth white texture
    moldImage: 'https://images.unsplash.com/photo-1595414993970-6b9421342675?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'personagens-fofos',
    title: 'Linha Cute & Geek',
    description: 'Personagens estilo "Hello Kitty" e games. Modelagem 3D perfeita.',
    // Result: Pink cute figurine/toy vibe
    resultImage: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=600&q=80',
    // Mold: White raw material
    moldImage: 'https://images.unsplash.com/photo-1605265058749-78afeb7a5e4e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'flores-jardim',
    title: 'Jardim Secreto',
    description: 'Rosas, suculentas e folhas com texturas realistas de nervuras.',
    // Result: Floral detailed soap/chocolate
    resultImage: 'https://images.unsplash.com/photo-1606100965166-5b1c0dd1515b?auto=format&fit=crop&w=600&q=80',
    // Mold: White clay/silicone look
    moldImage: 'https://images.unsplash.com/photo-1616623430519-77d007273966?auto=format&fit=crop&w=600&q=80'
  }
];

export const Catalog: React.FC = () => {
  return (
    <section id="catalogo" className="py-24 bg-munilight relative">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-munipink/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 text-munigreen uppercase tracking-[0.2em] text-xs font-bold mb-3"
            >
                <Layers size={14} />
                <span>Alta Definição</span>
            </motion.div>
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-serif text-4xl md:text-5xl text-munidark mb-4"
            >
                Do Molde à Obra de Arte
            </motion.h2>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-munidark/60 max-w-2xl mx-auto leading-relaxed"
            >
                Nossos silicones de platina garantem desmolde fácil e brilho espelhado. <br/>
                <span className="text-munipink font-medium">Passe o mouse (ou toque) nos cards</span> para revelar o molde por trás do produto.
            </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {collections.map((collection, index) => (
                <motion.div
                    key={collection.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-white/50"
                >
                    {/* Image Container with Switch Effect */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                        {/* Product Result Image (Visible by default) */}
                        <img 
                            src={collection.resultImage} 
                            alt={`${collection.title} - Resultado`}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:opacity-0 z-10"
                        />
                        
                        {/* Mold Image (Revealed on Hover) */}
                        <img 
                            src={collection.moldImage} 
                            alt={`${collection.title} - Molde de Silicone`} 
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 z-0"
                        />
                        
                        {/* Label Tag - Changes on Hover */}
                        <div className="absolute top-4 left-4 z-20">
                            <span className="bg-white/90 backdrop-blur-sm text-munidark text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm group-hover:hidden transition-all">
                                Produto Final
                            </span>
                            <span className="bg-munigreen/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm hidden group-hover:inline-block transition-all">
                                Molde de Silicone
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-white relative z-20">
                        <h3 className="font-serif text-xl text-munidark mb-2 group-hover:text-munipink transition-colors">{collection.title}</h3>
                        <p className="text-sm text-munidark/60 leading-relaxed mb-4 min-h-[40px]">
                            {collection.description}
                        </p>
                        <a href="#contato" className="inline-flex items-center gap-2 text-munidark font-medium text-sm border-b border-munidark/20 pb-0.5 group-hover:border-munipink transition-all">
                            Cotar Coleção <ArrowRight size={14} className="text-munipink group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </motion.div>
            ))}
        </div>
        
        <div className="mt-16 text-center">
            <a href="#contato" className="inline-block bg-munidark text-munilight px-10 py-4 rounded-full hover:bg-munipink transition-colors duration-300 uppercase tracking-wider text-sm font-bold shadow-lg shadow-munidark/10 hover:shadow-munipink/20">
                Solicitar Tabela de Atacado
            </a>
        </div>
      </div>
    </section>
  );
};