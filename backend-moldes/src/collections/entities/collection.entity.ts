import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  slug: string;

  /** Produtos que têm esta como categoria principal. */
  @OneToMany(() => Product, (product) => product.collection)
  products: Product[];

  /** Produtos que têm esta categoria, como principal ou não. */
  @ManyToMany(() => Product, (product) => product.collections)
  memberProducts: Product[];

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  /**
   * Foto de capa enviada pelo painel (de preferência uma foto de ambiente, 2:1).
   * Sem ela, o site usa a foto de um produto da categoria.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  cover_url: string | null;

  /** Ordem de exibição: menor vem antes. Definida pela tela de categorias. */
  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'timestamptz', nullable: true })
  active_from: Date;

  @Column({ type: 'timestamptz', nullable: true })
  active_until: Date;
}
