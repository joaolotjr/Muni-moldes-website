import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';
import { Auth, CurrentUser, OptionalAuth } from './auth.decorator';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import type { AuthUser } from './permissions';
import { clearSessionCookie, setSessionCookie } from './session-cookie';

// Tentativas de login por IP: 10 a cada 15 minutos; ao estourar, bloqueia por 15 minutos.
const LOGIN_WINDOW_MS = 15 * 60_000;
export const LOGIN_MAX_ATTEMPTS = 10;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly audit: AuditService,
  ) {}

  @Throttle({
    default: {
      limit: LOGIN_MAX_ATTEMPTS,
      ttl: LOGIN_WINDOW_MS,
      blockDuration: LOGIN_WINDOW_MS,
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      await this.audit.record({
        action: 'login_failed',
        area: 'auth',
        user: { email: loginDto.email },
        ip: req.ip,
      });
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const session = this.authService.login(user);
    setSessionCookie(res, session.token, session.tokenMinutes);
    await this.audit.record({
      action: 'login',
      area: 'auth',
      user: { id: user.id, name: user.name, email: user.email },
      ip: req.ip,
    });
    return session.body;
  }

  // Renova a sessão de quem está ativo no painel.
  @Auth()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const session = this.authService.refresh(user);
    setSessionCookie(res, session.token, session.tokenMinutes);
    return session.body;
  }

  // Funciona mesmo com a sessão já vencida: o que importa é apagar o cookie.
  @OptionalAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @CurrentUser() user: AuthUser | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    clearSessionCookie(res);
    if (user) {
      await this.audit.record({
        action: 'logout',
        area: 'auth',
        user: { id: user.userId, name: user.name, email: user.email },
        ip: req.ip,
      });
    }
  }

  @Auth()
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return {
      id: user.userId,
      name: user.name,
      email: user.email,
      permissions: user.permissions,
    };
  }

  // Troca da própria senha, para qualquer usuário logado.
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('password')
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changeOwnPassword(
      user.userId,
      dto.current_password,
      dto.new_password,
    );
  }
}
