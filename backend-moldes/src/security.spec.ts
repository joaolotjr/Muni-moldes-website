import { Logger } from '@nestjs/common';
import { corsOptions, trustProxySetting } from './security';
import { isVisibleNow } from './visibility';

describe('corsOptions', () => {
  const original = { ...process.env };
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });
  afterEach(() => {
    process.env = { ...original };
    jest.restoreAllMocks();
  });

  it('restringe às origens de CORS_ORIGINS, sempre com credenciais', () => {
    process.env.CORS_ORIGINS =
      'https://www.munimoldes.com.br/, https://munimoldes.com.br';

    expect(corsOptions()).toEqual({
      origin: ['https://www.munimoldes.com.br', 'https://munimoldes.com.br'],
      credentials: true,
    });
  });

  it('em desenvolvimento, sem a lista, aceita qualquer origem', () => {
    delete process.env.CORS_ORIGINS;
    process.env.NODE_ENV = 'development';

    expect(corsOptions()).toEqual({ origin: true, credentials: true });
  });

  it('em produção, sem a lista, a API não sobe', () => {
    delete process.env.CORS_ORIGINS;
    process.env.NODE_ENV = 'production';

    expect(() => corsOptions()).toThrow(/CORS_ORIGINS/);
  });
});

describe('trustProxySetting', () => {
  const original = process.env.TRUST_PROXY;
  afterEach(() => {
    process.env.TRUST_PROXY = original;
  });

  it.each([
    [undefined, false],
    ['', false],
    ['false', false],
    ['true', true],
    ['1', 1],
    ['2', 2],
    ['abc', false],
  ])('TRUST_PROXY=%s -> %s', (value, expected) => {
    if (value === undefined) delete process.env.TRUST_PROXY;
    else process.env.TRUST_PROXY = value;

    expect(trustProxySetting()).toBe(expected);
  });
});

describe('isVisibleNow', () => {
  const now = new Date('2026-06-15T12:00:00Z');

  it('mostra o item ativo e sem agendamento', () => {
    expect(isVisibleNow({ is_active: true }, now)).toBe(true);
  });

  it('esconde o item inativo', () => {
    expect(isVisibleNow({ is_active: false }, now)).toBe(false);
  });

  it('respeita o início e o fim do agendamento', () => {
    const future = new Date('2026-07-01T00:00:00Z');
    const past = new Date('2026-06-01T00:00:00Z');

    expect(isVisibleNow({ is_active: true, active_from: future }, now)).toBe(
      false,
    );
    expect(isVisibleNow({ is_active: true, active_until: past }, now)).toBe(
      false,
    );
    expect(
      isVisibleNow(
        { is_active: true, active_from: past, active_until: future },
        now,
      ),
    ).toBe(true);
  });
});
