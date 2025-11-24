import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/40 to-transparent pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-munipink/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-munigreen/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center md:text-left"
        >
          <span className="inline-block px-4 py-1 mb-6 text-xs tracking-[0.2em] font-bold text-munigreen border border-munigreen/30 rounded-full uppercase bg-white/50 backdrop-blur-sm">
            Desde 2018
          </span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-munidark leading-tight mb-6">
            Precisão que transforma <br />
            <span className="text-munipink italic">suas modelagens</span> em arte.
          </h1>
          <p className="text-munidark/80 text-lg md:text-xl mb-8 max-w-lg mx-auto md:mx-0 font-light leading-relaxed">
            Especialistas em moldes de silicone de alta performance para pasta americana, chocolate, biscuit e artesanato. A definição perfeita para indústrias e confeiteiros exigentes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a href="#catalogo" className="px-8 py-4 bg-munidark text-munilight rounded-full font-medium hover:bg-munipink transition-all duration-300 shadow-lg hover:shadow-munipink/50">
              Ver Coleções
            </a>
            <a href="#contato" className="px-8 py-4 border border-munidark text-munidark rounded-full font-medium hover:bg-white hover:border-transparent transition-all duration-300">
              Orçamento B2B
            </a>
          </div>
        </motion.div>

        {/* Visual Content - Abstract Mold Representation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="relative h-[500px] w-full flex items-center justify-center"
        >
             {/* Main Image Placeholder */}
             <div className="relative w-full h-full max-w-md mx-auto">
                <img 
                    src="https://picsum.photos/600/800?grayscale" 
                    alt="Muni Moldes Art" 
                    className="w-full h-full object-cover rounded-t-[10rem] rounded-b-3xl shadow-2xl border-4 border-white"
                />
                {/* Floating Badge */}
                <motion.div 
                    className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-[200px]"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <p className="font-serif text-3xl text-munigreen mb-1">100%</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Silicone de Grau Alimentício</p>
                </motion.div>
             </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 2, duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-munidark/50"
      >
        <ArrowDown size={24} />
      </motion.div>
    </section>
  );
};