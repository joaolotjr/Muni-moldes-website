import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import sharp from 'sharp';
import { Readable } from 'stream';
import { StorageService } from './storage.service';

const configWith = (values: Record<string, string>) =>
  ({
    get: (key: string, fallback?: string) => values[key] ?? fallback,
    getOrThrow: (key: string) => {
      if (!(key in values)) throw new Error(`faltou ${key}`);
      return values[key];
    },
  }) as unknown as ConfigService;

const readAll = async (stream: Readable) => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString();
};

describe('StorageService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('reconhece o tipo pela extensão', () => {
    expect(StorageService.contentTypeFor('foto.JPG')).toBe('image/jpeg');
    expect(StorageService.contentTypeFor('foto.webp')).toBe('image/webp');
    expect(StorageService.contentTypeFor('arquivo.exe')).toBeUndefined();
    expect(StorageService.contentTypeFor('sem-extensao')).toBeUndefined();
  });

  describe('saveImage', () => {
    const upload = (buffer: Buffer, mimetype = 'image/jpeg') =>
      ({
        mimetype,
        buffer,
        size: buffer.length,
        originalname: 'qualquer.exe',
      }) as Express.Multer.File;
    const jpeg = () =>
      sharp({
        create: { width: 3000, height: 2000, channels: 3, background: '#a65' },
      })
        .jpeg()
        .toBuffer();
    let service: StorageService;
    let save: jest.SpyInstance;

    beforeEach(() => {
      service = new StorageService(configWith({}));
      save = jest.spyOn(service, 'save').mockResolvedValue(undefined);
      jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
      jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    });

    it('guarda a versão compactada em WebP, com nome aleatório', async () => {
      const url = await service.saveImage(upload(await jpeg()));

      // O nome vem de um UUID, nunca do nome enviado; a extensão é sempre .webp.
      expect(url).toMatch(/^\/uploads\/[0-9a-f-]{36}\.webp$/);
      const [key, body, contentType] = save.mock.calls[0];
      expect(key).toBe(url.replace('/uploads/', ''));
      expect(contentType).toBe('image/webp');
      const meta = await sharp(body as Buffer).metadata();
      expect([meta.format, meta.width, meta.height]).toEqual([
        'webp',
        2000,
        1333,
      ]);
    });

    it('confere o conteúdo, não o tipo declarado pelo navegador', async () => {
      await expect(
        service.saveImage(upload(Buffer.from('<html></html>'), 'image/jpeg')),
      ).rejects.toThrow(BadRequestException);
      expect(save).not.toHaveBeenCalled();
    });

    it('recusa SVG', async () => {
      const svg = Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"/>',
      );

      await expect(
        service.saveImage(upload(svg, 'image/svg+xml')),
      ).rejects.toThrow(BadRequestException);
      expect(save).not.toHaveBeenCalled();
    });

    it('recusa requisição sem arquivo', async () => {
      await expect(service.saveImage(undefined)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('removeByUrl', () => {
    let service: StorageService;
    let remove: jest.SpyInstance;

    beforeEach(() => {
      service = new StorageService(configWith({}));
      remove = jest.spyOn(service, 'remove').mockResolvedValue(undefined);
    });

    it('apaga o arquivo do endereço /uploads/<arquivo>', async () => {
      await service.removeByUrl('/uploads/foto.png');

      expect(remove).toHaveBeenCalledWith('foto.png');
    });

    it('ignora endereço vazio', async () => {
      await service.removeByUrl(null);

      expect(remove).not.toHaveBeenCalled();
    });

    it('não falha se o armazenamento estiver fora do ar', async () => {
      jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
      remove.mockRejectedValue(new Error('S3 indisponível'));

      await expect(
        service.removeByUrl('/uploads/foto.png'),
      ).resolves.toBeUndefined();
    });
  });

  describe('sem S3_BUCKET (pasta local)', () => {
    let dir: string;
    let service: StorageService;

    beforeEach(async () => {
      dir = await mkdtemp(join(tmpdir(), 'muni-storage-'));
      jest.spyOn(process, 'cwd').mockReturnValue(dir);
      service = new StorageService(configWith({}));
    });

    afterEach(async () => {
      await rm(dir, { recursive: true, force: true });
    });

    it('grava, lê e apaga na pasta uploads', async () => {
      await service.save('foto.png', Buffer.from('imagem'), 'image/png');
      expect(existsSync(join(dir, 'uploads', 'foto.png'))).toBe(true);

      const file = await service.get('foto.png');
      expect(file.contentType).toBe('image/png');
      expect(file.contentLength).toBe(6);
      await expect(readAll(file.stream)).resolves.toBe('imagem');

      await service.remove('foto.png');
      expect(existsSync(join(dir, 'uploads', 'foto.png'))).toBe(false);
    });

    it('responde 404 para arquivo que não existe', async () => {
      await expect(service.get('nao-existe.png')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('apagar arquivo que não existe não dá erro', async () => {
      await expect(service.remove('nao-existe.png')).resolves.toBeUndefined();
    });
  });

  describe('com S3_BUCKET', () => {
    const s3Config = {
      S3_BUCKET: 'fotos',
      S3_ENDPOINT: 'http://127.0.0.1:3900',
      S3_REGION: 'garage',
      S3_ACCESS_KEY_ID: 'chave',
      S3_SECRET_ACCESS_KEY: 'segredo',
      S3_FORCE_PATH_STYLE: 'true',
    };
    let send: jest.SpyInstance;
    let service: StorageService;

    beforeEach(() => {
      send = jest.spyOn(S3Client.prototype, 'send') as jest.SpyInstance;
      send.mockImplementation(() => Promise.resolve({}));
      service = new StorageService(configWith(s3Config));
    });

    it('exige as credenciais', () => {
      expect(
        () => new StorageService(configWith({ S3_BUCKET: 'fotos' })),
      ).toThrow('faltou S3_ACCESS_KEY_ID');
    });

    it('envia a foto para o bucket', async () => {
      await service.save('foto.png', Buffer.from('imagem'), 'image/png');

      const command = send.mock.calls[0][0];
      expect(command).toBeInstanceOf(PutObjectCommand);
      expect(command.input).toEqual({
        Bucket: 'fotos',
        Key: 'foto.png',
        Body: Buffer.from('imagem'),
        ContentType: 'image/png',
      });
    });

    it('lê a foto do bucket', async () => {
      send.mockImplementation(() =>
        Promise.resolve({
          Body: Readable.from(['imagem']),
          ContentType: 'image/png',
          ContentLength: 6,
        }),
      );

      const file = await service.get('foto.png');

      expect(send.mock.calls[0][0]).toBeInstanceOf(GetObjectCommand);
      expect(send.mock.calls[0][0].input).toEqual({
        Bucket: 'fotos',
        Key: 'foto.png',
      });
      expect(file.contentType).toBe('image/png');
      expect(file.contentLength).toBe(6);
      await expect(readAll(file.stream)).resolves.toBe('imagem');
    });

    it('responde 404 quando a foto não está no bucket', async () => {
      send.mockImplementation(() =>
        Promise.reject(
          Object.assign(new Error('não existe'), { name: 'NoSuchKey' }),
        ),
      );

      await expect(service.get('nao-existe.png')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('repassa outros erros do S3', async () => {
      send.mockImplementation(() => Promise.reject(new Error('sem conexão')));

      await expect(service.get('foto.png')).rejects.toThrow('sem conexão');
    });

    it('apaga a foto do bucket', async () => {
      await service.remove('foto.png');

      expect(send.mock.calls[0][0]).toBeInstanceOf(DeleteObjectCommand);
      expect(send.mock.calls[0][0].input).toEqual({
        Bucket: 'fotos',
        Key: 'foto.png',
      });
    });
  });
});
