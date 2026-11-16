import { useState, type FormEvent } from 'react';
import { PageHeader } from '../../components/public/PageHeader';
import { InstagramIcon } from '../../components/icons/InstagramIcon';
import { WhatsAppIcon } from '../../components/icons/WhatsAppIcon';
import { defaultQuoteMessage, site, whatsappLink } from '../../config/site';

const subjects = [
  'Orçamento para atacado ou revenda',
  'Dúvida sobre um molde',
  'Molde personalizado',
  'Pedido em andamento',
  'Outro assunto',
];

export function Contact() {
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
    window.open(whatsappLink(lines.join('\n')), '_blank', 'noopener');
  };

  return (
    <div className="flex-1">
      <PageHeader eyebrow="Contato" title="Fale com a fábrica.">
        Orçamentos, dúvidas sobre moldes e pedidos em quantidade. O atendimento é feito pelo WhatsApp.
      </PageHeader>

      <section className="container-page grid gap-12 py-14 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        <div>
          <p className="eyebrow">Canais de atendimento</p>
          <dl className="mt-5 border-t border-line">
            <div className="border-b border-line py-4">
              <dt className="eyebrow">WhatsApp</dt>
              <dd className="mt-1">
                <a
                  href={whatsappLink(defaultQuoteMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-lg font-semibold hover:underline"
                >
                  <WhatsAppIcon className="h-5 w-5 text-sage" />
                  {site.phoneDisplay}
                </a>
                <p className="mt-1 text-sm text-ink-soft">{site.businessHours}</p>
              </dd>
            </div>
            <div className="border-b border-line py-4">
              <dt className="eyebrow">E-mail</dt>
              <dd className="mt-1">
                <a href={`mailto:${site.email}`} className="font-medium hover:underline">{site.email}</a>
              </dd>
            </div>
            <div className="border-b border-line py-4">
              <dt className="eyebrow">Instagram</dt>
              <dd className="mt-1">
                <a
                  href={site.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-medium hover:underline"
                >
                  <InstagramIcon className="h-4 w-4" />
                  {site.instagramHandle}
                </a>
              </dd>
            </div>
            <div className="border-b border-line py-4">
              <dt className="eyebrow">Fábrica</dt>
              <dd className="mt-1 text-sm leading-relaxed text-ink-soft">
                {site.addressLines.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </dd>
            </div>
          </dl>
        </div>

        <form onSubmit={handleSubmit} className="border border-line bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight">Envie sua solicitação</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Preencha os dados e a conversa abre no WhatsApp com a mensagem pronta.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="field-label">Nome</label>
              <input id="name" type="text" required value={form.name} onChange={update('name')} className="field" autoComplete="name" />
            </div>
            <div>
              <label htmlFor="company" className="field-label">Empresa <span className="font-normal text-ink-soft">(opcional)</span></label>
              <input id="company" type="text" value={form.company} onChange={update('company')} className="field" autoComplete="organization" />
            </div>
            <div>
              <label htmlFor="city" className="field-label">Cidade e estado <span className="font-normal text-ink-soft">(opcional)</span></label>
              <input id="city" type="text" value={form.city} onChange={update('city')} className="field" />
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
                rows={5}
                required
                value={form.message}
                onChange={update('message')}
                placeholder="Quais moldes e quantidades você precisa?"
                className="field resize-y"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-quote mt-6 w-full sm:w-auto">
            <WhatsAppIcon className="h-4 w-4" />
            Enviar pelo WhatsApp
          </button>
        </form>
      </section>
    </div>
  );
}
