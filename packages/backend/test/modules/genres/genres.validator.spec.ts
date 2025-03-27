import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';
import {
  GenreErrorCode,
  GenreException,
} from '@/src/modules/genres/exceptions/genres.exception';
import { GenresValidator } from '@/src/modules/genres/genres.validator';
import { ArtworksFactory } from '@/test/factories/artworks.factory';
import { GenresFactory } from '@/test/factories/genres.factory';

describe('GenresValidator', () => {
  let validator: GenresValidator;

  beforeEach(() => {
    validator = new GenresValidator();
  });

  describe('assertAllTranslationNamesExist', () => {
    it('번역 이름이 하나 이상 존재하면 예외를 발생시키지 않음', () => {
      expect(() =>
        validator.assertAllTranslationNamesExist({ koName: '액션' }),
      ).not.toThrow();

      expect(() =>
        validator.assertAllTranslationNamesExist({ enName: 'Action' }),
      ).not.toThrow();

      expect(() =>
        validator.assertAllTranslationNamesExist({ jaName: 'アクション' }),
      ).not.toThrow();

      expect(() =>
        validator.assertAllTranslationNamesExist({
          koName: '액션',
          enName: 'Action',
          jaName: 'アクション',
        }),
      ).not.toThrow();
    });

    it('번역 이름이 하나도 없으면 예외를 발생시킴', () => {
      expect(() => validator.assertAllTranslationNamesExist({})).toThrow(
        GenreException,
      );

      try {
        validator.assertAllTranslationNamesExist({});
      } catch (e) {
        expect(e).toBeInstanceOf(GenreException);
        expect(e.getCode()).toBe(GenreErrorCode.NO_TRANSLATIONS_PROVIDED);
      }
    });
  });

  describe('assertTranslationsExist', () => {
    it('모든 언어에 대한 번역이 존재하면 예외를 발생시키지 않음', () => {
      const genre = GenresFactory.createTestData({
        translations: [
          { language: Language.KO, name: '액션' },
          { language: Language.EN, name: 'Action' },
          { language: Language.JA, name: 'アクション' },
        ] as GenreTranslation[],
      });

      expect(() => validator.assertTranslationsExist(genre)).not.toThrow();
    });

    it('하나라도 누락된 번역이 있으면 예외를 발생시킴', () => {
      const genre = GenresFactory.createTestData({
        translations: [
          { language: Language.KO, name: '액션' },
          { language: Language.EN, name: 'Action' },
          // JA 번역이 누락됨
        ] as GenreTranslation[],
      });

      expect(() => validator.assertTranslationsExist(genre)).toThrow(
        GenreException,
      );

      try {
        validator.assertTranslationsExist(genre);
      } catch (e) {
        expect(e).toBeInstanceOf(GenreException);
        expect(e.getCode()).toBe(GenreErrorCode.NOT_ENOUGH_TRANSLATIONS);
      }
    });

    it('번역이 없으면 예외를 발생시킴', () => {
      const genre = GenresFactory.createTestData({
        translations: [],
      });

      expect(() => validator.assertTranslationsExist(genre)).toThrow(
        GenreException,
      );
    });
  });

  describe('assertGenreExist', () => {
    it('장르가 존재하면 예외를 발생시키지 않음', () => {
      const genre = GenresFactory.createTestData({});

      expect(() => validator.assertGenreExist(genre as Genre)).not.toThrow();
    });

    it('장르가 null이면 예외를 발생시킴', () => {
      expect(() =>
        validator.assertGenreExist(null as unknown as Genre),
      ).toThrow(GenreException);

      try {
        validator.assertGenreExist(null as unknown as Genre);
      } catch (e) {
        expect(e).toBeInstanceOf(GenreException);
        expect(e.getCode()).toBe(GenreErrorCode.NOT_FOUND);
      }
    });
  });

  describe('assertAllGenresExist', () => {
    it('모든 ID에 해당하는 장르가 존재하면 예외를 발생시키지 않음', () => {
      const genres = [
        GenresFactory.createTestData({ id: 'genre-1' }),
        GenresFactory.createTestData({ id: 'genre-2' }),
      ];
      const ids = ['genre-1', 'genre-2'];

      expect(() =>
        validator.assertAllGenresExist(genres as Genre[], ids),
      ).not.toThrow();
    });

    it('일부 ID에 해당하는 장르가 없으면 예외를 발생시킴', () => {
      const genres = [GenresFactory.createTestData({ id: 'genre-1' })];
      const ids = ['genre-1', 'non-existent'];

      expect(() =>
        validator.assertAllGenresExist(genres as Genre[], ids),
      ).toThrow(GenreException);

      try {
        validator.assertAllGenresExist(genres as Genre[], ids);
      } catch (e) {
        expect(e).toBeInstanceOf(GenreException);
        expect(e.getCode()).toBe(GenreErrorCode.NOT_FOUND);
        expect(e.getErrors()).toHaveProperty('ids');
        expect(e.getErrors().ids).toContain('non-existent');
      }
    });
  });

  describe('assertGenresNotInUse', () => {
    it('모든 장르가 사용되지 않으면 예외를 발생시키지 않음', () => {
      const genres = [
        GenresFactory.createTestData({ id: 'genre-1', artworks: [] }),
        GenresFactory.createTestData({ id: 'genre-2', artworks: [] }),
      ];

      expect(() =>
        validator.assertGenresNotInUse(genres as Genre[]),
      ).not.toThrow();
    });

    it('일부 장르가 사용 중이면 예외를 발생시킴', () => {
      const genres = [
        GenresFactory.createTestData({
          id: 'genre-1',
          artworks: [],
        }),
        GenresFactory.createTestData({
          id: 'genre-2',
          artworks: [ArtworksFactory.createTestData({}) as Artwork],
          translations: [
            { language: Language.KO, name: '롤플레잉' },
          ] as GenreTranslation[],
        }),
      ];

      expect(() => validator.assertGenresNotInUse(genres as Genre[])).toThrow(
        GenreException,
      );

      try {
        validator.assertGenresNotInUse(genres as Genre[]);
      } catch (e) {
        expect(e).toBeInstanceOf(GenreException);
        expect(e.getCode()).toBe(GenreErrorCode.IN_USE);
        expect(e.getErrors()).toHaveProperty('koNames');
      }
    });
  });

  describe('assertDuplicatesNotExist', () => {
    it('중복된 장르가 없으면 예외를 발생시키지 않음', () => {
      const duplicates: Genre[] = [];

      expect(() =>
        validator.assertDuplicatesNotExist(duplicates),
      ).not.toThrow();
    });

    it('중복된 장르가 있으면 예외를 발생시킴', () => {
      const duplicates = [
        GenresFactory.createTestData({
          id: 'genre-1',
          translations: [
            { language: Language.KO, name: '액션' },
          ] as GenreTranslation[],
        }),
        GenresFactory.createTestData({
          id: 'genre-2',
          translations: [
            { language: Language.EN, name: 'RPG' },
          ] as GenreTranslation[],
        }),
      ];

      expect(() =>
        validator.assertDuplicatesNotExist(duplicates as Genre[]),
      ).toThrow(GenreException);

      try {
        validator.assertDuplicatesNotExist(duplicates as Genre[]);
      } catch (e) {
        expect(e).toBeInstanceOf(GenreException);
        expect(e.getCode()).toBe(GenreErrorCode.DUPLICATE_NAME);
        expect(e.getErrors()).toHaveProperty('names');
      }
    });
  });
});
