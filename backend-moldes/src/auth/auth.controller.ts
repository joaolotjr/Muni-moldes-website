import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Auth, CurrentUser } from './auth.decorator';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import type { AuthUser } from './permissions';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.authService.login(user);
  }

  // Renova a sessão de quem está ativo no painel.
  @Auth()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@CurrentUser() user: AuthUser) {
    return this.authService.refresh(user);
  }

  @Auth()
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return {
      id: user.userId,
      name: user.name,
      email: user.email,
      permissions: user.permissions,
    };
  }

  // Troca da própria senha, para qualquer usuário logado.
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('password')
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.usersService.changeOwnPassword(
      user.userId,
      dto.current_password,
      dto.new_password,
    );
  }
}
