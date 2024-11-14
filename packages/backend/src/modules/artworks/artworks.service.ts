import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { Artwork } from '@/src/modules/artworks/artworks.entity';
import { ArtworksRepository } from '@/src/modules/artworks/artworks.repository';
import { CreateArtworkDto } from '@/src/modules/artworks/dtos/create-artwork.dto';
import { GenresRepository } from '@/src/modules/genres/genres.repository';

@Injectable()
export class ArtworksService {
  constructor(
    private readonly artworksRepository: ArtworksRepository,
    private readonly genresRepository: GenresRepository,
    private entityManager: EntityManager,
  ) {}

  /**
   * 새로운 작품을 생성
   * @param dto 새로운 작품을 생성하기 위한 정보를 포함하는 DTO
   * @returns 생성된 작품
   */
  async createArtwork(dto: CreateArtworkDto): Promise<Artwork> {
    return this.entityManager.transaction(async (manager) => {
      const artworksTxRepo = this.artworksRepository.forTransaction(manager);
      const genresTxRepo = this.genresRepository.forTransaction(manager);

      const genres = await genresTxRepo.bulkCreateIfNotExist(dto.genres);
      const artwork = await artworksTxRepo.createOne({
        title: dto.title,
        imageKey: dto.imageKey,
        createdAt: new Date(dto.createdAt),
        playedOn: dto.playedOn,
        genres: genres,
        rating: dto.rating,
        shortReview: dto.shortReview,
        isDraft: true, // 작품 생성 시에는 무조건 초안 상태
      });

      return artwork;
    });
  }
}
