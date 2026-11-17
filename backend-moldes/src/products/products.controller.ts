import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Auth } from '../auth/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Product } from './entities/product.entity';
import { StorageService } from '../storage/storage.service';
import { imageUploadOptions } from '../storage/image-upload';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  findAll(@Query('collection') collectionSlug?: string, @Query('public') isPublic?: string) {
    return this.productsService.findAll(collectionSlug, isPublic === 'true');
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productsService.findOne(slug);
  }

  @Auth('products')
  @Post()
  create(@Body() body: Partial<Product>) {
    return this.productsService.create(body);
  }

  @Auth('products')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Product>) {
    return this.productsService.update(id, body);
  }

  @Auth('products')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Auth('products')
  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('isCover') isCover?: string
  ) {
    // A imagem vai para o armazenamento (S3 ou pasta local) e é servida em /uploads/<nome>.
    const imageUrl = await this.storage.saveImage(file);
    return this.productsService.addImage(id, imageUrl, isCover === 'true');
  }

  @Auth('products')
  @Delete(':id/images/:imageId')
  removeImage(@Param('imageId') imageId: string) {
    return this.productsService.removeImage(imageId);
  }
}
