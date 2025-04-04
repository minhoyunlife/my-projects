import { DataSource, Repository } from 'typeorm';

import { Language } from '@/src/common/enums/language.enum';
import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { SeriesArtwork } from '@/src/modules/series/entities/series-artworks.entity';
import { SeriesTranslation } from '@/src/modules/series/entities/series-translations.entity';
import { Series } from '@/src/modules/series/entities/series.entity';
import { SeriesRepository } from '@/src/modules/series/series.repository';
import { ArtworkTranslationsFactory } from '@/test/factories/artwork-translations.factory';
import { ArtworksFactory } from '@/test/factories/artworks.factory';
import { SeriesArtworksFactory } from '@/test/factories/series-artworks.factory';
import { SeriesTranslationsFactory } from '@/test/factories/series-translations.factory';
import { SeriesFactory } from '@/test/factories/series.factory';
import { clearTables, saveEntities } from '@/test/utils/database.util';
import { createTestingModuleWithDB } from '@/test/utils/module-builder.util';

describeWithDeps('SeriesRepository', () => {
  let dataSource: DataSource;

  let seriesRepo: SeriesRepository;
  let seriesTranslationRepo: Repository<SeriesTranslation>;
  let artworkRepo: Repository<Artwork>;
  let seriesArtworkRepo: Repository<SeriesArtwork>;

  beforeAll(async () => {
    const module = await createTestingModuleWithDB({
      entities: [
        Series,
        SeriesTranslation,
        Artwork,
        ArtworkTranslation,
        SeriesArtwork,
      ],
      providers: [SeriesRepository],
    });

    dataSource = module.get<DataSource>(DataSource);

    seriesRepo = module.get<SeriesRepository>(SeriesRepository);
    seriesTranslationRepo = dataSource.getRepository(SeriesTranslation);
    artworkRepo = dataSource.getRepository(Artwork);
    seriesArtworkRepo = dataSource.getRepository(SeriesArtwork);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('getAllWithFilters', () => {
    let series: Series[];
    let artworks: Artwork[];

    beforeEach(async () => {
      await clearTables(dataSource, [Series, Artwork]);

      // 시리즈 데이터 생성
      series = await saveEntities(seriesRepo.repository, [
        SeriesFactory.createTestData({}, [
          SeriesTranslationsFactory.createTestData({
            language: Language.KO,
            title: '파이널 판타지',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.EN,
            title: 'Final Fantasy',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.JA,
            title: 'ファイナルファンタジー',
          }),
        ]),
        SeriesFactory.createTestData({}, [
          SeriesTranslationsFactory.createTestData({
            language: Language.KO,
            title: '젤다의 전설',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.EN,
            title: 'The Legend of Zelda',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.JA,
            title: 'ゼルダの伝説',
          }),
        ]),
        SeriesFactory.createTestData({}, [
          SeriesTranslationsFactory.createTestData({
            language: Language.KO,
            title: '메탈 기어',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.EN,
            title: 'Metal Gear',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.JA,
            title: 'メタルギア',
          }),
        ]),
      ]);

      // 작품 데이터 생성
      artworks = await saveEntities(artworkRepo, [
        ArtworksFactory.createTestData({}, [
          ArtworkTranslationsFactory.createTestData({
            language: Language.KO,
            title: '파이널 판타지 7',
          }),
          ArtworkTranslationsFactory.createTestData({
            language: Language.EN,
            title: 'Final Fantasy VII',
          }),
          ArtworkTranslationsFactory.createTestData({
            language: Language.JA,
            title: 'ファイナルファンタジーVII',
          }),
        ]),
        ArtworksFactory.createTestData({}, [
          ArtworkTranslationsFactory.createTestData({
            language: Language.KO,
            title: '파이널 판타지 10',
          }),
          ArtworkTranslationsFactory.createTestData({
            language: Language.EN,
            title: 'Final Fantasy X',
          }),
          ArtworkTranslationsFactory.createTestData({
            language: Language.JA,
            title: 'ファイナルファンタジーX',
          }),
        ]),
      ]);

      // 시리즈와 작품 연결
      await saveEntities(seriesArtworkRepo, [
        SeriesArtworksFactory.createTestData(
          { order: 0 },
          series[0],
          artworks[0],
        ),
        SeriesArtworksFactory.createTestData(
          { order: 1 },
          series[0],
          artworks[1],
        ),
      ]);
    });

    describe('검색어 필터링 검증', () => {
      it('한국어 타이틀로 검색 시 해당 시리즈가 조회됨', async () => {
        const [result, totalCount] = await seriesRepo.getAllWithFilters({
          page: 1,
          pageSize: 20,
          search: '젤다',
        });

        expect(totalCount).toBe(1);
        expect(result).toHaveLength(1);
        expect(result[0].translations).toContainEqual(
          expect.objectContaining({
            language: Language.KO,
            title: '젤다의 전설',
          }),
        );
      });

      it('영어 타이틀로 검색 시 해당 시리즈가 조회됨', async () => {
        const [result, totalCount] = await seriesRepo.getAllWithFilters({
          page: 1,
          pageSize: 20,
          search: 'Final',
        });

        expect(totalCount).toBe(1);
        expect(result).toHaveLength(1);
        expect(result[0].translations).toContainEqual(
          expect.objectContaining({
            language: Language.EN,
            title: 'Final Fantasy',
          }),
        );
      });

      it('일본어 타이틀로 검색 시 해당 시리즈가 조회됨', async () => {
        const [result, totalCount] = await seriesRepo.getAllWithFilters({
          page: 1,
          pageSize: 20,
          search: 'メタル',
        });

        expect(totalCount).toBe(1);
        expect(result).toHaveLength(1);
        expect(result[0].translations).toContainEqual(
          expect.objectContaining({
            language: Language.JA,
            title: 'メタルギア',
          }),
        );
      });

      it('검색어가 타이틀의 일부와 일치하는 경우에도 해당 시리즈가 조회됨', async () => {
        const [result, totalCount] = await seriesRepo.getAllWithFilters({
          page: 1,
          pageSize: 20,
          search: '전설',
        });

        expect(totalCount).toBe(1);
        expect(result).toHaveLength(1);
        expect(result[0].translations).toContainEqual(
          expect.objectContaining({
            language: Language.KO,
            title: '젤다의 전설',
          }),
        );
      });

      it('검색어를 지정하지 않은 경우, 모든 시리즈가 조회됨', async () => {
        const [result, totalCount] = await seriesRepo.getAllWithFilters({
          page: 1,
          pageSize: 20,
        });

        expect(totalCount).toBe(3);
        expect(result).toHaveLength(3);
      });
    });

    describe('페이지네이션 검증', () => {
      it('지정한 페이지 크기만큼 시리즈가 조회됨', async () => {
        const [result, totalCount] = await seriesRepo.getAllWithFilters({
          page: 1,
          pageSize: 2,
        });

        expect(totalCount).toBe(3);
        expect(result).toHaveLength(2);
      });

      it('지정한 페이지의 시리즈가 조회됨', async () => {
        const [result, totalCount] = await seriesRepo.getAllWithFilters({
          page: 2,
          pageSize: 2,
        });

        expect(totalCount).toBe(3);
        expect(result).toHaveLength(1);
      });
    });

    describe('연관 데이터 로딩 검증', () => {
      it('시리즈와 연결된 작품 정보가 함께 로딩됨', async () => {
        const [result, _] = await seriesRepo.getAllWithFilters({
          page: 1,
          pageSize: 20,
          search: '파이널',
        });

        expect(result).toHaveLength(1);
        expect(result[0].seriesArtworks).toHaveLength(2);

        // 작품과의 연결 정보 검증
        const seriesArtworks = result[0].seriesArtworks;
        expect(seriesArtworks[0].artworkId).toBe(artworks[0].id);
        expect(seriesArtworks[1].artworkId).toBe(artworks[1].id);

        // 순서 정보 검증
        expect(seriesArtworks[0].order).toBe(0);
        expect(seriesArtworks[1].order).toBe(1);
      });

      it('작품이 연결되지 않은 시리즈도 정상적으로 조회됨', async () => {
        const [result, _] = await seriesRepo.getAllWithFilters({
          page: 1,
          pageSize: 20,
          search: '젤다',
        });

        expect(result).toHaveLength(1);
        expect(result[0].seriesArtworks).toHaveLength(0);
      });
    });
  });

  describe('findDuplicateTitleOfSeries', () => {
    beforeEach(async () => {
      await clearTables(dataSource, [Series]);

      await saveEntities(seriesRepo.repository, [
        SeriesFactory.createTestData({ id: 'series-1' }, [
          SeriesTranslationsFactory.createTestData({
            language: Language.KO,
            title: '파이널 판타지',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.EN,
            title: 'Final Fantasy',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.JA,
            title: 'ファイナルファンタジー',
          }),
        ]),
        SeriesFactory.createTestData({ id: 'series-2' }, [
          SeriesTranslationsFactory.createTestData({
            language: Language.KO,
            title: '젤다의 전설',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.EN,
            title: 'The Legend of Zelda',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.JA,
            title: 'ゼルダの伝説',
          }),
        ]),
      ]);
    });

    it('중복된 타이틀이 있으면 해당 시리즈들을 반환함', async () => {
      const result = await seriesRepo.findDuplicateTitleOfSeries([
        '파이널 판타지',
        'The Legend of Zelda',
      ]);

      expect(result).toHaveLength(2);
      expect(result.map((s) => s.id)).toContain('series-1');
      expect(result.map((s) => s.id)).toContain('series-2');
    });

    it('제외할 ID를 지정하면 해당 시리즈를 제외한 결과를 반환함', async () => {
      const result = await seriesRepo.findDuplicateTitleOfSeries(
        ['파이널 판타지'],
        'series-1',
      );

      expect(result).toHaveLength(0);
    });

    it('중복된 타이틀이 없으면 빈 배열을 반환함', async () => {
      const result = await seriesRepo.findDuplicateTitleOfSeries([
        '새로운시리즈',
      ]);

      expect(result).toHaveLength(0);
    });

    it('일본어 타이틀로 검색해도 시리즈가 정상적으로 조회됨', async () => {
      const result = await seriesRepo.findDuplicateTitleOfSeries([
        'ファイナルファンタジー',
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('series-1');
    });
  });

  describe('findOneWithDetails', () => {
    let series: Series[];
    let artworks: Artwork[];

    beforeEach(async () => {
      await clearTables(dataSource, [Series, Artwork]);

      series = await saveEntities(seriesRepo.repository, [
        SeriesFactory.createTestData({ id: 'series-1' }, [
          SeriesTranslationsFactory.createTestData({
            language: Language.KO,
            title: '파이널 판타지',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.EN,
            title: 'Final Fantasy',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.JA,
            title: 'ファイナルファンタジー',
          }),
        ]),
        SeriesFactory.createTestData({ id: 'series-2' }, [
          SeriesTranslationsFactory.createTestData({
            language: Language.KO,
            title: '젤다의 전설',
          }),
        ]),
      ]);

      artworks = await saveEntities(artworkRepo, [
        ArtworksFactory.createTestData({ id: 'artwork-1' }),
        ArtworksFactory.createTestData({ id: 'artwork-2' }),
      ]);

      await saveEntities(seriesArtworkRepo, [
        SeriesArtworksFactory.createTestData(
          { order: 0 },
          series[0],
          artworks[0],
        ),
        SeriesArtworksFactory.createTestData(
          { order: 1 },
          series[0],
          artworks[1],
        ),
      ]);
    });

    it('지정된 ID의 시리즈와 관련 정보를 모두 불러옴', async () => {
      const result = await seriesRepo.findOneWithDetails('series-1');

      expect(result).not.toBeNull();
      expect(result.id).toBe('series-1');
      expect(result.translations).toHaveLength(3);
      expect(result.seriesArtworks).toHaveLength(2);
      expect(result.seriesArtworks[0].artworkId).toBe('artwork-1');
      expect(result.seriesArtworks[1].artworkId).toBe('artwork-2');
      expect(result.seriesArtworks[0].order).toBe(0);
      expect(result.seriesArtworks[1].order).toBe(1);
    });

    it('작품이 연결되지 않은 시리즈도 정상적으로 불러옴', async () => {
      const result = await seriesRepo.findOneWithDetails('series-2');

      expect(result).not.toBeNull();
      expect(result.id).toBe('series-2');
      expect(result.translations).toHaveLength(1);
      expect(result.seriesArtworks).toHaveLength(0);
    });

    it('존재하지 않는 ID를 조회하면 null 을 반환함', async () => {
      const result = await seriesRepo.findOneWithDetails('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findManyWithDetails', () => {
    let series: Series[];
    let artworks: Artwork[];

    beforeEach(async () => {
      await clearTables(dataSource, [Series, Artwork]);

      series = await saveEntities(seriesRepo.repository, [
        SeriesFactory.createTestData({ id: 'series-1' }, [
          SeriesTranslationsFactory.createTestData({
            language: Language.KO,
            title: '파이널 판타지',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.EN,
            title: 'Final Fantasy',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.JA,
            title: 'ファイナルファンタジー',
          }),
        ]),
        SeriesFactory.createTestData({ id: 'series-2' }, [
          SeriesTranslationsFactory.createTestData({
            language: Language.KO,
            title: '젤다의 전설',
          }),
        ]),
      ]);

      artworks = await saveEntities(artworkRepo, [
        ArtworksFactory.createTestData({ id: 'artwork-1' }),
      ]);

      await saveEntities(seriesArtworkRepo, [
        SeriesArtworksFactory.createTestData(
          { order: 0 },
          series[0],
          artworks[0],
        ),
      ]);
    });

    it('지정된 ID의 시리즈들과 관련 정보를 모두 불러옴', async () => {
      const result = await seriesRepo.findManyWithDetails([
        'series-1',
        'series-2',
      ]);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('series-1');
      expect(result[1].id).toBe('series-2');
      expect(result[0].translations).toHaveLength(3);
      expect(result[1].translations).toHaveLength(1);
      expect(result[0].seriesArtworks).toHaveLength(1);
      expect(result[0].seriesArtworks[0].artworkId).toBe('artwork-1');
      expect(result[1].seriesArtworks).toHaveLength(0);
    });

    it('존재하지 않는 ID를 포함할 경우 찾은 시리즈만 반환', async () => {
      const result = await seriesRepo.findManyWithDetails([
        'series-1',
        'non-existent',
      ]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('series-1');
    });

    it('빈 배열을 전달하면 빈 배열 반환', async () => {
      const result = await seriesRepo.findManyWithDetails([]);

      expect(result).toHaveLength(0);
    });
  });

  describe('createOne', () => {
    beforeEach(async () => {
      await clearTables(dataSource, [Series]);
    });

    it('시리즈 데이터를 성공적으로 생성함', async () => {
      const seriesData = SeriesFactory.createTestData({
        translations: [
          { language: Language.KO, title: '파이널 판타지' },
          { language: Language.EN, title: 'Final Fantasy' },
          { language: Language.JA, title: 'ファイナルファンタジー' },
        ] as SeriesTranslation[],
      });

      const result = await seriesRepo.createOne(seriesData);

      const saved = await seriesRepo.repository.findOne({
        where: { id: result.id },
        relations: {
          translations: true,
        },
      });

      expect(saved.translations).toHaveLength(3);
      expect(saved.translations).toContainEqual(
        expect.objectContaining({
          language: Language.KO,
          title: '파이널 판타지',
        }),
      );
      expect(saved.translations).toContainEqual(
        expect.objectContaining({
          language: Language.EN,
          title: 'Final Fantasy',
        }),
      );
      expect(saved.translations).toContainEqual(
        expect.objectContaining({
          language: Language.JA,
          title: 'ファイナルファンタジー',
        }),
      );
    });
  });

  describe('updateOne', () => {
    let series: Series;

    beforeEach(async () => {
      await clearTables(dataSource, [Series]);

      const seriesData = SeriesFactory.createTestData({ id: 'series-1' }, [
        SeriesTranslationsFactory.createTestData({
          language: Language.KO,
          title: '파이널 판타지',
        }),
        SeriesTranslationsFactory.createTestData({
          language: Language.EN,
          title: 'Final Fantasy',
        }),
        SeriesTranslationsFactory.createTestData({
          language: Language.JA,
          title: 'ファイナルファンタジー',
        }),
      ]);

      [series] = await saveEntities(seriesRepo.repository, [seriesData]);
    });

    it('언어 번역을 수정했을 때 해당 번역이 업데이트됨', async () => {
      const newSeriesData = {
        id: 'series-1',
        translations: [
          { language: Language.KO, title: '완전히 새로운 타이틀' },
          { language: Language.EN, title: 'Completely New Title' },
          { language: Language.JA, title: '完全に新しいタイトル' },
        ] as SeriesTranslation[],
      };

      await seriesRepo.updateOne(newSeriesData, series);

      const updated = await seriesRepo.repository.findOne({
        where: { id: 'series-1' },
        relations: { translations: true },
      });

      expect(updated.translations).toHaveLength(3);

      const koTranslation = updated.translations.find(
        (t) => t.language === Language.KO,
      );
      expect(koTranslation.title).toBe('완전히 새로운 타이틀');

      const enTranslation = updated.translations.find(
        (t) => t.language === Language.EN,
      );
      expect(enTranslation.title).toBe('Completely New Title');

      const jaTranslation = updated.translations.find(
        (t) => t.language === Language.JA,
      );
      expect(jaTranslation.title).toBe('完全に新しいタイトル');
    });
  });

  describe('updateSeriesArtworks', () => {
    let series: Series;
    let artworks: Artwork[];
    let seriesArtworks: SeriesArtwork[];

    beforeEach(async () => {
      await clearTables(dataSource, [Series, Artwork]);

      [series] = await saveEntities(seriesRepo.repository, [
        SeriesFactory.createTestData({ id: 'series-1' }, [
          SeriesTranslationsFactory.createTestData({
            language: Language.KO,
            title: '파이널 판타지',
          }),
        ]),
      ]);

      artworks = await saveEntities(artworkRepo, [
        ArtworksFactory.createTestData({ id: 'artwork-1' }),
        ArtworksFactory.createTestData({ id: 'artwork-2' }),
        ArtworksFactory.createTestData({ id: 'artwork-3' }),
      ]);

      seriesArtworks = await saveEntities(seriesArtworkRepo, [
        {
          seriesId: series.id,
          artworkId: artworks[0].id,
          order: 0,
          series,
          artwork: artworks[0],
        } as SeriesArtwork,
      ]);

      series.seriesArtworks = seriesArtworks;
    });

    it('새로운 작품 연결로 업데이트됨', async () => {
      const newArtworks = [
        { id: artworks[1].id, order: 0 },
        { id: artworks[2].id, order: 1 },
      ];

      const result = await seriesRepo.updateSeriesArtworks(series, newArtworks);

      expect(result.id).toBe('series-1');
      const connections = await seriesArtworkRepo.find({
        where: { seriesId: series.id },
      });
      expect(connections).toHaveLength(2);

      const sortedConnections = [...connections].sort(
        (a, b) => a.order - b.order,
      );
      expect(sortedConnections[0].artworkId).toBe(artworks[1].id);
      expect(sortedConnections[1].artworkId).toBe(artworks[2].id);
      expect(sortedConnections[0].order).toBe(0);
      expect(sortedConnections[1].order).toBe(1);

      const oldConnection = await seriesArtworkRepo.findOne({
        where: {
          seriesId: series.id,
          artworkId: artworks[0].id,
        },
      });
      expect(oldConnection).toBeNull();
    });

    it('빈 작품 목록으로 모든 연결이 제거됨', async () => {
      const emptyArtworks = [];

      await seriesRepo.updateSeriesArtworks(series, emptyArtworks);

      const connections = await seriesArtworkRepo.find({
        where: { seriesId: series.id },
      });
      expect(connections).toHaveLength(0);
    });

    it('순서가 변경된 경우 정상적으로 업데이트됨', async () => {
      await saveEntities(seriesArtworkRepo, [
        {
          seriesId: series.id,
          artworkId: artworks[1].id,
          order: 1,
          series,
          artwork: artworks[1],
        } as SeriesArtwork,
      ]);

      const reorderedArtworks = [
        { id: artworks[1].id, order: 0 }, // 원래 순서 1 -> 0
        { id: artworks[0].id, order: 1 }, // 원래 순서 0 -> 1
      ];

      await seriesRepo.updateSeriesArtworks(series, reorderedArtworks);

      const connections = await seriesArtworkRepo.find({
        where: { seriesId: series.id },
        order: { order: 'ASC' },
      });

      expect(connections).toHaveLength(2);
      expect(connections[0].artworkId).toBe(artworks[1].id);
      expect(connections[1].artworkId).toBe(artworks[0].id);
      expect(connections[0].order).toBe(0);
      expect(connections[1].order).toBe(1);
    });
  });

  describe('deleteMany', () => {
    let series: Series[];
    let artworks: Artwork[];

    beforeEach(async () => {
      await clearTables(dataSource, [Series, Artwork]);

      series = await saveEntities(seriesRepo.repository, [
        SeriesFactory.createTestData({ id: 'series-1' }, [
          SeriesTranslationsFactory.createTestData({
            language: Language.KO,
            title: '파이널 판타지',
          }),
        ]),
        SeriesFactory.createTestData({ id: 'series-2' }, [
          SeriesTranslationsFactory.createTestData({
            language: Language.KO,
            title: '젤다의 전설',
          }),
        ]),
      ]);

      artworks = await saveEntities(artworkRepo, [
        ArtworksFactory.createTestData({ id: 'artwork-1' }),
      ]);

      await saveEntities(seriesArtworkRepo, [
        SeriesArtworksFactory.createTestData(
          { order: 0 },
          series[0],
          artworks[0],
        ),
      ]);
    });

    it('시리즈를 성공적으로 삭제함', async () => {
      const beforeCount = await seriesRepo.repository.count();
      expect(beforeCount).toBe(2);

      await seriesRepo.deleteMany([series[1]]);

      const afterCount = await seriesRepo.repository.count();
      expect(afterCount).toBe(1);

      const remaining = await seriesRepo.repository.findOne({
        where: { id: 'series-1' },
      });
      expect(remaining).not.toBeNull();

      const deleted = await seriesRepo.repository.findOne({
        where: { id: 'series-2' },
      });
      expect(deleted).toBeNull();
    });

    it('시리즈 삭제 시 관련 번역 정보도 같이 삭제됨', async () => {
      const beforeCount = await seriesTranslationRepo.count();
      expect(beforeCount).toBe(2);

      await seriesRepo.deleteMany([series[1]]);

      const afterCount = await seriesTranslationRepo.count();
      expect(afterCount).toBe(1);

      const remaining = await seriesTranslationRepo.findOne({
        where: { seriesId: 'series-1' },
      });
      expect(remaining).not.toBeNull();

      const deleted = await seriesTranslationRepo.findOne({
        where: { seriesId: 'series-2' },
      });
      expect(deleted).toBeNull();
    });

    it('시리즈 삭제 시 연결된 시리즈-작품 정보도 같이 삭제됨', async () => {
      const beforeCount = await seriesArtworkRepo.count();
      expect(beforeCount).toBe(1);

      await seriesRepo.deleteMany([series[0]]);

      const afterCount = await seriesArtworkRepo.count();
      expect(afterCount).toBe(0);
    });

    it('빈 배열을 전달하면 아무 시리즈도 삭제하지 않음', async () => {
      const beforeCount = await seriesRepo.repository.count();
      expect(beforeCount).toBe(2);

      await seriesRepo.deleteMany([]);

      const afterCount = await seriesRepo.repository.count();
      expect(afterCount).toBe(2);
    });
  });
});
