import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Repository } from 'typeorm';
import { Logger } from 'winston';

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
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async seed(): Promise<void> {
    const environment = this.configService.get('app.env');
    if (environment === 'production') {
      this.logger.error('Seed execution blocked in production', {
        context: 'SeedService',
        metadata: { environment },
      });
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
      this.logger.error('Admin email not configured', {
        context: 'SeedService',
      });
      throw new Error('관리자 이메일이 설정되지 않았습니다.');
    }

    const existingAdmin = await this.administratorRepository.findOneBy({
      email: adminEmail,
    });

    if (existingAdmin) {
      this.logger.info('Administrator already exists', {
        context: 'SeedService',
        metadata: { email: adminEmail },
      });
      return;
    }

    await this.administratorRepository.save({ email: adminEmail });
    this.logger.info('Administrator created', {
      context: 'SeedService',
      metadata: { email: adminEmail },
    });
  }

  private async createGenres(): Promise<Genre[]> {
    const existingGenres = await this.genreRepository.count();
    if (existingGenres > 0) {
      this.logger.info('Genres already exist', {
        context: 'SeedService',
        metadata: { count: existingGenres },
      });
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
      this.logger.info('Artworks already exist', {
        context: 'SeedService',
        metadata: { count: existingArtworks },
      });
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
        imageKey: seed.imageKey || 'example-key',
        isVertical: seed.isVertical || false,
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
