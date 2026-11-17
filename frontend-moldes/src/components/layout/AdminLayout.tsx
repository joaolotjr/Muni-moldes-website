import { useState } from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import { ExternalLink, Menu } from 'lucide-react';
import { useIdleLogout } from '../../hooks/useIdleLogout';
import { getToken, useSessionUser } from '../../services/session';
import { AdminSidebar } from './AdminSidebar';

function initials(name: string | null | undefined) {
  if (!name) return 'AD';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : parts[0]?.[1] ?? '')).toUpperCase();
}

export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useSessionUser();
  useIdleLogout();

  if (!getToken() || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  const userName = user.name;

  return (
    <div className="flex h-dvh overflow-hidden bg-surface-low font-sans text-ink antialiased selection:bg-primary-soft selection:text-primary-dark">
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
            className="flex-1 bg-ink/40"
            onClick={() => setMenuOpen(false)}
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line/30 bg-white px-4 md:h-20 md:px-10">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="truncate font-serif text-lg font-semibold text-primary md:hidden">Muni Moldes</span>
            <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-outline md:block">
              Painel administrativo
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-line-soft hover:text-ink"
            >
              <ExternalLink className="h-4 w-4" />
              Ver site
            </a>
            <Link
              to="/admin/minha-conta"
              title={`${userName} · Minha conta`}
              aria-label="Minha conta"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-soft text-[13px] font-semibold text-secondary-dark shadow-sm transition hover:brightness-95"
            >
              {initials(userName)}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-surface">
          <div className="mx-auto max-w-[1280px] p-4 sm:p-6 md:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
