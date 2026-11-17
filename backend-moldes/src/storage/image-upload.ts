import { memoryStorage } from 'multer';

export const MAX_UPLOAD_MB = 25;

/**
 * Opções do FileInterceptor para upload de imagem: em memória, até 25 MB.
 * O limite é folgado porque a foto original de celular é grande; o que fica
 * guardado é a versão compactada (ver image-processing.ts).
 */
export const imageUploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024 },
};
