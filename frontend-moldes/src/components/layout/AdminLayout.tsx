import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';

export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex h-dvh bg-slate-50 font-sans antialiased overflow-hidden">
      {/* Menu lateral: fixo no desktop, gaveta no celular */}
      <div className="hidden md:flex">
        <AdminSidebar />
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <AdminSidebar onNavigate={() => setMenuOpen(false)} />
          <button
            type="button"
            aria-label="Fechar menu"
            className="flex-1 bg-slate-900/50"
            onClick={() => setMenuOpen(false)}
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 bg-slate-900 px-4 text-white md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-lg font-bold tracking-tight">Muni Admin</span>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 relative">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] bg-[length:20px_20px] pointer-events-none"></div>
          <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
