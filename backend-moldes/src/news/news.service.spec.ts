import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StorageService } from '../storage/storage.service';
import { SaveNewsDto } from './dto/save-news.dto';
import { NewsPost } from './entities/news-post.entity';
import { NewsService, slugify } from './news.service';

const dto = (overrides: Partial<SaveNewsDto> = {}): SaveNewsDto => ({
  title: 'Nova linha de Páscoa',
  excerpt: 'Resumo',
  content: 'Texto da notícia',
  category: 'lancamentos',
  tags: [],
  status: 'draft',
  ...overrides,
});

describe('slugify', () => {
  it('remove acentos, espaços e símbolos', () => {
    expect(slugify('Nova linha de Páscoa: ovos & coelhos!')).toBe(
      'nova-linha-de-pascoa-ovos-coelhos',
    );
    expect(slugify('  Ação   de  NATAL  ')).toBe('acao-de-natal');
  });

  it('devolve vazio quando não sobra nada', () => {
    expect(slugify('!!!')).toBe('');
  });
});

describe('NewsService', () => {
  let service: NewsService;
  const repository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((data) => ({ ...data })),
    save: jest.fn((post) =>
      Promise.resolve({ id: post.id ?? 'news-1', ...post }),
    ),
    delete: jest.fn(),
  };
  const storage = { removeByUrl: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    repository.findOne.mockResolvedValue(null);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        { provide: getRepositoryToken(NewsPost), useValue: repository },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = module.get(NewsService);
  });

  it('findPublished lista só as publicadas, mais recentes primeiro e sem o texto', async () => {
    repository.find.mockResolvedValue([]);

    await service.findPublished();

    const options = repository.find.mock.calls[0][0];
    expect(options.where).toEqual({ status: 'published' });
    expect(options.order).toEqual({ published_at: 'DESC' });
    expect(options.select.content).toBeUndefined();
  });

  describe('findPublishedBySlug', () => {
    it('procura só entre as publicadas', async () => {
      repository.findOne.mockResolvedValue({ id: 'news-1' });

      await expect(service.findPublishedBySlug('pascoa')).resolves.toEqual({
        id: 'news-1',
      });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { slug: 'pascoa', status: 'published' },
      });
    });

    it('responde 404 para rascunho ou notícia inexistente', async () => {
      await expect(service.findPublishedBySlug('rascunho')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  it('findOneForAdmin responde 404 quando não existe', async () => {
    await expect(service.findOneForAdmin('nao-existe')).rejects.toThrow(
      NotFoundException,
    );
  });

  describe('create', () => {
    it('salva o rascunho com endereço gerado do título e sem data de publicação', async () => {
      const post = await service.create(dto(), 'Ana');

      expect(post).toMatchObject({
        title: 'Nova linha de Páscoa',
        slug: 'nova-linha-de-pascoa',
        status: 'draft',
        published_at: null,
        author_name: 'Ana',
        cover_image_url: null,
      });
    });

    it('marca a data ao publicar', async () => {
      const post = await service.create(dto({ status: 'published' }), 'Ana');

      expect(post.status).toBe('published');
      expect(post.published_at).toBeInstanceOf(Date);
    });

    it('recusa publicar sem texto', async () => {
      await expect(
        service.create(dto({ status: 'published', content: '   ' }), 'Ana'),
      ).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('aceita rascunho sem texto e sem resumo', async () => {
      const post = await service.create(
        dto({ content: undefined, excerpt: undefined }),
        null,
      );

      expect(post).toMatchObject({
        content: '',
        excerpt: '',
        author_name: null,
      });
    });

    it('acrescenta um número quando o endereço já existe', async () => {
      repository.findOne
        .mockResolvedValueOnce({ id: 'outra-1' })
        .mockResolvedValueOnce({ id: 'outra-2' })
        .mockResolvedValueOnce(null);

      const post = await service.create(dto(), 'Ana');

      expect(post.slug).toBe('nova-linha-de-pascoa-3');
    });

    it('usa "noticia" quando o título não gera endereço', async () => {
      const post = await service.create(dto({ title: '!!!' }), 'Ana');

      expect(post.slug).toBe('noticia');
    });

    it('limpa as tags: tira espaços, vazias e repetidas', async () => {
      const post = await service.create(
        dto({ tags: [' Páscoa ', 'páscoa', '', 'Ovos'] }),
        'Ana',
      );

      expect(post.tags).toEqual(['Páscoa', 'Ovos']);
    });
  });

  describe('update', () => {
    const stored = (overrides: Partial<NewsPost> = {}) => ({
      id: 'news-1',
      title: 'Título antigo',
      slug: 'titulo-antigo',
      status: 'draft',
      published_at: null,
      ...overrides,
    });

    it('atualiza o endereço junto com o título enquanto for rascunho', async () => {
      repository.findOne
        .mockResolvedValueOnce(stored())
        .mockResolvedValue(null);

      const post = await service.update(
        'news-1',
        dto({ title: 'Título novo' }),
      );

      expect(post.slug).toBe('titulo-novo');
    });

    it('mantém o endereço depois de publicada, mesmo mudando o título', async () => {
      const publishedAt = new Date('2026-01-10T12:00:00Z');
      repository.findOne.mockResolvedValueOnce(
        stored({ status: 'published', published_at: publishedAt }),
      );

      const post = await service.update(
        'news-1',
        dto({ title: 'Título novo', status: 'published' }),
      );

      expect(post.slug).toBe('titulo-antigo');
      expect(post.published_at).toBe(publishedAt);
    });

    it('voltar para rascunho preserva a data da primeira publicação', async () => {
      const publishedAt = new Date('2026-01-10T12:00:00Z');
      repository.findOne.mockResolvedValueOnce(
        stored({ status: 'published', published_at: publishedAt }),
      );

      const post = await service.update('news-1', dto({ status: 'draft' }));

      expect(post.status).toBe('draft');
      expect(post.published_at).toBe(publishedAt);
    });

    it('não troca o endereço quando o único conflito é a própria notícia', async () => {
      repository.findOne
        .mockResolvedValueOnce(stored({ title: 'Pascoa', slug: 'pascoa' }))
        .mockResolvedValueOnce({ id: 'news-1' });

      const post = await service.update('news-1', dto({ title: 'Páscoa' }));

      expect(post.slug).toBe('pascoa');
    });

    it('responde 404 quando não existe', async () => {
      await expect(service.update('nao-existe', dto())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  it('remove apaga a notícia e a imagem de destaque', async () => {
    repository.findOne.mockResolvedValue({
      id: 'news-1',
      cover_image_url: '/uploads/capa.png',
    });

    await service.remove('news-1');

    expect(repository.delete).toHaveBeenCalledWith('news-1');
    expect(storage.removeByUrl).toHaveBeenCalledWith('/uploads/capa.png');
  });

  it('setCover troca a imagem e apaga a anterior', async () => {
    repository.findOne.mockResolvedValue({
      id: 'news-1',
      cover_image_url: '/uploads/antiga.png',
    });

    const post = await service.setCover('news-1', '/uploads/nova.png');

    expect(post.cover_image_url).toBe('/uploads/nova.png');
    expect(storage.removeByUrl).toHaveBeenCalledWith('/uploads/antiga.png');
  });

  it('removeCover tira a imagem e apaga o arquivo', async () => {
    repository.findOne.mockResolvedValue({
      id: 'news-1',
      cover_image_url: '/uploads/capa.png',
    });

    const post = await service.removeCover('news-1');

    expect(post.cover_image_url).toBeNull();
    expect(storage.removeByUrl).toHaveBeenCalledWith('/uploads/capa.png');
  });
});
