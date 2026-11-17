import sharp from 'sharp';

/** Maior lado da foto guardada, em pixels. Suficiente para tela cheia e zoom. */
export const MAX_IMAGE_SIDE = 2000;
const WEBP_QUALITY = 82;

// Formatos que o sharp identifica e que aceitamos como foto. SVG fica de fora.
const ACCEPTED_FORMATS = new Set(['jpeg', 'png', 'webp', 'gif', 'heif']);

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
}

/** Lançado quando o arquivo não é uma imagem que conseguimos ler. */
export class UnreadableImageError extends Error {}

/**
 * Prepara a foto para o site: gira conforme a orientação gravada pela câmera,
 * reduz para no máximo 2000 px no maior lado, converte para WebP e descarta os
 * metadados (inclusive a localização que o celular grava na foto).
 *
 * O tipo é conferido pelo conteúdo do arquivo, não pelo nome nem pelo que o
 * navegador declarou.
 */
export async function processImage(input: Buffer): Promise<ProcessedImage> {
  try {
    const image = sharp(input, { failOn: 'error' });
    const { format } = await image.metadata();
    if (!format || !ACCEPTED_FORMATS.has(format)) {
      throw new UnreadableImageError(`formato não aceito: ${format}`);
    }

    const { data, info } = await image
      .rotate()
      .resize({
        width: MAX_IMAGE_SIDE,
        height: MAX_IMAGE_SIDE,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer({ resolveWithObject: true });

    return { buffer: data, width: info.width, height: info.height };
  } catch (error) {
    if (error instanceof UnreadableImageError) throw error;
    throw new UnreadableImageError(
      error instanceof Error ? error.message : String(error),
    );
  }
}
