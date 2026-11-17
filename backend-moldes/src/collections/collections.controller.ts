import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { Auth } from '../auth/auth.decorator';

import { Collection } from './entities/collection.entity';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  findAll(@Query('public') isPublic?: string) {
    return this.collectionsService.findAll(isPublic === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectionsService.findOne(id);
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
