import { Injectable, ConflictException, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  // Cria o primeiro administrador a partir do .env quando ainda não existe nenhum usuário.
  async onApplicationBootstrap() {
    if ((await this.usersRepository.count()) > 0) return;

    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');
    if (!email || !password) {
      this.logger.warn('Nenhum usuário cadastrado. Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env para criar o primeiro administrador.');
      return;
    }

    await this.create(this.configService.get<string>('ADMIN_NAME', 'Administrador'), email, password);
    this.logger.log(`Administrador inicial criado: ${email}`);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user || undefined;
  }

  async create(name: string, email: string, password_plain: string): Promise<User> {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password_plain, saltRounds);

    const user = this.usersRepository.create({
      name,
      email,
      password_hash,
    });

    return this.usersRepository.save(user);
  }
}
