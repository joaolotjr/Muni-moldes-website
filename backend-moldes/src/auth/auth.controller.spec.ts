import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
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
  const current: AuthUser = {
    userId: 'user-1',
    name: 'Ana',
    email: 'ana@b.com',
    permissions: ['news'],
  };

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
      authService.login.mockReturnValue({ access_token: 'token' });

      await expect(
        controller.login({ email: 'ana@b.com', password: 'segredo123' }),
      ).resolves.toEqual({ access_token: 'token' });
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

  it('refresh renova a sessão de quem está logado', () => {
    authService.refresh.mockReturnValue({ access_token: 'novo' });

    expect(controller.refresh(current)).toEqual({ access_token: 'novo' });
    expect(authService.refresh).toHaveBeenCalledWith(current);
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
