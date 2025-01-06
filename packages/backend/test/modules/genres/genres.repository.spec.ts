import { DataSource } from 'typeorm';

import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { GenresFactory } from '@/test/factories/genres.factory';
import { clearTables, saveEntities } from '@/test/utils/database.util';
import { createTestingModuleWithDB } from '@/test/utils/module-builder.util';

describeWithDeps('GenresRepository', () => {
  let genreRepo: GenresRepository;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module = await createTestingModuleWithDB({
      entities: [Genre, GenreTranslation],
      providers: [GenresRepository],
    });

    genreRepo = module.get<GenresRepository>(GenresRepository);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('getAllWithFilters', () => {
    let genres: Genre[];

    beforeEach(async () => {
      await clearTables(dataSource, [Genre]);

      genres = await saveEntities(genreRepo, [
        GenresFactory.createTestData({}, [
          { language: Language.KO, name: '롤플레잉' },
          { language: Language.EN, name: 'RPG' },
          { language: Language.JA, name: 'ロールプレイング' },
        ]),
        GenresFactory.createTestData({}, [
          { language: Language.KO, name: '액션' },
          { language: Language.EN, name: 'Action' },
          { language: Language.JA, name: 'アクション' },
        ]),
        GenresFactory.createTestData({}, [
          { language: Language.KO, name: '어드벤처' },
          { language: Language.EN, name: 'Adventure' },
          { language: Language.JA, name: 'アドベンチャー' },
        ]),
      ]);
    });

    describe('검색어 필터링 검증', () => {
      it('한국어 이름으로 검색 시 해당 장르가 조회됨', async () => {
        const [result, totalCount] = await genreRepo.getAllWithFilters({
          page: 1,
          pageSize: 20,
          search: '액션',
        });

        expect(totalCount).toBe(1);
        expect(result).toHaveLength(1);
        expect(result[0].translations).toContainEqual(
          expect.objectContaining({
            language: Language.KO,
            name: '액션',
          }),
        );
      });

      it('영어 이름으로 검색 시 해당 장르가 조회됨', async () => {
        const [result, totalCount] = await genreRepo.getAllWithFilters({
          page: 1,
          pageSize: 20,
          search: 'RPG',
        });

        expect(totalCount).toBe(1);
        expect(result).toHaveLength(1);
        expect(result[0].translations).toContainEqual(
          expect.objectContaining({
            language: Language.EN,
            name: 'RPG',
          }),
        );
      });

      it('일본어 이름으로 검색 시 해당 장르가 조회됨', async () => {
        const [result, totalCount] = await genreRepo.getAllWithFilters({
          page: 1,
          pageSize: 20,
          search: 'アクション',
        });

        expect(totalCount).toBe(1);
        expect(result).toHaveLength(1);
        expect(result[0].translations).toContainEqual(
          expect.objectContaining({
            language: Language.JA,
            name: 'アクション',
          }),
        );
      });

      it('검색어가 이름의 일부와 일치하는 경우에도 해당 장르가 조회됨', async () => {
        const [result, totalCount] = await genreRepo.getAllWithFilters({
          page: 1,
          pageSize: 20,
          search: '플레',
        });

        expect(totalCount).toBe(1);
        expect(result).toHaveLength(1);
        expect(result[0].translations).toContainEqual(
          expect.objectContaining({
            language: Language.KO,
            name: '롤플레잉',
          }),
        );
      });

      it('검색어를 지정하지 않은 경우, 모든 장르가 조회됨', async () => {
        const [result, totalCount] = await genreRepo.getAllWithFilters({
          page: 1,
          pageSize: 20,
        });

        expect(totalCount).toBe(3);
        expect(result).toHaveLength(3);
      });
    });

    describe('페이지네이션 검증', () => {
      it('지정한 페이지 크기만큼 장르가 조회됨', async () => {
        const [result, totalCount] = await genreRepo.getAllWithFilters({
          page: 1,
          pageSize: 2,
        });

        expect(totalCount).toBe(3);
        expect(result).toHaveLength(2);
      });

      it('지정한 페이지의 장르가 조회됨', async () => {
        const [result, totalCount] = await genreRepo.getAllWithFilters({
          page: 2,
          pageSize: 2,
        });

        expect(totalCount).toBe(3);
        expect(result).toHaveLength(1);
      });
    });
  });
});
