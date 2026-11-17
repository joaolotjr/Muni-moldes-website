import { Test, TestingModule } from '@nestjs/testing';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

describe('SettingsController', () => {
  let controller: SettingsController;
  const service = { get: jest.fn(), update: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [{ provide: SettingsService, useValue: service }],
    }).compile();

    controller = module.get(SettingsController);
  });

  it('repassa leitura e alteração ao serviço', async () => {
    service.get.mockResolvedValue({ email: 'a@b.com' });
    service.update.mockResolvedValue({ email: 'novo@b.com' });

    await expect(controller.get()).resolves.toEqual({ email: 'a@b.com' });
    await expect(controller.update({ email: 'novo@b.com' })).resolves.toEqual({
      email: 'novo@b.com',
    });
    expect(service.update).toHaveBeenCalledWith({ email: 'novo@b.com' });
  });
});
