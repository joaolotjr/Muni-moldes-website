import React from 'react';
import { Shield, Users, Heart } from 'lucide-react';
import { SEO } from '../../components/SEO';
import logo from '../../assets/logo.png';

export const About: React.FC = () => {
  return (
    <>
      <SEO title="Sobre Nós" description="Conheça a história e os valores da Muni Moldes." />
      
      {/* Header - Soft Warm Pastel */}
      <div className="bg-orange-50 text-slate-main py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
          
          <div className="flex items-center gap-4 mb-6">
            <img src={logo} alt="Muni Moldes Logo" className="h-44 w-auto" />
            <h1 className="text-4xl md:text-5xl font-bold">Nossa História</h1>
          </div>
          
          <p className="text-xl text-slate-light max-w-2xl mx-auto text-center">
            Transformando ideias em formas precisas desde 2015.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg text-gray-600 mx-auto">
            <p>
              A <strong>Muni Moldes</strong> começou como um pequeno ateliê familiar, focado em ajudar artesãos locais a replicarem suas peças com qualidade. Percebemos uma lacuna no mercado brasileiro: faltava silicone de alta performance acessível para pequenos e médios produtores.
            </p>
            <p>
              Hoje, somos referência nacional na fabricação de moldes para artesanato (biscuit, resina, gesso), confeitaria e saboaria. Nossa fábrica utiliza tecnologia de ponta para garantir que cada molde tenha a flexibilidade ideal e reproduza até os mínimos detalhes da matriz original.
            </p>
            
            <h3 className="text-gray-900 font-bold text-2xl mt-12 mb-6">Nosso Processo Produtivo</h3>
            <p>
              Utilizamos silicone de grau industrial e alimentício, dependendo da linha. Todo o processo, desde a modelagem 3D da matriz até a vulcanização do silicone, passa por um rigoroso controle de qualidade. Isso garante que nossos moldes não rasguem facilmente e mantenham a forma por milhares de reproduções.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="py-16 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-main">Nossos Valores</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-soft hover:shadow-glow transition-all text-center">
              <div className="bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-600">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-main mb-4">Qualidade Intransigente</h3>
              <p className="text-slate-light">Não economizamos na matéria-prima. O resultado do nosso cliente é nossa prioridade.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-soft hover:shadow-glow transition-all text-center">
              <div className="bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-600">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-main mb-4">Parceria B2B</h3>
              <p className="text-slate-light">Crescemos juntos com lojistas e distribuidores, oferecendo condições justas e suporte real.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-soft hover:shadow-glow transition-all text-center">
              <div className="bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-600">
                <Heart size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-main mb-4">Paixão pelo Artesanato</h3>
              <p className="text-slate-light">Entendemos a arte de criar com as mãos e desenvolvemos ferramentas para facilitá-la.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};