import { CallHandler, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of, throwError } from 'rxjs';
import { DataSource } from 'typeorm';
import { AuditInterceptor, classify } from './audit.interceptor';
import { AuditService } from './audit.service';

const ID = '0b67499e-8c2c-4b37-a329-4f31329b8e2a';

describe('classify', () => {
  it.each([
    ['POST', '/products', { area: 'products', action: 'create' }],
    [
      'PUT',
      `/products/${ID}`,
      { area: 'products', action: 'update', targetId: ID },
    ],
    [
      'DELETE',
      `/collections/${ID}`,
      { area: 'collections', action: 'delete', targetId: ID },
    ],
    [
      'POST',
      `/products/${ID}/images`,
      { area: 'products', action: 'image_add', targetId: ID },
    ],
    [
      'DELETE',
      `/products/${ID}/images/abc`,
      { area: 'products', action: 'image_remove', targetId: ID },
    ],
    [
      'POST',
      `/news/${ID}/cover`,
      { area: 'news', action: 'image_add', targetId: ID },
    ],
    ['PUT', '/settings', { area: 'settings', action: 'update' }],
    ['PUT', '/auth/password', { area: 'auth', action: 'password_change' }],
    [
      'DELETE',
      `/users/${ID}`,
      { area: 'users', action: 'delete', targetId: ID },
    ],
  ])('%s %s', (method, path, expected) => {
    expect(classify(method, path)).toEqual(expected);
  });

  it.each([
    ['POST', '/auth/login'],
    ['POST', '/auth/refresh'],
    ['POST', '/auth/logout'],
    ['POST', '/desconhecido'],
    ['POST', '/'],
  ])('não registra %s %s', (method, path) => {
    expect(classify(method, path)).toBeNull();
  });
});

describe('AuditInterceptor', () => {
  const audit = { record: jest.fn() };
  const findOne = jest.fn();
  const dataSource = { getRepository: () => ({ findOne }) };
  const interceptor = new AuditInterceptor(
    audit as unknown as AuditService,
    dataSource as unknown as DataSource,
  );
  const user = {
    userId: 'user-1',
    name: 'Ana',
    email: 'ana@b.com',
    permissions: [],
  };

  const contextFor = (req: object) =>
    ({
      getType: () => 'http',
      switchToHttp: () => ({ getRequest: () => req }),
    }) as unknown as ExecutionContext;
  const handler = (result: unknown): CallHandler => ({
    handle: () => of(result),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    findOne.mockResolvedValue(null);
  });

  it('registra a criação com o nome devolvido pela API', async () => {
    const req = {
      method: 'POST',
      path: '/products',
      body: {},
      user,
      ip: '10.0.0.7',
    };

    await lastValueFrom(
      interceptor.intercept(
        contextFor(req),
        handler({ id: ID, name: 'Ovo liso' }),
      ),
    );

    expect(audit.record).toHaveBeenCalledWith({
      action: 'create',
      area: 'products',
      user: { id: 'user-1', name: 'Ana', email: 'ana@b.com' },
      target: 'Ovo liso',
      targetId: ID,
      ip: '10.0.0.7',
    });
  });

  it('na exclusão, guarda o nome que o item tinha antes de sumir', async () => {
    findOne.mockResolvedValue({ id: ID, name: 'Coelho sentado' });
    const req = {
      method: 'DELETE',
      path: `/products/${ID}`,
      body: {},
      user,
      ip: '::1',
    };

    await lastValueFrom(
      interceptor.intercept(contextFor(req), handler(undefined)),
    );

    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'delete',
        target: 'Coelho sentado',
        targetId: ID,
      }),
    );
  });

  it('não registra leitura, ação sem login nem ação que falhou', async () => {
    await lastValueFrom(
      interceptor.intercept(
        contextFor({ method: 'GET', path: '/products', user }),
        handler([]),
      ),
    );
    await lastValueFrom(
      interceptor.intercept(
        contextFor({ method: 'POST', path: '/products', body: {} }),
        handler({}),
      ),
    );
    await expect(
      lastValueFrom(
        interceptor.intercept(
          contextFor({ method: 'POST', path: '/products', body: {}, user }),
          { handle: () => throwError(() => new Error('falhou')) },
        ),
      ),
    ).rejects.toThrow('falhou');

    expect(audit.record).not.toHaveBeenCalled();
  });
});
