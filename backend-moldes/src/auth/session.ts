import { ConfigService } from '@nestjs/config';

// Minutos sem atividade até a sessão cair. O painel encerra a sessão nesse prazo
// e renova o token enquanto a pessoa estiver usando; sem renovação, o token
// vence sozinho um minuto depois.
export function sessionIdleMinutes(config: ConfigService): number {
  const value = Number(config.get('SESSION_IDLE_MINUTES', 5));
  return Number.isFinite(value) && value >= 1 ? value : 5;
}
