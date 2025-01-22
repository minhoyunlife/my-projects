import { ConfigService } from '@nestjs/config';

import {
  ArtworkListResponse,
  ArtworkResponse,
} from '@/src/modules/artworks/dtos/artwork-response.dto';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { GenreResponse } from '@/src/modules/genres/dtos/genre-response.dto';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';
import { StorageService } from '@/src/modules/storage/storage.service';
import { ArtworkTranslationsFactory } from '@/test/factories/artwork-translations.factory';
import { ArtworksFactory } from '@/test/factories/artworks.factory';
import { GenresFactory } from '@/test/factories/genres.factory';

describeWithoutDeps('ArtworkResponse', () => {
  const domain = 'https://test-cdn.example.com/';
  const mockStorageService = {
    getImageUrl: vi.fn((imageKey: string) => `${domain}/${imageKey}`),
  } as unknown as StorageService;

  const genres = [GenresFactory.createTestData({ id: 'some-nanoid' }) as Genre];
  const artwork = ArtworksFactory.createTestData(
    {
      id: 'some-nanoid',
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

  describe('ArtworkResponse', () => {
    const response = new ArtworkResponse(mockStorageService, artwork);

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

        const responseWithNullCreatedAt = new ArtworkResponse(
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

        const responseWithNullPlayedOn = new ArtworkResponse(
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

      it('엔티티의 속성 값이 존재하지 않는 경우, -1 이 반환됨', () => {
        const artworkWithNullRating = ArtworksFactory.createTestData({
          rating: null,
        }) as Artwork;

        const responseWithNullRating = new ArtworkResponse(
          mockStorageService,
          artworkWithNullRating,
        );

        expect(responseWithNullRating.rating).toBe(-1);
      });
    });

    it('엔티티의 속성 값대로 isDraft 가 반환됨', () => {
      expect(response.isDraft).toBe(artwork.isDraft);
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

        const responseWithNullTranslations = new ArtworkResponse(
          mockStorageService,
          artworkWithNullTranslations,
        );

        expect(responseWithNullTranslations.translations).toEqual([]);
      });
    });

    describe('genres', () => {
      it('엔티티의 속성 값이 존재하는 경우, GenreResponse 인스턴스의 배열이 반환됨', () => {
        expect(response.genres).toEqual(
          genres.map((genre) => new GenreResponse(genre)),
        );
      });

      it('엔티티의 속성 값이 미정의인 경우, 빈 배열이 반환됨', () => {
        const artworkWithUndefinedGenres = ArtworksFactory.createTestData({
          genres: undefined,
        }) as Artwork;

        const responseWithUndefinedGenres = new ArtworkResponse(
          mockStorageService,
          artworkWithUndefinedGenres,
        );

        expect(responseWithUndefinedGenres.genres).toEqual([]);
      });

      it('엔티티의 속성 값이 빈 배열인 경우, 빈 배열이 반환됨', () => {
        const artworkWithEmptyGenres = ArtworksFactory.createTestData({
          genres: [],
        }) as Artwork;

        const responseWithEmptyGenres = new ArtworkResponse(
          mockStorageService,
          artworkWithEmptyGenres,
        );

        expect(responseWithEmptyGenres.genres).toEqual([]);
      });
    });
  });

  describe('ArtworkListResponse', () => {
    const artworks = [artwork];
    const response = new ArtworkListResponse(
      mockStorageService,
      artworks,
      1,
      1,
      10,
    );

    it('엔티티의 속성 값대로 items 가 반환됨', () => {
      for (const a of artworks) {
        expect(response.items).toEqual([
          new ArtworkResponse(mockStorageService, a),
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
