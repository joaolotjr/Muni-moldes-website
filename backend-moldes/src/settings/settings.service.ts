import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SiteSettings } from './entities/site-settings.entity';

const SETTINGS_ID = 1;

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SiteSettings)
    private settingsRepository: Repository<SiteSettings>,
  ) {}

  /** O que foi alterado no painel. Objeto vazio enquanto ninguém salvou nada. */
  async get(): Promise<Record<string, string>> {
    const row = await this.settingsRepository.findOne({
      where: { id: SETTINGS_ID },
    });
    return row?.data ?? {};
  }

  /** Grava só os campos enviados; os demais continuam como estavam. */
  async update(dto: UpdateSettingsDto): Promise<Record<string, string>> {
    const current = await this.get();
    const changes: Record<string, string> = {};
    for (const [key, value] of Object.entries(dto)) {
      if (typeof value === 'string') changes[key] = value;
    }
    const data = { ...current, ...changes };
    await this.settingsRepository.save({ id: SETTINGS_ID, data });
    return data;
  }
}
