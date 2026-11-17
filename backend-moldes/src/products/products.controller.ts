import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseInterceptors, UploadedFile, NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Auth, CurrentUser, OptionalAuth } from '../auth/auth.decorator';
import type { AuthUser } from '../auth/permissions';
import { isVisibleNow } from '../visibility';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateProductDto, UpdateProductDto } from './dto/save-product.dto';
import { StorageService } from '../storage/storage.service';
import { imageUploadOptions } from '../storage/image-upload';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly storage: StorageService,
  ) {}

  // Sem login, só o que está visível no site. Itens inativos ou agendados
  // aparecem apenas para quem está logado no painel.
  @OptionalAuth()
  @Get()
  findAll(
    @CurrentUser() user: AuthUser | undefined,
    @Query('collection') collectionSlug?: string,
    @Query('public') isPublic?: string,
  ) {
    return this.productsService.findAll(collectionSlug, !user || isPublic === 'true');
  }

  @OptionalAuth()
  @Get(':slug')
  async findOne(@CurrentUser() user: AuthUser | undefined, @Param('slug') slug: string) {
    const product = await this.productsService.findOne(slug);
    if (!user && !isVisibleNow(product)) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }
    return product;
  }

  @Auth('products')
  @Post()
  create(@Body() body: CreateProductDto) {
    return this.productsService.create(body);
  }

  @Auth('products')
  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateProductDto) {
    return this.productsService.update(id, body);
  }

  @Auth('products')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }

  @Auth('products')
  @Post(':id/images')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('isCover') isCover?: string
  ) {
    // Confere o produto antes de guardar o arquivo, para não sobrar foto órfã.
    await this.productsService.findById(id);
    // A imagem vai para o armazenamento (S3 ou pasta local) e é servida em /uploads/<nome>.
    const imageUrl = await this.storage.saveImage(file);
    return this.productsService.addImage(id, imageUrl, isCover === 'true');
  }

  @Auth('products')
  @Delete(':id/images/:imageId')
  removeImage(@Param('imageId', ParseUUIDPipe) imageId: string) {
    return this.productsService.removeImage(imageId);
  }
}
