import React, { useState } from 'react';
import { INTERESTS, ContactForm } from '../../types';
import { Mail, Phone, MapPin } from 'lucide-react';
import { SEO } from '../../components/SEO';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    company: '',
    interest: INTERESTS[0],
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Olá! Me chamo ${formData.name}, da empresa ${formData.company}. Tenho interesse em: ${formData.interest}. Mensagem: ${formData.message}`;
    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <SEO title="Contato" description="Fale com a equipe comercial da Muni Moldes." />
      
      <div className="bg-gray-50 min-h-screen py-16 pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Contact Info */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-6">Fale Conosco</h1>
              <p className="text-lg text-gray-600 mb-8">
                Estamos prontos para atender sua empresa. Preencha o formulário para iniciar uma conversa direta via WhatsApp com nossos consultores.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-brand-100 p-3 rounded-full text-brand-600">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Telefone / WhatsApp</h3>
                    <p className="text-gray-600">(11) 99999-9999</p>
                    <p className="text-sm text-gray-500">Seg a Sex: 08h às 18h</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-brand-100 p-3 rounded-full text-brand-600">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Email</h3>
                    <p className="text-gray-600">comercial@munimoldes.com.br</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-brand-100 p-3 rounded-full text-brand-600">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Localização</h3>
                    <p className="text-gray-600">Av. das Indústrias, 1000 - Zona Industrial<br />São Paulo - SP, CEP 00000-000</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Envie uma mensagem</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-white text-black placeholder-gray-400"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa</label>
                  <input
                    type="text"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-white text-black placeholder-gray-400"
                    placeholder="Sua empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interesse</label>
                  <select
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-white text-black"
                  >
                    {INTERESTS.map(int => (
                      <option key={int} value={int}>{int}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem (Opcional)</label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all bg-white text-black placeholder-gray-400"
                    placeholder="Descreva sua necessidade..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-accent-coral hover:bg-accent-coralHover text-white font-bold py-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  Iniciar Conversa no WhatsApp
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};