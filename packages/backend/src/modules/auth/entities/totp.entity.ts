import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

import { Administrator } from '@/src/modules/auth/entities/administrator.entity';

@Entity()
export class Totp {
  @PrimaryColumn()
  adminEmail: string;

  @Column('varchar')
  encryptedSecret: string;

  @Column('varchar', { array: true, default: [] })
  backupCodes: string[];

  @Column('smallint', { default: 0 })
  failedAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lastFailedAttempt: Date;

  @OneToOne(() => Administrator, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  administrator: Administrator;
}
