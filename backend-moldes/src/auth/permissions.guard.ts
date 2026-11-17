import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthUser, Permission } from './permissions';

export const PERMISSION_KEY = 'required_permission';

// Roda depois do JwtAuthGuard: confere se o usuário tem a permissão pedida pela rota.
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission | undefined>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) return true;

    const { user } = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    if (!user?.permissions?.includes(required)) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta área.',
      );
    }
    return true;
  }
}
