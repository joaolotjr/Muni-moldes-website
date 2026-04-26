// backend-moldes/src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CollectionsModule } from './collections/collections.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', // Mapped from docker-compose
      port: 5432,
      username: 'user_admin',
      password: 'senha_segura',
      database: 'catalogo_db',
      autoLoadEntities: true, // Automatically loads entities
      synchronize: true, // ONLY FOR DEVELOPMENT: Creates the tables
    }),
    UsersModule,
    AuthModule,
    CollectionsModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}