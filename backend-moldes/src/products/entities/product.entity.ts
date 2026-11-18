import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Collection } from '../../collections/entities/collection.entity';
import { ProductImage } from './product-image.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 220, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  dimensions: string;

  /** Peso aproximado do molde (pode variar um pouco de peça para peça). */
  @Column({ type: 'varchar', length: 50, nullable: true })
  final_weight: string;

  /** Código de referência usado nos pedidos, ex.: MM-0142. */
  @Column({ type: 'varchar', length: 30, nullable: true, unique: true })
  code: string | null;

  @Column({ type: 'int', nullable: true })
  cavities: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  material: string | null;

  /** Peso da peça pronta, por cavidade, ex.: "20 g por cavidade". */
  @Column({ type: 'varchar', length: 50, nullable: true })
  piece_weight: string | null;

  /** Quantidade mínima por pedido. */
  @Column({ type: 'int', nullable: true })
  min_order: number | null;

  /** Categoria principal: usada no selo do cartão, no caminho da ficha e no link canônico. */
  @Column({ type: 'uuid', nullable: true })
  collection_id: string;

  @ManyToOne(() => Collection, (collection) => collection.products, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  /** Todas as categorias do produto, incluindo a principal. */
  @ManyToMany(() => Collection, (collection) => collection.memberProducts)
  @JoinTable({
    name: 'product_collections',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'collection_id', referencedColumnName: 'id' },
  })
  collections: Collection[];

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  active_from: Date;

  @Column({ type: 'timestamptz', nullable: true })
  active_until: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
