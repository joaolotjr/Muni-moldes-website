import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  slug: string;

  @OneToMany(() => Product, (product) => product.collection)
  products: Product[];

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamp', nullable: true })
  active_from: Date;

  @Column({ type: 'timestamp', nullable: true })
  active_until: Date;
}
