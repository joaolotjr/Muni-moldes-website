import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export const SocialProof: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="bg-munidark rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="2" fill="#fff" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#dots)" />
                </svg>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative z-10 max-w-3xl mx-auto"
            >
                <div className="flex justify-center gap-1 mb-8">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={24} className="fill-munipink text-munipink" />
                    ))}
                </div>
                
                <h3 className="font-serif text-3xl md:text-4xl text-munilight leading-relaxed mb-10">
                    "A qualidade dos moldes da Muni elevou o nível dos produtos em nossa loja. A precisão dos detalhes é exatamente o que nossos clientes exigentes procuram."
                </h3>
                
                <div className="flex flex-col items-center gap-2">
                    <p className="text-munipink font-bold text-lg tracking-wide uppercase">Parceiro Oficial</p>
                    <p className="text-white/80 font-serif text-2xl">lojaalinecandido.com.br</p>
                </div>
            </motion.div>
        </div>

        {/* Mini News/Blog Section embedded to satisfy requirements */}
        <div id="noticias" className="mt-32">
             <div className="flex justify-between items-end mb-12">
                <h2 className="font-serif text-4xl text-munidark">Últimas Novidades</h2>
                <a href="#" className="text-munigreen font-medium hover:text-munipink transition-colors">Ver todas as notícias</a>
             </div>
             
             <div className="grid md:grid-cols-3 gap-8">
                {[
                    { date: "15 OUT", title: "Tendências de Páscoa 2025: O que esperar?", tag: "Mercado" },
                    { date: "02 NOV", title: "Lançamento: Coleção Botânica Exclusiva", tag: "Produtos" },
                    { date: "20 NOV", title: "Como cuidar dos seus moldes de silicone para durarem anos", tag: "Dicas" }
                ].map((news, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="border-t border-munidark/10 pt-6 group cursor-pointer"
                    >
                        <span className="text-xs font-bold text-munipink mb-2 block">{news.tag}</span>
                        <h4 className="font-serif text-xl text-munidark group-hover:text-munigreen transition-colors mb-2">{news.title}</h4>
                        <p className="text-sm text-munidark/50">{news.date} • Leitura de 3 min</p>
                    </motion.div>
                ))}
             </div>
        </div>
      </div>
    </section>
  );
};