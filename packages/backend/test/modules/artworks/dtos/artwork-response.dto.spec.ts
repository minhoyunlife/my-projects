import { Artwork } from '@/src/modules/artworks/artworks.entity';
import {
  ArtworkListResponse,
  ArtworkResponse,
} from '@/src/modules/artworks/dtos/artwork-response.dto';
import { GenreResponse } from '@/src/modules/genres/dtos/genre-response.dto';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { ArtworksFactory } from '@/test/factories/artworks.factory';
import { GenresFactory } from '@/test/factories/genres.factory';

describeWithoutDeps('ArtworkResponse', () => {
  const genres = [GenresFactory.createTestData({ id: 'some-nanoid' }) as Genre];
  const artwork = ArtworksFactory.createTestData({
    id: 'some-nanoid',
    isDraft: true,
    genres,
  }) as Artwork;

  describe('ArtworkResponse', () => {
    const genres = [
      GenresFactory.createTestData({ id: 'some-nanoid' }) as Genre,
    ];
    const artwork = ArtworksFactory.createTestData({
      id: 'some-nanoid',
      isDraft: true,
      genres,
    }) as Artwork;

    const response = new ArtworkResponse(artwork);

    it('엔티티의 속성 값대로 id 가 반환됨', () => {
      expect(response.id).toBe(artwork.id);
    });

    it('엔티티의 속성 값대로 title 이 반환됨', () => {
      expect(response.title).toBe(artwork.title);
    });

    // TODO: 액세스 가능한 URL 로 변환하는 처리 구현 후 수정할 것.
    it('엔티티의 속성 값대로 imageUrl 이 반환됨', () => {
      expect(response.imageUrl).toBe('https://example.com/img.png');
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
          artworkWithNullCreatedAt,
        );

        expect(responseWithNullCreatedAt.createdAt).toBe('');
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
          artworkWithUndefinedGenres,
        );

        expect(responseWithUndefinedGenres.genres).toEqual([]);
      });

      it('엔티티의 속성 값이 빈 배열인 경우, 빈 배열이 반환됨', () => {
        const artworkWithEmptyGenres = ArtworksFactory.createTestData({
          genres: [],
        }) as Artwork;

        const responseWithEmptyGenres = new ArtworkResponse(
          artworkWithEmptyGenres,
        );

        expect(responseWithEmptyGenres.genres).toEqual([]);
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
          artworkWithNullRating,
        );

        expect(responseWithNullRating.rating).toBe(-1);
      });
    });

    describe('shortReview', () => {
      it('엔티티의 속성 값이 존재하는 경우, shortReview 가 반환됨', () => {
        expect(response.shortReview).toBe(artwork.shortReview);
      });

      it('엔티티의 속성 값이 존재하지 않는 경우, 빈 문자열이 반환됨', () => {
        const artworkWithNullShortReview = ArtworksFactory.createTestData({
          shortReview: null,
        }) as Artwork;

        const responseWithNullShortReview = new ArtworkResponse(
          artworkWithNullShortReview,
        );

        expect(responseWithNullShortReview.shortReview).toBe('');
      });
    });

    it('엔티티의 속성 값대로 isDraft 가 반환됨', () => {
      expect(response.isDraft).toBe(artwork.isDraft);
    });
  });

  describe('ArtworkListResponse', () => {
    const artworks = [artwork];
    const response = new ArtworkListResponse(artworks, 1, 1, 10);

    it('엔티티의 속성 값대로 items 가 반환됨', () => {
      expect(response.items).toEqual([new ArtworkResponse(artwork)]);
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
