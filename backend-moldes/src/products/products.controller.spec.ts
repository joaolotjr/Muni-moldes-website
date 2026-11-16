import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
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

  it('findAll repassa a coleção e só aplica o filtro público com ?public=true', () => {
    void controller.findAll('pascoa', 'true');
    void controller.findAll(undefined, undefined);

    expect(service.findAll.mock.calls).toEqual([
      ['pascoa', true],
      [undefined, false],
    ]);
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
