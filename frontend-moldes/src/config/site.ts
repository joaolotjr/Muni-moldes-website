// Dados de contato e textos do site.
//
// Os valores de `defaultSettings` são o ponto de partida: valem enquanto ninguém alterar
// o campo em Painel > Configurações. O que for salvo lá fica no banco e passa a valer
// no lugar do padrão. ATENÇÃO: os contatos abaixo são de exemplo.

export const siteName = 'Muni Moldes';

/**
 * Tudo o que o painel pode alterar. As chaves são as mesmas do UpdateSettingsDto no backend
 * (backend-moldes/src/settings/dto); ao criar um campo novo, inclua nos dois lugares.
 */
export interface SiteSettings {
  // Contato
  /** Só dígitos, com código do país (55) e DDD. */
  whatsappNumber: string;
  phoneDisplay: string;
  email: string;
  instagramHandle: string;
  businessHours: string;
  /** Uma linha do endereço por linha de texto. */
  address: string;
  // Página inicial
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroText: string;
  homeStoryText: string;
  // Quem somos
  aboutTitle: string;
  aboutIntro: string;
  aboutStoryTitle: string;
  /** Parágrafos separados por uma linha em branco. */
  aboutStory: string;
  // Rodapé
  footerText: string;
}

export const defaultSettings: SiteSettings = {
  whatsappNumber: '5511999999999',
  phoneDisplay: '(11) 99999-9999',
  email: 'contato@munimoldes.com.br',
  instagramHandle: '@munimoldes',
  businessHours: 'Segunda a sexta, das 9h às 18h',
  address: 'Rua dos Confeiteiros, 123\nBairro Doce, São Paulo, SP\nCEP 00000-000',

  heroBadge: 'Fábrica de moldes · Atacado e revenda',
  heroTitle: 'Moldes para chocolate e confeitaria,',
  heroHighlight: 'direto da fábrica.',
  heroText:
    'Catálogo completo para confeitarias, lojistas e revendedores. Escolha os modelos e peça o orçamento da quantidade que você precisa.',
  homeStoryText:
    'A Muni Moldes começou com a Mariluci, confeiteira que passou a fabricar os próprios moldes por não encontrar no mercado a qualidade que precisava. Hoje a fábrica produz para quem vive da confeitaria e conhece a diferença que um bom molde faz na produção.',

  aboutTitle: 'Moldes feitos por quem conhece a rotina da confeitaria.',
  aboutIntro:
    'A Muni Moldes nasceu dentro de uma cozinha e hoje fabrica moldes para confeitarias, lojistas e revendedores.',
  aboutStoryTitle: 'A história da Mariluci',
  aboutStory: [
    'A história da Muni Moldes não começou em uma fábrica, e sim em uma cozinha. A Mariluci, confeiteira, queria criar doces com detalhes únicos e percebeu que faltavam no mercado moldes que fossem bonitos, bem acabados e duráveis.',
    'Ela passou a testar e produzir os próprios moldes de silicone. O que era uma ferramenta para uso próprio chamou a atenção de outras confeiteiras, e os pedidos começaram a chegar.',
    'Hoje a Muni Moldes é uma fábrica dedicada a moldes para confeitaria e artesanato, com o mesmo cuidado no detalhe que deu origem a tudo.',
  ].join('\n\n'),

  footerText:
    'Fábrica de moldes para chocolate e confeitaria. Atendemos pedidos em quantidade para confeitarias, lojistas e revendedores.',
};

export const defaultQuoteMessage =
  'Olá! Gostaria de solicitar um orçamento de moldes para minha empresa.';

/** Junta o que veio do banco com os padrões, ignorando chaves desconhecidas ou de tipo errado. */
export function mergeSettings(stored: unknown): SiteSettings {
  const result = { ...defaultSettings };
  if (stored && typeof stored === 'object') {
    for (const key of Object.keys(defaultSettings) as (keyof SiteSettings)[]) {
      const value = (stored as Record<string, unknown>)[key];
      if (typeof value === 'string') result[key] = value;
    }
  }
  return result;
}

/** Quebra um texto em parágrafos (separados por linha em branco). */
export function paragraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
}

/** Configurações mais os dados derivados e os links de WhatsApp, prontos para as páginas. */
export function buildSite(settings: SiteSettings) {
  const whatsappLink = (message?: string) => {
    const base = `https://wa.me/${settings.whatsappNumber}`;
    return message ? `${base}?text=${encodeURIComponent(message)}` : base;
  };
  const handle = settings.instagramHandle.replace(/^@/, '');

  return {
    ...settings,
    name: siteName,
    instagramUrl: handle ? `https://www.instagram.com/${handle}` : '',
    addressLines: settings.address.split('\n').map((line) => line.trim()).filter(Boolean),
    whatsappLink,
    /** Link de orçamento geral. */
    quoteUrl: whatsappLink(defaultQuoteMessage),
    /** Mensagem de orçamento já com o nome e o link do molde. */
    productQuoteLink: (product: { name: string; slug: string; code?: string | null }) =>
      whatsappLink(
        `Olá! Gostaria de um orçamento para o molde: *${product.name}*${product.code ? ` (código ${product.code})` : ''}.\n\nQuantidade: \n\nLink: ${window.location.origin}/molde/${product.slug}`,
      ),
  };
}

export type Site = ReturnType<typeof buildSite>;
