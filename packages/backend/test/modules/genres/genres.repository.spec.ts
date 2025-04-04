import { DataSource, In, Repository } from 'typeorm';

import { Language } from '@/src/common/enums/language.enum';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { ArtworkTranslationsFactory } from '@/test/factories/artwork-translations.factory';
import { ArtworksFactory } from '@/test/factories/artworks.factory';
import { GenresFactory } from '@/test/factories/genres.factory';
import { clearTables, saveEntities } from '@/test/utils/database.util';
import { createTestingModuleWithDB } from '@/test/utils/module-builder.util';

describeWithDeps('GenresRepository', () => {
  let dataSource: DataSource;

  let genreRepo: GenresRepository;
  let genreTranslationRepo: Repository<GenreTranslation>;
  let artworkRepo: Repository<Artwork>;

  beforeAll(async () => {
    const module = await createTestingModuleWithDB({
      entities: [Genre, GenreTranslation, Artwork],
      providers: [GenresRepository],
    });

    dataSource = module.get<DataSource>(DataSource);

    genreRepo = module.get<GenresRepository>(GenresRepository);
    genreTranslationRepo = dataSource.getRepository(GenreTranslation);
    artworkRepo = dataSource.getRepository(Artwork);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('getAllWithFilters', () => {
    let genres: Genre[];

    beforeEach(async () => {
      await clearTables(dataSource, [Genre]);

      genres = await saveEntities(genreRepo.repository, [
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

  describe('findByName', () => {
    beforeEach(async () => {
      await clearTables(dataSource, [Genre]);

      await saveEntities(genreRepo.repository, [
        GenresFactory.createTestData(
          {
            id: 'genre-1', // 검증 편의를 위해 ID 에 순서를 지정
          },
          [
            { language: Language.KO, name: '액션' },
            { language: Language.EN, name: 'Action' },
            { language: Language.JA, name: 'アクション' },
          ],
        ),
        GenresFactory.createTestData(
          {
            id: 'genre-2',
          },
          [
            { language: Language.KO, name: '액션 RPG' },
            { language: Language.EN, name: 'Action RPG' },
            { language: Language.JA, name: 'アクションRPG' },
          ],
        ),
        GenresFactory.createTestData(
          {
            id: 'genre-3',
          },
          [
            { language: Language.KO, name: '전략' },
            { language: Language.EN, name: 'Strategy' },
            { language: Language.JA, name: 'ストラテジー' },
          ],
        ),
      ]);
    });

    it('검색어에 매칭되는 장르와, 그 장르의 모든 번역 정보들이 조회됨', async () => {
      const result = await genreRepo.findByName('act');

      expect(result).toHaveLength(2);

      expect(result[0].translations).toContainEqual(
        expect.objectContaining({ language: Language.KO, name: '액션' }),
      );
      expect(result[0].translations).toContainEqual(
        expect.objectContaining({ language: Language.EN, name: 'Action' }),
      );
      expect(result[0].translations).toContainEqual(
        expect.objectContaining({ language: Language.JA, name: 'アクション' }),
      );

      expect(result[1].translations).toContainEqual(
        expect.objectContaining({ language: Language.KO, name: '액션 RPG' }),
      );
      expect(result[1].translations).toContainEqual(
        expect.objectContaining({ language: Language.EN, name: 'Action RPG' }),
      );
      expect(result[1].translations).toContainEqual(
        expect.objectContaining({
          language: Language.JA,
          name: 'アクションRPG',
        }),
      );
    });

    it('한국어로 검색해도 장르가 정상적으로 조회됨', async () => {
      const result = await genreRepo.findByName('액션');
      expect(result).toHaveLength(2);
    });

    it('일본어로 검색해도 장르가 정상적으로 조회됨', async () => {
      const result = await genreRepo.findByName('アクション');
      expect(result).toHaveLength(2);
    });

    it('매칭되는 장르가 없으면 빈 배열이 반환됨', async () => {
      const result = await genreRepo.findByName('not-existing');
      expect(result).toEqual([]);
    });
  });

  describe('findByIds', () => {
    let genres: Genre[];

    beforeEach(async () => {
      await clearTables(dataSource, [Genre]);

      genres = await saveEntities(genreRepo.repository, [
        GenresFactory.createTestData({}, [
          { language: Language.KO, name: '액션' },
          { language: Language.EN, name: 'Action' },
          { language: Language.JA, name: 'アクション' },
        ]),
        GenresFactory.createTestData({}, [
          { language: Language.KO, name: '롤플레잉' },
          { language: Language.EN, name: 'RPG' },
          { language: Language.JA, name: 'ロールプレイング' },
        ]),
        GenresFactory.createTestData({}, [
          { language: Language.KO, name: '어드벤처' },
          { language: Language.EN, name: 'Adventure' },
          { language: Language.JA, name: 'アドベンチャー' },
        ]),
      ]);
    });

    it('ID 목록으로 장르들을 성공적으로 조회함', async () => {
      const targetIds = [genres[0].id, genres[1].id];
      const result = await genreRepo.findByIds(targetIds);

      expect(result).toHaveLength(2);
      expect(result.map((g) => g.id)).toEqual(
        expect.arrayContaining(targetIds),
      );
    });

    it('존재하지 않는 ID가 포함된 경우, 존재하는 장르만 조회됨', async () => {
      const targetIds = [genres[0].id, 'non-existent-id'];
      const result = await genreRepo.findByIds(targetIds);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(genres[0].id);
    });

    it('빈 ID 목록이 주어진 경우, 빈 배열이 반환됨', async () => {
      const result = await genreRepo.findByIds([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOneWithDetails', () => {
    let genre: Genre;

    beforeEach(async () => {
      await clearTables(dataSource, [Genre, Artwork]);

      const genres = await saveEntities(genreRepo.repository, [
        GenresFactory.createTestData({}, [
          { language: Language.KO, name: '액션' },
          { language: Language.EN, name: 'Action' },
          { language: Language.JA, name: 'アクション' },
        ]),
      ]);

      genre = genres[0];

      await saveEntities(artworkRepo, [
        ArtworksFactory.createTestData(
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
          [genre],
        ),
      ]);
    });

    it('ID로 장르 상세 정보를 성공적으로 조회함', async () => {
      const result = await genreRepo.findOneWithDetails(genre.id);

      expect(result).not.toBeNull();
      expect(result.id).toBe(genre.id);
      expect(result.translations).toHaveLength(3);
      expect(result.artworks).toHaveLength(1);
    });

    it('존재하지 않는 ID로 조회하면 null을 반환함', async () => {
      const result = await genreRepo.findOneWithDetails('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('findManyWithDetails', () => {
    let genres: Genre[];

    beforeEach(async () => {
      await clearTables(dataSource, [Genre, Artwork]);

      genres = await saveEntities(genreRepo.repository, [
        GenresFactory.createTestData({}, [
          { language: Language.KO, name: '액션' },
          { language: Language.EN, name: 'Action' },
          { language: Language.JA, name: 'アクション' },
        ]),
        GenresFactory.createTestData({}, [
          { language: Language.KO, name: '롤플레잉' },
          { language: Language.EN, name: 'RPG' },
          { language: Language.JA, name: 'ロールプレイング' },
        ]),
      ]);

      await saveEntities(artworkRepo, [
        ArtworksFactory.createTestData(
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
          [genres[0]],
        ),
      ]);
    });

    it('ID 목록으로 장르 상세 정보를 성공적으로 조회함', async () => {
      const targetIds = [genres[0].id, genres[1].id];
      const result = await genreRepo.findManyWithDetails(targetIds);

      expect(result).toHaveLength(2);
      expect(result.map((g) => g.id)).toEqual(
        expect.arrayContaining(targetIds),
      );

      expect(result.find((g) => g.id === genres[0].id).artworks).toHaveLength(
        1,
      );
      expect(result.find((g) => g.id === genres[1].id).artworks).toHaveLength(
        0,
      );
    });

    it('존재하지 않는 ID가 포함된 경우, 존재하는 장르만 조회됨', async () => {
      const targetIds = [genres[0].id, 'non-existent-id'];
      const result = await genreRepo.findManyWithDetails(targetIds);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(genres[0].id);
    });

    it('빈 ID 목록이 주어진 경우, 빈 배열이 반환됨', async () => {
      const result = await genreRepo.findManyWithDetails([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findDuplicateNameOfGenres', () => {
    beforeEach(async () => {
      await clearTables(dataSource, [Genre]);

      await saveEntities(genreRepo.repository, [
        GenresFactory.createTestData({ id: 'genre-1' }, [
          { language: Language.KO, name: '액션' },
          { language: Language.EN, name: 'Action' },
          { language: Language.JA, name: 'アクション' },
        ]),
        GenresFactory.createTestData({ id: 'genre-2' }, [
          { language: Language.KO, name: '롤플레잉' },
          { language: Language.EN, name: 'RPG' },
          { language: Language.JA, name: 'ロールプレイング' },
        ]),
      ]);
    });

    it('중복된 이름이 있으면 해당 장르들을 반환함', async () => {
      const result = await genreRepo.findDuplicateNameOfGenres(['액션', 'RPG']);

      expect(result).toHaveLength(2);
      expect(result.map((g) => g.id)).toContain('genre-1');
      expect(result.map((g) => g.id)).toContain('genre-2');
    });

    it('제외할 ID를 지정하면 해당 장르를 제외한 결과를 반환함', async () => {
      const result = await genreRepo.findDuplicateNameOfGenres(
        ['액션'],
        'genre-1',
      );

      expect(result).toHaveLength(0);
    });

    it('중복된 이름이 없으면 빈 배열을 반환함', async () => {
      const result = await genreRepo.findDuplicateNameOfGenres(['새로운이름']);

      expect(result).toHaveLength(0);
    });
  });

  describe('createOne', () => {
    beforeEach(async () => {
      await clearTables(dataSource, [Genre]);
    });

    it('장르 데이터를 성공적으로 생성함', async () => {
      const genreData = GenresFactory.createTestData({
        translations: [
          { language: Language.KO, name: '액션' },
          { language: Language.EN, name: 'Action' },
          { language: Language.JA, name: 'アクション' },
        ] as GenreTranslation[],
      });

      const result = await genreRepo.createOne(genreData);

      const saved = await genreRepo.repository.findOne({
        where: { id: result.id },
        relations: {
          translations: true,
        },
      });

      expect(saved.translations).toHaveLength(3);
      expect(saved.translations).toContainEqual(
        expect.objectContaining({ language: Language.KO, name: '액션' }),
      );
      expect(saved.translations).toContainEqual(
        expect.objectContaining({ language: Language.EN, name: 'Action' }),
      );
      expect(saved.translations).toContainEqual(
        expect.objectContaining({ language: Language.JA, name: 'アクション' }),
      );
    });
  });

  describe('updateOne', () => {
    let genre: Genre;

    beforeEach(async () => {
      await clearTables(dataSource, [Genre]);

      const genres = await saveEntities(genreRepo.repository, [
        GenresFactory.createTestData({}, [
          { language: Language.KO, name: '액션' },
          { language: Language.EN, name: 'Action' },
          { language: Language.JA, name: 'アクション' },
        ]),
      ]);

      genre = genres[0];
    });

    it('장르 데이터를 성공적으로 수정함', async () => {
      const genreData = GenresFactory.createTestData({
        id: genre.id,
        translations: [
          { language: Language.KO, name: '롤플레잉' },
        ] as GenreTranslation[],
      });

      const result = await genreRepo.updateOne(genreData, genre);

      const saved = await genreRepo.repository.findOne({
        where: { id: result.id },
        relations: {
          translations: true,
        },
      });

      expect(
        saved.translations.find((t) => t.language === Language.KO)?.name,
      ).toBe('롤플레잉');
    });
  });

  describe('deleteMany', () => {
    let genres: Genre[];

    beforeEach(async () => {
      await clearTables(dataSource, [Genre]);

      genres = await saveEntities(genreRepo.repository, [
        GenresFactory.createTestData({}, [
          { language: Language.KO, name: '액션' },
          { language: Language.EN, name: 'Action' },
          { language: Language.JA, name: 'アクション' },
        ]),
        GenresFactory.createTestData({}, [
          { language: Language.KO, name: '롤플레잉' },
          { language: Language.EN, name: 'RPG' },
          { language: Language.JA, name: 'ロールプレイング' },
        ]),
      ]);
    });

    it('장르들을 성공적으로 삭제함', async () => {
      await genreRepo.deleteMany(genres);

      const saved = await genreRepo.repository.findBy({
        id: In(genres.map((g) => g.id)),
      });
      expect(saved).toHaveLength(0);
    });

    it('삭제할 장르와 연관된 번역 데이터도 함께 삭제됨', async () => {
      await genreRepo.deleteMany(genres);

      const savedTranslations = await genreTranslationRepo.findBy({
        genreId: In(genres.map((g) => g.id)),
      });
      expect(savedTranslations).toHaveLength(0);
    });
  });
});
