import { Test, TestingModule } from '@nestjs/testing';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';

describe('CollectionsController', () => {
  let controller: CollectionsController;
  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionsController],
      providers: [{ provide: CollectionsService, useValue: service }],
    }).compile();

    controller = module.get(CollectionsController);
  });

  it('findAll só aplica o filtro público com ?public=true', () => {
    void controller.findAll('true');
    void controller.findAll();
    void controller.findAll('1');

    expect(service.findAll.mock.calls).toEqual([[true], [false], [false]]);
  });

  it('repassa as demais operações ao serviço', () => {
    void controller.findOne('col-1');
    void controller.create({ name: 'Páscoa' });
    void controller.update('col-1', { name: 'Natal' });
    void controller.remove('col-1');

    expect(service.findOne).toHaveBeenCalledWith('col-1');
    expect(service.create).toHaveBeenCalledWith({ name: 'Páscoa' });
    expect(service.update).toHaveBeenCalledWith('col-1', { name: 'Natal' });
    expect(service.remove).toHaveBeenCalledWith('col-1');
  });
});
