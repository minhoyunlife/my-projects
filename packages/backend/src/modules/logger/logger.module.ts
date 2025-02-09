import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { WinstonModule } from 'nest-winston';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('logger'),
    }),
  ],
})
export class AppLoggerModule {}
