import { BadRequestException, ConflictException } from '@nestjs/common';

interface Schedule {
  active_from?: string | Date | null;
  active_until?: string | Date | null;
}

/** O fim do período de exibição não pode vir antes do início. */
export function assertValidSchedule(next: Schedule, current: Schedule = {}) {
  const from =
    next.active_from !== undefined ? next.active_from : current.active_from;
  const until =
    next.active_until !== undefined ? next.active_until : current.active_until;
  if (from && until && new Date(until) < new Date(from)) {
    throw new BadRequestException(
      'A data "mostrar até" não pode ser anterior à data "mostrar a partir de".',
    );
  }
}

// Códigos de erro do Postgres.
const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

/**
 * Executa a gravação e troca os erros do banco por mensagens claras:
 * endereço repetido vira 409 e categoria inexistente vira 400.
 */
export async function saveWithClearErrors<T>(
  save: () => Promise<T>,
): Promise<T> {
  try {
    return await save();
  } catch (error) {
    const code =
      (error as { code?: string }).code ??
      (error as { driverError?: { code?: string } }).driverError?.code;
    if (code === UNIQUE_VIOLATION) {
      // O Postgres informa a coluna no detalhe: "Key (code)=(MM-1) already exists."
      const detail =
        (error as { detail?: string }).detail ??
        (error as { driverError?: { detail?: string } }).driverError?.detail ??
        '';
      const column = /Key \(([^)]+)\)/.exec(detail)?.[1];
      throw new ConflictException(
        column === 'code'
          ? 'Este código já é usado por outro produto. Escolha outro.'
          : 'Este endereço (URL) já é usado por outro item. Escolha outro.',
      );
    }
    if (code === FOREIGN_KEY_VIOLATION) {
      throw new BadRequestException('A categoria escolhida não existe mais.');
    }
    throw error;
  }
}
