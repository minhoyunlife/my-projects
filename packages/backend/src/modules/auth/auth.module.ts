import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Environment } from '@/src/common/enums/environment.enum';
import { AuthController } from '@/src/modules/auth/auth.controller';
import { AuthExceptionFilter } from '@/src/modules/auth/auth.filter';
import { AuthService } from '@/src/modules/auth/auth.service';
import { Administrator } from '@/src/modules/auth/entities/administrator.entity';
import { Totp } from '@/src/modules/auth/entities/totp.entity';
import { GithubStrategy } from '@/src/modules/auth/strategies/github.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Administrator, Totp]),
    PassportModule.register({ defaultStrategy: 'github' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('auth.jwtSecret'),
        signOptions: {
          issuer: 'MY:auth-service',
          audience: 'MY:admin-client',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ConfigService,
    GithubStrategy,
    {
      provide: APP_FILTER,
      useClass: AuthExceptionFilter,
    },
  ],
  exports: [AuthService],
})
export class AuthModule implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Administrator)
    private readonly administratorRepository: Repository<Administrator>,
  ) {}

  async onModuleInit() {
    const isDev = this.configService.get('app.env') === Environment.DEV;
    if (isDev) {
      const adminEmail = this.configService.get('auth.adminEmail');
      await this.seedAdminUser(adminEmail);
    }
  }

  private async seedAdminUser(email: string) {
    console.log('Seeding administrator user if it does not exist...');

    const existingAdmin = await this.administratorRepository.findOneBy({
      email,
    });

    if (!existingAdmin) {
      this.administratorRepository.save({ email });
      console.log('Admin account created.');
    } else {
      console.log('Admin account exists.');
    }
  }
}
