import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2, X } from 'lucide-react';
import { api } from '../../services/api';
import { apiErrorMessage } from '../../utils/apiError';
import { useToast } from '../../contexts/ToastContext';
import { useSessionUser } from '../../services/session';
import { PasswordInput } from '../../components/admin/PasswordInput';
import { permissionOptions, type Permission } from '../../config/permissions';
import type { AdminUser } from '../../types';

const labelClass = 'mb-2 ml-1 block text-[13px] font-semibold tracking-[0.05em] text-ink-soft';
const MIN_PASSWORD = 8;

const emptyForm = {
  name: '',
  email: '',
  password: '',
  permissions: [] as Permission[],
  is_active: true,
};

export function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const me = useSessionUser();
  const [loadingUser, setLoadingUser] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const isMe = Boolean(id) && id === me?.id;
  const update = (changes: Partial<typeof emptyForm>) => setForm((current) => ({ ...current, ...changes }));

  useEffect(() => {
    if (!id) return;
    api
      .get<AdminUser>(`/users/${id}`)
      .then(({ data }) =>
        setForm({
          name: data.name,
          email: data.email,
          password: '',
          permissions: data.permissions,
          is_active: data.is_active,
        }),
      )
      .catch((error) => {
        showToast(apiErrorMessage(error, 'Erro ao carregar o usuário.'), 'error');
        navigate('/admin/usuarios');
      })
      .finally(() => setLoadingUser(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const togglePermission = (permission: Permission, checked: boolean) =>
    update({
      permissions: checked
        ? [...form.permissions, permission]
        : form.permissions.filter((item) => item !== permission),
    });

  const allSelected = form.permissions.length === permissionOptions.length;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return showToast('Digite o nome do usuário.', 'error');
    if (!id && form.password.length < MIN_PASSWORD) {
      return showToast(`A senha deve ter pelo menos ${MIN_PASSWORD} caracteres.`, 'error');
    }
    if (form.password && form.password.length < MIN_PASSWORD) {
      return showToast(`A nova senha deve ter pelo menos ${MIN_PASSWORD} caracteres.`, 'error');
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      permissions: form.permissions,
      is_active: form.is_active,
      // Na edição, senha em branco mantém a atual.
      ...(form.password ? { password: form.password } : {}),
    };
    try {
      if (id) {
        await api.put(`/users/${id}`, payload);
      } else {
        await api.post('/users', payload);
      }
      showToast(id ? 'Usuário salvo!' : 'Usuário criado!', 'success');
      navigate('/admin/usuarios');
    } catch (error) {
      showToast(apiErrorMessage(error, 'Erro ao salvar o usuário.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loadingUser) {
    return <p className="py-20 text-center text-ink-soft">Carregando usuário...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-line/30 bg-white shadow-soft">
      <header className="flex items-start justify-between gap-4 border-b border-line-soft/50 px-5 pb-4 pt-6 sm:px-10 sm:pt-10">
        <div>
          <h1 className="heading-2">{id ? 'Editar usuário' : 'Novo usuário'}</h1>
          <p className="mt-2 text-ink-soft">
            {id ? 'Altere os dados, a senha ou o que esta pessoa pode fazer.' : 'Crie o acesso de mais uma pessoa ao painel.'}
          </p>
        </div>
        <Link to="/admin/usuarios" aria-label="Fechar" className="icon-btn text-ink-soft">
          <X className="h-6 w-6" />
        </Link>
      </header>

      <div className="flex flex-col gap-6 p-5 sm:p-10">
        <div>
          <label htmlFor="user-name" className={labelClass}>Nome</label>
          <input
            id="user-name"
            type="text"
            required
            maxLength={150}
            autoComplete="off"
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
            className="input bg-surface"
          />
        </div>

        <div>
          <label htmlFor="user-email" className={labelClass}>E-mail</label>
          <input
            id="user-email"
            type="email"
            required
            maxLength={150}
            autoComplete="off"
            autoCapitalize="none"
            inputMode="email"
            value={form.email}
            onChange={(e) => update({ email: e.target.value })}
            className="input bg-surface"
          />
          <p className="ml-1 mt-2 text-[13px] text-outline">É com este e-mail que a pessoa entra no painel.</p>
        </div>

        <div>
          <label htmlFor="user-password" className={labelClass}>{id ? 'Nova senha' : 'Senha'}</label>
          <PasswordInput
            id="user-password"
            required={!id}
            minLength={MIN_PASSWORD}
            maxLength={72}
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => update({ password: e.target.value })}
          />
          <p className="ml-1 mt-2 text-[13px] text-outline">
            {id
              ? `Deixe em branco para manter a senha atual. Mínimo de ${MIN_PASSWORD} caracteres.`
              : `Mínimo de ${MIN_PASSWORD} caracteres. A pessoa pode trocar depois em "Minha conta".`}
          </p>
        </div>

        <fieldset className="border-t border-line-soft pt-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <legend className="font-medium">Permissões</legend>
            <button
              type="button"
              onClick={() => update({ permissions: allSelected ? (isMe ? ['users'] : []) : permissionOptions.map((o) => o.value) })}
              className="min-h-11 rounded-lg px-2 text-[13px] font-semibold text-primary hover:text-primary-dark"
            >
              {allSelected ? 'Desmarcar todas' : 'Marcar todas'}
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {permissionOptions.map((option) => {
              // Ninguém tira de si mesmo a permissão de administrar usuários.
              const locked = isMe && option.value === 'users';
              return (
                <label
                  key={option.value}
                  className={`flex min-h-11 items-start gap-3 rounded-lg px-2 py-2.5 ${locked ? 'opacity-70' : 'cursor-pointer hover:bg-surface-low'}`}
                >
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(option.value)}
                    disabled={locked}
                    onChange={(e) => togglePermission(option.value, e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-secondary"
                  />
                  <span>
                    <span className="block font-medium">{option.label}</span>
                    <span className="block text-sm text-ink-soft">
                      {option.description}
                      {locked && ' Você não pode remover esta permissão de si mesmo.'}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          <p className="ml-1 mt-3 text-[13px] text-outline">
            Sem nenhuma permissão, a pessoa entra no painel mas só vê a tela inicial.
          </p>
        </fieldset>

        <div className="border-t border-line-soft pt-6">
          <label className={`flex min-h-11 items-center justify-between gap-4 ${isMe ? 'opacity-70' : 'cursor-pointer'}`}>
            <span>
              <span className="block font-medium">Usuário ativo</span>
              <span className="block text-sm text-ink-soft">
                {isMe
                  ? 'Você não pode desativar a própria conta.'
                  : 'Desativado, o usuário não consegue entrar e é desconectado na hora.'}
              </span>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={form.is_active}
              disabled={isMe}
              onChange={(e) => update({ is_active: e.target.checked })}
              className="peer sr-only"
            />
            <span className="relative h-7 w-12 shrink-0 rounded-full bg-line transition-colors after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-secondary peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary" />
          </label>
        </div>
      </div>

      <footer className="flex flex-col-reverse gap-3 px-5 pb-6 sm:flex-row sm:items-center sm:justify-end sm:px-10 sm:pb-10">
        <Link to="/admin/usuarios" className="btn btn-plain text-ink-soft hover:bg-surface-low hover:text-ink">
          Cancelar
        </Link>
        <button type="submit" disabled={saving} className="btn btn-primary btn-plain disabled:pointer-events-none disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {id ? 'Salvar usuário' : 'Criar usuário'}
        </button>
      </footer>
    </form>
  );
}
