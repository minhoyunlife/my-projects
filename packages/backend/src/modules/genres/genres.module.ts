import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Genre } from '@/src/modules/genres/genres.entity';
import { GenresService } from '@/src/modules/genres/genres.service';

@Module({
  imports: [TypeOrmModule.forFeature([Genre])],
  providers: [GenresService],
})
export class GenresModule {}
