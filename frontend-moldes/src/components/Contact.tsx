import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <section id="contato" className="py-24 bg-munidark text-munilight relative">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* Info */}
          <div>
            <h4 className="text-munipink font-bold tracking-widest text-sm uppercase mb-4">Fale Conosco</h4>
            <h2 className="font-serif text-4xl md:text-5xl mb-8 leading-tight text-white">
              Vamos criar algo <br/> incrível juntos?
            </h2>
            <p className="text-white/70 mb-12 text-lg font-light">
              Seja para revender nossos moldes ou criar uma coleção exclusiva para sua fábrica de chocolates, nossa equipe está pronta para atender sua demanda com precisão.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-munipink group-hover:bg-munipink group-hover:text-white transition-all duration-300">
                    <Mail size={20} />
                </div>
                <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider">Email</p>
                    <p className="text-lg">comercial@munimoldes.com.br</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-munipink group-hover:bg-munipink group-hover:text-white transition-all duration-300">
                    <Phone size={20} />
                </div>
                <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider">WhatsApp B2B</p>
                    <p className="text-lg">(11) 99999-9999</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-munipink group-hover:bg-munipink group-hover:text-white transition-all duration-300">
                    <MapPin size={20} />
                </div>
                <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider">Localização</p>
                    <p className="text-lg">São Paulo, SP - Brasil</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-10 rounded-3xl text-munidark shadow-2xl"
          >
            <h3 className="font-serif text-2xl mb-6">Solicite um Orçamento</h3>
            <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-munidark/50">Nome</label>
                        <input type="text" className="w-full bg-munilight border-none rounded-lg p-3 focus:ring-2 focus:ring-munipink" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-munidark/50">Empresa</label>
                        <input type="text" className="w-full bg-munilight border-none rounded-lg p-3 focus:ring-2 focus:ring-munipink" />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-munidark/50">Email Corporativo</label>
                    <input type="email" className="w-full bg-munilight border-none rounded-lg p-3 focus:ring-2 focus:ring-munipink" />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-munidark/50">Interesse</label>
                    <select className="w-full bg-munilight border-none rounded-lg p-3 focus:ring-2 focus:ring-munipink text-munidark">
                        <option>Compra no Atacado (Revenda)</option>
                        <option>Uso Próprio (Confeitaria/Indústria)</option>
                        <option>Desenvolvimento de Molde Exclusivo</option>
                        <option>Outros</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-munidark/50">Mensagem</label>
                    <textarea rows={4} className="w-full bg-munilight border-none rounded-lg p-3 focus:ring-2 focus:ring-munipink"></textarea>
                </div>
                <button className="w-full bg-munigreen text-white py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-munipink transition-colors duration-300 shadow-lg">
                    Enviar Solicitação
                </button>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
};