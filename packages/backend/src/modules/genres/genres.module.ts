import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/src/modules/auth/auth.module';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { GenresController } from '@/src/modules/genres/genres.controller';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { GenresService } from '@/src/modules/genres/genres.service';

@Module({
  imports: [TypeOrmModule.forFeature([Genre]), AuthModule],
  controllers: [GenresController],
  providers: [GenresService, GenresRepository],
})
export class GenresModule {}
