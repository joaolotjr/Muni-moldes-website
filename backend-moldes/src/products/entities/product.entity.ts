import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
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

  @Column({ type: 'varchar', length: 50, nullable: true })
  final_weight: string;

  @Column({ type: 'uuid', nullable: true })
  collection_id: string;

  @ManyToOne(() => Collection, (collection) => collection.products, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'collection_id' })
  collection: Collection;

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  active_from: Date;

  @Column({ type: 'timestamp', nullable: true })
  active_until: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
