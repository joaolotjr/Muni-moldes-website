import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { FileText, Home, Loader2, PanelBottom, Phone, RotateCcw, Save } from 'lucide-react';
import { api } from '../../services/api';
import { apiErrorMessage } from '../../utils/apiError';
import { defaultSettings, mergeSettings, type SiteSettings } from '../../config/site';
import { useSiteContext } from '../../contexts/SiteContext';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';

type Key = keyof SiteSettings;

interface FieldProps {
  name: Key;
  label: string;
  value: string;
  onChange: (name: Key, value: string) => void;
  hint?: ReactNode;
  maxLength: number;
  rows?: number;
  type?: string;
  inputMode?: 'numeric' | 'email' | 'text';
  placeholder?: string;
  required?: boolean;
}

function Field({ name, label, value, onChange, hint, maxLength, rows, type = 'text', inputMode, placeholder, required }: FieldProps) {
  const id = `setting-${name}`;
  return (
    <div>
      <label htmlFor={id} className="label-caps">{label}</label>
      {rows ? (
        <textarea
          id={id}
          rows={rows}
          value={value}
          maxLength={maxLength}
          required={required}
          placeholder={placeholder}
          onChange={(e) => onChange(name, e.target.value)}
          className="input resize-y"
        />
      ) : (
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          value={value}
          maxLength={maxLength}
          required={required}
          placeholder={placeholder}
          onChange={(e) => onChange(name, e.target.value)}
          className="input"
        />
      )}
      {hint && <p className="mt-2 text-[13px] text-outline">{hint}</p>}
    </div>
  );
}

function Section({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children: ReactNode }) {
  return (
    <section className="panel">
      <h2 className="heading-3 flex items-center gap-2">
        <span className="text-outline">{icon}</span>
        {title}
      </h2>
      <p className="mb-6 mt-1 text-sm text-ink-soft">{description}</p>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

export function Settings() {
  const { applySettings } = useSiteContext();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [form, setForm] = useState<SiteSettings>(defaultSettings);
  const [saved, setSaved] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => {
        const current = mergeSettings(res.data);
        setForm(current);
        setSaved(current);
      })
      .catch(() => showToast('Erro ao carregar as configurações.', 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const change = (name: Key, value: string) => setForm((current) => ({ ...current, [name]: value }));
  const changed = (Object.keys(form) as Key[]).some((key) => form[key] !== saved[key]);

  // Avisa antes de sair da página com alterações não salvas.
  useEffect(() => {
    if (!changed) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [changed]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const whatsappNumber = form.whatsappNumber.replace(/\D/g, '');
    if (!/^\d{10,15}$/.test(whatsappNumber)) {
      return showToast('O WhatsApp deve ter de 10 a 15 números, com código do país e DDD.', 'error');
    }

    setSaving(true);
    try {
      const res = await api.put('/settings', { ...form, whatsappNumber });
      const current = mergeSettings(res.data);
      setForm(current);
      setSaved(current);
      applySettings(res.data);
      showToast('Configurações salvas! O site já mostra os novos dados.', 'success');
    } catch (error) {
      showToast(apiErrorMessage(error, 'Erro ao salvar as configurações.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    confirm({
      title: 'Descartar alterações',
      message: 'Os campos voltam ao que está salvo hoje. O que você digitou e não salvou será perdido.',
      confirmText: 'Descartar',
      onConfirm: () => setForm(saved),
    });
  };

  if (loading) {
    return <p className="py-20 text-center text-ink-soft">Carregando configurações...</p>;
  }

  const field = (name: Key) => ({ name, value: form[name], onChange: change });
  const whatsappDigits = form.whatsappNumber.replace(/\D/g, '');

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-8">
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="heading-2">Configurações do site</h1>
          <p className="mt-2 max-w-2xl text-ink-soft">
            Contatos e textos que aparecem no site. As mudanças valem assim que você salva.
          </p>
        </div>
        <div className="flex w-full items-center gap-3 md:w-auto">
          <button type="button" onClick={discard} disabled={!changed || saving} className="btn btn-outline btn-plain flex-1 disabled:pointer-events-none disabled:opacity-50 md:flex-none">
            <RotateCcw className="h-4 w-4" />
            Descartar
          </button>
          <button type="submit" disabled={!changed || saving} className="btn btn-primary btn-plain flex-1 disabled:pointer-events-none disabled:opacity-50 md:flex-none">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar
          </button>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-8">
        <Section icon={<Phone className="h-6 w-6" />} title="Contato" description="Aparecem no rodapé, na página de contato e nos botões de orçamento.">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field
              {...field('whatsappNumber')}
              label="WhatsApp (só números)"
              maxLength={20}
              inputMode="numeric"
              required
              placeholder="5511999999999"
              hint={
                whatsappDigits.length >= 10 ? (
                  <>
                    Os botões de orçamento abrem{' '}
                    <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-2">
                      wa.me/{whatsappDigits}
                    </a>
                    . Clique para testar.
                  </>
                ) : (
                  'Com código do país (55) e DDD, sem espaços nem traços.'
                )
              }
            />
            <Field {...field('phoneDisplay')} label="Telefone como aparece no site" maxLength={30} required placeholder="(11) 99999-9999" />
          </div>
          <Field {...field('email')} label="E-mail" type="email" inputMode="email" maxLength={150} hint="Deixe em branco para não mostrar e-mail no site." />
          <Field {...field('instagramHandle')} label="Instagram" maxLength={31} placeholder="@munimoldes" hint="Só o nome do perfil. Em branco, o Instagram some do site." />
          <Field {...field('businessHours')} label="Horário de atendimento" maxLength={120} />
          <Field {...field('address')} label="Endereço" rows={3} maxLength={300} hint="Uma linha do endereço por linha. Em branco, o endereço some do site." />
        </Section>

        <Section icon={<Home className="h-6 w-6" />} title="Página inicial" description="Textos da abertura e do bloco de história da página inicial.">
          <Field {...field('heroBadge')} label="Etiqueta acima do título" maxLength={80} />
          <Field {...field('heroTitle')} label="Título" maxLength={120} required />
          <Field {...field('heroHighlight')} label="Fim do título, em destaque" maxLength={80} hint="Aparece em itálico e colorido, logo depois do título." />
          <Field {...field('heroText')} label="Texto de abertura" rows={3} maxLength={400} />
          <Field {...field('homeStoryText')} label="Bloco “Nossa história”" rows={5} maxLength={1000} />
        </Section>

        <Section icon={<FileText className="h-6 w-6" />} title="Quem somos" description="Textos da página “Sobre nós”.">
          <Field {...field('aboutTitle')} label="Título da página" maxLength={160} required />
          <Field {...field('aboutIntro')} label="Texto de abertura" rows={3} maxLength={400} />
          <Field {...field('aboutStoryTitle')} label="Título da história" maxLength={120} />
          <Field
            {...field('aboutStory')}
            label="História"
            rows={12}
            maxLength={5000}
            hint="Deixe uma linha em branco entre os parágrafos. O último parágrafo aparece em destaque."
          />
        </Section>

        <Section icon={<PanelBottom className="h-6 w-6" />} title="Rodapé" description="Frase de apresentação que aparece no fim de todas as páginas.">
          <Field {...field('footerText')} label="Texto do rodapé" rows={3} maxLength={400} />
        </Section>
      </div>

      {changed && (
        <p className="text-sm font-medium text-primary" role="status">
          Há alterações não salvas.
        </p>
      )}
    </form>
  );
}
