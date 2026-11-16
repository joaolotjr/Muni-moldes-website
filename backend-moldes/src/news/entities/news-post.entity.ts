import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { NewsCategory, NewsStatus } from '../news.constants';

@Entity('news_posts')
export class NewsPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 220, unique: true })
  slug: string;

  /** Resumo curto mostrado na listagem. */
  @Column({ type: 'varchar', length: 160, default: '' })
  excerpt: string;

  /** Texto da notícia, em Markdown simples (negrito, itálico, títulos, listas e links). */
  @Column({ type: 'text', default: '' })
  content: string;

  @Column({ type: 'varchar', length: 30 })
  category: NewsCategory;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  cover_image_url: string | null;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: NewsStatus;

  /** Data da primeira publicação. Fica vazia enquanto a notícia é rascunho. */
  @Column({ type: 'timestamptz', nullable: true })
  published_at: Date | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  author_name: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
