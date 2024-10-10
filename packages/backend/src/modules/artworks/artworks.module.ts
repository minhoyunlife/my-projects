import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArtworksController } from './artworks.controller';
import { Artwork } from './artworks.entity';
import { ArtworksService } from './artworks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Artwork])],
  controllers: [ArtworksController],
  providers: [ArtworksService],
})
export class ArtworksModule {}
