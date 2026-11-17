// Conversão entre as datas da API (ISO, em UTC) e o campo <input type="datetime-local">,
// que trabalha no horário do computador de quem está usando o painel.

export function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function localInputToIso(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}
