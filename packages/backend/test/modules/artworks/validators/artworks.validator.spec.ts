import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import {
  ArtworkErrorCode,
  ArtworkException,
} from '@/src/modules/artworks/exceptions/artworks.exception';
import { ArtworksValidator } from '@/src/modules/artworks/validators/artworks.validator';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';
import { ArtworkTranslationsFactory } from '@/test/factories/artwork-translations.factory';
import { ArtworksFactory } from '@/test/factories/artworks.factory';
import { GenresFactory } from '@/test/factories/genres.factory';

describeWithoutDeps('ArtworksValidator', () => {
  let validator: ArtworksValidator;

  beforeEach(() => {
    validator = new ArtworksValidator();
  });

  describe('assertAllGenresExist', () => {
    it('모든 장르 ID에 해당하는 장르가 존재하면 예외를 발생시키지 않음', () => {
      const genres = [
        GenresFactory.createTestData({ id: 'genre-1' }),
        GenresFactory.createTestData({ id: 'genre-2' }),
      ] as Genre[];
      const genreIds = ['genre-1', 'genre-2'];

      expect(() =>
        validator.assertAllGenresExist(genres, genreIds),
      ).not.toThrow();
    });

    it('일부 장르 ID에 해당하는 장르가 없으면 예외를 발생시킴', () => {
      const genres = [
        GenresFactory.createTestData({ id: 'genre-1' }),
      ] as Genre[];
      const genreIds = ['genre-1', 'non-existent'];

      expect(() => validator.assertAllGenresExist(genres, genreIds)).toThrow(
        ArtworkException,
      );

      try {
        validator.assertAllGenresExist(genres, genreIds);
      } catch (e) {
        expect(e).toBeInstanceOf(ArtworkException);
        expect(e.getCode()).toBe(ArtworkErrorCode.NOT_EXISTING_GENRES_INCLUDED);
        expect(e.getErrors()).toHaveProperty('genreIds');
        expect(e.getErrors().genreIds).toContain('non-existent');
      }
    });
  });

  describe('assertAtLeastOneFieldProvided', () => {
    it('적어도 하나의 필드가 제공되면 예외를 발생시키지 않음', () => {
      expect(() =>
        validator.assertAtLeastOneFieldProvided({ koTitle: '테스트' }),
      ).not.toThrow();
      expect(() =>
        validator.assertAtLeastOneFieldProvided({ rating: 15 }),
      ).not.toThrow();
      expect(() =>
        validator.assertAtLeastOneFieldProvided({
          koTitle: '테스트',
          rating: 15,
        }),
      ).not.toThrow();
    });

    it('필드가 하나도 제공되지 않으면 예외를 발생시킴', () => {
      expect(() => validator.assertAtLeastOneFieldProvided({})).toThrow(
        ArtworkException,
      );

      try {
        validator.assertAtLeastOneFieldProvided({});
      } catch (e) {
        expect(e).toBeInstanceOf(ArtworkException);
        expect(e.getCode()).toBe(ArtworkErrorCode.NO_DATA_PROVIDED);
        expect(e.getErrors()).toHaveProperty('fields');
      }
    });
  });

  describe('assertNoErrorsExist', () => {
    it('에러가 없으면 예외를 발생시키지 않음', () => {
      expect(() => validator.assertNoErrorsExist({})).not.toThrow();
    });

    it('에러가 있으면 예외를 발생시킴', () => {
      const errors = {
        ERROR_CODE: ['artwork-1|field'],
      };

      expect(() => validator.assertNoErrorsExist(errors)).toThrow(
        ArtworkException,
      );

      try {
        validator.assertNoErrorsExist(errors);
      } catch (e) {
        expect(e).toBeInstanceOf(ArtworkException);
        expect(e.getCode()).toBe(ArtworkErrorCode.SOME_FAILED);
        expect(e.getErrors()).toEqual(errors);
      }
    });
  });

  describe('assertArtworkExists', () => {
    it('작품이 존재하면 예외를 발생시키지 않음', () => {
      const artwork = ArtworksFactory.createTestData() as Artwork;

      expect(() => validator.assertArtworkExists(artwork)).not.toThrow();
    });

    it('작품이 null이면 예외를 발생시킴', () => {
      expect(() =>
        validator.assertArtworkExists(null as unknown as Artwork),
      ).toThrow(ArtworkException);

      try {
        validator.assertArtworkExists(null as unknown as Artwork);
      } catch (e) {
        expect(e).toBeInstanceOf(ArtworkException);
        expect(e.getCode()).toBe(ArtworkErrorCode.NOT_FOUND);
      }
    });
  });

  describe('assertArtworkDraft', () => {
    it('작품이 초안 상태이면 예외를 발생시키지 않음', () => {
      const artwork = ArtworksFactory.createTestData({
        isDraft: true,
      }) as Artwork;

      expect(() => validator.assertArtworkDraft(artwork)).not.toThrow();
    });

    it('작품이 이미 공개되었으면 예외를 발생시킴', () => {
      const artwork = ArtworksFactory.createTestData({
        isDraft: false,
      }) as Artwork;

      expect(() => validator.assertArtworkDraft(artwork)).toThrow(
        ArtworkException,
      );

      try {
        validator.assertArtworkDraft(artwork);
      } catch (e) {
        expect(e).toBeInstanceOf(ArtworkException);
        expect(e.getCode()).toBe(ArtworkErrorCode.ALREADY_PUBLISHED);
      }
    });
  });

  describe('assertAllProvidedArtworksExist', () => {
    it('모든 작품 ID에 해당하는 작품이 존재하면 예외를 발생시키지 않음', () => {
      const artworks = [
        ArtworksFactory.createTestData({ id: 'artwork-1' }),
        ArtworksFactory.createTestData({ id: 'artwork-2' }),
      ] as Artwork[];
      const ids = ['artwork-1', 'artwork-2'];

      expect(() =>
        validator.assertAllProvidedArtworksExist(artworks, ids),
      ).not.toThrow();
    });

    it('일부 작품 ID에 해당하는 작품이 없으면 예외를 발생시킴', () => {
      const artworks = [
        ArtworksFactory.createTestData({ id: 'artwork-1' }),
      ] as Artwork[];
      const ids = ['artwork-1', 'non-existent'];

      expect(() =>
        validator.assertAllProvidedArtworksExist(artworks, ids),
      ).toThrow(ArtworkException);

      try {
        validator.assertAllProvidedArtworksExist(artworks, ids);
      } catch (e) {
        expect(e).toBeInstanceOf(ArtworkException);
        expect(e.getCode()).toBe(ArtworkErrorCode.NOT_FOUND);
        expect(e.getErrors()).toHaveProperty('ids');
        expect(e.getErrors().ids).toContain('non-existent');
      }
    });
  });

  describe('assertAllArtworksDraft', () => {
    it('모든 작품이 초안 상태이면 예외를 발생시키지 않음', () => {
      const artworks = [
        ArtworksFactory.createTestData({ id: 'artwork-1', isDraft: true }),
        ArtworksFactory.createTestData({ id: 'artwork-2', isDraft: true }),
      ] as Artwork[];

      expect(() => validator.assertAllArtworksDraft(artworks)).not.toThrow();
    });

    it('일부 작품이 이미 공개되었으면 예외를 발생시킴', () => {
      const koTranslation = ArtworkTranslationsFactory.createTestData({
        language: Language.KO,
        title: '테스트 작품',
      });

      const artworks = [
        ArtworksFactory.createTestData({
          id: 'artwork-1',
          isDraft: true,
        }),
        ArtworksFactory.createTestData({
          id: 'artwork-2',
          isDraft: false,
          translations: [koTranslation] as ArtworkTranslation[],
        }),
      ] as Artwork[];

      expect(() => validator.assertAllArtworksDraft(artworks)).toThrow(
        ArtworkException,
      );

      try {
        validator.assertAllArtworksDraft(artworks);
      } catch (e) {
        expect(e).toBeInstanceOf(ArtworkException);
        expect(e.getCode()).toBe(ArtworkErrorCode.ALREADY_PUBLISHED);
        expect(e.getErrors()).toHaveProperty('titles');
        expect(e.getErrors().titles).toContain('테스트 작품');
      }
    });
  });
});
