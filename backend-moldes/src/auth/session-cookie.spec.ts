import type { Request } from 'express';
import { sessionTokenFromRequest } from './session-cookie';

const requestWith = (cookie?: string) =>
  ({ headers: cookie === undefined ? {} : { cookie } }) as Request;

describe('sessionTokenFromRequest', () => {
  it('lê o token do cookie de sessão, mesmo entre outros cookies', () => {
    expect(
      sessionTokenFromRequest(
        requestWith('tema=escuro; mm_session=abc.def.ghi; x=1'),
      ),
    ).toBe('abc.def.ghi');
  });

  it('não confunde com cookie de nome parecido', () => {
    expect(
      sessionTokenFromRequest(requestWith('outro_mm_session=falso')),
    ).toBeNull();
  });

  it('devolve null sem cookie, com cookie vazio ou malformado', () => {
    expect(sessionTokenFromRequest(requestWith())).toBeNull();
    expect(sessionTokenFromRequest(requestWith('mm_session='))).toBeNull();
    expect(
      sessionTokenFromRequest(requestWith('mm_session=%E0%A4%A')),
    ).toBeNull();
  });
});
