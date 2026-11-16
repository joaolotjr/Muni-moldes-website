import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SiteSettings } from './entities/site-settings.entity';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  const repository = { findOne: jest.fn(), save: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: getRepositoryToken(SiteSettings), useValue: repository },
      ],
    }).compile();

    service = module.get(SettingsService);
  });

  describe('get', () => {
    it('devolve objeto vazio enquanto nada foi salvo', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.get()).resolves.toEqual({});
    });

    it('devolve o que foi salvo', async () => {
      repository.findOne.mockResolvedValue({
        id: 1,
        data: { email: 'a@b.com' },
      });

      await expect(service.get()).resolves.toEqual({ email: 'a@b.com' });
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('update', () => {
    it('cria a linha única na primeira vez', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update({ email: 'a@b.com' })).resolves.toEqual({
        email: 'a@b.com',
      });
      expect(repository.save).toHaveBeenCalledWith({
        id: 1,
        data: { email: 'a@b.com' },
      });
    });

    it('altera só os campos enviados e mantém os outros', async () => {
      repository.findOne.mockResolvedValue({
        id: 1,
        data: { email: 'a@b.com', businessHours: '9h às 18h' },
      });

      const data = await service.update({
        email: 'novo@b.com',
        address: 'Rua A, 1',
      });

      expect(data).toEqual({
        email: 'novo@b.com',
        businessHours: '9h às 18h',
        address: 'Rua A, 1',
      });
    });

    it('aceita campo vazio, que esconde a informação no site', async () => {
      repository.findOne.mockResolvedValue({
        id: 1,
        data: { instagramHandle: '@muni' },
      });

      await expect(service.update({ instagramHandle: '' })).resolves.toEqual({
        instagramHandle: '',
      });
    });

    it('ignora campos não enviados (undefined)', async () => {
      repository.findOne.mockResolvedValue({
        id: 1,
        data: { email: 'a@b.com' },
      });

      await expect(service.update({ email: undefined })).resolves.toEqual({
        email: 'a@b.com',
      });
    });
  });
});
