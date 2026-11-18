import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { Collection } from '../collections/entities/collection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductImage, Collection])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
