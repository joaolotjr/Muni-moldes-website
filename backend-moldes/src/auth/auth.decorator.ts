import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, OptionalJwtAuthGuard } from './jwt-auth.guard';
import { AuthUser, Permission } from './permissions';
import { PERMISSION_KEY, PermissionsGuard } from './permissions.guard';

// Exige login. Com uma permissão, exige também que o usuário a tenha.
export function Auth(permission?: Permission) {
  return applyDecorators(
    SetMetadata(PERMISSION_KEY, permission),
    UseGuards(JwtAuthGuard, PermissionsGuard),
  );
}

// Rota aberta que reconhece quem está logado: use com @CurrentUser(), que pode vir vazio.
export function OptionalAuth() {
  return applyDecorators(UseGuards(OptionalJwtAuthGuard));
}

// Usuário autenticado da requisição (vazio em rota com @OptionalAuth e sem login).
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser =>
    context.switchToHttp().getRequest<{ user: AuthUser }>().user,
);
