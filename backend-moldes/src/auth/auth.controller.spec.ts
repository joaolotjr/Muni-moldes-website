import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = { validateUser: jest.fn(), login: jest.fn() };
  const usersService = { create: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    controller = module.get(AuthController);
  });

  describe('login', () => {
    it('devolve o token quando as credenciais conferem', async () => {
      const user = { id: 'user-1', email: 'ana@b.com' };
      authService.validateUser.mockResolvedValue(user);
      authService.login.mockResolvedValue({ access_token: 'token' });

      await expect(
        controller.login({ email: 'ana@b.com', password: 'segredo123' }),
      ).resolves.toEqual({
        access_token: 'token',
      });
      expect(authService.validateUser).toHaveBeenCalledWith(
        'ana@b.com',
        'segredo123',
      );
      expect(authService.login).toHaveBeenCalledWith(user);
    });

    it('responde 401 quando as credenciais são inválidas', async () => {
      authService.validateUser.mockResolvedValue(null);

      await expect(
        controller.login({ email: 'ana@b.com', password: 'errada' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('cria o usuário e devolve só o id', async () => {
      usersService.create.mockResolvedValue({
        id: 'user-2',
        password_hash: 'hash',
      });

      const result = await controller.register({
        name: 'Bia',
        email: 'bia@b.com',
        password: 'segredo123',
      });

      expect(usersService.create).toHaveBeenCalledWith(
        'Bia',
        'bia@b.com',
        'segredo123',
      );
      expect(result).toEqual({
        message: 'Usuário criado com sucesso',
        userId: 'user-2',
      });
    });
  });
});
