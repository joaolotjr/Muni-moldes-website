import { memoryStorage } from 'multer';

/** Opções do FileInterceptor para upload de imagem: em memória, até 10 MB. */
export const imageUploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
};
