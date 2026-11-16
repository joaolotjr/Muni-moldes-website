import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { imageUploadOptions } from '../storage/image-upload';
import { StorageService } from '../storage/storage.service';
import { UsersService } from '../users/users.service';
import { SaveNewsDto } from './dto/save-news.dto';
import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly usersService: UsersService,
    private readonly storage: StorageService,
  ) {}

  // ---- Site (sem login): só notícias publicadas

  @Get()
  findPublished() {
    return this.newsService.findPublished();
  }

  // ---- Painel (com login). As rotas "admin" vêm antes de ":slug" para não serem confundidas.

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  findAllForAdmin() {
    return this.newsService.findAllForAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/:id')
  findOneForAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.findOneForAdmin(id);
  }

  @Get(':slug')
  findPublishedBySlug(@Param('slug') slug: string) {
    return this.newsService.findPublishedBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() dto: SaveNewsDto,
    @Request() req: { user: { email: string } },
  ) {
    const author = await this.usersService.findByEmail(req.user.email);
    return this.newsService.create(dto, author?.name ?? null);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SaveNewsDto) {
    return this.newsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cover')
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async uploadCover(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    // Confere que a notícia existe antes de guardar o arquivo.
    await this.newsService.findOneForAdmin(id);
    const imageUrl = await this.storage.saveImage(file);
    return this.newsService.setCover(id, imageUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/cover')
  removeCover(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.removeCover(id);
  }
}
