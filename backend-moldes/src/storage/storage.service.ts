import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { createReadStream } from 'fs';
import { mkdir, stat, unlink, writeFile } from 'fs/promises';
import { join } from 'path';
import { Readable } from 'stream';

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
