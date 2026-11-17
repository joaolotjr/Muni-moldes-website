import { Body, Controller, Get, Put } from '@nestjs/common';
import { Auth } from '../auth/auth.decorator';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Público: o site lê contato e textos daqui. Não há segredos nestes dados.
  @Get()
  get() {
    return this.settingsService.get();
  }

  @Auth('settings')
  @Put()
  update(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.update(dto);
  }
}
