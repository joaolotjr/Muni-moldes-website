import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const usersService = { findById: jest.fn() };
  const strategy = new JwtStrategy(
    { getOrThrow: () => 'segredo' } as unknown as ConfigService,
    usersService as unknown as UsersService,
  );

  it('devolve os dados atuais do usuário, com as permissões do banco', async () => {
    usersService.findById.mockResolvedValue({
      id: 'user-1',
      name: 'Ana',
      email: 'ana@b.com',
      permissions: ['news'],
      is_active: true,
    });

    await expect(strategy.validate({ sub: 'user-1' })).resolves.toEqual({
      userId: 'user-1',
      name: 'Ana',
      email: 'ana@b.com',
      permissions: ['news'],
    });
  });

  it('recusa usuário desativado', async () => {
    usersService.findById.mockResolvedValue({ id: 'user-1', is_active: false });

    await expect(strategy.validate({ sub: 'user-1' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('recusa usuário que não existe mais', async () => {
    usersService.findById.mockResolvedValue(undefined);

    await expect(strategy.validate({ sub: 'user-1' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
