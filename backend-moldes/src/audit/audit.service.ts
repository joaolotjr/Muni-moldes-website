import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

export interface AuditEntry {
  action: string;
  area: string;
  user?: { id?: string | null; name?: string | null; email?: string | null };
  target?: string | null;
  targetId?: string | null;
  ip?: string | null;
}

const clip = (value: string | null | undefined, max: number) =>
  value ? value.slice(0, max) : null;

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly repository: Repository<AuditLog>,
  ) {}

  /** Grava o registro. Uma falha aqui é só anotada: nunca derruba a ação do usuário. */
  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.repository.save(
        this.repository.create({
          action: entry.action,
          area: entry.area,
          user_id: entry.user?.id ?? null,
          user_name: clip(entry.user?.name, 150),
          user_email: clip(entry.user?.email, 150),
          target: clip(entry.target, 255),
          target_id: clip(entry.targetId, 64),
          // IPv4 chega como "::ffff:1.2.3.4" quando o servidor escuta em IPv6.
          ip: clip(entry.ip?.replace(/^::ffff:/, ''), 64),
        }),
      );
    } catch (error) {
      this.logger.error(
        `Não foi possível gravar o registro de atividade (${entry.area}/${entry.action})`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /** Registros mais recentes primeiro. */
  findRecent(limit: number, area?: string): Promise<AuditLog[]> {
    return this.repository.find({
      where: area ? { area } : {},
      order: { created_at: 'DESC' },
      take: Math.min(Math.max(limit, 1), 500),
    });
  }
}
