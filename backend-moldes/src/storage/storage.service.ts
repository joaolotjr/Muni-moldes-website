import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { createReadStream } from 'fs';
import { mkdir, stat, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { Readable } from 'stream';
import { processImage, UnreadableImageError } from './image-processing';

export interface StoredFile {
  stream: Readable;
  contentType?: string;
  contentLength?: number;
}

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
};

/**
 * Guarda as fotos dos moldes. Com S3_BUCKET definido usa um serviço compatível
 * com S3 (Garage local, Cloudflare R2, Backblaze B2...). Sem ele, grava na pasta
 * ./uploads, como antes.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3?: S3Client;
  private readonly bucket?: string;
  private readonly localDir = join(process.cwd(), 'uploads');

  constructor(config: ConfigService) {
    this.bucket = config.get<string>('S3_BUCKET') || undefined;
    if (this.bucket) {
      this.s3 = new S3Client({
        endpoint: config.get<string>('S3_ENDPOINT') || undefined,
        region: config.get<string>('S3_REGION', 'us-east-1'),
        forcePathStyle:
          config.get<string>('S3_FORCE_PATH_STYLE', 'false') === 'true',
        credentials: {
          accessKeyId: config.getOrThrow<string>('S3_ACCESS_KEY_ID'),
          secretAccessKey: config.getOrThrow<string>('S3_SECRET_ACCESS_KEY'),
        },
      });
      this.logger.log(`Fotos no bucket S3 "${this.bucket}"`);
    } else {
      this.logger.log(
        `Fotos na pasta local ${this.localDir} (S3_BUCKET não definido)`,
      );
    }
  }

  static contentTypeFor(key: string): string | undefined {
    const dot = key.lastIndexOf('.');
    return dot === -1 ? undefined : CONTENT_TYPES[key.slice(dot).toLowerCase()];
  }

  /**
   * Compacta e guarda uma imagem enviada pelo painel. Devolve o endereço público
   * (/uploads/<arquivo>). Toda foto é guardada em WebP, já reduzida e sem
   * metadados; o nome vem de um UUID, nunca do nome enviado.
   */
  async saveImage(file: Express.Multer.File | undefined): Promise<string> {
    if (!file) {
      throw new BadRequestException('Envie uma imagem.');
    }

    let processed: Awaited<ReturnType<typeof processImage>>;
    try {
      processed = await processImage(file.buffer);
    } catch (error) {
      if (!(error instanceof UnreadableImageError)) throw error;
      this.logger.warn(
        `Imagem recusada (${file.mimetype}, ${file.size} bytes): ${error.message}`,
      );
      throw new BadRequestException(
        'Não foi possível ler esta imagem. Envie uma foto em JPG, PNG ou WebP.',
      );
    }

    const key = `${randomUUID()}.webp`;
    await this.save(key, processed.buffer, 'image/webp');
    this.logger.log(
      `Foto guardada: ${file.size} -> ${processed.buffer.length} bytes (${processed.width}x${processed.height})`,
    );
    return `/uploads/${key}`;
  }

  /** Apaga a imagem de um endereço /uploads/<arquivo>. Uma falha aqui só é registrada. */
  async removeByUrl(url: string | null | undefined): Promise<void> {
    if (!url) return;
    const key = url.replace(/^\/uploads\//, '');
    try {
      await this.remove(key);
    } catch (error) {
      this.logger.error(
        `Não foi possível apagar ${key} do armazenamento`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async save(key: string, body: Buffer, contentType: string): Promise<void> {
    if (this.s3) {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      );
      return;
    }
    await mkdir(this.localDir, { recursive: true });
    await writeFile(join(this.localDir, key), body);
  }

  async get(key: string): Promise<StoredFile> {
    if (this.s3) {
      try {
        const res = await this.s3.send(
          new GetObjectCommand({ Bucket: this.bucket, Key: key }),
        );
        return {
          stream: res.Body as Readable,
          contentType: res.ContentType ?? StorageService.contentTypeFor(key),
          contentLength: res.ContentLength,
        };
      } catch (error) {
        if ((error as { name?: string }).name === 'NoSuchKey')
          throw new NotFoundException();
        throw error;
      }
    }
    const path = join(this.localDir, key);
    const info = await stat(path).catch(() => null);
    if (!info?.isFile()) throw new NotFoundException();
    return {
      stream: createReadStream(path),
      contentType: StorageService.contentTypeFor(key),
      contentLength: info.size,
    };
  }

  async remove(key: string): Promise<void> {
    if (this.s3) {
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return;
    }
    await unlink(join(this.localDir, key)).catch(() => undefined);
  }
}
