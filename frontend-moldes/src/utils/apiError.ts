import { isAxiosError } from 'axios';

/** Mensagem de erro devolvida pela API (texto ou lista de validações), ou a alternativa. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  const message = isAxiosError(error) ? error.response?.data?.message : undefined;
  if (Array.isArray(message)) return message.join('. ');
  return typeof message === 'string' ? message : fallback;
}
