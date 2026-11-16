import { NotFoundException, StreamableFile } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { Readable } from 'stream';
import { StorageService } from './storage.service';
import { UploadsController } from './uploads.controller';

describe('UploadsController', () => {
  let controller: UploadsController;
  const storage = { get: jest.fn() };
  const res = { set: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [{ provide: StorageService, useValue: storage }],
    }).compile();

    controller = module.get(UploadsController);
  });

  it('entrega a foto com tipo e cache longo', async () => {
    storage.get.mockResolvedValue({
      stream: Readable.from(['x']),
      contentType: 'image/png',
      contentLength: 1,
    });

    const result = await controller.serve(
      'abc-123.png',
      res as unknown as Response,
    );

    expect(result).toBeInstanceOf(StreamableFile);
    expect(storage.get).toHaveBeenCalledWith('abc-123.png');
    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      }),
    );
  });

  it.each(['../.env', '..', '.env', 'pasta/foto.png', 'foto', 'foto.png.'])(
    'responde 404 para o nome inválido "%s" sem consultar o armazenamento',
    async (key) => {
      await expect(
        controller.serve(key, res as unknown as Response),
      ).rejects.toThrow(NotFoundException);
      expect(storage.get).not.toHaveBeenCalled();
    },
  );
});
