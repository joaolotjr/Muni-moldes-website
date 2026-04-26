import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, LogOut } from 'lucide-react';
import { logout } from '../../services/api';

export function AdminSidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Produtos', path: '/admin/produtos', icon: Package },
    { name: 'Coleções', path: '/admin/colecoes', icon: FolderTree },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col shadow-2xl z-10">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30"></div>
          Muni Admin
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-500/10 text-indigo-400 font-medium shadow-sm'
                  : 'hover:bg-slate-800/50 hover:text-slate-100'
              }`
            }
          >
            <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-200 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 group"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
}
