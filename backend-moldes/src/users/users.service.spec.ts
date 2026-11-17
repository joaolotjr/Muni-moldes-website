import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { PERMISSIONS } from '../auth/permissions';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let env: Record<string, string>;
  const repository = {
    count: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((data) => data),
    save: jest.fn((user) =>
      Promise.resolve(Array.isArray(user) ? user : { id: 'user-1', ...user }),
    ),
    remove: jest.fn(),
  };

  const stored = (overrides: Partial<User> = {}): User => ({
    id: 'user-1',
    name: 'Ana',
    email: 'ana@b.com',
    password_hash: 'hash',
    permissions: ['products', 'users'],
    is_active: true,
    created_at: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    env = {};
    repository.findOne.mockResolvedValue(null);
    repository.find.mockResolvedValue([]);

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
    it('procura pelo e-mail sem espaços e em minúsculas', async () => {
      const user = stored();
      repository.findOne.mockResolvedValue(user);

      await expect(service.findByEmail('  Ana@B.com ')).resolves.toBe(user);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: 'ana@b.com' },
      });
    });

    it('devolve undefined quando não existe', async () => {
      await expect(
        service.findByEmail('ninguem@b.com'),
      ).resolves.toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('nunca devolve o hash da senha', async () => {
      repository.find.mockResolvedValue([stored()]);

      const users = await service.findAll();

      expect(users).toHaveLength(1);
      expect(users[0]).not.toHaveProperty('password_hash');
      expect(users[0]).toMatchObject({ email: 'ana@b.com', is_active: true });
    });
  });

  describe('create', () => {
    const dto = {
      name: ' Ana ',
      email: ' Ana@B.com',
      password: 'segredo123',
      permissions: ['news' as const],
    };

    it('salva com a senha em hash e sem devolvê-la', async () => {
      const user = await service.create(dto);

      expect(user).toMatchObject({
        id: 'user-1',
        name: 'Ana',
        email: 'ana@b.com',
        permissions: ['news'],
        is_active: true,
      });
      expect(user).not.toHaveProperty('password_hash');

      const saved = repository.save.mock.calls[0][0];
      expect(saved.password_hash).not.toBe('segredo123');
      await expect(
        bcrypt.compare('segredo123', saved.password_hash),
      ).resolves.toBe(true);
    });

    it('recusa e-mail já cadastrado', async () => {
      repository.findOne.mockResolvedValue(stored());

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('altera nome, permissões e situação de outro usuário', async () => {
      repository.findOne.mockResolvedValue(stored({ id: 'user-2' }));

      const user = await service.update(
        'user-2',
        { name: 'Bia', permissions: ['news'], is_active: false },
        'user-1',
      );

      expect(user).toMatchObject({
        name: 'Bia',
        permissions: ['news'],
        is_active: false,
      });
    });

    it('mantém a senha quando ela não é enviada', async () => {
      repository.findOne.mockResolvedValue(stored({ id: 'user-2' }));

      await service.update('user-2', { name: 'Bia' }, 'user-1');

      expect(repository.save.mock.calls[0][0].password_hash).toBe('hash');
    });

    it('troca a senha quando ela é enviada', async () => {
      repository.findOne.mockResolvedValue(stored({ id: 'user-2' }));

      await service.update('user-2', { password: 'novasenha1' }, 'user-1');

      await expect(
        bcrypt.compare(
          'novasenha1',
          repository.save.mock.calls[0][0].password_hash,
        ),
      ).resolves.toBe(true);
    });

    it('não deixa desativar a própria conta', async () => {
      repository.findOne.mockResolvedValue(stored());

      await expect(
        service.update('user-1', { is_active: false }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('não deixa remover a própria permissão de usuários', async () => {
      repository.findOne.mockResolvedValue(stored());

      await expect(
        service.update('user-1', { permissions: ['products'] }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('recusa trocar para um e-mail que já é de outra pessoa', async () => {
      repository.findOne
        .mockResolvedValueOnce(stored({ id: 'user-2', email: 'bia@b.com' }))
        .mockResolvedValueOnce(stored());

      await expect(
        service.update('user-2', { email: 'ana@b.com' }, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('responde 404 para usuário inexistente', async () => {
      await expect(service.update('nada', {}, 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('exclui outro usuário', async () => {
      const other = stored({ id: 'user-2' });
      repository.findOne.mockResolvedValue(other);

      await service.remove('user-2', 'user-1');

      expect(repository.remove).toHaveBeenCalledWith(other);
    });

    it('não deixa excluir a própria conta', async () => {
      await expect(service.remove('user-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });

  describe('changeOwnPassword', () => {
    it('troca a senha quando a atual confere', async () => {
      repository.findOne.mockResolvedValue(
        stored({ password_hash: await bcrypt.hash('atual1234', 4) }),
      );

      await service.changeOwnPassword('user-1', 'atual1234', 'novasenha1');

      await expect(
        bcrypt.compare(
          'novasenha1',
          repository.save.mock.calls[0][0].password_hash,
        ),
      ).resolves.toBe(true);
    });

    it('recusa quando a senha atual está errada', async () => {
      repository.findOne.mockResolvedValue(
        stored({ password_hash: await bcrypt.hash('atual1234', 4) }),
      );

      await expect(
        service.changeOwnPassword('user-1', 'errada', 'novasenha1'),
      ).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('onApplicationBootstrap', () => {
    it('cria o primeiro administrador com todas as permissões', async () => {
      repository.count.mockResolvedValue(0);
      env = {
        ADMIN_EMAIL: 'Admin@b.com',
        ADMIN_PASSWORD: 'segredo123',
        ADMIN_NAME: 'Chefe',
      };

      await service.onApplicationBootstrap();

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Chefe',
          email: 'admin@b.com',
          permissions: [...PERMISSIONS],
        }),
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

    it('não cria nada sem ADMIN_EMAIL e ADMIN_PASSWORD', async () => {
      repository.count.mockResolvedValue(0);

      await service.onApplicationBootstrap();

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('não mexe em nada quando alguém ativo já administra usuários', async () => {
      repository.count.mockResolvedValue(2);
      repository.find.mockResolvedValue([
        stored(),
        stored({ id: 'user-2', permissions: [] }),
      ]);

      await service.onApplicationBootstrap();

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('dá acesso completo às contas antigas, que não tinham permissões', async () => {
      repository.count.mockResolvedValue(2);
      repository.find.mockResolvedValue([
        stored({ permissions: [] }),
        stored({ id: 'user-2', permissions: ['news'] }),
      ]);

      await service.onApplicationBootstrap();

      const saved = repository.save.mock.calls[0][0];
      expect(saved).toHaveLength(1);
      expect(saved[0]).toMatchObject({
        id: 'user-1',
        permissions: [...PERMISSIONS],
      });
    });
  });
});
