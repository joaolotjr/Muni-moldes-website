import sharp from 'sharp';
import {
  MAX_IMAGE_SIDE,
  processImage,
  UnreadableImageError,
} from './image-processing';

// Foto sintética com ruído, para o arquivo não comprimir a quase nada.
const photo = (width: number, height: number) =>
  sharp({
    create: {
      width,
      height,
      channels: 3,
      noise: { type: 'gaussian', mean: 128, sigma: 40 },
    },
  });

// Processar imagem é pesado em máquinas pequenas; o padrão de 5 s não basta.
jest.setTimeout(30_000);

describe('processImage', () => {
  it('reduz foto grande para caber em 2000 px e converte para WebP', async () => {
    const original = await photo(2800, 2100).jpeg({ quality: 95 }).toBuffer();

    const result = await processImage(original);
    const meta = await sharp(result.buffer).metadata();

    expect(meta.format).toBe('webp');
    expect([result.width, result.height]).toEqual([MAX_IMAGE_SIDE, 1500]);
    expect(result.buffer.length).toBeLessThan(original.length);
  });

  it('não amplia foto que já é pequena', async () => {
    const original = await photo(800, 600).png().toBuffer();

    const result = await processImage(original);

    expect([result.width, result.height]).toEqual([800, 600]);
  });

  it('gira a foto conforme a orientação gravada pela câmera', async () => {
    // Orientação 6: a câmera gravou deitada uma foto tirada em pé.
    const original = await photo(1200, 800)
      .withMetadata({ orientation: 6 })
      .jpeg()
      .toBuffer();

    const result = await processImage(original);

    expect([result.width, result.height]).toEqual([800, 1200]);
  });

  it('descarta os metadados da foto', async () => {
    const original = await photo(600, 400)
      .withExif({ IFD0: { Copyright: 'dado que não deve ir para o site' } })
      .jpeg()
      .toBuffer();
    expect((await sharp(original).metadata()).exif).toBeDefined();

    const result = await processImage(original);

    expect((await sharp(result.buffer).metadata()).exif).toBeUndefined();
  });

  it('recusa arquivo que não é imagem', async () => {
    await expect(processImage(Buffer.from('isto não é foto'))).rejects.toThrow(
      UnreadableImageError,
    );
  });

  it('recusa SVG, mesmo sendo um formato que a biblioteca lê', async () => {
    const svg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>',
    );

    await expect(processImage(svg)).rejects.toThrow(UnreadableImageError);
  });
});
