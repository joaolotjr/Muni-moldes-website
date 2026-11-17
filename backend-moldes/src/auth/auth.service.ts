import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthUser, Permission } from './permissions';
import { sessionIdleMinutes } from './session';

interface SessionUser {
  id: string;
  name: string;
  email: string;
  permissions: Permission[];
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Devolve o usuário quando e-mail e senha conferem e a conta está ativa.
  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (
      user &&
      user.is_active &&
      (await bcrypt.compare(pass, user.password_hash))
    ) {
      return user;
    }
    return null;
  }

  login(user: SessionUser) {
    return this.session(user);
  }

  // Emite um token novo para quem continua usando o painel.
  refresh(user: AuthUser) {
    return this.session({ ...user, id: user.userId });
  }

  private session(user: SessionUser) {
    return {
      access_token: this.jwtService.sign({ sub: user.id }),
      idle_minutes: sessionIdleMinutes(this.configService),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        permissions: user.permissions,
      },
    };
  }
}
