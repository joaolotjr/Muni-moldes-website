import { isAxiosError } from 'axios';

/** Mensagem de erro devolvida pela API (texto ou lista de validações), ou a alternativa. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  const message = isAxiosError(error) ? error.response?.data?.message : undefined;
  if (Array.isArray(message)) return message.join('. ');
  if (typeof message === 'string') return message;
  // Erro gerado no próprio navegador (ex.: foto grande demais), que já traz o texto pronto.
  if (!isAxiosError(error) && error instanceof Error && error.message) return error.message;
  return fallback;
}
