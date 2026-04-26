import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: Record<string, string>) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  // MVP ONLY: Endpoint to register the initial admin
  @Post('register')
  async register(@Body() body: Record<string, string>) {
    // In a real scenario, protect this or remove after first run
    const user = await this.usersService.create(body.name, body.email, body.password);
    return {
      message: 'User created successfully',
      userId: user.id,
    };
  }
}
