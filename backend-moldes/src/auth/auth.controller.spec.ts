import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuditService } from '../audit/audit.service';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthUser } from './permissions';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
  };
  const usersService = { changeOwnPassword: jest.fn() };
  const audit = { record: jest.fn() };
  const req = { ip: '10.0.0.7' } as Request;
  const res = { cookie: jest.fn(), clearCookie: jest.fn() };
  const response = res as unknown as Response;
  const current: AuthUser = {
    userId: 'user-1',
    name: 'Ana',
    email: 'ana@b.com',
    permissions: ['news'],
  };
  const session = {
    token: 'token-secreto',
    tokenMinutes: 6,
    body: { idle_minutes: 5, user: { id: 'user-1' } },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
        { provide: AuditService, useValue: audit },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(AuthController);
  });

  describe('login', () => {
    const user = { id: 'user-1', name: 'Ana', email: 'ana@b.com' };

    it('põe o token em cookie HttpOnly e não o devolve no corpo', async () => {
      authService.validateUser.mockResolvedValue(user);
      authService.login.mockReturnValue(session);

      const body = await controller.login(
        { email: 'ana@b.com', password: 'segredo123' },
        req,
        response,
      );

      expect(body).toEqual(session.body);
      expect(JSON.stringify(body)).not.toContain('token-secreto');
      expect(res.cookie).toHaveBeenCalledWith(
        'mm_session',
        'token-secreto',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 6 * 60_000,
        }),
      );
    });

    it('registra o login com usuário e IP', async () => {
      authService.validateUser.mockResolvedValue(user);
      authService.login.mockReturnValue(session);

      await controller.login(
        { email: 'ana@b.com', password: 'segredo123' },
        req,
        response,
      );

      expect(audit.record).toHaveBeenCalledWith({
        action: 'login',
        area: 'auth',
        user,
        ip: '10.0.0.7',
      });
    });

    it('responde 401, não cria cookie e registra a tentativa que falhou', async () => {
      authService.validateUser.mockResolvedValue(null);

      await expect(
        controller.login(
          { email: 'ana@b.com', password: 'errada' },
          req,
          response,
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(res.cookie).not.toHaveBeenCalled();
      expect(audit.record).toHaveBeenCalledWith({
        action: 'login_failed',
        area: 'auth',
        user: { email: 'ana@b.com' },
        ip: '10.0.0.7',
      });
    });
  });

  it('refresh renova o cookie de quem está logado', () => {
    authService.refresh.mockReturnValue(session);

    expect(controller.refresh(current, response)).toEqual(session.body);
    expect(authService.refresh).toHaveBeenCalledWith(current);
    expect(res.cookie).toHaveBeenCalledWith(
      'mm_session',
      'token-secreto',
      expect.objectContaining({ httpOnly: true }),
    );
  });

  describe('logout', () => {
    it('apaga o cookie e registra a saída', async () => {
      await controller.logout(current, req, response);

      expect(res.clearCookie).toHaveBeenCalledWith(
        'mm_session',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(audit.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'logout', area: 'auth' }),
      );
    });

    it('apaga o cookie mesmo com a sessão já vencida', async () => {
      await controller.logout(undefined, req, response);

      expect(res.clearCookie).toHaveBeenCalled();
      expect(audit.record).not.toHaveBeenCalled();
    });
  });

  it('me devolve os dados de quem está logado', () => {
    expect(controller.me(current)).toEqual({
      id: 'user-1',
      name: 'Ana',
      email: 'ana@b.com',
      permissions: ['news'],
    });
  });

  it('changePassword troca a senha de quem está logado', async () => {
    await controller.changePassword(current, {
      current_password: 'atual1234',
      new_password: 'novasenha1',
    });

    expect(usersService.changeOwnPassword).toHaveBeenCalledWith(
      'user-1',
      'atual1234',
      'novasenha1',
    );
  });
});
