import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
} from '../collections/dto/save-collection.dto';
import {
  CreateProductDto,
  UpdateProductDto,
} from '../products/dto/save-product.dto';

// Mesmas opções do ValidationPipe global (main.ts).
const check = async <T extends object>(dto: new () => T, body: object) => {
  const instance = plainToInstance(dto, body);
  const errors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  return { instance, fields: errors.map((error) => error.property).sort() };
};

const product = { name: 'Ovo liso 250 g', slug: 'ovo-liso-250-g' };

describe('CreateProductDto', () => {
  it('aceita o que o painel envia', async () => {
    const { fields } = await check(CreateProductDto, {
      ...product,
      description: 'Molde de silicone.',
      dimensions: '14 x 10 cm',
      final_weight: '250 g',
      collection_id: '0b67499e-8c2c-4b37-a329-4f31329b8e2a',
      is_active: true,
      active_from: '2026-12-01T03:00:00.000Z',
      active_until: null,
    });

    expect(fields).toEqual([]);
  });

  it('tira espaços das pontas e transforma texto em branco em null', async () => {
    const { instance, fields } = await check(CreateProductDto, {
      name: '  Ovo liso  ',
      slug: ' ovo-liso ',
      description: '   ',
      dimensions: ' 14 x 10 cm ',
    });

    expect(fields).toEqual([]);
    expect(instance).toMatchObject({
      name: 'Ovo liso',
      slug: 'ovo-liso',
      description: null,
      dimensions: '14 x 10 cm',
    });
  });

  it('recusa campo que não faz parte do cadastro', async () => {
    const { fields } = await check(CreateProductDto, {
      ...product,
      id: '0b67499e-8c2c-4b37-a329-4f31329b8e2a',
      created_at: '2020-01-01T00:00:00Z',
      images: [],
    });

    expect(fields).toEqual(['created_at', 'id', 'images']);
  });

  it('exige nome e endereço', async () => {
    expect((await check(CreateProductDto, {})).fields).toEqual([
      'name',
      'slug',
    ]);
    expect(
      (await check(CreateProductDto, { name: '   ', slug: 'ok' })).fields,
    ).toEqual(['name']);
  });

  it.each([
    'Ovo Liso',
    'ovo liso',
    'ovo_liso',
    'ação',
    '-ovo',
    'ovo-',
    'ovo--liso',
    '../admin',
  ])('recusa o endereço "%s"', async (slug) => {
    expect(
      (await check(CreateProductDto, { ...product, slug })).fields,
    ).toEqual(['slug']);
  });

  it('recusa tipos errados e tamanhos acima do limite', async () => {
    const { fields } = await check(CreateProductDto, {
      name: 'x'.repeat(201),
      slug: 'ovo',
      description: 'x'.repeat(5001),
      dimensions: 123,
      final_weight: 'x'.repeat(51),
      collection_id: 'não-é-uuid',
      is_active: 'sim',
      active_from: 'amanhã',
    });

    expect(fields).toEqual([
      'active_from',
      'collection_id',
      'description',
      'dimensions',
      'final_weight',
      'is_active',
      'name',
    ]);
  });
});

describe('UpdateProductDto', () => {
  it('aceita alteração de um campo só', async () => {
    expect(
      (await check(UpdateProductDto, { is_active: false })).fields,
    ).toEqual([]);
  });

  it('continua validando o que vier e recusando campos estranhos', async () => {
    const { fields } = await check(UpdateProductDto, {
      slug: 'Com Espaço',
      id: 'outro',
    });

    expect(fields).toEqual(['id', 'slug']);
  });
});

describe('CreateCollectionDto e UpdateCollectionDto', () => {
  it('aceita o que o painel envia', async () => {
    const { fields } = await check(CreateCollectionDto, {
      name: 'Páscoa',
      slug: 'pascoa',
      is_active: true,
      active_from: null,
      active_until: null,
    });

    expect(fields).toEqual([]);
  });

  it('recusa nome longo, endereço inválido e campo estranho', async () => {
    const { fields } = await check(CreateCollectionDto, {
      name: 'x'.repeat(101),
      slug: 'Páscoa 2027',
      products: [],
    });

    expect(fields).toEqual(['name', 'products', 'slug']);
  });

  it('na alteração, tudo é opcional', async () => {
    expect(
      (await check(UpdateCollectionDto, { name: 'Natal' })).fields,
    ).toEqual([]);
  });
});
