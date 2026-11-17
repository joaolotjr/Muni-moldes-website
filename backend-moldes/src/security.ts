import { Logger } from '@nestjs/common';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const logger = new Logger('Security');

export const isProduction = () => process.env.NODE_ENV === 'production';

/**
 * Sites que podem chamar a API pelo navegador (CORS_ORIGINS, separados por vírgula).
 * `credentials` é necessário porque a sessão do painel vai em cookie.
 *
 * Em desenvolvimento, sem CORS_ORIGINS, qualquer origem é aceita (o site é aberto
 * por localhost, IP da rede etc.). Em produção a lista é obrigatória.
 */
export function corsOptions(): CorsOptions {
  const origins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

  if (origins.length === 0) {
    if (isProduction()) {
      throw new Error(
        'CORS_ORIGINS é obrigatório em produção. Ex.: CORS_ORIGINS=https://www.munimoldes.com.br',
      );
    }
    logger.warn(
      'CORS_ORIGINS não definido: a API aceita chamadas de qualquer site. Use só em desenvolvimento.',
    );
    return { origin: true, credentials: true };
  }

  logger.log(`CORS liberado para: ${origins.join(', ')}`);
  return { origin: origins, credentials: true };
}

/**
 * Quantos proxies ficam na frente da API (TRUST_PROXY). Sem isso, atrás de um
 * proxy todos os acessos parecem vir do mesmo IP e o limite de tentativas
 * bloquearia todo mundo junto. Sem proxy, deixe em branco.
 */
export function trustProxySetting(): number | boolean {
  const value = (process.env.TRUST_PROXY ?? '').trim();
  if (!value || value === 'false') return false;
  if (value === 'true') return true;
  const hops = Number(value);
  return Number.isInteger(hops) && hops > 0 ? hops : false;
}
