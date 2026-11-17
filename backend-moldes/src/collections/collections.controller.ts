import { Controller, Get, Post, Body, Param, Put, Delete, Query, NotFoundException } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { Auth, CurrentUser, OptionalAuth } from '../auth/auth.decorator';
import type { AuthUser } from '../auth/permissions';
import { isVisibleNow } from '../visibility';

import { Collection } from './entities/collection.entity';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  // Sem login, só as categorias visíveis no site.
  @OptionalAuth()
  @Get()
  findAll(@CurrentUser() user: AuthUser | undefined, @Query('public') isPublic?: string) {
    return this.collectionsService.findAll(!user || isPublic === 'true');
  }

  @OptionalAuth()
  @Get(':id')
  async findOne(@CurrentUser() user: AuthUser | undefined, @Param('id') id: string) {
    const collection = await this.collectionsService.findOne(id);
    if (!user && !isVisibleNow(collection)) {
      throw new NotFoundException(`Collection #${id} not found`);
    }
    return collection;
  }

  @Auth('collections')
  @Post()
  create(@Body() body: Partial<Collection>) {
    return this.collectionsService.create(body);
  }

  @Auth('collections')
  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Collection>) {
    return this.collectionsService.update(id, body);
  }

  @Auth('collections')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.collectionsService.remove(id);
  }
}
