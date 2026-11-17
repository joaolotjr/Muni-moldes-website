import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { apiErrorMessage } from '../../utils/apiError';
import { useToast } from '../../contexts/ToastContext';
import { getIdleMs, useSessionUser } from '../../services/session';
import { PasswordInput } from '../../components/admin/PasswordInput';
import { permissionOptions } from '../../config/permissions';

const labelClass = 'mb-2 ml-1 block text-[13px] font-semibold tracking-[0.05em] text-ink-soft';
const MIN_PASSWORD = 8;
const emptyForm = { current: '', next: '', confirm: '' };

export function Account() {
  const user = useSessionUser();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const update = (changes: Partial<typeof emptyForm>) => setForm((current) => ({ ...current, ...changes }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.next.length < MIN_PASSWORD) {
      return showToast(`A nova senha deve ter pelo menos ${MIN_PASSWORD} caracteres.`, 'error');
    }
    if (form.next !== form.confirm) return showToast('A confirmação não é igual à nova senha.', 'error');

    setSaving(true);
    try {
      await api.put('/auth/password', { current_password: form.current, new_password: form.next });
      setForm(emptyForm);
      showToast('Senha alterada!', 'success');
    } catch (error) {
      showToast(apiErrorMessage(error, 'Erro ao alterar a senha.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const granted = permissionOptions.filter((option) => user.permissions.includes(option.value));
  const idleMinutes = Math.round(getIdleMs() / 60_000);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header>
        <h1 className="heading-2">Minha conta</h1>
        <p className="mt-2 text-ink-soft">Seus dados de acesso ao painel.</p>
      </header>

      <section className="panel">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="label-caps">Nome</dt>
            <dd className="font-medium">{user.name}</dd>
          </div>
          <div className="min-w-0">
            <dt className="label-caps">E-mail</dt>
            <dd className="truncate font-medium">{user.email}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="label-caps">O que você pode alterar</dt>
            <dd className="flex flex-wrap gap-2">
              {granted.length === 0 ? (
                <span className="text-ink-soft">Nenhuma área liberada.</span>
              ) : (
                granted.map((option) => (
                  <span key={option.value} className="status-chip bg-secondary-soft text-secondary-dark">
                    {option.label}
                  </span>
                ))
              )}
            </dd>
          </div>
        </dl>
        <p className="mt-5 border-t border-line-soft pt-5 text-[13px] text-outline">
          Por segurança, o painel encerra a sessão depois de {idleMinutes} {idleMinutes === 1 ? "minuto" : "minutos"} sem uso.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="panel flex flex-col gap-5">
        <h2 className="heading-3">Alterar senha</h2>
        <div>
          <label htmlFor="current-password" className={labelClass}>Senha atual</label>
          <PasswordInput
            id="current-password"
            required
            autoComplete="current-password"
            value={form.current}
            onChange={(e) => update({ current: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="new-password" className={labelClass}>Nova senha</label>
          <PasswordInput
            id="new-password"
            required
            minLength={MIN_PASSWORD}
            maxLength={72}
            autoComplete="new-password"
            value={form.next}
            onChange={(e) => update({ next: e.target.value })}
          />
          <p className="ml-1 mt-2 text-[13px] text-outline">Mínimo de {MIN_PASSWORD} caracteres.</p>
        </div>
        <div>
          <label htmlFor="confirm-password" className={labelClass}>Repita a nova senha</label>
          <PasswordInput
            id="confirm-password"
            required
            maxLength={72}
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => update({ confirm: e.target.value })}
          />
        </div>
        <button type="submit" disabled={saving} className="btn btn-primary btn-plain self-start disabled:pointer-events-none disabled:opacity-60">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Alterar senha
        </button>
      </form>
    </div>
  );
}
