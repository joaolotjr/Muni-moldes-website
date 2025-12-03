import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../../services/db';
import { Lock, ArrowLeft } from 'lucide-react';
import { SEO } from '../../components/SEO';

export const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (db.login(password)) {
      navigate('/admin');
    } else {
      setError('Senha incorreta.');
    }
  };

  return (
    <>
      <SEO title="Admin Login" />
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        
        <div className="w-full max-w-md">
            <Link to="/" className="flex items-center gap-2 text-slate-light hover:text-slate-main mb-8 transition-colors justify-center">
                <ArrowLeft size={20} />
                <span>Voltar para o Site</span>
            </Link>

            <div className="bg-white p-10 rounded-3xl shadow-soft w-full">
            <div className="text-center mb-8">
                <div className="bg-brand-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-600">
                <Lock size={32} />
                </div>
                <h1 className="text-2xl font-bold text-slate-main">Acesso Restrito</h1>
                <p className="text-slate-light mt-2">Muni Moldes - Gestão</p>
            </div>

            <form onSubmit={handleLogin}>
                <div className="mb-6">
                <label className="block text-sm font-medium text-slate-600 mb-2">Senha de Acesso</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                    placeholder="Digite a senha..."
                    autoFocus
                />
                </div>

                {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm text-center font-medium">
                    {error}
                </div>
                )}

                <button
                type="submit"
                className="w-full bg-slate-main text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors"
                >
                Entrar
                </button>
                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">Dica: a senha é admin123</p>
                </div>
            </form>
            </div>
        </div>
      </div>
    </>
  );
};