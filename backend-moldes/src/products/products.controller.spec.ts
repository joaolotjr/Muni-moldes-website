import { BadRequestException } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthUser } from '../auth/permissions';
import { StorageService } from '../storage/storage.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    addImage: jest.fn(),
    removeImage: jest.fn(),
  };
  const storage = { saveImage: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    service.addImage.mockResolvedValue({ id: 'img-1' });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: service },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    controller = module.get(ProductsController);
  });

  const admin: AuthUser = {
    userId: 'user-1',
    name: 'Ana',
    email: 'ana@b.com',
    permissions: [],
  };

  describe('findAll', () => {
    it('sem login, sempre aplica o filtro público', () => {
      void controller.findAll(undefined, 'pascoa', undefined);
      void controller.findAll(undefined, undefined, 'false');

      expect(service.findAll.mock.calls).toEqual([
        ['pascoa', true],
        [undefined, true],
      ]);
    });

    it('com login, mostra tudo, a menos que peça ?public=true', () => {
      void controller.findAll(admin, undefined, undefined);
      void controller.findAll(admin, undefined, 'true');

      expect(service.findAll.mock.calls).toEqual([
        [undefined, false],
        [undefined, true],
      ]);
    });
  });

  describe('findOne', () => {
    const hidden = { slug: 'oculto', is_active: false };

    it('devolve o produto visível para qualquer pessoa', async () => {
      const product = { slug: 'ovo', is_active: true };
      service.findOne.mockResolvedValue(product);

      await expect(controller.findOne(undefined, 'ovo')).resolves.toBe(product);
    });

    it('esconde o produto inativo de quem não está logado', async () => {
      service.findOne.mockResolvedValue(hidden);

      await expect(controller.findOne(undefined, 'oculto')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('esconde o produto agendado para o futuro', async () => {
      service.findOne.mockResolvedValue({
        slug: 'futuro',
        is_active: true,
        active_from: new Date(Date.now() + 60_000),
      });

      await expect(controller.findOne(undefined, 'futuro')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('mostra o produto inativo para quem está logado', async () => {
      service.findOne.mockResolvedValue(hidden);

      await expect(controller.findOne(admin, 'oculto')).resolves.toBe(hidden);
    });
  });

  describe('uploadImage', () => {
    const file = { mimetype: 'image/png' } as Express.Multer.File;

    it('guarda a imagem e registra a foto com o endereço devolvido', async () => {
      storage.saveImage.mockResolvedValue('/uploads/abc.png');

      await expect(
        controller.uploadImage('prod-1', file, 'true'),
      ).resolves.toEqual({ id: 'img-1' });
      expect(storage.saveImage).toHaveBeenCalledWith(file);
      expect(service.addImage).toHaveBeenCalledWith(
        'prod-1',
        '/uploads/abc.png',
        true,
      );
    });

    it('trata a foto como não sendo capa por padrão', async () => {
      storage.saveImage.mockResolvedValue('/uploads/abc.png');

      await controller.uploadImage('prod-1', file);

      expect(service.addImage).toHaveBeenCalledWith(
        'prod-1',
        '/uploads/abc.png',
        false,
      );
    });

    it('não registra a foto quando o arquivo é recusado', async () => {
      storage.saveImage.mockRejectedValue(new BadRequestException());

      await expect(controller.uploadImage('prod-1', undefined)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.addImage).not.toHaveBeenCalled();
    });
  });

  it('removeImage repassa o id da foto', () => {
    void controller.removeImage('img-1');

    expect(service.removeImage).toHaveBeenCalledWith('img-1');
  });
});
