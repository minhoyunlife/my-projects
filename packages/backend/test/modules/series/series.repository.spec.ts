import { DataSource, Repository } from 'typeorm';

import { Language } from '@/src/modules/genres/enums/language.enum';
import { SeriesTranslation } from '@/src/modules/series/entities/series-translations.entity';
import { Series } from '@/src/modules/series/entities/series.entity';
import { SeriesRepository } from '@/src/modules/series/series.repository';
import { SeriesTranslationsFactory } from '@/test/factories/series-translations.factory';
import { SeriesFactory } from '@/test/factories/series.factory';
import { clearTables, saveEntities } from '@/test/utils/database.util';
import { createTestingModuleWithDB } from '@/test/utils/module-builder.util';

describeWithDeps('SeriesRepository', () => {
  let dataSource: DataSource;

  let seriesRepo: SeriesRepository;
  let seriesTranslationRepo: Repository<SeriesTranslation>;

  beforeAll(async () => {
    const module = await createTestingModuleWithDB({
      entities: [Series, SeriesTranslation],
      providers: [SeriesRepository],
    });

    dataSource = module.get<DataSource>(DataSource);

    seriesRepo = module.get<SeriesRepository>(SeriesRepository);
    seriesTranslationRepo = dataSource.getRepository(SeriesTranslation);
  });

  afterAll(async () => {
    await dataSource.destroy();
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
});
