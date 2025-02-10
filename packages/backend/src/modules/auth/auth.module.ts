import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Repository } from 'typeorm';
import { Logger } from 'winston';

import { Environment } from '@/src/common/enums/environment.enum';
import { AuthController } from '@/src/modules/auth/auth.controller';
import { AuthExceptionFilter } from '@/src/modules/auth/auth.filter';
import { AuthService } from '@/src/modules/auth/auth.service';
import { Administrator } from '@/src/modules/auth/entities/administrator.entity';
import { Totp } from '@/src/modules/auth/entities/totp.entity';
import { OptionalBearerAuthGuard } from '@/src/modules/auth/guards/token.auth.guard';
import { GithubStrategy } from '@/src/modules/auth/strategies/github.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Administrator, Totp]),
    PassportModule.register({ defaultStrategy: 'github' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
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
    OptionalBearerAuthGuard,
    {
      provide: APP_FILTER,
      useClass: AuthExceptionFilter,
    },
  ],
  exports: [JwtModule, AuthService, OptionalBearerAuthGuard],
})
export class AuthModule implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Administrator)
    private readonly administratorRepository: Repository<Administrator>,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async onModuleInit() {
    const isDev = this.configService.get('app.env') === Environment.DEV;
    if (isDev) {
      const adminEmail = this.configService.get('auth.adminEmail');
      await this.seedAdminUser(adminEmail);
    }
  }

  private async seedAdminUser(email: string) {
    this.logger.info('Checking administrator account', {
      context: 'AuthModule',
      metadata: { email },
    });

    const existingAdmin = await this.administratorRepository.findOneBy({
      email,
    });

    if (!existingAdmin) {
      this.administratorRepository.save({ email });
      this.logger.info('Administrator account created', {
        context: 'AuthModule',
        metadata: { email },
      });
    } else {
      this.logger.info('Administrator account already exists', {
        context: 'AuthModule',
        metadata: { email },
      });
    }
  }
}
