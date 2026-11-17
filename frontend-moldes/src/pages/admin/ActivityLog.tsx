import { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { apiErrorMessage } from '../../utils/apiError';
import { useToast } from '../../contexts/ToastContext';
import type { AuditLog } from '../../types';

const areas: Record<string, string> = {
  products: 'Produtos',
  collections: 'Categorias',
  news: 'Notícias',
  settings: 'Configurações',
  users: 'Usuários',
  auth: 'Acesso',
};

// Como cada item é chamado na frase, por área.
const things: Record<string, string> = {
  products: 'o produto',
  collections: 'a categoria',
  news: 'a notícia',
  users: 'o usuário',
};

function describe(log: AuditLog): string {
  const thing = things[log.area] ?? 'um item';
  const name = log.target ? ` "${log.target}"` : '';
  switch (log.action) {
    case 'create':
      return `Criou ${thing}${name}`;
    case 'update':
      return log.area === 'settings' ? 'Alterou as configurações do site' : `Alterou ${thing}${name}`;
    case 'delete':
      return `Excluiu ${thing}${name}`;
    case 'image_add':
      return log.area === 'news' ? `Trocou a imagem da notícia${name}` : `Adicionou uma foto ao produto${name}`;
    case 'image_remove':
      return log.area === 'news' ? `Removeu a imagem da notícia${name}` : `Removeu uma foto do produto${name}`;
    case 'login':
      return 'Entrou no painel';
    case 'logout':
      return 'Saiu do painel';
    case 'login_failed':
      return 'Tentativa de login com senha ou e-mail errados';
    case 'password_change':
      return 'Trocou a própria senha';
    default:
      return `${log.action}${name}`;
  }
}

const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });

export function ActivityLog() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [area, setArea] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    api
      .get<AuditLog[]>('/audit-logs', { params: { limit: 300 } })
      .then(({ data }) => setLogs(data))
      .catch((error) => showToast(apiErrorMessage(error, 'Erro ao carregar as atividades.'), 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = useMemo(() => (area ? logs.filter((log) => log.area === area) : logs), [logs, area]);

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="heading-2">Registro de atividades</h1>
          <p className="mt-2 text-ink-soft">
            Quem entrou no painel e o que foi criado, alterado ou excluído. Mostra as 300 ações mais recentes.
          </p>
        </div>
        <div className="w-full md:w-56">
          <label htmlFor="activity-area" className="label-caps">Área</label>
          <select id="activity-area" value={area} onChange={(e) => setArea(e.target.value)} className="input bg-white">
            <option value="">Todas</option>
            {Object.entries(areas).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-soft">
        <div className="hidden grid-cols-[170px_1fr_2fr_130px] items-center gap-4 border-b border-line bg-surface-low px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft md:grid">
          <div>Quando</div>
          <div>Quem</div>
          <div>O que fez</div>
          <div>Endereço IP</div>
        </div>

        {loading ? (
          <p className="px-6 py-10 text-center text-ink-soft">Carregando atividades...</p>
        ) : visible.length === 0 ? (
          <p className="px-6 py-10 text-center text-ink-soft">Nenhuma atividade registrada.</p>
        ) : (
          <ul>
            {visible.map((log) => {
              const failed = log.action === 'login_failed';
              return (
                <li
                  key={log.id}
                  className="grid gap-x-4 gap-y-1 border-b border-line px-4 py-3.5 last:border-b-0 sm:px-6 md:grid-cols-[170px_1fr_2fr_130px] md:items-center"
                >
                  <time dateTime={log.created_at} className="text-sm tabular-nums text-ink-soft">
                    {dateFormat.format(new Date(log.created_at))}
                  </time>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{log.user_name ?? 'Não identificado'}</p>
                    {log.user_email && <p className="truncate text-sm text-ink-soft">{log.user_email}</p>}
                  </div>
                  <p className={failed ? 'font-medium text-[#93000a]' : undefined}>
                    {describe(log)}
                    <span className="ml-2 text-sm text-outline">· {areas[log.area] ?? log.area}</span>
                  </p>
                  <p className="text-sm tabular-nums text-outline">{log.ip ?? ''}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
