import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let env: Record<string, string>;
  const usersService = { findByEmail: jest.fn() };
  const jwtService = { sign: jest.fn(() => 'token-assinado') };

  beforeEach(async () => {
    jest.clearAllMocks();
    env = {};
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, fallback?: unknown) => env[key] ?? fallback,
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('validateUser', () => {
    const storedUser = async (overrides = {}) => ({
      id: 'user-1',
      name: 'Ana',
      email: 'ana@b.com',
      permissions: ['news'],
      is_active: true,
      password_hash: await bcrypt.hash('segredo123', 4),
      ...overrides,
    });

    it('devolve o usuário quando a senha confere', async () => {
      const user = await storedUser();
      usersService.findByEmail.mockResolvedValue(user);

      await expect(
        service.validateUser('ana@b.com', 'segredo123'),
      ).resolves.toBe(user);
    });

    it('devolve null quando a senha está errada', async () => {
      usersService.findByEmail.mockResolvedValue(await storedUser());

      await expect(
        service.validateUser('ana@b.com', 'errada'),
      ).resolves.toBeNull();
    });

    it('devolve null quando o e-mail não existe', async () => {
      usersService.findByEmail.mockResolvedValue(undefined);

      await expect(
        service.validateUser('ninguem@b.com', 'segredo123'),
      ).resolves.toBeNull();
    });

    it('devolve null para conta desativada, mesmo com a senha certa', async () => {
      usersService.findByEmail.mockResolvedValue(
        await storedUser({ is_active: false }),
      );

      await expect(
        service.validateUser('ana@b.com', 'segredo123'),
      ).resolves.toBeNull();
    });
  });

  describe('login', () => {
    it('assina o token só com o id; o token não vai no corpo da resposta', () => {
      const result = service.login({
        id: 'user-1',
        name: 'Ana',
        email: 'ana@b.com',
        permissions: ['news'],
      });

      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'user-1' });
      expect(result).toEqual({
        token: 'token-assinado',
        tokenMinutes: 6,
        body: {
          idle_minutes: 5,
          user: {
            id: 'user-1',
            name: 'Ana',
            email: 'ana@b.com',
            permissions: ['news'],
          },
        },
      });
      expect(JSON.stringify(result.body)).not.toContain('token-assinado');
    });

    it('respeita SESSION_IDLE_MINUTES', () => {
      env = { SESSION_IDLE_MINUTES: '15' };

      const result = service.login({
        id: 'user-1',
        name: 'Ana',
        email: 'ana@b.com',
        permissions: [],
      });

      expect(result.body.idle_minutes).toBe(15);
      expect(result.tokenMinutes).toBe(16);
    });
  });

  describe('refresh', () => {
    it('emite um token novo para o usuário da requisição', () => {
      const result = service.refresh({
        userId: 'user-1',
        name: 'Ana',
        email: 'ana@b.com',
        permissions: ['users'],
      });

      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'user-1' });
      expect(result.body.user).toEqual({
        id: 'user-1',
        name: 'Ana',
        email: 'ana@b.com',
        permissions: ['users'],
      });
    });
  });
});
