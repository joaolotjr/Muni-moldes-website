import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { PERMISSIONS } from '../auth/permissions';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { User } from './entities/user.entity';

const SALT_ROUNDS = 10;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export type PublicUser = Omit<User, 'password_hash'>;

export function toPublicUser(user: User): PublicUser {
  const publicUser: Partial<User> = { ...user };
  delete publicUser.password_hash;
  return publicUser as PublicUser;
}

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedFirstAdmin();
    await this.ensureSomeoneManagesUsers();
  }

  // Cria o primeiro administrador a partir do .env quando ainda não existe nenhum usuário.
  private async seedFirstAdmin() {
    if ((await this.usersRepository.count()) > 0) return;

    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');
    if (!email || !password) {
      this.logger.warn(
        'Nenhum usuário cadastrado. Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env para criar o primeiro administrador.',
      );
      return;
    }

    await this.create({
      name: this.configService.get<string>('ADMIN_NAME', 'Administrador'),
      email,
      password,
      permissions: [...PERMISSIONS],
    });
    this.logger.log(`Administrador inicial criado: ${email}`);
  }

  // Contas criadas antes de existirem permissões entravam em tudo. Se ninguém
  // ativo consegue administrar usuários, essas contas recebem acesso completo,
  // para o painel não ficar trancado.
  private async ensureSomeoneManagesUsers() {
    const users = await this.usersRepository.find();
    if (users.length === 0) return;
    if (users.some((u) => u.is_active && u.permissions.includes('users')))
      return;

    const legacy = users.filter((u) => u.permissions.length === 0);
    const target = legacy.length > 0 ? legacy : users;
    for (const user of target) {
      user.permissions = [...PERMISSIONS];
      user.is_active = true;
    }
    await this.usersRepository.save(target);
    this.logger.warn(
      `Nenhum usuário ativo administrava usuários. Acesso completo concedido a: ${target
        .map((u) => u.email)
        .join(', ')}`,
    );
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({
      where: { email: normalizeEmail(email) },
    });
    return user || undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return user || undefined;
  }

  async findAll(): Promise<PublicUser[]> {
    const users = await this.usersRepository.find({ order: { name: 'ASC' } });
    return users.map(toPublicUser);
  }

  async findOnePublic(id: string): Promise<PublicUser> {
    return toPublicUser(await this.getOrFail(id));
  }

  async create(dto: CreateUserDto): Promise<PublicUser> {
    const email = normalizeEmail(dto.email);
    if (await this.findByEmail(email)) {
      throw new ConflictException('Já existe um usuário com este e-mail.');
    }

    const user = this.usersRepository.create({
      name: dto.name.trim(),
      email,
      password_hash: await bcrypt.hash(dto.password, SALT_ROUNDS),
      permissions: dto.permissions,
      is_active: dto.is_active ?? true,
    });
    return toPublicUser(await this.usersRepository.save(user));
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    actorId: string,
  ): Promise<PublicUser> {
    const user = await this.getOrFail(id);

    // Ninguém tira o próprio acesso: assim sempre sobra alguém que administra usuários.
    if (id === actorId) {
      if (dto.is_active === false) {
        throw new BadRequestException(
          'Você não pode desativar a própria conta.',
        );
      }
      if (dto.permissions && !dto.permissions.includes('users')) {
        throw new BadRequestException(
          'Você não pode remover a própria permissão de administrar usuários.',
        );
      }
    }

    const email = dto.email ? normalizeEmail(dto.email) : user.email;
    if (email !== user.email) {
      if (await this.findByEmail(email)) {
        throw new ConflictException('Já existe um usuário com este e-mail.');
      }
      user.email = email;
    }
    if (dto.name !== undefined) user.name = dto.name.trim();
    if (dto.permissions !== undefined) user.permissions = dto.permissions;
    if (dto.is_active !== undefined) user.is_active = dto.is_active;
    if (dto.password) {
      user.password_hash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }

    return toPublicUser(await this.usersRepository.save(user));
  }

  async remove(id: string, actorId: string): Promise<void> {
    if (id === actorId) {
      throw new BadRequestException('Você não pode excluir a própria conta.');
    }
    const user = await this.getOrFail(id);
    await this.usersRepository.remove(user);
  }

  async changeOwnPassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.getOrFail(id);
    if (!(await bcrypt.compare(currentPassword, user.password_hash))) {
      throw new BadRequestException('A senha atual não confere.');
    }
    user.password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await this.usersRepository.save(user);
  }

  private async getOrFail(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }
}
