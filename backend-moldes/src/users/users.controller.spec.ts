import { Test, TestingModule } from '@nestjs/testing';
import { AuthUser } from '../auth/permissions';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const usersService = {
    findAll: jest.fn(),
    findOnePublic: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const actor: AuthUser = {
    userId: 'user-1',
    name: 'Ana',
    email: 'ana@b.com',
    permissions: ['users'],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get(UsersController);
  });

  it('lista os usuários', async () => {
    usersService.findAll.mockResolvedValue([{ id: 'user-1' }]);

    await expect(controller.findAll()).resolves.toEqual([{ id: 'user-1' }]);
  });

  it('passa quem está alterando para o serviço', async () => {
    await controller.update('user-2', { name: 'Bia' }, actor);

    expect(usersService.update).toHaveBeenCalledWith(
      'user-2',
      { name: 'Bia' },
      'user-1',
    );
  });

  it('passa quem está excluindo para o serviço', async () => {
    await controller.remove('user-2', actor);

    expect(usersService.remove).toHaveBeenCalledWith('user-2', 'user-1');
  });
});
