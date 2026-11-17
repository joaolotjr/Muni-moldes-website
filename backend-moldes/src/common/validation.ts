import { Transform } from 'class-transformer';

/** Endereço (slug): letras minúsculas sem acento, números e hífens entre eles. */
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const SLUG_MESSAGE =
  'O endereço (URL) só pode ter letras minúsculas sem acento, números e hífens';

/** Tira os espaços das pontas de um texto. */
export const Trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );

/** Como Trim, mas texto em branco vira null (campo opcional deixado vazio). */
export const TrimToNull = () =>
  Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  });
