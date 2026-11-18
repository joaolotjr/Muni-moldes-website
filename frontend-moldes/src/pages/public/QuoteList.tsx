import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ImageOff, Minus, Plus, Trash2 } from 'lucide-react';
import { api, API_URL } from '../../services/api';
import { useSite } from '../../contexts/SiteContext';
import { useQuote } from '../../contexts/QuoteContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import { WhatsAppIcon } from '../../components/icons/WhatsAppIcon';
import { clampQuantity, MAX_QUANTITY, quoteMessageFor } from '../../utils/quote';
import type { Product } from '../../types';

const fieldClass = 'field';

export function QuoteList() {
  const site = useSite();
  const { items, customer, setCustomer, setQuantity, remove, clear, sync } = useQuote();
  const { confirm } = useConfirm();
  const [removedNames, setRemovedNames] = useState<string[]>([]);

  // Confere a lista com o catálogo atual: tira o que saiu e atualiza nomes e códigos.
  useEffect(() => {
    if (items.length === 0) return;
    api
      .get<Product[]>('/products?public=true')
      .then(({ data }) => {
        const removed = sync(data);
        if (removed.length) setRemovedNames(removed.map((item) => item.name));
      })
      .catch(() => {
        // Sem conexão com a API, a lista segue como está.
      });
    // Só ao abrir a página.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const message = useMemo(() => quoteMessageFor(items, customer, site.whatsappLink), [items, customer, site]);

  const handleSend = () => {
    window.open(message.link, '_blank', 'noopener');
    // O WhatsApp abre em outra aba; a pessoa pode voltar para ajustar, então não limpa sozinho.
    confirm({
      title: 'Lista enviada para o WhatsApp',
      message: 'Se a mensagem foi enviada, você pode limpar a lista. Se ainda vai ajustar algo, mantenha.',
      confirmText: 'Limpar a lista',
      cancelText: 'Manter',
      onConfirm: clear,
    });
  };

  if (items.length === 0) {
    return (
      <div className="container-page flex-1 py-14 sm:py-24">
        <div className="card mx-auto max-w-2xl px-6 py-14 text-center sm:px-12">
          <h1 className="heading-2">Sua lista de orçamento está vazia</h1>
          <p className="mx-auto mt-4 max-w-md text-ink-soft">
            No catálogo, use "Adicionar à lista" nos moldes que interessam. Depois é só informar as
            quantidades e enviar tudo de uma vez pelo WhatsApp.
          </p>
          {removedNames.length > 0 && (
            <p className="mx-auto mt-4 max-w-md text-sm text-ink-soft">
              Saíram do catálogo e foram retirados da lista: {removedNames.join(', ')}.
            </p>
          )}
          <Link to="/catalogo" className="btn btn-primary mt-8">
            Ver catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page flex-1 pb-14 pt-6 sm:pb-24 sm:pt-10">
      <Link to="/catalogo" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Continuar escolhendo
      </Link>
      <h1 className="heading-1 mt-3">Lista de orçamento</h1>
      <p className="mt-3 max-w-2xl text-ink-soft sm:text-lg">
        Confira os moldes e as quantidades. A mensagem já vai pronta para o WhatsApp da fábrica.
      </p>

      {removedNames.length > 0 && (
        <p role="status" className="mt-6 rounded-lg border border-line bg-surface-low px-4 py-3 text-sm text-ink-soft">
          Saíram do catálogo e foram retirados da lista: {removedNames.join(', ')}.
        </p>
      )}

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-12">
        <section className="lg:col-span-7" aria-label="Moldes na lista">
          <ul className="card divide-y divide-line-soft">
            {items.map((item) => {
              const belowMin = item.minOrder !== null && item.quantity < item.minOrder;
              return (
                <li key={item.productId} className="flex gap-3 p-3 sm:gap-4 sm:p-5">
                  <Link to={`/molde/${item.slug}`} className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-mid sm:h-20 sm:w-20">
                    {item.image ? (
                      <img src={`${API_URL}${item.image}`} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-outline/60">
                        <ImageOff className="h-5 w-5" strokeWidth={1.5} />
                      </span>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    {item.code && (
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-outline">{item.code}</p>
                    )}
                    <Link to={`/molde/${item.slug}`} className="line-clamp-2 font-serif font-semibold leading-snug hover:text-primary sm:text-lg">
                      {item.name}
                    </Link>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center rounded-lg border border-line bg-white">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label={`Diminuir quantidade de ${item.name}`}
                          className="flex h-11 w-11 items-center justify-center text-ink-soft hover:text-primary disabled:opacity-30"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={MAX_QUANTITY}
                          value={item.quantity}
                          onChange={(e) => setQuantity(item.productId, clampQuantity(Number(e.target.value)))}
                          aria-label={`Quantidade de ${item.name}`}
                          className="h-11 w-16 border-x border-line text-center text-base [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity(item.productId, item.quantity + 1)}
                          aria-label={`Aumentar quantidade de ${item.name}`}
                          className="flex h-11 w-11 items-center justify-center text-ink-soft hover:text-primary"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.productId)}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-ink-soft hover:text-[#ba1a1a]"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remover
                      </button>
                    </div>
                    {belowMin && (
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-[#8a5300]">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        Pedido mínimo deste molde: {item.minOrder} unidades.
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1 text-sm text-ink-soft">
            <p>
              {items.length} {items.length === 1 ? 'modelo' : 'modelos'}, {total} unidades
            </p>
            <button
              type="button"
              onClick={() =>
                confirm({
                  title: 'Limpar a lista',
                  message: 'Tirar todos os moldes da lista de orçamento?',
                  confirmText: 'Limpar',
                  onConfirm: clear,
                })
              }
              className="min-h-11 rounded-lg px-2 font-semibold hover:text-[#ba1a1a]"
            >
              Limpar a lista
            </button>
          </div>
        </section>

        <section className="card p-5 sm:p-8 lg:sticky lg:top-28 lg:col-span-5" aria-labelledby="quote-contact">
          <h2 id="quote-contact" className="heading-3">Seus dados</h2>
          <p className="mt-1 text-sm text-ink-soft">Opcionais, mas ajudam a fábrica a responder mais rápido.</p>
          <div className="mt-5 grid gap-4">
            <div>
              <label htmlFor="quote-name" className="field-label">Nome</label>
              <input id="quote-name" type="text" autoComplete="name" value={customer.name} onChange={(e) => setCustomer({ name: e.target.value })} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="quote-company" className="field-label">Empresa</label>
              <input id="quote-company" type="text" autoComplete="organization" value={customer.company} onChange={(e) => setCustomer({ company: e.target.value })} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="quote-city" className="field-label">Cidade e estado</label>
              <input id="quote-city" type="text" value={customer.city} onChange={(e) => setCustomer({ city: e.target.value })} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="quote-notes" className="field-label">Observações</label>
              <textarea
                id="quote-notes"
                rows={3}
                maxLength={500}
                value={customer.notes}
                onChange={(e) => setCustomer({ notes: e.target.value })}
                placeholder="Prazo desejado, forma de envio, dúvidas..."
                className={`${fieldClass} resize-y`}
              />
            </div>
          </div>

          {message.compact && (
            <p role="status" className="mt-5 rounded-lg bg-surface-low px-4 py-3 text-sm text-ink-soft">
              {message.tooLong
                ? 'A lista é longa: a mensagem pode ser cortada em alguns celulares. Se isso acontecer, envie em duas partes.'
                : 'A lista é longa, então a mensagem vai resumida, com o código (ou o nome) e a quantidade de cada molde.'}
            </p>
          )}

          <button type="button" onClick={handleSend} className="btn btn-whatsapp mt-6 w-full py-4">
            <WhatsAppIcon className="h-5 w-5" />
            Enviar pelo WhatsApp
          </button>
          <p className="mt-3 text-center text-xs text-outline">
            A conversa abre com a mensagem pronta. Nada é enviado sem você confirmar no WhatsApp.
          </p>
        </section>
      </div>
    </div>
  );
}
