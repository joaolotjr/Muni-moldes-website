import { BadRequestException, Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Product } from './entities/product.entity';
import { memoryStorage } from 'multer';
import { randomUUID } from 'crypto';
import { StorageService } from '../storage/storage.service';

// Tipos de imagem aceitos no upload e a extensão gravada para cada um.
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

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

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: Partial<Product>) {
    return this.productsService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Product>) {
    return this.productsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: MAX_IMAGE_BYTES },
  }))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('isCover') isCover?: string
  ) {
    const extension = file && IMAGE_EXTENSIONS[file.mimetype];
    if (!file || !extension) {
      throw new BadRequestException('Envie uma imagem JPG, PNG, WebP, GIF ou AVIF.');
    }
    // O arquivo vai para o armazenamento (S3 ou pasta local) e é servido em /uploads/<nome>.
    const key = `${randomUUID()}${extension}`;
    await this.storage.save(key, file.buffer, file.mimetype);
    return this.productsService.addImage(id, `/uploads/${key}`, isCover === 'true');
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/images/:imageId')
  removeImage(@Param('imageId') imageId: string) {
    return this.productsService.removeImage(imageId);
  }
}
