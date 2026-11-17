import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthUser, Permission } from './permissions';
import { PERMISSION_KEY, PermissionsGuard } from './permissions.guard';

// Exige login. Com uma permissão, exige também que o usuário a tenha.
export function Auth(permission?: Permission) {
  return applyDecorators(
    SetMetadata(PERMISSION_KEY, permission),
    UseGuards(JwtAuthGuard, PermissionsGuard),
  );
}

// Usuário autenticado da requisição.
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser =>
    context.switchToHttp().getRequest<{ user: AuthUser }>().user,
);
