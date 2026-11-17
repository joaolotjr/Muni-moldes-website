import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { apiErrorMessage } from '../../utils/apiError';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { useSessionUser } from '../../services/session';
import { permissionLabel, permissionOptions } from '../../config/permissions';
import type { AdminUser } from '../../types';

function accessSummary(user: AdminUser) {
  if (user.permissions.length === 0) return 'Sem acesso a nenhuma área';
  if (user.permissions.length === permissionOptions.length) return 'Acesso completo';
  // Na ordem do menu, não na ordem em que foram marcadas.
  return permissionOptions
    .filter((option) => user.permissions.includes(option.value))
    .map((option) => permissionLabel(option.value))
    .join(', ');
}

export function UsersList() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const me = useSessionUser();

  useEffect(() => {
    api
      .get<AdminUser[]>('/users')
      .then(({ data }) => setUsers(data))
      .catch((error) => showToast(apiErrorMessage(error, 'Erro ao carregar os usuários.'), 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = (user: AdminUser) => {
    confirm({
      title: 'Excluir usuário',
      message: `Tem certeza que deseja excluir "${user.name}"? Essa pessoa perde o acesso ao painel na hora.`,
      confirmText: 'Excluir',
      onConfirm: async () => {
        try {
          await api.delete(`/users/${user.id}`);
          setUsers((current) => current.filter((item) => item.id !== user.id));
          showToast('Usuário excluído.', 'success');
        } catch (error) {
          showToast(apiErrorMessage(error, 'Erro ao excluir o usuário.'), 'error');
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="heading-2">Usuários do painel</h1>
          <p className="mt-2 text-ink-soft">Quem pode entrar no painel e o que cada pessoa pode alterar.</p>
        </div>
        <Link to="/admin/usuarios/novo" className="btn btn-primary btn-plain w-full md:w-auto">
          <Plus className="h-5 w-5" />
          Novo usuário
        </Link>
      </header>

      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-soft">
        <div className="hidden grid-cols-[1.2fr_1.4fr_auto_auto] items-center gap-4 border-b border-line bg-surface-low px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft md:grid">
          <div>Usuário</div>
          <div>Acesso</div>
          <div className="w-20">Situação</div>
          <div className="w-20 text-right">Ações</div>
        </div>

        {loading ? (
          <p className="px-6 py-10 text-center text-ink-soft">Carregando usuários...</p>
        ) : users.length === 0 ? (
          <p className="px-6 py-10 text-center text-ink-soft">Nenhum usuário encontrado.</p>
        ) : (
          <ul>
            {users.map((user) => {
              const isMe = user.id === me?.id;
              return (
                <li
                  key={user.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-b border-line px-4 py-4 transition-colors last:border-b-0 hover:bg-surface-mid sm:px-6 md:grid-cols-[1.2fr_1.4fr_auto_auto]"
                >
                  <div className="min-w-0">
                    <Link to={`/admin/usuarios/${user.id}`} className="block truncate font-medium hover:text-primary">
                      {user.name}
                      {isMe && <span className="ml-2 text-sm font-normal text-outline">(você)</span>}
                    </Link>
                    <p className="truncate text-sm text-ink-soft">{user.email}</p>
                  </div>
                  <p className="order-3 col-span-2 text-sm text-ink-soft md:order-none md:col-span-1">
                    {accessSummary(user)}
                  </p>
                  <div className="order-4 md:order-none md:w-20">
                    <span
                      className={`status-chip ${
                        user.is_active ? 'bg-secondary-soft text-secondary-dark' : 'border border-line bg-surface text-outline'
                      }`}
                    >
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="order-2 flex w-20 justify-end gap-1 md:order-none">
                    <Link to={`/admin/usuarios/${user.id}`} aria-label={`Editar ${user.name}`} title="Editar" className="icon-btn">
                      <Pencil className="h-5 w-5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(user)}
                      disabled={isMe}
                      aria-label={`Excluir ${user.name}`}
                      title={isMe ? 'Você não pode excluir a própria conta' : 'Excluir usuário'}
                      className="icon-btn hover:bg-[#ffdad6] hover:text-[#ba1a1a]"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
