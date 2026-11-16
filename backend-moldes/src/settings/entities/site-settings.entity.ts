import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Configurações do site editadas no painel (contato e textos). Existe uma linha só, id = 1.
 * Guarda apenas o que foi alterado; o que não estiver aqui usa o padrão do frontend
 * (frontend-moldes/src/config/site.ts).
 */
@Entity('site_settings')
export class SiteSettings {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column({ type: 'jsonb', default: {} })
  data: Record<string, string>;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
