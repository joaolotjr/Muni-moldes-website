import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { StorageService } from './storage.service';

// Nome gerado no upload: letras, números, hífen e uma extensão. Nada de barras ou "..".
const KEY_PATTERN = /^[a-zA-Z0-9-]+\.[a-zA-Z0-9]+$/;

/** Entrega as fotos em /uploads/<arquivo>, buscando no armazenamento configurado. */
@Controller('uploads')
export class UploadsController {
  constructor(private readonly storage: StorageService) {}

  @Get(':key')
  async serve(
    @Param('key') key: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!KEY_PATTERN.test(key)) throw new NotFoundException();
    const file = await this.storage.get(key);
    // O nome do arquivo nunca é reaproveitado, então o navegador pode guardar por muito tempo.
    res.set({
      'Content-Type': file.contentType ?? 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    });
    return new StreamableFile(file.stream, { length: file.contentLength });
  }
}
