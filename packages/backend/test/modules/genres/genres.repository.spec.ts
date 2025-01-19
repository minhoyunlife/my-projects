import { DataSource, In, Repository } from 'typeorm';

<<<<<<< HEAD
import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
=======
>>>>>>> 3ddd721 (chore: move current entity to sub folder)
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';
import { GenreException } from '@/src/modules/genres/exceptions/genres.exception';
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
      entities: [Genre, GenreTranslation, Artwork, ArtworkTranslation],
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

  describe('findByName', () => {
    beforeEach(async () => {
      await clearTables(dataSource, [Genre]);

      await saveEntities(genreRepo, [
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

      const saved = await genreRepo.findOne({
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

    it('번역이 누락된 경우 에러가 발생함', async () => {
      const genreData = GenresFactory.createTestData({
        translations: [
          { language: Language.KO, name: '액션' },
          { language: Language.EN, name: 'Action' },
        ] as GenreTranslation[],
      });

      await expect(genreRepo.createOne(genreData)).rejects.toThrowError(
        GenreException,
      );
    });

    it('중복된 장르명이 있는 경우 에러가 발생함', async () => {
      await saveEntities(genreRepo, [
        GenresFactory.createTestData({
          translations: [
            { language: Language.KO, name: '액션' },
            { language: Language.EN, name: 'Action' },
            { language: Language.JA, name: 'アクション' },
          ] as GenreTranslation[],
        }),
      ]);

      const duplicateGenre = GenresFactory.createTestData({
        translations: [
          { language: Language.KO, name: '액션' }, // 중복된 장르명
          { language: Language.EN, name: 'RPG' },
          { language: Language.JA, name: 'ロールプレイング' },
        ] as GenreTranslation[],
      });

      await expect(genreRepo.createOne(duplicateGenre)).rejects.toThrowError(
        GenreException,
      );
    });
  });

  describe('updateOne', () => {
    let genre: Genre;

    beforeEach(async () => {
      await clearTables(dataSource, [Genre]);

      const genres = await saveEntities(genreRepo, [
        GenresFactory.createTestData({}, [
          { language: Language.KO, name: '액' },
          { language: Language.EN, name: 'Action' },
          { language: Language.JA, name: 'アクション' },
        ]),
        GenresFactory.createTestData({}, [
          { language: Language.KO, name: '롤플레잉' },
          { language: Language.EN, name: 'RPG' },
          { language: Language.JA, name: 'ロールプレイング' },
        ]),
      ]);

      genre = genres[0];
    });

    it('장르 데이터를 성공적으로 수정함', async () => {
      const genreData = GenresFactory.createTestData({
        id: genre.id,
        translations: [
          { language: Language.KO, name: '액션' },
        ] as GenreTranslation[],
      });

      const result = await genreRepo.updateOne(genreData);

      const saved = await genreRepo.findOne({
        where: { id: result.id },
        relations: {
          translations: true,
        },
      });

      expect(
        saved.translations.find((t) => t.language === Language.KO)?.name,
      ).toBe('액션');
    });

    it('갱신하려는 장르명이 데이터베이스에 이미 등록되어 있으나 수정 대상의 소유인 경우, 에러가 발생하지 않음', async () => {
      const genreData = GenresFactory.createTestData({
        id: genre.id,
        translations: [
          { language: Language.EN, name: 'Action' },
        ] as GenreTranslation[],
      });

      await expect(genreRepo.updateOne(genreData)).resolves.not.toThrowError();
    });

    it('대상 장르를 찾을 수 없는 경우, 에러가 발생함', async () => {
      const genreData = GenresFactory.createTestData({
        id: 'not-existing',
        translations: [
          { language: Language.KO, name: '액션' },
        ] as GenreTranslation[],
      });

      await expect(genreRepo.updateOne(genreData)).rejects.toThrowError(
        GenreException,
      );
    });

    it('갱신하려는 장르명이 데이터베이스에 이미 등록되어 있는 경우, 에러가 발생함', async () => {
      const genreData = GenresFactory.createTestData({
        id: genre.id,
        translations: [
          { language: Language.KO, name: '롤플레잉' },
        ] as GenreTranslation[],
      });

      await expect(genreRepo.updateOne(genreData)).rejects.toThrowError(
        GenreException,
      );
    });
  });

  describe('deleteMany', () => {
    let genres: Genre[];

    beforeEach(async () => {
      await clearTables(dataSource, [Genre]);

      genres = await saveEntities(genreRepo, [
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
          { language: Language.KO, name: '시뮬레이션' },
          { language: Language.EN, name: 'Simulation' },
          { language: Language.JA, name: 'シミュレーション' },
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
          [genres[2]],
        ),
      ]);
    });

    describe('삭제할 장르가 존재하는 경우', async () => {
      it('해당되는 삭제들을 모두 삭제함', async () => {
        const ids = [genres[0].id, genres[1].id];
        await genreRepo.deleteMany(ids);

        const saved = await genreRepo.findBy({ id: In(ids) });
        expect(saved).toHaveLength(0);
      });

      it('삭제할 장르와 연관된 번역 데이터도 함께 삭제됨', async () => {
        const ids = [genres[0].id, genres[1].id];
        await genreRepo.deleteMany(ids);

        const savedTranslations = await genreTranslationRepo.findBy({
          genreId: In(ids),
        });
        expect(savedTranslations).toHaveLength(0);
      });
    });

    it('삭제 대상 장르 중 일부가 존재하지 않는 경우, 에러가 발생함', async () => {
      const ids = [genres[0].id, 'not-existing'];

      await expect(genreRepo.deleteMany(ids)).rejects.toThrowError(
        GenreException,
      );

      const saved = await genreRepo.findBy({ id: genres[0].id });
      expect(saved).toHaveLength(1);
    });

    it('삭제 대상 장르 중 작품에 의해 참조되고 있는 경우, 에러가 발생함', async () => {
      const ids = [genres[0].id, genres[2].id];

      await expect(genreRepo.deleteMany(ids)).rejects.toThrowError(
        GenreException,
      );

      const saved = await genreRepo.findBy({ id: genres[0].id });
      expect(saved).toHaveLength(1);
    });
  });
});
