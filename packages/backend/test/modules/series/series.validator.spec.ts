import { Language } from '@/src/modules/genres/enums/language.enum';
import { SeriesTranslation } from '@/src/modules/series/entities/series-translations.entity';
import { Series } from '@/src/modules/series/entities/series.entity';
import {
  SeriesErrorCode,
  SeriesException,
} from '@/src/modules/series/series.exception';
import { SeriesValidator } from '@/src/modules/series/series.validator';
import { SeriesFactory } from '@/test/factories/series.factory';

describeWithoutDeps('SeriesValidator', () => {
  let validator: SeriesValidator;

  beforeEach(() => {
    validator = new SeriesValidator();
  });

  describe('assertTranslationsExist', () => {
    it('모든 언어에 대한 번역이 존재하면 예외를 발생시키지 않음', () => {
      const series = SeriesFactory.createTestData({
        translations: [
          { language: Language.KO, title: '타이틀' },
          { language: Language.EN, title: 'title' },
          { language: Language.JA, title: 'タイトル' },
        ] as SeriesTranslation[],
      });

      expect(() => validator.assertTranslationsExist(series)).not.toThrow();
    });

    it('하나라도 누락된 번역이 있으면 예외를 발생시킴', () => {
      const series = SeriesFactory.createTestData({
        translations: [
          { language: Language.KO, title: '타이틀' },
          { language: Language.EN, title: 'title' },
        ] as SeriesTranslation[],
      });

      try {
        validator.assertTranslationsExist(series);
      } catch (e) {
        expect(e).toBeInstanceOf(SeriesException);
        expect(e.getCode()).toBe(SeriesErrorCode.NOT_ENOUGH_TRANSLATIONS);
      }
    });
  });

  describe('assertDuplicatesNotExist', () => {
    it('중복된 장르가 없으면 예외를 발생시키지 않음', () => {
      const duplicates: Series[] = [];

      expect(() =>
        validator.assertDuplicatesNotExist(duplicates),
      ).not.toThrow();
    });

    it('중복된 시리즈 타이틀이 있으면 예외를 발생시킴', () => {
      const duplicates = [
        SeriesFactory.createTestData({
          translations: [
            { language: Language.KO, title: '타이틀' },
            { language: Language.EN, title: 'title' },
            { language: Language.JA, title: 'タイトル' },
          ] as SeriesTranslation[],
        }),
        SeriesFactory.createTestData({
          translations: [
            { language: Language.KO, title: '타이틀' },
            { language: Language.EN, title: 'title' },
            { language: Language.JA, title: 'タイトル' },
          ] as SeriesTranslation[],
        }),
      ] as Series[];

      try {
        validator.assertDuplicatesNotExist(duplicates);
      } catch (e) {
        expect(e).toBeInstanceOf(SeriesException);
        expect(e.getCode()).toBe(SeriesErrorCode.DUPLICATE_TITLE);
        expect(e.getErrors()).toHaveProperty('titles');
      }
    });
  });
});
