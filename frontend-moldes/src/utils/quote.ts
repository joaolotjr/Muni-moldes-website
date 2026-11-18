/** Um molde na lista de orçamento do cliente. */
export interface QuoteItem {
  productId: string;
  slug: string;
  name: string;
  code: string | null;
  /** Foto pequena para a lista; pode ficar desatualizada, é só ilustrativa. */
  image: string | null;
  quantity: number;
  minOrder: number | null;
}

export interface QuoteCustomer {
  name: string;
  company: string;
  city: string;
  notes: string;
}

export const emptyCustomer: QuoteCustomer = { name: '', company: '', city: '', notes: '' };

export const MAX_QUANTITY = 100_000;

/** Garante uma quantidade inteira entre 1 e o máximo. */
export function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_QUANTITY, Math.max(1, Math.round(value)));
}

/**
 * Acima deste tamanho de link, alguns aparelhos cortam a mensagem do WhatsApp.
 * É uma estimativa conservadora; vale medir com aparelhos reais.
 */
export const MAX_LINK_LENGTH = 1800;

function itemLine(item: QuoteItem, index: number, compact: boolean): string {
  const label = compact ? (item.code ?? item.name) : [item.code, item.name].filter(Boolean).join(' ');
  return compact
    ? `${label} x${item.quantity}`
    : `${index + 1}. ${label} — ${item.quantity} un.`;
}

/** Monta o texto da mensagem. Na forma compacta, cada linha leva só o código (ou o nome) e a quantidade. */
export function buildQuoteMessage(
  items: QuoteItem[],
  customer: QuoteCustomer,
  compact = false,
): string {
  const lines = ['Olá! Gostaria de um orçamento destes moldes:', ''];
  items.forEach((item, index) => lines.push(itemLine(item, index, compact)));
  const total = items.reduce((sum, item) => sum + item.quantity, 0);
  lines.push('', `Total: ${items.length} ${items.length === 1 ? 'modelo' : 'modelos'}, ${total} unidades.`);

  const details = [
    customer.name.trim() && `Nome: ${customer.name.trim()}`,
    customer.company.trim() && `Empresa: ${customer.company.trim()}`,
    customer.city.trim() && `Cidade: ${customer.city.trim()}`,
  ].filter(Boolean) as string[];
  if (details.length) lines.push('', ...details);
  if (customer.notes.trim()) lines.push('', `Observações: ${customer.notes.trim()}`);
  return lines.join('\n');
}

/**
 * Escolhe a mensagem completa ou, se o link ficar longo demais, a compacta.
 * Devolve também se houve compactação, para avisar o cliente.
 */
export function quoteMessageFor(
  items: QuoteItem[],
  customer: QuoteCustomer,
  toLink: (message: string) => string,
): { link: string; compact: boolean; tooLong: boolean } {
  const full = toLink(buildQuoteMessage(items, customer));
  if (full.length <= MAX_LINK_LENGTH) return { link: full, compact: false, tooLong: false };
  const compact = toLink(buildQuoteMessage(items, customer, true));
  return { link: compact, compact: true, tooLong: compact.length > MAX_LINK_LENGTH };
}
