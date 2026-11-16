import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from '../storage/storage.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

const upload = (mimetype: string) =>
  ({
    mimetype,
    buffer: Buffer.from('conteudo'),
    originalname: 'qualquer.exe',
  }) as Express.Multer.File;

describe('ProductsController', () => {
  let controller: ProductsController;
  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    addImage: jest.fn(),
    removeImage: jest.fn(),
  };
  const storage = { save: jest.fn() };

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
    it('guarda a imagem com nome aleatório e registra a foto', async () => {
      await expect(
        controller.uploadImage('prod-1', upload('image/png'), 'true'),
      ).resolves.toEqual({ id: 'img-1' });

      const [key, body, contentType] = storage.save.mock.calls[0];
      // O nome vem de um UUID e a extensão do tipo do arquivo, nunca do nome enviado.
      expect(key).toMatch(/^[0-9a-f-]{36}\.png$/);
      expect(body).toEqual(Buffer.from('conteudo'));
      expect(contentType).toBe('image/png');
      expect(service.addImage).toHaveBeenCalledWith(
        'prod-1',
        `/uploads/${key}`,
        true,
      );
    });

    it('trata a foto como não sendo capa por padrão', async () => {
      await controller.uploadImage('prod-1', upload('image/jpeg'));

      expect(service.addImage).toHaveBeenCalledWith(
        'prod-1',
        expect.stringMatching(/\.jpg$/),
        false,
      );
    });

    it.each(['application/pdf', 'text/html', 'image/svg+xml'])(
      'recusa arquivo do tipo %s',
      async (mimetype) => {
        await expect(
          controller.uploadImage('prod-1', upload(mimetype)),
        ).rejects.toThrow(BadRequestException);
        expect(storage.save).not.toHaveBeenCalled();
        expect(service.addImage).not.toHaveBeenCalled();
      },
    );

    it('recusa requisição sem arquivo', async () => {
      await expect(controller.uploadImage('prod-1', undefined)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  it('removeImage repassa o id da foto', () => {
    void controller.removeImage('img-1');

    expect(service.removeImage).toHaveBeenCalledWith('img-1');
  });
});
