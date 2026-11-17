/** Tipos de arquivo que o painel aceita como foto. */
export const ACCEPTED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

/** Tamanho máximo do arquivo original escolhido (foto de celular costuma ter de 5 a 15 MB). */
export const MAX_ORIGINAL_MB = 40;
/** Limite do servidor para o que é efetivamente enviado. Igual a MAX_UPLOAD_MB no backend. */
export const MAX_UPLOAD_MB = 25;

// O servidor guarda no máximo 2000 px; mandar um pouco mais preserva a nitidez da redução final.
const MAX_SIDE = 2400;
const JPEG_QUALITY = 0.88;
// Abaixo disso o envio já é rápido e não compensa recomprimir.
const SKIP_BELOW_BYTES = 1024 * 1024;

/**
 * Reduz a foto no navegador antes do envio, para o upload ser rápido mesmo em
 * rede de celular. A versão final (WebP, sem metadados) é gerada pelo servidor.
 *
 * Se o navegador não conseguir ler a imagem, ou se a redução não diminuir o
 * arquivo, devolve o original e o servidor cuida de tudo.
 */
export async function shrinkImage(file: File): Promise<File> {
  // GIF pode ser animado e o canvas guardaria só o primeiro quadro.
  if (file.type === 'image/gif' || file.size < SKIP_BELOW_BYTES) return file;

  try {
    // 'from-image' aplica a rotação gravada pela câmera.
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    try {
      const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
      const width = Math.round(bitmap.width * scale);
      const height = Math.round(bitmap.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) return file;
      // JPEG não tem transparência: sem o fundo branco, áreas transparentes sairiam pretas.
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      context.imageSmoothingQuality = 'high';
      context.drawImage(bitmap, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
      );
      if (!blob || blob.size >= file.size) return file;

      const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
      return new File([blob], name, { type: 'image/jpeg', lastModified: file.lastModified });
    } finally {
      bitmap.close();
    }
  } catch {
    return file;
  }
}

/** Motivo para recusar o arquivo escolhido, ou null se ele pode entrar na fila. */
export function imageRejection(file: File): string | null {
  if (!ACCEPTED_IMAGES.includes(file.type)) {
    return `"${file.name}" não é uma imagem JPG, PNG, WebP, GIF ou AVIF.`;
  }
  if (file.size > MAX_ORIGINAL_MB * 1024 * 1024) {
    return `"${file.name}" passa de ${MAX_ORIGINAL_MB} MB.`;
  }
  return null;
}

/** Reduz a foto e monta o corpo do envio. Lança erro se ainda ficar grande demais. */
export async function imageFormData(file: File): Promise<FormData> {
  const prepared = await shrinkImage(file);
  if (prepared.size > MAX_UPLOAD_MB * 1024 * 1024) {
    throw new Error(`"${file.name}" ficou com mais de ${MAX_UPLOAD_MB} MB mesmo depois de reduzida.`);
  }
  const body = new FormData();
  body.append('file', prepared);
  return body;
}
