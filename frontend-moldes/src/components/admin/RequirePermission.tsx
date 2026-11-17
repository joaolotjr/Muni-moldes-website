import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useSessionUser } from '../../services/session';
import { permissionLabel, type Permission } from '../../config/permissions';

/** Mostra a tela só para quem tem a permissão; para os demais, um aviso. */
export function RequirePermission({ permission, children }: { permission: Permission; children: ReactNode }) {
  const user = useSessionUser();

  if (user?.permissions.includes(permission)) return <>{children}</>;

  return (
    <div className="panel mx-auto mt-6 flex max-w-xl flex-col items-center text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-mid text-primary">
        <ShieldAlert className="h-7 w-7" />
      </span>
      <h1 className="heading-3 mt-5">Você não tem acesso a esta área</h1>
      <p className="mt-2 text-ink-soft">
        Seu usuário não tem a permissão "{permissionLabel(permission)}". Peça a quem administra os
        usuários para liberar o acesso.
      </p>
      <Link to="/admin" className="btn btn-outline btn-plain mt-6">
        Voltar ao painel
      </Link>
    </div>
  );
}
