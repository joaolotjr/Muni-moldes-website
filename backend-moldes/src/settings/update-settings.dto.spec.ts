import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const errorsFor = async (payload: Record<string, unknown>) => {
  const dto = plainToInstance(UpdateSettingsDto, payload);
  const errors = await validate(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  return errors.map((error) => error.property);
};

describe('UpdateSettingsDto', () => {
  it('aceita um conjunto válido e tira espaços das pontas', async () => {
    const payload = {
      whatsappNumber: ' 5511988887777 ',
      phoneDisplay: '(11) 98888-7777',
      email: 'contato@munimoldes.com.br',
      instagramHandle: '@muni.moldes',
      address: 'Rua A, 1\nCentro',
      aboutStory: 'Primeiro parágrafo.\n\nSegundo parágrafo.',
    };

    await expect(errorsFor(payload)).resolves.toEqual([]);
    expect(plainToInstance(UpdateSettingsDto, payload).whatsappNumber).toBe(
      '5511988887777',
    );
  });

  it('aceita e-mail, Instagram e endereço vazios', async () => {
    await expect(
      errorsFor({ email: '', instagramHandle: '', address: '' }),
    ).resolves.toEqual([]);
  });

  it.each(['11 99999-9999', '+5511999999999', '123', ''])(
    'recusa o WhatsApp "%s"',
    async (whatsappNumber) => {
      await expect(errorsFor({ whatsappNumber })).resolves.toEqual([
        'whatsappNumber',
      ]);
    },
  );

  it('recusa e-mail e Instagram inválidos', async () => {
    await expect(
      errorsFor({
        email: 'nao-e-email',
        instagramHandle: 'https://instagram.com/x',
      }),
    ).resolves.toEqual(['email', 'instagramHandle']);
  });

  it('recusa texto acima do limite', async () => {
    await expect(
      errorsFor({ businessHours: 'x'.repeat(121) }),
    ).resolves.toEqual(['businessHours']);
  });

  it('recusa campo desconhecido', async () => {
    await expect(errorsFor({ adminPassword: 'x' })).resolves.toEqual([
      'adminPassword',
    ]);
  });
});
