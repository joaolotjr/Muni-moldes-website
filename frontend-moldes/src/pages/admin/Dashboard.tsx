import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { db } from '../../services/db';
import { Product } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, Eye, Tag } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(db.getProducts());
  }, []);

  // Stats Logic
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.active).length;
  const newProducts = products.filter(p => p.isNew).length;

  // Chart Data Preparation
  const productsByCollection = products.reduce((acc, curr) => {
    acc[curr.collection] = (acc[curr.collection] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.keys(productsByCollection).map(key => ({
    name: key,
    quantidade: productsByCollection[key]
  }));

  const pieData = [
    { name: 'Ativos', value: activeProducts },
    { name: 'Inativos', value: totalProducts - activeProducts }
  ];

  const COLORS = ['#0ea5e9', '#94a3b8'];

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <AdminSidebar />
      <div className="ml-64 flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-brand-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total de Produtos</p>
                <h3 className="text-3xl font-bold text-gray-900">{totalProducts}</h3>
              </div>
              <div className="p-3 bg-brand-50 rounded-full text-brand-600">
                <Package size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 font-medium">Produtos Ativos</p>
                <h3 className="text-3xl font-bold text-gray-900">{activeProducts}</h3>
              </div>
              <div className="p-3 bg-green-50 rounded-full text-green-600">
                <Eye size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 font-medium">Lançamentos</p>
                <h3 className="text-3xl font-bold text-gray-900">{newProducts}</h3>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
                <Tag size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Produtos por Coleção</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Status do Catálogo</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};