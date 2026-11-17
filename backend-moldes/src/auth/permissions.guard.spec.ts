import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() };
  const guard = new PermissionsGuard(reflector as unknown as Reflector);

  const contextFor = (user: unknown) =>
    ({
      getHandler: () => undefined,
      getClass: () => undefined,
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as unknown as ExecutionContext;

  it('libera a rota que só exige login', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(contextFor({ permissions: [] }))).toBe(true);
  });

  it('libera quem tem a permissão pedida', () => {
    reflector.getAllAndOverride.mockReturnValue('news');

    expect(
      guard.canActivate(contextFor({ permissions: ['products', 'news'] })),
    ).toBe(true);
  });

  it('bloqueia quem não tem a permissão pedida', () => {
    reflector.getAllAndOverride.mockReturnValue('users');

    expect(() =>
      guard.canActivate(contextFor({ permissions: ['products'] })),
    ).toThrow(ForbiddenException);
  });
});
