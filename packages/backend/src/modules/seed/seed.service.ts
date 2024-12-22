import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Artwork } from '@/src/modules/artworks/artworks.entity';
import { Administrator } from '@/src/modules/auth/entities/administrator.entity';
import { Genre } from '@/src/modules/genres/genres.entity';
import { ARTWORKS } from '@/src/modules/seed/data/artworks';
import { GENRES } from '@/src/modules/seed/data/genres';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Administrator)
    private readonly administratorRepository: Repository<Administrator>,
    @InjectRepository(Artwork)
    private readonly artworkRepository: Repository<Artwork>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    private readonly configService: ConfigService,
  ) {}

  async seed(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      console.error('프로덕션 환경에서 시드를 실행할 수 없습니다.');
      return;
    }

    await this.createAdministrator();
    const genres = await this.createGenres();
    if (genres) {
      await this.createArtworks(genres);
    }
  }

  private async createAdministrator(): Promise<void> {
    const adminEmail = this.configService.get('auth.adminEmail');
    if (!adminEmail) {
      throw new Error('관리자 이메일이 설정되지 않았습니다.');
    }

    const existingAdmin = await this.administratorRepository.findOneBy({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log('Administrator data already exist. Pass seeding data.');
      return;
    }

    await this.administratorRepository.delete({});

    await this.administratorRepository.save({ email: adminEmail });
  }

  private async createGenres(): Promise<Genre[]> {
    const existingGenres = await this.genreRepository.count();
    if (existingGenres > 0) {
      console.log('Genre data already exist. Pass seeding data.');
      return;
    }

    await this.genreRepository.delete({});

    return await this.genreRepository.save(
      GENRES.map((genre) => this.genreRepository.create(genre)),
    );
  }

  private async createArtworks(genres: Genre[]): Promise<void> {
    const existingArtworks = await this.artworkRepository.count();
    if (existingArtworks > 0) {
      console.log('Artwork data already exist. Pass seeding data.');
      return;
    }

    await this.artworkRepository.delete({});

    const genreMap = new Map(genres.map((g) => [g.name, g]));

    const artworksData = ARTWORKS.map((seed) => ({
      title: seed.title,
      imageKey: 'example-key',
      imageUrl: `http://example.com/images/${encodeURIComponent(seed.title)}.png`,
      genres: seed.genres.map((name) => genreMap.get(name)!),
      playedOn: seed.playedOn,
      rating: seed.rating,
      shortReview: seed.shortReview,
      isDraft: seed.isDraft,
      createdAt: new Date(seed.createdAt),
    }));

    for (const data of artworksData) {
      await this.artworkRepository.save(this.artworkRepository.create(data));
    }
  }
}
