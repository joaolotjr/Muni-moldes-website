import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

/**
 * Não exige login: com sessão válida, req.user é preenchido; sem ela, fica vazio.
 * Usado nas listagens, que mostram itens ocultos só para quem está logado.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(_err: unknown, user: TUser | false): TUser {
    return (user || undefined) as TUser;
  }
}
