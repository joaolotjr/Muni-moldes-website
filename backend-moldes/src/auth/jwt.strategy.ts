import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { AuthUser } from './permissions';
import { sessionTokenFromRequest } from './session-cookie';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      // O token vem só do cookie de sessão (ver session-cookie.ts).
      jwtFromRequest: sessionTokenFromRequest,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Consulta o usuário a cada requisição: quem foi desativado, excluído ou teve
  // as permissões alteradas sente o efeito na hora, sem esperar o token vencer.
  async validate(payload: { sub: string }): Promise<AuthUser> {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('Sessão encerrada.');
    }
    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      permissions: user.permissions,
    };
  }
}
