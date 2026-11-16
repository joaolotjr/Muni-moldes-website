import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/** Campo de texto opcional com limite de tamanho. Vazio é aceito (esconde a informação no site). */
function Text(max: number) {
  return function (target: object, propertyKey: string) {
    IsOptional()(target, propertyKey);
    Transform(trim)(target, propertyKey);
    IsString()(target, propertyKey);
    MaxLength(max, {
      message: `Use até ${max} caracteres em "${propertyKey}"`,
    })(target, propertyKey);
  };
}

/**
 * Tudo o que o painel pode alterar. As chaves são as mesmas de SiteSettings no frontend
 * (frontend-moldes/src/config/site.ts); ao criar um campo novo, inclua nos dois lugares.
 */
export class UpdateSettingsDto {
  // ---- Contato
  @IsOptional()
  @Transform(trim)
  @Matches(/^\d{10,15}$/, {
    message:
      'O WhatsApp deve ter só números, com código do país e DDD (ex.: 5511999999999)',
  })
  whatsappNumber?: string;

  @Text(30)
  phoneDisplay?: string;

  @IsOptional()
  @Transform(trim)
  @ValidateIf((_, value) => value !== '')
  @IsEmail({}, { message: 'E-mail inválido' })
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @Transform(trim)
  @ValidateIf((_, value) => value !== '')
  @Matches(/^@?[A-Za-z0-9._]{1,30}$/, {
    message: 'Instagram inválido. Use só o nome do perfil, ex.: @munimoldes',
  })
  instagramHandle?: string;

  @Text(120)
  businessHours?: string;

  @Text(300)
  address?: string;

  // ---- Página inicial
  @Text(80)
  heroBadge?: string;

  @Text(120)
  heroTitle?: string;

  @Text(80)
  heroHighlight?: string;

  @Text(400)
  heroText?: string;

  @Text(1000)
  homeStoryText?: string;

  // ---- Quem somos
  @Text(160)
  aboutTitle?: string;

  @Text(400)
  aboutIntro?: string;

  @Text(120)
  aboutStoryTitle?: string;

  @Text(5000)
  aboutStory?: string;

  // ---- Rodapé
  @Text(400)
  footerText?: string;
}
