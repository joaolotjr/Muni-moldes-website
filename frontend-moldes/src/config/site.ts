// Dados de contato e textos fixos do site, em um único lugar.
// ATENÇÃO: os valores abaixo são de exemplo e precisam ser trocados pelos reais.
export const site = {
  name: 'Muni Moldes',
  tagline: 'Fábrica de moldes',
  // Número do WhatsApp só com dígitos, com código do país (55) e DDD.
  whatsappNumber: '5511999999999',
  phoneDisplay: '(11) 99999-9999',
  email: 'contato@munimoldes.com.br',
  instagramHandle: '@munimoldes',
  instagramUrl: 'https://www.instagram.com/munimoldes',
  businessHours: 'Segunda a sexta, das 9h às 18h',
  addressLines: ['Rua dos Confeiteiros, 123', 'Bairro Doce, São Paulo, SP', 'CEP 00000-000'],
};

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${site.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const defaultQuoteMessage =
  'Olá! Gostaria de solicitar um orçamento de moldes para minha empresa.';
