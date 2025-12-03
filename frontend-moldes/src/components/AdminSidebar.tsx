import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FileText, LogOut, Layers } from 'lucide-react';
import { db } from '../services/db';

export const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    db.logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Catálogo', path: '/admin/catalogo' },
    { icon: Layers, label: 'Coleções', path: '/admin/colecoes' },
    { icon: FileText, label: 'Notícias', path: '/admin/noticias' },
  ];

  return (
    <div className="w-64 bg-gray-900 min-h-screen text-white flex flex-col fixed left-0 top-0 h-full">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-brand-500">Muni Admin</h2>
        <p className="text-gray-400 text-xs mt-1">Gestão de Conteúdo</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? 'bg-brand-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};