import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { api, setAuthToken, setUserName } from '../../services/api';

const inputClass =
  'w-full rounded-lg border border-line bg-surface-low py-3.5 pl-12 text-base text-ink shadow-sm transition-colors placeholder:text-ink-soft/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      setAuthToken(response.data.access_token);
      setUserName(response.data.user?.name);
      navigate('/admin');
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(
        typeof message === 'string' ? message : 'Erro ao fazer login. Verifique suas credenciais.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-surface px-5 py-10 font-sans text-ink">
      {/* Fundo: degradê suave e filete no topo, como na tela do Stitch */}
      <div className="pointer-events-none absolute inset-0 bg-radial-[at_top_right] from-surface-high via-surface to-surface opacity-70" />
      <div className="absolute left-0 top-0 h-1 w-full bg-linear-to-r from-surface via-primary to-surface opacity-20" />

      <main className="relative z-10 w-full max-w-[420px]">
        <div className="flex flex-col items-center rounded-2xl border border-line-soft bg-white p-6 shadow-soft sm:p-10">
          <div className="mb-8 flex w-full flex-col items-center text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-line-soft bg-surface-low shadow-sm">
              <img src="/logo.png" alt="" className="h-16 w-16" />
            </div>
            <h1 className="heading-2">Muni Moldes</h1>
            <p className="mt-2 text-ink-soft">Acesso ao painel administrativo</p>
          </div>

          <form onSubmit={handleLogin} className="flex w-full flex-col gap-5">
            {error && (
              <div role="alert" className="rounded-lg border border-[#ba1a1a]/20 bg-[#ffdad6] px-4 py-3 text-center text-sm font-medium text-[#93000a]">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 ml-1 block text-[13px] font-semibold tracking-[0.05em] text-ink-soft">
                E-mail
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="username"
                  inputMode="email"
                  autoCapitalize="none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClass} pr-4`}
                  placeholder="admin@munimoldes.com.br"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 ml-1 block text-[13px] font-semibold tracking-[0.05em] text-ink-soft">
                Senha
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-outline" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((show) => !show)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={showPassword}
                  className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-outline hover:text-primary"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary mt-2 w-full disabled:pointer-events-none disabled:opacity-70">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar no painel
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-ink-soft/70">Ambiente seguro. Acesso restrito a pessoas autorizadas.</p>
          <Link to="/" className="mt-4 inline-flex min-h-11 items-center gap-2 text-[13px] font-semibold text-primary underline-offset-4 hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </Link>
        </div>
      </main>
    </div>
  );
}
