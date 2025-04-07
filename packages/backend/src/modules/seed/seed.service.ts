import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Repository } from 'typeorm';
import { Logger } from 'winston';

import { Language } from '@/src/common/enums/language.enum';
import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { Administrator } from '@/src/modules/auth/entities/administrator.entity';
import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { ARTWORKS } from '@/src/modules/seed/data/artworks';
import { GENRES } from '@/src/modules/seed/data/genres';
import { SERIES } from '@/src/modules/seed/data/series';
import { SeriesArtwork } from '@/src/modules/series/entities/series-artworks.entity';
import { SeriesTranslation } from '@/src/modules/series/entities/series-translations.entity';
import { Series } from '@/src/modules/series/entities/series.entity';

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
    @InjectRepository(Series)
    private readonly seriesRepository: Repository<Series>,
    @InjectRepository(SeriesTranslation)
    private readonly seriesTranslationRepository: Repository<SeriesTranslation>,
    @InjectRepository(SeriesArtwork)
    private readonly seriesArtworkRepository: Repository<SeriesArtwork>,
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
      const artworks = await this.createArtworks(genres);
      await this.createSeries(artworks);
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

  private async createSeries(artworks: Artwork[] = []): Promise<void> {
    const existingSeries = await this.seriesRepository.count();
    if (existingSeries > 0) {
      this.logger.info('Series already exist', {
        context: 'SeedService',
        metadata: { count: existingSeries },
      });
      return;
    }

    const seriesArtworkMap = {
      0: ['파이널 판타지 7 리버스', '파이널 판타지 16'],
      1: ['젤다의 전설: 티어스 오브 더 킹덤'],
      2: [],
      3: ['포켓몬 스칼렛'],
      4: ['슈퍼 마리오 원더'],
    };

    const createdSeries: Series[] = [];

    for (let i = 0; i < SERIES.length; i++) {
      const seriesData = SERIES[i];
      const series = this.seriesRepository.create();
      await this.seriesRepository.save(series);

      const translations = seriesData.translations.map((translation) =>
        this.seriesTranslationRepository.create({
          seriesId: series.id,
          language: translation.language as Language,
          title: translation.title,
          series,
        }),
      );
      await this.seriesTranslationRepository.save(translations);

      createdSeries.push(series);
    }

    if (artworks.length > 0) {
      for (let i = 0; i < createdSeries.length; i++) {
        const series = createdSeries[i];
        const artworkTitles = seriesArtworkMap[i] || [];

        const seriesArtworks = [];
        for (const artwork of artworks) {
          const koTitle = artwork.translations.find(
            (t) => t.language === 'ko',
          )?.title;
          if (koTitle && artworkTitles.includes(koTitle)) {
            const order = artworkTitles.indexOf(koTitle);
            seriesArtworks.push(
              this.seriesArtworkRepository.create({
                seriesId: series.id,
                artworkId: artwork.id,
                order: order,
                series,
                artwork,
              }),
            );
          }
        }

        if (seriesArtworks.length > 0) {
          await this.seriesArtworkRepository.save(seriesArtworks);
        }
      }
    }

    this.logger.info(
      'Series and series-artwork relationships created successfully',
      {
        context: 'SeedService',
        metadata: { seriesCount: SERIES.length },
      },
    );
  }

  private async createArtworks(genres: Genre[]): Promise<Artwork[]> {
    const existingArtworks = await this.artworkRepository.count();
    if (existingArtworks > 0) {
      this.logger.info('Artworks already exist', {
        context: 'SeedService',
        metadata: { count: existingArtworks },
      });
      return this.artworkRepository.find({
        relations: { translations: true },
      });
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

    this.logger.info('Artworks created successfully', {
      context: 'SeedService',
      metadata: { count: ARTWORKS.length },
    });

    return this.artworkRepository.find({
      relations: { translations: true },
    });
  }
}
