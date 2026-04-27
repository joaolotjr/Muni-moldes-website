import { Phone, Mail, Instagram, MapPin, Send } from 'lucide-react';

export function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In MVP, maybe just alert or redirect to WhatsApp.
    alert("Função de envio de e-mail em construção. Por favor, contate via WhatsApp!");
  };

  return (
    <div className="flex-1 bg-munibg animate-in fade-in duration-500">
      
      {/* Header */}
      <section className="pt-24 pb-12 px-4 text-center">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-munidark tracking-tight mb-4">
          Fale Conosco
        </h1>
        <p className="font-sans text-lg text-munidark/70 max-w-2xl mx-auto">
          Tem alguma dúvida, precisa de um molde personalizado ou quer falar sobre um pedido? Estamos aqui para ajudar.
        </p>
      </section>

      <section className="py-12 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[3rem] border border-munipink/10 shadow-xl shadow-munipink/5 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Contact Info Sidebar */}
            <div className="bg-munigreen p-10 lg:p-16 text-white flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-munidark/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
              
              <div className="relative z-10">
                <h3 className="font-heading text-3xl font-bold mb-8">Informações de Contato</h3>
                
                <div className="space-y-8 font-sans">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">WhatsApp / Telefone</h4>
                      <p className="text-white/80">+55 (11) 99999-9999</p>
                      <p className="text-white/60 text-sm mt-1">Seg a Sex, das 9h às 18h</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">E-mail</h4>
                      <p className="text-white/80">contato@munimoldes.com.br</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">Endereço Fábrica</h4>
                      <p className="text-white/80 leading-relaxed">
                        Rua dos Confeiteiros, 123<br />
                        Bairro Doce - São Paulo, SP<br />
                        CEP: 00000-000
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/20">
                  <h4 className="font-bold mb-4 font-sans">Redes Sociais</h4>
                  <div className="flex gap-4">
                    <a href="#" className="w-12 h-12 bg-white/20 hover:bg-white hover:text-munigreen transition-colors backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Instagram className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="p-10 lg:p-16">
              <h3 className="font-heading text-2xl font-bold text-munidark mb-8">Envie uma mensagem</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6 font-sans">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-munidark mb-2">Seu Nome</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full px-4 py-3 bg-munibg border border-munipink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-munipink/50 focus:border-munipink transition-all text-munidark"
                    placeholder="João Silva"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-munidark mb-2">Seu E-mail</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full px-4 py-3 bg-munibg border border-munipink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-munipink/50 focus:border-munipink transition-all text-munidark"
                    placeholder="joao@exemplo.com"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-bold text-munidark mb-2">Assunto</label>
                  <select 
                    id="subject" 
                    className="w-full px-4 py-3 bg-munibg border border-munipink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-munipink/50 focus:border-munipink transition-all text-munidark"
                    required
                  >
                    <option value="">Selecione um assunto</option>
                    <option value="duvida">Dúvida sobre Produto</option>
                    <option value="personalizado">Orçamento de Molde Personalizado</option>
                    <option value="pedido">Status do Pedido</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-munidark mb-2">Mensagem</label>
                  <textarea 
                    id="message" 
                    rows={4}
                    className="w-full px-4 py-3 bg-munibg border border-munipink/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-munipink/50 focus:border-munipink transition-all text-munidark resize-none"
                    placeholder="Como podemos te ajudar hoje?"
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-munipink hover:bg-[#a67c79] text-white py-4 px-8 rounded-xl font-bold text-lg transition-all shadow-md shadow-munipink/20 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Enviar Mensagem
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}