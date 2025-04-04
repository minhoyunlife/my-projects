import { Language } from '@/src/common/enums/language.enum';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import {
  SeriesListResponseDto,
  SeriesResponseDto,
} from '@/src/modules/series/dtos/series-response.dto';
import { SeriesArtwork } from '@/src/modules/series/entities/series-artworks.entity';
import { Series } from '@/src/modules/series/entities/series.entity';
import { ArtworkTranslationsFactory } from '@/test/factories/artwork-translations.factory';
import { ArtworksFactory } from '@/test/factories/artworks.factory';
import { SeriesArtworksFactory } from '@/test/factories/series-artworks.factory';
import { SeriesTranslationsFactory } from '@/test/factories/series-translations.factory';
import { SeriesFactory } from '@/test/factories/series.factory';

describeWithoutDeps('SeriesResponse', () => {
  const series = SeriesFactory.createTestData({ id: 'some-nanoid' }, [
    SeriesTranslationsFactory.createTestData({
      language: Language.KO,
      title: '타이틀',
    }),
    SeriesTranslationsFactory.createTestData({
      language: Language.EN,
      title: 'title',
    }),
    SeriesTranslationsFactory.createTestData({
      language: Language.JA,
      title: 'タイトル',
    }),
  ]) as Series;

  const artworks = [
    ArtworksFactory.createTestData(
      {
        id: 'some-nanoid1',
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
    ) as Artwork,
    ArtworksFactory.createTestData(
      {
        id: 'some-nanoid2',
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
    ) as Artwork,
  ];

  const seriesArtwork1 = SeriesArtworksFactory.createTestData(
    { order: 0 },
    series,
    artworks[0],
  ) as SeriesArtwork;
  const seriesArtwork2 = SeriesArtworksFactory.createTestData(
    { order: 1 },
    series,
    artworks[1],
  ) as SeriesArtwork;
  series.seriesArtworks = [seriesArtwork1, seriesArtwork2];

  describe('SeriesResponseDto', () => {
    const response = new SeriesResponseDto(series);

    it('엔티티의 속성 값대로 id 가 반환됨', () => {
      expect(response.id).toBe(series.id);
    });

    describe('translations', () => {
      it('엔티티에 속성 값이 존재하는 경우, translations 가 반환됨', () => {
        expect(response.translations).toHaveLength(3);
      });

      it('엔티티에 속성 값이 존재하지 않는 경우, translations 이 빈 배열로 반환됨', () => {
        const seriesWithNullTranslations = SeriesFactory.createTestData({
          id: 'some-nanoid',
          translations: null,
        }) as Series;

        const responseWithNullTranslations = new SeriesResponseDto(
          seriesWithNullTranslations,
        );

        expect(responseWithNullTranslations.translations).toEqual([]);
      });
    });

    describe('seriesArtworks', () => {
      it('엔티티에 속성 값이 존재하는 경우, seriesArtworks 가 반환됨', () => {
        expect(response.seriesArtworks).toHaveLength(2);
      });

      it('엔티티에 속성 값이 존재하지 않는 경우, seriesArtworks 이 빈 배열로 반환됨', () => {
        const seriesWithNullArtworks = SeriesFactory.createTestData({
          id: 'some-nanoid',
          seriesArtworks: null,
        }) as Series;

        const responseWithNullArtworks = new SeriesResponseDto(
          seriesWithNullArtworks,
        );

        expect(responseWithNullArtworks.seriesArtworks).toEqual([]);
      });
    });
  });

  describe('SeriesListResponse', () => {
    const seriesList = [series];

    const response = new SeriesListResponseDto(seriesList, 1, 1, 20);

    it('엔티티의 속성 값대로 items 가 반환됨', () => {
      for (const s of seriesList) {
        expect(response.items).toEqual([new SeriesResponseDto(s)]);
      }
    });

    it('엔티티의 속성 값대로 metadata 가 반환됨', () => {
      expect(response.metadata).toEqual({
        totalCount: 1,
        totalPages: 1, // 1/10의 결과값을 올림
        currentPage: 1,
        pageSize: 20,
      });
    });
  });
});
