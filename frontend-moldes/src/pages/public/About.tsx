import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Sparkles, Star } from 'lucide-react';

export function About() {
  return (
    <div className="flex-1 bg-munibg animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <section className="relative py-24 bg-munilight border-b border-munipink/10 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noisy-grid.png')] opacity-10 mix-blend-multiply"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-munigreen rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-munipink rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-munidark tracking-tight mb-6">
            Nossa História
          </h1>
          <p className="font-sans text-lg text-munidark/80 max-w-2xl mx-auto leading-relaxed">
            Da confeitaria artesanal à criação de ferramentas que inspiram outros confeiteiros a realizarem seus sonhos. Conheça a jornada da Muni Moldes.
          </p>
        </div>
      </section>

      {/* Main Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            
            <div className="flex-1 relative">
              <div className="absolute -inset-4 bg-munigreen/10 rounded-[3rem] transform -rotate-3"></div>
              <div className="relative aspect-[4/5] w-full max-w-md mx-auto bg-white rounded-[2rem] border-8 border-white shadow-2xl overflow-hidden flex items-center justify-center">
                <div className="text-munidark/30 text-center p-6 font-sans text-sm">
                  <Heart className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  [Espaço Reservado para<br/>Foto da Mariluci / Fábrica]
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-8">
              <div>
                <h2 className="font-heading text-3xl font-bold text-munidark mb-4">A Paixão que Virou Negócio</h2>
                <p className="font-sans text-munidark/80 leading-relaxed">
                  A história da Muni Moldes não começou em uma fábrica, mas sim em uma cozinha. Tudo começou com a Mariluci, que tinha uma paixão genuína por confeitaria. Ao tentar criar doces com detalhes únicos, ela percebeu que o mercado carecia de moldes que fossem não apenas bonitos, mas que tivessem uma qualidade excepcional e durabilidade.
                </p>
              </div>
              
              <div>
                <p className="font-sans text-munidark/80 leading-relaxed">
                  Movida pela vontade de criar o perfeito "buchinho" para um cupcake e outras decorações incríveis, Mariluci começou a testar e produzir seus próprios moldes de silicone. O que era para ser uma ferramenta própria virou sucesso entre outras confeiteiras.
                </p>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold text-munidark mb-3">Hoje</h3>
                <p className="font-sans text-munidark/80 leading-relaxed">
                  A Muni Moldes é uma fábrica dedicada a produzir ferramentas perfeitas para confeitaria e artesanato, sempre mantendo a essência artesanal, o cuidado em cada detalhe e a vontade de ver seus clientes brilharem.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white border-y border-munipink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold text-munidark mb-4">O que nos move</h2>
            <p className="font-sans text-munidark/70 max-w-2xl mx-auto">Nossos valores estão em cada molde que enviamos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-munibg p-8 rounded-[2rem] border border-munipink/10 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-munipink/10">
                <Heart className="w-8 h-8 text-munipink" />
              </div>
              <h3 className="font-heading text-xl font-bold text-munidark mb-3">Feito com Carinho</h3>
              <p className="font-sans text-munidark/70 text-sm leading-relaxed">
                Cada molde é finalizado manualmente. Acreditamos que o amor dedicado na fábrica se reflete na beleza do seu trabalho final.
              </p>
            </div>

            <div className="bg-munibg p-8 rounded-[2rem] border border-munipink/10 text-center relative transform md:-translate-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-munipink/10">
                <Star className="w-8 h-8 text-munigreen" />
              </div>
              <h3 className="font-heading text-xl font-bold text-munidark mb-3">Qualidade Premium</h3>
              <p className="font-sans text-munidark/70 text-sm leading-relaxed">
                Utilizamos o melhor silicone do mercado. Nossos moldes garantem uma desmoldagem perfeita e duram por anos na sua cozinha.
              </p>
            </div>

            <div className="bg-munibg p-8 rounded-[2rem] border border-munipink/10 text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-munipink/10">
                <Sparkles className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="font-heading text-xl font-bold text-munidark mb-3">Detalhes Únicos</h3>
              <p className="font-sans text-munidark/70 text-sm leading-relaxed">
                Nossos mestres se certificam que cada vinco, curva e textura saia perfeita, elevando o nível dos seus doces e artesanatos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-munidark mb-6">Pronto para encantar?</h2>
          <p className="font-sans text-lg text-munidark/80 mb-8">
            Faça parte da nossa história criando doces incríveis com os moldes da Muni.
          </p>
          <Link to="/catalogo" className="inline-flex items-center gap-2 bg-munipink hover:bg-[#a67c79] text-white px-8 py-4 rounded-full font-bold transition-all shadow-xl shadow-munipink/20 hover:-translate-y-0.5 font-sans">
            Explorar o Catálogo
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}