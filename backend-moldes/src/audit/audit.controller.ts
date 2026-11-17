import { Controller, Get, Query } from '@nestjs/common';
import { Auth } from '../auth/auth.decorator';
import { AuditService } from './audit.service';

@Auth('users')
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  findRecent(@Query('limit') limit?: string, @Query('area') area?: string) {
    const parsed = Number(limit);
    return this.audit.findRecent(
      Number.isFinite(parsed) && parsed > 0 ? parsed : 200,
      area || undefined,
    );
  }
}
