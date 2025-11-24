import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const benefits = [
  "Silicone de Platina Premium",
  "Alta durabilidade para produção em escala",
  "Acabamento espelhado (brilho perfeito)",
  "Designs exclusivos e personalizados"
];

export const About: React.FC = () => {
  return (
    <section id="sobre" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative line */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-24 bg-gradient-to-b from-munilight to-munipink/50"></div>

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-4 mt-12"
            >
                <img src="https://picsum.photos/400/500?random=1" alt="Processo de criação" className="rounded-2xl shadow-lg w-full h-64 object-cover hover:scale-[1.02] transition-transform duration-500" />
                <div className="bg-munilight p-6 rounded-2xl">
                    <h3 className="font-serif text-2xl text-munipink mb-2">2018</h3>
                    <p className="text-sm text-munidark/70">O ano em que começamos a redefinir o padrão de qualidade em moldes no Brasil.</p>
                </div>
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-4"
            >
                <div className="bg-munigreen/10 p-6 rounded-2xl h-40 flex flex-col justify-center">
                    <h3 className="font-serif text-xl text-munigreen mb-2">Foco B2B</h3>
                    <p className="text-sm text-munidark/70">Parceria estratégica com revendedores e indústrias.</p>
                </div>
                <img src="https://picsum.photos/400/500?random=2" alt="Moldes finalizados" className="rounded-2xl shadow-lg w-full h-64 object-cover hover:scale-[1.02] transition-transform duration-500" />
            </motion.div>
          </div>

          {/* Content */}
          <motion.div
             initial={{ opacity: 0, x: 30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
          >
            <h4 className="text-munipink font-bold tracking-widest text-sm uppercase mb-4">Nossa Essência</h4>
            <h2 className="font-serif text-4xl md:text-5xl text-munidark mb-8 leading-tight">
              Mais que moldes, <br/> entregamos <span className="text-munigreen">confiança</span>.
            </h2>
            <p className="text-munidark/80 mb-6 leading-relaxed text-lg">
              A Muni Moldes nasceu em 2018 com uma missão clara: fornecer ferramentas de precisão para quem transforma açúcar em sonhos. Entendemos que, para uma fábrica de chocolates ou um grande revendedor, a falha de um molde significa a parada de uma produção.
            </p>
            <p className="text-munidark/80 mb-8 leading-relaxed text-lg">
              Por isso, trabalhamos com rigorosos processos de cura e design, garantindo que cada peça suporte ciclos intensos de uso sem perder a definição. Atendemos desde grandes indústrias até pedidos coletivos de confeiteiros, sempre com a mesma excelência.
            </p>

            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3 text-munidark font-medium">
                  <CheckCircle2 className="text-munigreen flex-shrink-0" size={20} />
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="mt-10">
                <button className="text-munipink font-semibold border-b-2 border-munipink hover:text-munidark hover:border-munidark transition-colors pb-1">
                    Conheça nosso processo fabril
                </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};