import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/src/modules/auth/auth.module';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { GenresController } from '@/src/modules/genres/genres.controller';
import { GenresMapper } from '@/src/modules/genres/genres.mapper';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { GenresService } from '@/src/modules/genres/genres.service';
import { GenresValidator } from '@/src/modules/genres/genres.validator';

@Module({
  imports: [TypeOrmModule.forFeature([Genre]), AuthModule],
  controllers: [GenresController],
  providers: [GenresService, GenresMapper, GenresValidator, GenresRepository],
})
export class GenresModule {}
