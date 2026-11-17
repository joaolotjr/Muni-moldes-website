import { NavLink } from 'react-router-dom';
import { FolderTree, LayoutDashboard, LogOut, Newspaper, Package, Settings } from 'lucide-react';
import { logout } from '../../services/api';

const navItems = [
  { name: 'Painel', path: '/admin', icon: LayoutDashboard, exact: true },
  { name: 'Produtos', path: '/admin/produtos', icon: Package, exact: false },
  { name: 'Categorias', path: '/admin/colecoes', icon: FolderTree, exact: false },
  { name: 'Notícias', path: '/admin/noticias', icon: Newspaper, exact: false },
  { name: 'Configurações', path: '/admin/configuracoes', icon: Settings, exact: false },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-line/30 bg-white">
      <div className="flex h-16 items-center justify-center gap-3 border-b border-line/30 px-6 md:h-20">
        <img src="/logo.png" alt="" className="h-9 w-9" />
        <span className="font-serif text-xl font-semibold tracking-tight text-primary">Muni Moldes</span>
      </div>

      <nav className="flex flex-1 flex-col gap-2 p-4" aria-label="Painel">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex min-h-11 items-center gap-4 rounded-lg px-4 text-[13px] font-semibold tracking-[0.05em] transition-colors ${
                isActive ? 'bg-primary-soft text-primary-dark' : 'text-ink-soft hover:bg-line-soft'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}

        <button
          type="button"
          onClick={logout}
          className="mt-auto flex min-h-11 items-center gap-4 rounded-lg px-4 text-[13px] font-semibold tracking-[0.05em] text-ink-soft transition-colors hover:bg-[#ffdad6] hover:text-[#93000a]"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </nav>
    </aside>
  );
}
