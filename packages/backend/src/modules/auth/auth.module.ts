import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from '@/src/modules/auth/auth.controller';
import { AuthService } from '@/src/modules/auth/auth.service';
import { GithubStrategy } from '@/src/modules/auth/strategy/github.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'github' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          issuer: 'MY:auth-service',
          audience: 'MY:admin-client',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GithubStrategy],
  exports: [AuthService],
})
export class AuthModule {}
