import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageService } from '../storage/storage.service';
import { SaveNewsDto } from './dto/save-news.dto';
import { NewsPost } from './entities/news-post.entity';

/** Transforma um título em um trecho de URL: sem acentos, minúsculo, com hífens. */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
    .replace(/-+$/, '');
}

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsPost)
    private newsRepository: Repository<NewsPost>,
    private storage: StorageService,
  ) {}

  /** Listagem do site: só publicadas, mais recentes primeiro, sem o texto completo. */
  findPublished(): Promise<NewsPost[]> {
    return this.newsRepository.find({
      where: { status: 'published' },
      order: { published_at: 'DESC' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        tags: true,
        cover_image_url: true,
        published_at: true,
        author_name: true,
      },
    });
  }

  async findPublishedBySlug(slug: string): Promise<NewsPost> {
    const post = await this.newsRepository.findOne({
      where: { slug, status: 'published' },
    });
    if (!post) throw new NotFoundException('Notícia não encontrada');
    return post;
  }

  /** Listagem do painel: rascunhos e publicadas. */
  findAllForAdmin(): Promise<NewsPost[]> {
    return this.newsRepository.find({ order: { created_at: 'DESC' } });
  }

  async findOneForAdmin(id: string): Promise<NewsPost> {
    const post = await this.newsRepository.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Notícia não encontrada');
    return post;
  }

  async create(dto: SaveNewsDto, authorName: string | null): Promise<NewsPost> {
    const post = this.newsRepository.create({
      author_name: authorName,
      cover_image_url: null,
      published_at: null,
    });
    await this.apply(post, dto);
    return this.newsRepository.save(post);
  }

  async update(id: string, dto: SaveNewsDto): Promise<NewsPost> {
    const post = await this.findOneForAdmin(id);
    await this.apply(post, dto);
    return this.newsRepository.save(post);
  }

  async remove(id: string): Promise<void> {
    const post = await this.findOneForAdmin(id);
    await this.newsRepository.delete(id);
    await this.storage.removeByUrl(post.cover_image_url);
  }

  async setCover(id: string, imageUrl: string): Promise<NewsPost> {
    const post = await this.findOneForAdmin(id);
    const previous = post.cover_image_url;
    post.cover_image_url = imageUrl;
    const saved = await this.newsRepository.save(post);
    await this.storage.removeByUrl(previous);
    return saved;
  }

  async removeCover(id: string): Promise<NewsPost> {
    const post = await this.findOneForAdmin(id);
    const previous = post.cover_image_url;
    post.cover_image_url = null;
    const saved = await this.newsRepository.save(post);
    await this.storage.removeByUrl(previous);
    return saved;
  }

  private async apply(post: NewsPost, dto: SaveNewsDto): Promise<void> {
    const content = dto.content ?? '';
    if (dto.status === 'published' && !content.trim()) {
      throw new BadRequestException(
        'Escreva o texto da notícia antes de publicar.',
      );
    }

    // O endereço acompanha o título enquanto a notícia nunca foi publicada.
    // Depois da primeira publicação ele fica fixo, para não quebrar links já compartilhados.
    if (!post.slug || (!post.published_at && dto.title !== post.title)) {
      post.slug = await this.uniqueSlug(dto.title, post.id);
    }

    post.title = dto.title;
    post.excerpt = dto.excerpt ?? '';
    post.content = content;
    post.category = dto.category;
    post.tags = this.cleanTags(dto.tags);
    post.status = dto.status;
    if (dto.status === 'published' && !post.published_at) {
      post.published_at = new Date();
    }
  }

  private cleanTags(tags: string[] | undefined): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const raw of tags ?? []) {
      const tag = raw.trim();
      const key = tag.toLowerCase();
      if (tag && !seen.has(key)) {
        seen.add(key);
        result.push(tag);
      }
    }
    return result;
  }

  private async uniqueSlug(title: string, ownId?: string): Promise<string> {
    const base = slugify(title) || 'noticia';
    for (let attempt = 1; ; attempt++) {
      const slug = attempt === 1 ? base : `${base}-${attempt}`;
      const existing = await this.newsRepository.findOne({ where: { slug } });
      if (!existing || existing.id === ownId) return slug;
    }
  }
}
