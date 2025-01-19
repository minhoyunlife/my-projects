import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { Administrator } from '@/src/modules/auth/entities/administrator.entity';
import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';
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
    @InjectRepository(ArtworkTranslation)
    private readonly artworkTranslationRepository: Repository<ArtworkTranslation>,
    @InjectRepository(GenreTranslation)
    private readonly genreTranslationRepository: Repository<GenreTranslation>,
    private readonly configService: ConfigService,
  ) {}

  async seed(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      console.error('프로덕션 환경에서 시드를 실행할 수 없습니다.');
      return;
    }

    await this.createAdministrator();
    const genres = await this.createGenres();
    if (genres.length > 0) {
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

    await this.administratorRepository.save({ email: adminEmail });
  }

  private async createGenres(): Promise<Genre[]> {
    const existingGenres = await this.genreRepository.count();
    if (existingGenres > 0) {
      console.log('Genre data already exist. Pass seeding data.');
      return this.genreRepository.find({ relations: { translations: true } });
    }

    const genres: Genre[] = [];

    for (const genreData of GENRES) {
      const genre = this.genreRepository.create();
      await this.genreRepository.save(genre);

      const translations = genreData.translations.map((translation) =>
        this.genreTranslationRepository.create({
          genreId: genre.id,
          language: translation.language as Language,
          name: translation.name,
          genre,
        }),
      );
      await this.genreTranslationRepository.save(translations);

      genre.translations = translations;
      genres.push(genre);
    }

    return genres;
  }

  private async createArtworks(genres: Genre[]): Promise<void> {
    const existingArtworks = await this.artworkRepository.count();
    if (existingArtworks > 0) {
      console.log('Artwork data already exist. Pass seeding data.');
      return;
    }

    const genreMap = new Map(
      genres.map((g) => [
        g.translations.find((t) => t.language === 'en')!.name,
        g,
      ]),
    );

    for (const seed of ARTWORKS) {
      const artwork = this.artworkRepository.create({
        imageKey: 'example-key',
        genres: seed.genres.map((name) => genreMap.get(name)!),
        playedOn: seed.playedOn,
        rating: seed.rating,
        isDraft: seed.isDraft,
        createdAt: new Date(seed.createdAt),
      });

      await this.artworkRepository.save(artwork);

      const translations = Object.entries(seed.translations).map(
        ([language, content]) =>
          this.artworkTranslationRepository.create({
            artworkId: artwork.id,
            language: language as Language,
            title: content.title,
            shortReview: content.shortReview,
            artwork,
          }),
      );

      await this.artworkTranslationRepository.save(translations);
    }
  }
}
