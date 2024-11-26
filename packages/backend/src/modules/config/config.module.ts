import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validate } from '@/src/modules/config/environment.validator';
import appConfig from '@/src/modules/config/settings/app.config';
import authConfig from '@/src/modules/config/settings/auth.config';
import databaseConfig from '@/src/modules/config/settings/database.config';
import s3Config from '@/src/modules/config/settings/s3.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, authConfig, s3Config],
      validate: validate,
    }),
  ],
})
export class AppConfigModule {}
