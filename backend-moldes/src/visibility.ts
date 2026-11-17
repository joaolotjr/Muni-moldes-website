interface Schedulable {
  is_active: boolean;
  active_from?: Date | null;
  active_until?: Date | null;
}

/** O item aparece no site agora? Ativo e dentro do período agendado, se houver. */
export function isVisibleNow(item: Schedulable, now = new Date()): boolean {
  if (!item.is_active) return false;
  if (item.active_from && new Date(item.active_from) > now) return false;
  if (item.active_until && new Date(item.active_until) < now) return false;
  return true;
}
