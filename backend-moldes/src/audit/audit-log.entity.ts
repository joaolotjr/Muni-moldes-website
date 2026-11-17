import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** Registro de uma ação feita no painel: quem, o quê, em que item e quando. */
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  // Nome e e-mail ficam copiados aqui: o registro continua legível mesmo que o
  // usuário seja renomeado ou excluído depois.
  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  user_name: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  user_email: string | null;

  /** create, update, delete, image_add, image_remove, login, login_failed, logout, password_change */
  @Column({ type: 'varchar', length: 40 })
  action: string;

  /** products, collections, news, settings, users, auth */
  @Column({ type: 'varchar', length: 40 })
  area: string;

  /** Nome ou título do item afetado, como estava na hora. */
  @Column({ type: 'varchar', length: 255, nullable: true })
  target: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  target_id: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ip: string | null;
}
