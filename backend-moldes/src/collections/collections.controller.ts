import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { Collection } from './entities/collection.entity';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  findAll() {
    return this.collectionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectionsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: Partial<Collection>) {
    return this.collectionsService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<Collection>) {
    return this.collectionsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.collectionsService.remove(id);
  }
}
