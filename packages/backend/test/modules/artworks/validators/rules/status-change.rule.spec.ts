import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { StatusError } from '@/src/modules/artworks/enums/status-error.enum';
import {
  CreatedAtMustBeSetRule,
  GenresMustExistRule,
  PlayedOnMustBeSetRule,
  RatingMustBeInRangeRule,
  RatingMustBeSetRule,
  ShortReviewsMustBeSetRule,
} from '@/src/modules/artworks/validators/rules/status-change.rule';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';
import { ArtworkTranslationsFactory } from '@/test/factories/artwork-translations.factory';
import { ArtworksFactory } from '@/test/factories/artworks.factory';
import { GenreTranslationsFactory } from '@/test/factories/genre-translations.factory';
import { GenresFactory } from '@/test/factories/genres.factory';

describeWithoutDeps('StatusChangeRule', () => {
  const artwork = ArtworksFactory.createTestData(
    {},
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
    [
      GenresFactory.createTestData({}, [
        GenreTranslationsFactory.createTestData({
          language: Language.KO,
        }),
        GenreTranslationsFactory.createTestData({
          language: Language.EN,
        }),
        GenreTranslationsFactory.createTestData({
          language: Language.JA,
        }),
      ]) as Genre,
    ],
  ) as Artwork;

  describe('CreatedAtMustBeSetRule', () => {
    const rule = new CreatedAtMustBeSetRule();

    it('createdAt이 설정된 경우, 검증을 통과함', () => {
      const result = rule.validate(artwork);
      expect(result.isValid).toBe(true);
    });

    it('createdAt이 없는 경우, 검증에 실패함', () => {
      const invalidArtwork = { ...artwork, createdAt: null };
      const result = rule.validate(invalidArtwork);

      expect(result.isValid).toBe(false);
      expect(result.error).toEqual({
        code: StatusError.FIELD_REQUIRED,
        field: 'createdAt',
      });
    });
  });

  describe('PlayedOnMustBeSetRule', () => {
    const rule = new PlayedOnMustBeSetRule();

    it('playedOn이 설정된 경우, 검증을 통과함', () => {
      const result = rule.validate(artwork);
      expect(result.isValid).toBe(true);
    });

    it('playedOn이 없는 경우, 검증에 실패함', () => {
      const invalidArtwork = { ...artwork, playedOn: null };
      const result = rule.validate(invalidArtwork);

      expect(result.isValid).toBe(false);
      expect(result.error).toEqual({
        code: StatusError.FIELD_REQUIRED,
        field: 'playedOn',
      });
    });
  });

  describe('RatingMustBeSetRule', () => {
    const rule = new RatingMustBeSetRule();

    it('rating이 설정된 경우, 검증을 통과함', () => {
      const result = rule.validate(artwork);
      expect(result.isValid).toBe(true);
    });

    it('rating이 없는 경우, 검증에 실패함', () => {
      const invalidArtwork = { ...artwork, rating: null };
      const result = rule.validate(invalidArtwork);

      expect(result.isValid).toBe(false);
      expect(result.error).toEqual({
        code: StatusError.FIELD_REQUIRED,
        field: 'rating',
      });
    });
  });

  describe('RatingMustBeInRangeRule', () => {
    const rule = new RatingMustBeInRangeRule();

    it.each([0, 10, 20])('rating이 %i일 때 검증 결과가 성공함', (rating) => {
      const artworkWithRating = { ...artwork, rating };
      const result = rule.validate(artworkWithRating);

      expect(result.isValid).toBe(true);
    });

    it.each([-1, 21])('rating이 %i일 때 검증 결과가 실패함', (rating) => {
      const artworkWithRating = { ...artwork, rating };
      const result = rule.validate(artworkWithRating);

      expect(result.isValid).toBe(false);
      expect(result.error).toEqual({
        code: StatusError.OUT_OF_RANGE,
        field: 'rating',
      });
    });
  });

  describe('GenresMustExistRule', () => {
    const rule = new GenresMustExistRule();

    it('genres가 설정된 경우, 검증을 통과함', () => {
      const result = rule.validate(artwork);
      expect(result.isValid).toBe(true);
    });

    it('genres가 없는 경우, 검증에 실패함', () => {
      const invalidArtwork = { ...artwork, genres: [] };
      const result = rule.validate(invalidArtwork);

      expect(result.isValid).toBe(false);
      expect(result.error).toEqual({
        code: StatusError.NOT_EXIST,
        field: 'genres',
      });
    });
  });

  describe('ShortReviewsMustBeSetRule', () => {
    const rule = new ShortReviewsMustBeSetRule();

    it('모든 언어에 shortReview가 설정된 경우 검증을 통과함', () => {
      const result = rule.validate(artwork);
      expect(result.isValid).toBe(true);
    });

    it('일부 언어의 shortReview가 없는 경우 검증 실패', () => {
      const invalidArtwork = {
        ...artwork,
        translations: [
          { ...artwork.translations[0], shortReview: null },
          { ...artwork.translations[1], shortReview: 'some text' },
          { ...artwork.translations[2], shortReview: 'some text' },
        ],
      };

      const result = rule.validate(invalidArtwork);

      expect(result.isValid).toBe(false);
      expect(result.error).toEqual({
        code: StatusError.FIELD_REQUIRED,
        field: `translations.${Language.KO}.shortReview`,
      });
    });
  });
});
