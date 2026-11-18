import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable, from, mergeMap, tap } from 'rxjs';
import { DataSource } from 'typeorm';
import type { AuthUser } from '../auth/permissions';
import { Collection } from '../collections/entities/collection.entity';
import { NewsPost } from '../news/entities/news-post.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { AuditService } from './audit.service';

// Onde buscar o nome do item de cada área, para o registro dizer "qual".
const TARGETS: Record<string, { entity: new () => object; label: string }> = {
  products: { entity: Product, label: 'name' },
  collections: { entity: Collection, label: 'name' },
  news: { entity: NewsPost, label: 'title' },
  users: { entity: User, label: 'name' },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Classified {
  area: string;
  action: string;
  targetId?: string;
}

/** Traduz método + caminho em área e ação. Devolve null para o que não se registra. */
export function classify(method: string, path: string): Classified | null {
  const [area, second, third] = path.split('?')[0].split('/').filter(Boolean);
  if (!area) return null;

  if (area === 'auth') {
    if (second === 'password' && method === 'PUT') {
      return { area, action: 'password_change' };
    }
    // Login e logout são registrados pelo próprio controller; a renovação não é registrada.
    return null;
  }
  if (area === 'settings') {
    return method === 'PUT' ? { area, action: 'update' } : null;
  }
  if (!(area in TARGETS)) return null;

  if (second === 'order' && method === 'PUT')
    return { area, action: 'reorder' };
  const targetId = second && UUID.test(second) ? second : undefined;
  // Fotos de produto (/images) e capa de notícia (/cover).
  if (third === 'images' || third === 'cover') {
    if (method === 'POST') return { area, action: 'image_add', targetId };
    if (method === 'DELETE') return { area, action: 'image_remove', targetId };
    return null;
  }
  if (method === 'POST') return { area, action: 'create' };
  if (method === 'PUT') return { area, action: 'update', targetId };
  if (method === 'DELETE') return { area, action: 'delete', targetId };
  return null;
}

const labelOf = (value: unknown, field: string): string | undefined => {
  const label =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)[field]
      : undefined;
  return typeof label === 'string' && label ? label : undefined;
};

/** Registra toda alteração feita por um usuário logado, depois que ela dá certo. */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly audit: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();

    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();
    const info = req.method === 'GET' ? null : classify(req.method, req.path);
    if (!info || !req.user) return next.handle();

    const user = req.user;
    const target = TARGETS[info.area];

    // O nome é lido antes da ação: depois de uma exclusão ele não existe mais.
    return from(this.lookupLabel(info, target)).pipe(
      mergeMap((before) =>
        next.handle().pipe(
          tap((response) => {
            const label = target?.label ?? 'name';
            void this.audit.record({
              action: info.action,
              area: info.area,
              user: { id: user.userId, name: user.name, email: user.email },
              target:
                (info.action === 'create' || info.action === 'update'
                  ? (labelOf(response, label) ?? labelOf(req.body, label))
                  : undefined) ?? before,
              targetId: info.targetId ?? labelOf(response, 'id'),
              ip: req.ip,
            });
          }),
        ),
      ),
    );
  }

  private async lookupLabel(
    info: Classified,
    target: (typeof TARGETS)[string] | undefined,
  ): Promise<string | undefined> {
    if (!target || !info.targetId) return undefined;
    try {
      const found = await this.dataSource
        .getRepository(target.entity)
        .findOne({ where: { id: info.targetId } });
      return labelOf(found, target.label);
    } catch {
      return undefined;
    }
  }
}
