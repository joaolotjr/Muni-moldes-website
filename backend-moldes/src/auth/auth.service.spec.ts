import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const usersService = { findByEmail: jest.fn() };
  const jwtService = { sign: jest.fn(() => 'token-assinado') };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('validateUser', () => {
    const storedUser = async () => ({
      id: 'user-1',
      name: 'Ana',
      email: 'ana@b.com',
      password_hash: await bcrypt.hash('segredo123', 4),
    });

    it('devolve o usuário sem o hash quando a senha confere', async () => {
      usersService.findByEmail.mockResolvedValue(await storedUser());

      const result = await service.validateUser('ana@b.com', 'segredo123');

      expect(result).toEqual({ id: 'user-1', name: 'Ana', email: 'ana@b.com' });
      expect(result).not.toHaveProperty('password_hash');
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
  });

  describe('login', () => {
    it('assina o token com e-mail e id e devolve os dados públicos do usuário', async () => {
      const result = await service.login({
        id: 'user-1',
        name: 'Ana',
        email: 'ana@b.com',
        password_hash: 'nao-deve-sair',
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        email: 'ana@b.com',
        sub: 'user-1',
      });
      expect(result).toEqual({
        access_token: 'token-assinado',
        user: { id: 'user-1', name: 'Ana', email: 'ana@b.com' },
      });
    });
  });
});
