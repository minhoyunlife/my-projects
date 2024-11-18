import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

import { decrypt, encrypt } from '@/src/common/utils/encryption.util';
import { Administrator } from '@/src/modules/auth/entities/administrator.entity';

@Entity()
export class Totp {
  @PrimaryColumn()
  adminEmail: string;

  @Column({
    type: 'varchar',
    transformer: {
      to: (value: string) => encrypt(value, process.env.DB_ENCRYPTION_KEY),
      from: (value: string) => decrypt(value, process.env.DB_ENCRYPTION_KEY),
    },
  })
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
