import React from 'react';

const ContactPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-munidark mb-6 text-center">Fale Conosco</h2>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <form className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Nome</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-munipink" type="text" id="name" placeholder="Seu nome" />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-munipink" type="email" id="email" placeholder="seu@email.com" />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">Mensagem</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-munipink h-32" id="message" placeholder="Como podemos ajudar?"></textarea>
          </div>
          <button className="w-full bg-munipink text-white font-bold py-3 rounded-lg hover:bg-pink-400 transition duration-300 shadow-md">
            Enviar Mensagem
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;