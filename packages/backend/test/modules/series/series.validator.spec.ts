import { Language } from '@/src/common/enums/language.enum';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { UpdateSeriesDto } from '@/src/modules/series/dtos/update-series.dto';
import { SeriesArtwork } from '@/src/modules/series/entities/series-artworks.entity';
import { SeriesTranslation } from '@/src/modules/series/entities/series-translations.entity';
import { Series } from '@/src/modules/series/entities/series.entity';
import {
  SeriesErrorCode,
  SeriesException,
} from '@/src/modules/series/series.exception';
import { SeriesValidator } from '@/src/modules/series/series.validator';
import { ArtworksFactory } from '@/test/factories/artworks.factory';
import { SeriesArtworksFactory } from '@/test/factories/series-artworks.factory';
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

  describe('assertAllSeriesExist', () => {
    it('모든 ID에 해당하는 시리즈가 존재하면 예외를 발생시키지 않음', () => {
      const series = [
        SeriesFactory.createTestData({ id: 'series-1' }),
        SeriesFactory.createTestData({ id: 'series-2' }),
      ];
      const ids = ['series-1', 'series-2'];

      expect(() =>
        validator.assertAllSeriesExist(series as Series[], ids),
      ).not.toThrow();
    });

    it('일부 ID에 해당하는 시리즈가 없으면 예외를 발생시킴', () => {
      const series = [SeriesFactory.createTestData({ id: 'series-1' })];
      const ids = ['series-1', 'non-existent'];

      expect(() =>
        validator.assertAllSeriesExist(series as Series[], ids),
      ).toThrow(SeriesException);

      try {
        validator.assertAllSeriesExist(series as Series[], ids);
      } catch (e) {
        expect(e).toBeInstanceOf(SeriesException);
        expect(e.getCode()).toBe(SeriesErrorCode.NOT_FOUND);
        expect(e.getErrors()).toHaveProperty('ids');
        expect(e.getErrors().ids).toContain('non-existent');
      }
    });
  });

  describe('assertSeriesNotInUse', () => {
    it('모든 시리즈가 사용되지 않으면 예외를 발생시키지 않음', () => {
      const series = [
        SeriesFactory.createTestData({
          id: 'series-1',
          seriesArtworks: [],
        }),
        SeriesFactory.createTestData({
          id: 'series-2',
          seriesArtworks: [],
        }),
      ];

      expect(() =>
        validator.assertSeriesNotInUse(series as Series[]),
      ).not.toThrow();
    });

    it('일부 시리즈가 작품에서 사용 중이면 예외를 발생시킴', () => {
      const artwork = ArtworksFactory.createTestData({
        id: 'artwork-1',
      }) as Artwork;
      const seriesWithTranslations = SeriesFactory.createTestData(
        { id: 'series-2' },
        [
          { language: Language.KO, title: '시리즈 타이틀' },
        ] as SeriesTranslation[],
      );

      const seriesArtwork = SeriesArtworksFactory.createTestData(
        { order: 0 },
        seriesWithTranslations as Series,
        artwork,
      ) as SeriesArtwork;

      const seriesWithArtworks = {
        ...seriesWithTranslations,
        seriesArtworks: [seriesArtwork],
      };

      const series = [
        SeriesFactory.createTestData({
          id: 'series-1',
          seriesArtworks: [],
        }),
        seriesWithArtworks,
      ];

      expect(() => validator.assertSeriesNotInUse(series as Series[])).toThrow(
        SeriesException,
      );

      try {
        validator.assertSeriesNotInUse(series as Series[]);
      } catch (e) {
        expect(e).toBeInstanceOf(SeriesException);
        expect(e.getCode()).toBe(SeriesErrorCode.IN_USE);
        expect(e.getErrors()).toHaveProperty('koTitles');
        expect(e.getErrors().koTitles).toContain('시리즈 타이틀');
      }
    });
  });

  describe('assertAtLeastOneTranslationTitleExist', () => {
    it('적어도 하나의 번역이 있으면 예외를 발생시키지 않음', () => {
      const dto = new UpdateSeriesDto();
      dto.koTitle = '한국어 타이틀';

      expect(() =>
        validator.assertAtLeastOneTranslationTitleExist(dto),
      ).not.toThrow();
    });

    it('번역이 하나도 없으면 예외를 발생시킴', () => {
      const dto = new UpdateSeriesDto();

      try {
        validator.assertAtLeastOneTranslationTitleExist(dto);
      } catch (e) {
        expect(e).toBeInstanceOf(SeriesException);
        expect(e.getCode()).toBe(SeriesErrorCode.NO_TRANSLATIONS_PROVIDED);
        expect(e.getErrors()).toHaveProperty('translations');
      }
    });
  });

  describe('assertSeriesExists', () => {
    it('시리즈가 존재하면 예외를 발생시키지 않음', () => {
      const series = SeriesFactory.createTestData();

      expect(() =>
        validator.assertSeriesExists(series as Series),
      ).not.toThrow();
    });

    it('시리즈가 존재하지 않으면 예외를 발생시킴', () => {
      try {
        validator.assertSeriesExists(null);
      } catch (e) {
        expect(e).toBeInstanceOf(SeriesException);
        expect(e.getCode()).toBe(SeriesErrorCode.NOT_FOUND);
      }
    });
  });

  describe('assertAllArtworksExist', () => {
    it('모든 아트워크가 존재하면 예외를 발생시키지 않음', () => {
      const artworks = [
        ArtworksFactory.createTestData({ id: 'artwork-1' }) as Artwork,
        ArtworksFactory.createTestData({ id: 'artwork-2' }) as Artwork,
      ];
      const ids = ['artwork-1', 'artwork-2'];

      expect(() =>
        validator.assertAllArtworksExist(artworks, ids),
      ).not.toThrow();
    });

    it('일부 아트워크가 존재하지 않으면 예외를 발생시킴', () => {
      const artworks = [
        ArtworksFactory.createTestData({ id: 'artwork-1' }) as Artwork,
      ];
      const ids = ['artwork-1', 'non-existent-artwork'];

      try {
        validator.assertAllArtworksExist(artworks, ids);
      } catch (e) {
        expect(e).toBeInstanceOf(SeriesException);
        expect(e.getCode()).toBe(SeriesErrorCode.NOT_FOUND);
        expect(e.getErrors()).toHaveProperty('ids');
        expect(e.getErrors().ids).toContain('non-existent-artwork');
      }
    });
  });
});
