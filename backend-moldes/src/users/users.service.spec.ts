import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let env: Record<string, string>;
  const repository = {
    count: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((data) => data),
    save: jest.fn((user) => Promise.resolve({ id: 'user-1', ...user })),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    env = {};
    repository.findOne.mockResolvedValue(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repository },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, fallback?: string) => env[key] ?? fallback,
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('findByEmail', () => {
    it('devolve o usuário encontrado', async () => {
      const user = { id: 'user-1', email: 'a@b.com' };
      repository.findOne.mockResolvedValue(user);

      await expect(service.findByEmail('a@b.com')).resolves.toBe(user);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'a@b.com' },
      });
    });

    it('devolve undefined quando não existe', async () => {
      await expect(
        service.findByEmail('ninguem@b.com'),
      ).resolves.toBeUndefined();
    });
  });

  describe('create', () => {
    it('salva o usuário com a senha em hash, nunca em texto puro', async () => {
      const user = await service.create('Ana', 'ana@b.com', 'segredo123');

      expect(user).toMatchObject({
        id: 'user-1',
        name: 'Ana',
        email: 'ana@b.com',
      });
      expect(user.password_hash).not.toBe('segredo123');
      await expect(
        bcrypt.compare('segredo123', user.password_hash),
      ).resolves.toBe(true);
    });

    it('recusa e-mail já cadastrado', async () => {
      repository.findOne.mockResolvedValue({
        id: 'user-1',
        email: 'ana@b.com',
      });

      await expect(
        service.create('Ana', 'ana@b.com', 'segredo123'),
      ).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('onApplicationBootstrap', () => {
    it('cria o primeiro administrador a partir do .env', async () => {
      repository.count.mockResolvedValue(0);
      env = {
        ADMIN_EMAIL: 'admin@b.com',
        ADMIN_PASSWORD: 'segredo123',
        ADMIN_NAME: 'Chefe',
      };

      await service.onApplicationBootstrap();

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Chefe', email: 'admin@b.com' }),
      );
    });

    it('usa o nome padrão quando ADMIN_NAME não foi definido', async () => {
      repository.count.mockResolvedValue(0);
      env = { ADMIN_EMAIL: 'admin@b.com', ADMIN_PASSWORD: 'segredo123' };

      await service.onApplicationBootstrap();

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Administrador' }),
      );
    });

    it('não cria nada quando já existe usuário', async () => {
      repository.count.mockResolvedValue(3);
      env = { ADMIN_EMAIL: 'admin@b.com', ADMIN_PASSWORD: 'segredo123' };

      await service.onApplicationBootstrap();

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('não cria nada sem ADMIN_EMAIL e ADMIN_PASSWORD', async () => {
      repository.count.mockResolvedValue(0);

      await service.onApplicationBootstrap();

      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
