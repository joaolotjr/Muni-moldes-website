// backend-moldes/src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', // Mapeado do docker-compose
      port: 5432,
      username: 'user_admin',
      password: 'senha_segura',
      database: 'catalogo_db',
      autoLoadEntities: true, // Carrega as entidades automaticamente
      synchronize: true, // APENAS PARA DESENVOLVIMENTO: Cria as tabelas
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}