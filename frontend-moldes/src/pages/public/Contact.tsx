import { useState, type FormEvent, type ReactNode } from 'react';
import { Clock, Mail, MapPin, Send } from 'lucide-react';
import { PageHeader } from '../../components/public/PageHeader';
import { InstagramIcon } from '../../components/icons/InstagramIcon';
import { WhatsAppIcon } from '../../components/icons/WhatsAppIcon';
import { useSite } from '../../contexts/SiteContext';

const subjects = [
  'Orçamento para atacado ou revenda',
  'Dúvida sobre um molde',
  'Molde personalizado',
  'Pedido em andamento',
  'Outro assunto',
];

function Channel({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-secondary-dark">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">{label}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

export function Contact() {
  const site = useSite();
  const [form, setForm] = useState({ name: '', company: '', city: '', subject: subjects[0], message: '' });

  const update = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((current) => ({ ...current, [field]: e.target.value }));

  // O formulário monta a mensagem e abre a conversa no WhatsApp da fábrica.
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const lines = [`Olá! Meu nome é ${form.name}.`];
    if (form.company) lines.push(`Empresa: ${form.company}`);
    if (form.city) lines.push(`Cidade: ${form.city}`);
    lines.push(`Assunto: ${form.subject}`, '', form.message);
    window.open(site.whatsappLink(lines.join('\n')), '_blank', 'noopener');
  };

  return (
    <div className="flex-1">
      <PageHeader eyebrow="Contato" title="Fale com a fábrica">
        Orçamentos, dúvidas sobre moldes e pedidos em quantidade. O atendimento é feito pelo WhatsApp.
      </PageHeader>

      <section className="container-page grid items-start gap-6 pb-16 sm:pb-24 lg:grid-cols-12 lg:gap-16">
        {/* No celular os canais vêm primeiro: o WhatsApp é o caminho mais curto */}
        <div className="rounded-2xl border border-line-soft bg-surface-low p-6 sm:p-10 lg:order-2 lg:col-span-5">
          <h2 className="heading-3">Canais de atendimento</h2>
          <div className="mt-6 space-y-6">
            {site.email && (
              <Channel icon={<Mail className="h-5 w-5" />} label="E-mail">
                <a href={`mailto:${site.email}`} className="break-all hover:text-primary">{site.email}</a>
              </Channel>
            )}
            {site.instagramUrl && (
              <Channel icon={<InstagramIcon className="h-5 w-5" />} label="Instagram">
                <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  {site.instagramHandle}
                </a>
              </Channel>
            )}
            {site.businessHours && (
              <Channel icon={<Clock className="h-5 w-5" />} label="Horário">
                <p>{site.businessHours}</p>
              </Channel>
            )}
            {site.addressLines.length > 0 && (
              <Channel icon={<MapPin className="h-5 w-5" />} label="Fábrica">
                <p className="leading-relaxed">
                  {site.addressLines.map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </p>
              </Channel>
            )}
          </div>
          <div className="mt-6 border-t border-line/40 pt-6">
            <a
              href={site.quoteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp w-full py-4"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Falar no WhatsApp · {site.phoneDisplay}
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 sm:p-10 lg:order-1 lg:col-span-7">
          <h2 className="heading-3">Envie sua solicitação</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Preencha os dados e a conversa abre no WhatsApp com a mensagem pronta.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 sm:gap-6">
            <div>
              <label htmlFor="name" className="field-label">Nome</label>
              <input id="name" type="text" required value={form.name} onChange={update('name')} className="field" autoComplete="name" placeholder="Seu nome" />
            </div>
            <div>
              <label htmlFor="company" className="field-label">Empresa <span className="font-normal normal-case tracking-normal text-ink-soft">(opcional)</span></label>
              <input id="company" type="text" value={form.company} onChange={update('company')} className="field" autoComplete="organization" />
            </div>
            <div>
              <label htmlFor="city" className="field-label">Cidade e estado <span className="font-normal normal-case tracking-normal text-ink-soft">(opcional)</span></label>
              <input id="city" type="text" value={form.city} onChange={update('city')} className="field" autoComplete="address-level2" />
            </div>
            <div>
              <label htmlFor="subject" className="field-label">Assunto</label>
              <select id="subject" value={form.subject} onChange={update('subject')} className="field">
                {subjects.map((subject) => (
                  <option key={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="message" className="field-label">Mensagem</label>
              <textarea
                id="message"
                rows={6}
                required
                value={form.message}
                onChange={update('message')}
                placeholder="Quais moldes e quantidades você precisa?"
                className="field resize-y"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-6 w-full sm:w-auto sm:px-10">
            Enviar pelo WhatsApp
            <Send className="h-4 w-4" />
          </button>
        </form>
      </section>
    </div>
  );
}
