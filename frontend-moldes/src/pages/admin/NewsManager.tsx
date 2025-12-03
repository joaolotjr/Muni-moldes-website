import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { db } from '../../services/db';
import { type NewsArticle } from '../../types';
import { Plus, Edit, Trash2, X, Save, Upload, Image as ImageIcon } from 'lucide-react';

export const NewsManager: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [formData, setFormData] = useState<Partial<NewsArticle>>({});

  useEffect(() => {
    refreshList();
  }, []);

  const refreshList = () => {
    setNews(db.getNews());
  };

  const handleOpenModal = (article?: NewsArticle) => {
    if (article) {
      setEditingArticle(article);
      setFormData({ ...article });
    } else {
      setEditingArticle(null);
      setFormData({
        image: 'https://picsum.photos/800/400'
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Confirmar exclusão desta notícia?')) {
      db.deleteNews(id);
      refreshList();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setFormData(prev => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formData.title?.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') || '';
    
    const articleToSave: NewsArticle = {
      id: editingArticle ? editingArticle.id : Date.now().toString(),
      title: formData.title || '',
      slug: slug,
      summary: formData.summary || '',
      content: formData.content || '',
      image: formData.image || 'https://via.placeholder.com/800x400',
      publishedAt: editingArticle ? editingArticle.publishedAt : new Date().toISOString()
    };

    try {
      db.saveNews(articleToSave);
      setIsModalOpen(false);
      refreshList();
    } catch (err) {
      alert('Erro ao salvar: A imagem pode ser muito pesada.');
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <AdminSidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Notícias</h1>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-brand-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-brand-700"
          >
            <Plus size={20} /> Nova Notícia
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {news.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <img src={item.image} alt="" className="w-20 h-20 rounded-lg object-cover" />
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{new Date(item.publishedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenModal(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <Edit size={20} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingArticle ? 'Editar Notícia' : 'Nova Notícia'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resumo</label>
                <input
                  type="text"
                  required
                  value={formData.summary || ''}
                  onChange={e => setFormData({...formData, summary: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
                <textarea
                  rows={6}
                  required
                  value={formData.content || ''}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagem de Capa</label>
                
                <div className="flex gap-4 items-start">
                   {formData.image && (
                       <div className="w-32 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                           <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                       </div>
                   )}
                   
                   <div className="flex-1 space-y-3">
                        {/* File Upload */}
                        <label className="cursor-pointer bg-brand-50 border border-dashed border-brand-300 text-brand-700 px-4 py-2 rounded-lg hover:bg-brand-100 transition-colors flex items-center gap-2 text-sm font-bold w-fit">
                            <Upload size={18} />
                            <span>Upload do Computador</span>
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleFileUpload}
                            />
                        </label>
                        
                        <div className="text-xs text-gray-500 font-medium">OU</div>

                        {/* URL Fallback */}
                        <input
                            type="text"
                            placeholder="Cole a URL da imagem..."
                            value={formData.image || ''}
                            onChange={e => setFormData({...formData, image: e.target.value})}
                            className="w-full px-4 py-2 text-sm border rounded-lg bg-white text-black"
                        />
                   </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-700 flex items-center gap-2"
                >
                  <Save size={18} /> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};