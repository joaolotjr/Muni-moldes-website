import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Package, FolderTree, TrendingUp, Users } from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    collections: 0,
  });

  useEffect(() => {
    // Fetch real counts from API
    const fetchStats = async () => {
      try {
        const [productsRes, collectionsRes] = await Promise.all([
          api.get('/products'),
          api.get('/collections')
        ]);
        setStats({
          products: productsRes.data.length,
          collections: collectionsRes.data.length,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total de Moldes', value: stats.products, icon: Package, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { name: 'Coleções Ativas', value: stats.collections, icon: FolderTree, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'Visitas no Catálogo', value: '1.2k', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { name: 'Leads Gerados', value: '48', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500">Visão geral do seu catálogo e desempenho.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.name}</p>
              <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <TrendingUp className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Gráfico de Visitas</h3>
          <p className="text-slate-500">A integração com o Google Analytics será exibida aqui.</p>
        </div>
      </div>
    </div>
  );
}