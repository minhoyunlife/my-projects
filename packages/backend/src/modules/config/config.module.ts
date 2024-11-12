import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validate } from '@/src/modules/config/environment.validator';
import appConfig from '@/src/modules/config/settings/app.config';
import databaseConfig from '@/src/modules/config/settings/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      validate: validate,
    }),
  ],
})
export class AppConfigModule {}
