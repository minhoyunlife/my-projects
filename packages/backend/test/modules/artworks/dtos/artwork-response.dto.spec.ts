import { Language } from '@/src/common/enums/language.enum';
import {
  ArtworkListResponseDto,
  ArtworkResponseDto,
  ArtworkSeriesDto,
} from '@/src/modules/artworks/dtos/artwork-response.dto';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { GenreResponseDto } from '@/src/modules/genres/dtos/genre-response.dto';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { SeriesArtwork } from '@/src/modules/series/entities/series-artworks.entity';
import { Series } from '@/src/modules/series/entities/series.entity';
import { StorageService } from '@/src/modules/storage/storage.service';
import { ArtworkTranslationsFactory } from '@/test/factories/artwork-translations.factory';
import { ArtworksFactory } from '@/test/factories/artworks.factory';
import { GenresFactory } from '@/test/factories/genres.factory';
import { SeriesArtworksFactory } from '@/test/factories/series-artworks.factory';
import { SeriesTranslationsFactory } from '@/test/factories/series-translations.factory';
import { SeriesFactory } from '@/test/factories/series.factory';

describeWithoutDeps('ArtworkResponse', () => {
  const domain = 'https://test-cdn.example.com/';
  const mockStorageService = {
    getImageUrl: vi.fn((imageKey: string) => `${domain}/${imageKey}`),
  } as unknown as StorageService;

  const genres = [GenresFactory.createTestData({ id: 'genre-id' }) as Genre];

  const seriesTranslations = [
    SeriesTranslationsFactory.createTestData({
      language: Language.KO,
      title: 'Test Series KO',
    }),
    SeriesTranslationsFactory.createTestData({
      language: Language.EN,
      title: 'Test Series EN',
    }),
  ];

  const series = SeriesFactory.createTestData(
    { id: 'series-id' },
    seriesTranslations,
  ) as Series;

  const artwork = ArtworksFactory.createTestData(
    {
      id: 'artwork-id',
      isDraft: true,
    },
    [
      ArtworkTranslationsFactory.createTestData({
        language: Language.KO,
      }),
      ArtworkTranslationsFactory.createTestData({
        language: Language.EN,
      }),
      ArtworkTranslationsFactory.createTestData({
        language: Language.JA,
      }),
    ],
    genres,
  ) as Artwork;

  const seriesArtwork = SeriesArtworksFactory.createTestData(
    { order: 3 },
    series,
    artwork,
  ) as SeriesArtwork;

  artwork.seriesArtworks = [seriesArtwork];

  describe('ArtworkSeriesDto', () => {
    it('시리즈 작품 엔티티로부터 DTO를 정확히 생성함', () => {
      const dto = new ArtworkSeriesDto(seriesArtwork);

      expect(dto.id).toBe(series.id);
      expect(dto.order).toBe(3);
      expect(dto.translations).toEqual(seriesTranslations);
    });

    it('series 속성이 없는 경우 빈 배열을 translations로 설정함', () => {
      const artworkWithoutSeriesTranslations = {
        ...seriesArtwork,
        series: { translations: null },
      };
      const dto = new ArtworkSeriesDto(
        artworkWithoutSeriesTranslations as SeriesArtwork,
      );

      expect(dto.translations).toEqual([]);
    });

    it('series 속성이 null인 경우 빈 배열을 translations로 설정함', () => {
      const artworkWithNullSeries = { ...seriesArtwork, series: null };
      const dto = new ArtworkSeriesDto(artworkWithNullSeries as SeriesArtwork);

      expect(dto.translations).toEqual([]);
    });
  });

  describe('ArtworkResponse', () => {
    const response = new ArtworkResponseDto(mockStorageService, artwork);

    it('엔티티의 속성 값대로 id 가 반환됨', () => {
      expect(response.id).toBe(artwork.id);
    });

    it('엔티티의 속성 값대로 imageUrl 이 반환됨', () => {
      expect(response.imageUrl).toBe(`${domain}/${artwork.imageKey}`);
    });

    describe('createdAt', () => {
      it('엔티티의 속성 값이 존재하는 경우, ISO 문자열 형식으로 반환됨', () => {
        expect(response.createdAt).toBe(artwork.createdAt.toISOString());
      });

      it('엔티티의 속성 값이 존재하지 않는 경우, 빈 문자열이 반환됨', () => {
        const artworkWithNullCreatedAt = ArtworksFactory.createTestData({
          createdAt: null,
        }) as Artwork;

        const responseWithNullCreatedAt = new ArtworkResponseDto(
          mockStorageService,
          artworkWithNullCreatedAt,
        );

        expect(responseWithNullCreatedAt.createdAt).toBe('');
      });
    });

    describe('playedOn', () => {
      it('엔티티의 속성 값이 존재하는 경우, playedOn 이 반환됨', () => {
        expect(response.playedOn).toBe(artwork.playedOn);
      });

      it('엔티티의 속성 값이 존재하지 않는 경우, 빈 문자열이 반환됨', () => {
        const artworkWithNullPlayedOn = ArtworksFactory.createTestData({
          playedOn: null,
        }) as Artwork;

        const responseWithNullPlayedOn = new ArtworkResponseDto(
          mockStorageService,
          artworkWithNullPlayedOn,
        );

        expect(responseWithNullPlayedOn.playedOn).toBe('');
      });
    });

    describe('rating', () => {
      it('엔티티의 속성 값이 존재하는 경우, rating 이 반환됨', () => {
        expect(response.rating).toBe(artwork.rating);
      });

      it('엔티티의 속성 값이 존재하지 않는 경우, null 이 반환됨', () => {
        const artworkWithNullRating = ArtworksFactory.createTestData({
          rating: null,
        }) as Artwork;

        const responseWithNullRating = new ArtworkResponseDto(
          mockStorageService,
          artworkWithNullRating,
        );

        expect(responseWithNullRating.rating).toBe(null);
      });
    });

    it('엔티티의 속성 값대로 isDraft 가 반환됨', () => {
      expect(response.isDraft).toBe(artwork.isDraft);
    });

    it('엔티티의 속성 값대로 isVertical 가 반환됨', () => {
      expect(response.isVertical).toBe(artwork.isVertical);
    });

    describe('translations', () => {
      it('엔티티에 속성 값이 존재하는 경우, translations 가 반환됨', () => {
        expect(response.translations).toHaveLength(3);
      });

      it('엔티티에 속성 값이 존재하지 않는 경우, translations 이 빈 배열로 반환됨', () => {
        const artworkWithNullTranslations = ArtworksFactory.createTestData(
          {},
          null,
        ) as Artwork;

        const responseWithNullTranslations = new ArtworkResponseDto(
          mockStorageService,
          artworkWithNullTranslations,
        );

        expect(responseWithNullTranslations.translations).toEqual([]);
      });
    });

    describe('genres', () => {
      it('엔티티의 속성 값이 존재하는 경우, GenreResponseDto 인스턴스의 배열이 반환됨', () => {
        expect(response.genres).toEqual(
          genres.map((genre) => new GenreResponseDto(genre)),
        );
      });

      it('엔티티의 속성 값이 미정의인 경우, 빈 배열이 반환됨', () => {
        const artworkWithUndefinedGenres = ArtworksFactory.createTestData({
          genres: undefined,
        }) as Artwork;

        const responseWithUndefinedGenres = new ArtworkResponseDto(
          mockStorageService,
          artworkWithUndefinedGenres,
        );

        expect(responseWithUndefinedGenres.genres).toEqual([]);
      });

      it('엔티티의 속성 값이 빈 배열인 경우, 빈 배열이 반환됨', () => {
        const artworkWithEmptyGenres = ArtworksFactory.createTestData({
          genres: [],
        }) as Artwork;

        const responseWithEmptyGenres = new ArtworkResponseDto(
          mockStorageService,
          artworkWithEmptyGenres,
        );

        expect(responseWithEmptyGenres.genres).toEqual([]);
      });
    });

    describe('series', () => {
      it('작품이 시리즈에 속한 경우, ArtworkSeriesDto 인스턴스가 반환됨', () => {
        expect(response.series).toEqual(new ArtworkSeriesDto(seriesArtwork));
      });

      it('작품이 시리즈에 속하지 않은 경우, null이 반환됨', () => {
        const artworkWithoutSeries = ArtworksFactory.createTestData({
          seriesArtworks: [],
        }) as Artwork;

        const responseWithoutSeries = new ArtworkResponseDto(
          mockStorageService,
          artworkWithoutSeries,
        );

        expect(responseWithoutSeries.series).toBeNull();
      });

      it('seriesArtworks가 undefined인 경우, null이 반환됨', () => {
        const artworkWithUndefinedSeries = ArtworksFactory.createTestData({
          seriesArtworks: undefined,
        }) as Artwork;

        const responseWithUndefinedSeries = new ArtworkResponseDto(
          mockStorageService,
          artworkWithUndefinedSeries,
        );

        expect(responseWithUndefinedSeries.series).toBeNull();
      });
    });
  });

  describe('ArtworkListResponse', () => {
    const artworks = [artwork];
    const response = new ArtworkListResponseDto(
      mockStorageService,
      artworks,
      1,
      1,
      10,
    );

    it('엔티티의 속성 값대로 items 가 반환됨', () => {
      for (const a of artworks) {
        expect(response.items).toEqual([
          new ArtworkResponseDto(mockStorageService, a),
        ]);
      }
    });

    it('엔티티의 속성 값대로 metadata 가 반환됨', () => {
      expect(response.metadata).toEqual({
        totalCount: 1,
        totalPages: 1, // 1/10의 결과값을 올림
        currentPage: 1,
        pageSize: 10,
      });
    });
  });
});
