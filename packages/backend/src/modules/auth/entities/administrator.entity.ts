import { IsEmail } from 'class-validator';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Administrator {
  @PrimaryColumn()
  @IsEmail()
  email: string;

  @Column({ default: false })
  isTotpEnabled: boolean;
}
