import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthUser } from '../auth/permissions';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { StorageService } from '../storage/storage.service';

describe('CollectionsController', () => {
  let controller: CollectionsController;
  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    setCover: jest.fn(),
    removeCover: jest.fn(),
  };
  const storage = { saveImage: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionsController],
      providers: [
        { provide: CollectionsService, useValue: service },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    controller = module.get(CollectionsController);
  });

  const admin: AuthUser = {
    userId: 'user-1',
    name: 'Ana',
    email: 'ana@b.com',
    permissions: [],
  };

  it('findAll: sem login só o que é público; com login, tudo', () => {
    void controller.findAll(undefined);
    void controller.findAll(undefined, 'false');
    void controller.findAll(admin);
    void controller.findAll(admin, 'true');

    expect(service.findAll.mock.calls).toEqual([
      [true],
      [true],
      [false],
      [true],
    ]);
  });

  it('findOne esconde a categoria inativa de quem não está logado', async () => {
    const hidden = { id: 'col-1', is_active: false };
    service.findOne.mockResolvedValue(hidden);

    await expect(controller.findOne(undefined, 'col-1')).rejects.toThrow(
      NotFoundException,
    );
    await expect(controller.findOne(admin, 'col-1')).resolves.toBe(hidden);
  });

  it('repassa as demais operações ao serviço', () => {
    void controller.create({ name: 'Páscoa' });
    void controller.update('col-1', { name: 'Natal' });
    void controller.remove('col-1');

    expect(service.create).toHaveBeenCalledWith({ name: 'Páscoa' });
    expect(service.update).toHaveBeenCalledWith('col-1', { name: 'Natal' });
    expect(service.remove).toHaveBeenCalledWith('col-1');
  });

  describe('capa', () => {
    const file = { mimetype: 'image/png' } as Express.Multer.File;

    it('guarda a foto e grava como capa', async () => {
      service.findOne.mockResolvedValue({ id: 'col-1' });
      storage.saveImage.mockResolvedValue('/uploads/capa.webp');

      await controller.uploadCover('col-1', file);

      expect(storage.saveImage).toHaveBeenCalledWith(file);
      expect(service.setCover).toHaveBeenCalledWith(
        'col-1',
        '/uploads/capa.webp',
      );
    });

    it('não guarda o arquivo se a categoria não existe', async () => {
      service.findOne.mockRejectedValueOnce(new NotFoundException());

      await expect(controller.uploadCover('col-x', file)).rejects.toThrow(
        NotFoundException,
      );
      expect(storage.saveImage).not.toHaveBeenCalled();
    });

    it('remove a capa', async () => {
      await controller.removeCover('col-1');

      expect(service.removeCover).toHaveBeenCalledWith('col-1');
    });
  });
});
