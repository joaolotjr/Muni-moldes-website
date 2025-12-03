import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { db } from '../../services/db';
import { type NewsArticle } from '../../types';
import { SEO } from '../../components/SEO';

export const NewsDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);

  useEffect(() => {
    if (slug) {
      const found = db.getNewsBySlug(slug);
      setArticle(found || null);
    }
  }, [slug]);

  if (!article) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-main mb-4">Notícia não encontrada</h2>
        <Link to="/noticias" className="text-accent-coral hover:underline">Voltar para notícias</Link>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={article.title} 
        description={article.summary}
        image={article.image}
        url={`/noticias/${article.slug}`}
        type="article"
        articleData={{
            headline: article.title,
            image: [article.image],
            datePublished: article.publishedAt,
            author: "Muni Moldes Team"
        }}
      />
      
      <div className="bg-canvas min-h-screen pb-20 pt-28">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to="/noticias" className="inline-flex items-center text-slate-light hover:text-accent-coral mb-8 transition-colors">
                <ArrowLeft size={20} className="mr-2" /> Voltar para o Blog
            </Link>

            <div className="bg-white rounded-[2rem] shadow-soft overflow-hidden">
                <div className="h-64 md:h-96 w-full relative">
                    <img 
                        src={article.image} 
                        alt={article.title} 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>

                <div className="p-8 md:p-12">
                    <div className="flex items-center text-sm font-medium text-accent-coral mb-4">
                        <Calendar size={16} className="mr-2" />
                        {new Date(article.publishedAt).toLocaleDateString('pt-BR')}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-main mb-6 leading-tight">
                        {article.title}
                    </h1>

                    <div className="prose prose-lg prose-slate max-w-none text-slate-light">
                        <p className="lead font-medium text-slate-main/80 mb-8 text-xl">
                            {article.summary}
                        </p>
                        <div className="whitespace-pre-wrap">
                            {article.content}
                        </div>
                    </div>
                </div>
            </div>
        </article>
      </div>
    </>
  );
};