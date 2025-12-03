import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { db } from '../../services/db';
import { NewsArticle } from '../../types';
import { SEO } from '../../components/SEO';

export const News: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    // Sort by most recent
    const all = db.getNews().sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    setNews(all);
  }, []);

  return (
    <>
      <SEO title="Notícias e Blog" description="Fique por dentro das novidades da Muni Moldes." />
      
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog & Novidades</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Acompanhe lançamentos, participação em feiras e dicas de uso dos nossos produtos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((article) => (
              <article key={article.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar size={14} className="mr-2" />
                    {new Date(article.publishedAt).toLocaleDateString('pt-BR')}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                    {article.summary}
                  </p>
                  <Link 
                    to={`/noticias/${article.slug}`} 
                    className="text-brand-600 font-semibold hover:text-brand-800 transition-colors"
                  >
                    Ler matéria completa →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};