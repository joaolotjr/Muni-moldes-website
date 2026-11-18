import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { Auth, CurrentUser, OptionalAuth } from '../auth/auth.decorator';
import type { AuthUser } from '../auth/permissions';
import { isVisibleNow } from '../visibility';

import {
  CreateCollectionDto,
  UpdateCollectionDto,
} from './dto/save-collection.dto';
import { ReorderCollectionsDto } from './dto/reorder-collections.dto';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  // Sem login, só as categorias visíveis no site.
  @OptionalAuth()
  @Get()
  findAll(
    @CurrentUser() user: AuthUser | undefined,
    @Query('public') isPublic?: string,
  ) {
    return this.collectionsService.findAll(!user || isPublic === 'true');
  }

  @OptionalAuth()
  @Get(':id')
  async findOne(
    @CurrentUser() user: AuthUser | undefined,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const collection = await this.collectionsService.findOne(id);
    if (!user && !isVisibleNow(collection)) {
      throw new NotFoundException(`Collection #${id} not found`);
    }
    return collection;
  }

  @Auth('collections')
  @Post()
  create(@Body() body: CreateCollectionDto) {
    return this.collectionsService.create(body);
  }

  // Antes de ':id', para "order" não ser tratado como id.
  @Auth('collections')
  @Put('order')
  reorder(@Body() body: ReorderCollectionsDto) {
    return this.collectionsService.reorder(body.ids);
  }

  @Auth('collections')
  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateCollectionDto,
  ) {
    return this.collectionsService.update(id, body);
  }

  @Auth('collections')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.collectionsService.remove(id);
  }
}
