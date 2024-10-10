import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Artwork } from './artworks.entity';

@Injectable()
export class ArtworksService {
  constructor(
    @InjectRepository(Artwork)
    private artworksRepository: Repository<Artwork>,
  ) {}

  // TODO
  getArtworks(): Promise<Artwork[]> {
    return this.artworksRepository.find();
  }
}
