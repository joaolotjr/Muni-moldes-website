import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StorageService } from '../storage/storage.service';
import { UsersService } from '../users/users.service';
import { SaveNewsDto } from './dto/save-news.dto';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

const dto: SaveNewsDto = {
  title: 'Páscoa',
  category: 'lancamentos',
  status: 'draft',
};
const request = { user: { email: 'ana@b.com' } };
const file = { mimetype: 'image/png' } as Express.Multer.File;

describe('NewsController', () => {
  let controller: NewsController;
  const service = {
    findPublished: jest.fn(),
    findPublishedBySlug: jest.fn(),
    findAllForAdmin: jest.fn(),
    findOneForAdmin: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    setCover: jest.fn(),
    removeCover: jest.fn(),
  };
  const usersService = { findByEmail: jest.fn() };
  const storage = { saveImage: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [
        { provide: NewsService, useValue: service },
        { provide: UsersService, useValue: usersService },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    controller = module.get(NewsController);
  });

  it('repassa as consultas ao serviço', () => {
    void controller.findPublished();
    void controller.findPublishedBySlug('pascoa');
    void controller.findAllForAdmin();
    void controller.findOneForAdmin('news-1');

    expect(service.findPublished).toHaveBeenCalled();
    expect(service.findPublishedBySlug).toHaveBeenCalledWith('pascoa');
    expect(service.findAllForAdmin).toHaveBeenCalled();
    expect(service.findOneForAdmin).toHaveBeenCalledWith('news-1');
  });

  describe('create', () => {
    it('grava o nome de quem está logado como autor', async () => {
      usersService.findByEmail.mockResolvedValue({ name: 'Ana' });

      await controller.create(dto, request);

      expect(usersService.findByEmail).toHaveBeenCalledWith('ana@b.com');
      expect(service.create).toHaveBeenCalledWith(dto, 'Ana');
    });

    it('cria sem autor se o usuário não for encontrado', async () => {
      usersService.findByEmail.mockResolvedValue(undefined);

      await controller.create(dto, request);

      expect(service.create).toHaveBeenCalledWith(dto, null);
    });
  });

  it('repassa edição, exclusão e remoção da imagem', () => {
    void controller.update('news-1', dto);
    void controller.remove('news-1');
    void controller.removeCover('news-1');

    expect(service.update).toHaveBeenCalledWith('news-1', dto);
    expect(service.remove).toHaveBeenCalledWith('news-1');
    expect(service.removeCover).toHaveBeenCalledWith('news-1');
  });

  describe('uploadCover', () => {
    it('guarda a imagem e associa à notícia', async () => {
      storage.saveImage.mockResolvedValue('/uploads/capa.png');
      service.setCover.mockResolvedValue({
        id: 'news-1',
        cover_image_url: '/uploads/capa.png',
      });

      await expect(controller.uploadCover('news-1', file)).resolves.toEqual({
        id: 'news-1',
        cover_image_url: '/uploads/capa.png',
      });
      expect(service.setCover).toHaveBeenCalledWith(
        'news-1',
        '/uploads/capa.png',
      );
    });

    it('não guarda o arquivo quando a notícia não existe', async () => {
      service.findOneForAdmin.mockRejectedValue(new NotFoundException());

      await expect(controller.uploadCover('nao-existe', file)).rejects.toThrow(
        NotFoundException,
      );
      expect(storage.saveImage).not.toHaveBeenCalled();
    });

    it('não associa nada quando o arquivo é recusado', async () => {
      service.findOneForAdmin.mockResolvedValue({ id: 'news-1' });
      storage.saveImage.mockRejectedValue(new BadRequestException());

      await expect(controller.uploadCover('news-1', file)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.setCover).not.toHaveBeenCalled();
    });
  });
});
