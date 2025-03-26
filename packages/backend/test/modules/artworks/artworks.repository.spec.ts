import { DataSource, In, Repository } from 'typeorm';

import { ArtworksRepository } from '@/src/modules/artworks/artworks.repository';
import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { Sort } from '@/src/modules/artworks/enums/sort-type.enum';
import { ArtworkException } from '@/src/modules/artworks/exceptions/artworks.exception';
import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { ArtworkTranslationsFactory } from '@/test/factories/artwork-translations.factory';
import { ArtworksFactory } from '@/test/factories/artworks.factory';
import { GenreTranslationsFactory } from '@/test/factories/genre-translations.factory';
import { GenresFactory } from '@/test/factories/genres.factory';
import { clearTables, saveEntities } from '@/test/utils/database.util';
import { createTestingModuleWithDB } from '@/test/utils/module-builder.util';

describeWithDeps('ArtworksRepository', () => {
  let artworkRepo: ArtworksRepository;
  let artworkTranslationRepo: Repository<ArtworkTranslation>;
  let genreRepo: GenresRepository;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module = await createTestingModuleWithDB({
      entities: [Artwork, ArtworkTranslation, Genre, GenreTranslation],
      providers: [ArtworksRepository, GenresRepository],
    });

    dataSource = module.get<DataSource>(DataSource);
    artworkRepo = module.get<ArtworksRepository>(ArtworksRepository);
    genreRepo = module.get<GenresRepository>(GenresRepository);
    artworkTranslationRepo = dataSource.getRepository(ArtworkTranslation);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('createOne', () => {
    let savedGenres: Genre[];

    beforeEach(async () => {
      await clearTables(dataSource, [Artwork, Genre]);

      const genreEntity = GenresFactory.createTestData({}, [
        GenreTranslationsFactory.createTestData({
          language: Language.KO,
          name: '액션',
        }),
        GenreTranslationsFactory.createTestData({
          language: Language.EN,
          name: 'Action',
        }),
        GenreTranslationsFactory.createTestData({
          language: Language.JA,
          name: 'アクション',
        }),
      ]);
      savedGenres = await saveEntities(genreRepo.repository, [genreEntity]);
    });

    it('작품 데이터를 성공적으로 생성함', async () => {
      const artworkData = ArtworksFactory.createTestData(
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
        savedGenres,
      );
      const result = await artworkRepo.createOne(artworkData);

      const saved = await artworkRepo.repository.findOne({
        where: { id: result.id },
        relations: {
          genres: {
            translations: true,
          },
          translations: true,
        },
      });

      expect(saved.imageKey).toBe(artworkData.imageKey);
      expect(saved.playedOn).toBe(artworkData.playedOn);
      expect(saved.rating).toBe(artworkData.rating);
      expect(saved.genres).toEqual(artworkData.genres);
      expect(saved.isDraft).toBe(true);
      expect(
        saved.translations.find((t) => t.language === Language.KO).title,
      ).toEqual(
        artworkData.translations.find((t) => t.language === Language.KO).title,
      );
      expect(
        saved.translations.find((t) => t.language === Language.EN).title,
      ).toEqual(
        artworkData.translations.find((t) => t.language === Language.EN).title,
      );
      expect(
        saved.translations.find((t) => t.language === Language.JA).title,
      ).toEqual(
        artworkData.translations.find((t) => t.language === Language.JA).title,
      );
    });

    describe('필수 필드 검증', () => {
      it('title이 없으면 에러가 발생함', async () => {
        const artworkData = ArtworksFactory.createTestData({}, [
          ArtworkTranslationsFactory.createTestData({
            language: Language.KO,
            title: undefined,
          }),
        ]);

        await expect(artworkRepo.createOne(artworkData)).rejects.toThrow();
      });

      it('imageKey가 없으면 에러가 발생함', async () => {
        const artworkData = ArtworksFactory.createTestData({
          imageKey: undefined,
        });

        await expect(artworkRepo.createOne(artworkData)).rejects.toThrow();
      });
    });
  });

  describe('getAllWithFilters', () => {
    let genres: Genre[];
    let artworks: Artwork[];

    beforeEach(async () => {
      await clearTables(dataSource, [Artwork, Genre]);

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

      artworks = await saveEntities(artworkRepo.repository, [
        ArtworksFactory.createTestData(
          {
            isDraft: false,
            playedOn: Platform.STEAM,
            genres: [genres[0]], // RPG
            createdAt: new Date('2024-01-01'),
            rating: 10,
          },
          [
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
              title: 'ファイナルファンタジー7',
            }),
          ],
        ), // 공개 + Steam + RPG
        ArtworksFactory.createTestData(
          {
            isDraft: true,
            playedOn: Platform.STEAM,
            genres: [genres[0], genres[1]], // RPG, Action
            createdAt: new Date('2024-01-02'),
            rating: 12,
          },
          [
            ArtworkTranslationsFactory.createTestData({
              language: Language.KO,
              title: '다크 소울',
            }),
            ArtworkTranslationsFactory.createTestData({
              language: Language.EN,
              title: 'Dark Souls',
            }),
            ArtworkTranslationsFactory.createTestData({
              language: Language.JA,
              title: 'ダークソウル',
            }),
          ],
        ), // 비공개 + Steam + RPG, Action
        ArtworksFactory.createTestData(
          {
            isDraft: false,
            playedOn: Platform.SWITCH,
            genres: [genres[1], genres[2]], // Action, Adventure
            createdAt: new Date('2024-01-03'),
            rating: 14,
          },
          [
            ArtworkTranslationsFactory.createTestData({
              language: Language.KO,
              title: '젤다',
            }),
            ArtworkTranslationsFactory.createTestData({
              language: Language.EN,
              title: 'Zelda',
            }),
            ArtworkTranslationsFactory.createTestData({
              language: Language.JA,
              title: 'ゼルダ',
            }),
          ],
        ), // 공개 + Switch + Action, Adventure
        ArtworksFactory.createTestData(
          {
            isDraft: true,
            playedOn: Platform.GOG,
            genres: [genres[2]], // Adventure
            createdAt: new Date('2024-01-04'),
            rating: 16,
          },
          [
            ArtworkTranslationsFactory.createTestData({
              language: Language.KO,
              title: '위쳐 3',
            }),
            ArtworkTranslationsFactory.createTestData({
              language: Language.EN,
              title: 'Witcher 3',
            }),
            ArtworkTranslationsFactory.createTestData({
              language: Language.JA,
              title: 'ウィッチャー 3',
            }),
          ],
        ), // 비공개 + GOG + Adventure
        ArtworksFactory.createTestData(
          {
            isDraft: false,
            playedOn: Platform.EPIC,
            genres: [genres[0], genres[2]], // RPG, Adventure
            createdAt: new Date('2024-01-05'),
            rating: 18,
          },
          [
            ArtworkTranslationsFactory.createTestData({
              language: Language.KO,
              title: '파이널 판타지 16',
            }),
            ArtworkTranslationsFactory.createTestData({
              language: Language.EN,
              title: 'Final Fantasy XVI',
            }),
            ArtworkTranslationsFactory.createTestData({
              language: Language.JA,
              title: 'ファイナルファンタジー16',
            }),
          ],
        ),
      ]);
    });

    describe('상태 필터링 검증', () => {
      it('공개 상태로 필터링하는 경우, 공개된 작품만 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: Sort.CREATED_DESC,
          isDraftIn: [false],
        });

        expect(totalCount).toBe(3);
        expect(result).toHaveLength(3);
        expect(result.every((artwork) => artwork.isDraft === false)).toBe(true);

        const englishTitles = result.map(
          (artwork) =>
            artwork.translations.find((t) => t.language === Language.EN)!.title,
        );

        expect(englishTitles).toEqual(
          expect.arrayContaining([
            'Final Fantasy VII',
            'Zelda',
            'Final Fantasy XVI',
          ]),
        );
      });

      it('비공개 상태로 필터링하는 경우, 비공개된 작품만 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: Sort.CREATED_DESC,
          isDraftIn: [true],
        });

        expect(totalCount).toBe(2);
        expect(result).toHaveLength(2);
        expect(result.every((artwork) => artwork.isDraft === true)).toBe(true);

        const englishTitles = result.map(
          (artwork) =>
            artwork.translations.find((t) => t.language === Language.EN)!.title,
        );

        expect(englishTitles).toEqual(
          expect.arrayContaining(['Dark Souls', 'Witcher 3']),
        );
      });

      it('공개 및 비공개 상태로 필터링하는 경우, 두 상태의 작품이 모두 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: Sort.CREATED_DESC,
          isDraftIn: [false, true],
        });

        expect(totalCount).toBe(5);
        expect(result).toHaveLength(5);
      });
    });

    describe('검색어 필터링 검증', () => {
      it('검색어가 제목과 정확히 일치하는 경우, 해당 작품이 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: Sort.CREATED_DESC,
          isDraftIn: [true, false],
          search: 'Zelda',
        });

        expect(totalCount).toBe(1);
        expect(result).toHaveLength(1);
        expect(
          result[0].translations.find((t) => t.language === Language.EN).title,
        ).toBe('Zelda');
      });

      it('검색어가 제목 일부와 일치하는 경우, 해당 작품이 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: Sort.CREATED_DESC,
          isDraftIn: [true, false],
          search: 'Final',
        });

        expect(totalCount).toBe(2);
        expect(result).toHaveLength(2);

        const englishTitles = result.map(
          (artwork) =>
            artwork.translations.find((t) => t.language === Language.EN)!.title,
        );

        expect(englishTitles).toEqual(
          expect.arrayContaining(['Final Fantasy VII', 'Final Fantasy XVI']),
        );
      });

      it('검색어를 지정하지 않은 경우, 모든 작품이 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: Sort.CREATED_DESC,
          isDraftIn: [true, false],
        });

        expect(totalCount).toBe(5);
        expect(result).toHaveLength(5);
      });
    });

    describe('플랫폼 필터링 검증', () => {
      it('단일 특정 플랫폼으로 필터링하는 경우, 해당 플랫폼의 작품만 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: Sort.CREATED_DESC,
          isDraftIn: [true, false],
          platforms: [Platform.STEAM],
        });

        expect(totalCount).toBe(2);
        expect(result).toHaveLength(2);
        expect(
          result.every((artwork) => artwork.playedOn === Platform.STEAM),
        ).toBe(true);

        const englishTitles = result.map(
          (artwork) =>
            artwork.translations.find((t) => t.language === Language.EN)!.title,
        );

        expect(englishTitles).toEqual(
          expect.arrayContaining(['Final Fantasy VII', 'Dark Souls']),
        );
      });

      it('복수의 플랫폼으로 필터링하는 경우, 해당 플랫폼의 작품이 모두 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: Sort.CREATED_DESC,
          isDraftIn: [true, false],
          platforms: [Platform.STEAM, Platform.SWITCH],
        });

        expect(totalCount).toBe(3);
        expect(result).toHaveLength(3);

        const englishTitles = result.map(
          (artwork) =>
            artwork.translations.find((t) => t.language === Language.EN)!.title,
        );

        expect(englishTitles).toEqual(
          expect.arrayContaining(['Final Fantasy VII', 'Zelda', 'Dark Souls']),
        );
      });

      it('플랫폼을 지정하지 않은 경우, 모든 작품이 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: Sort.CREATED_DESC,
          isDraftIn: [true, false],
        });

        expect(totalCount).toBe(5);
        expect(result).toHaveLength(5);
      });
    });

    describe('장르 필터링 검증', () => {
      it('단일 특정 장르로 필터링하는 경우, 해당 장르의 작품만 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: Sort.CREATED_DESC,
          isDraftIn: [true, false],
          genreIds: [genres[0].id], // RPG
        });

        expect(totalCount).toBe(3);
        expect(result).toHaveLength(3);
        expect(
          result.every((artwork) =>
            artwork.genres.some((genre) => genre.id === genres[0].id),
          ),
        ).toBe(true);

        const englishTitles = result.map(
          (artwork) =>
            artwork.translations.find((t) => t.language === Language.EN)!.title,
        );

        expect(englishTitles).toEqual(
          expect.arrayContaining([
            'Final Fantasy VII',
            'Dark Souls',
            'Final Fantasy XVI',
          ]),
        );
      });

      it('복수의 장르로 필터링하는 경우, 해당 장르의 작품이 모두 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: Sort.CREATED_DESC,
          isDraftIn: [true, false],
          genreIds: [genres[0].id, genres[1].id], // RPG, Action
        });

        expect(totalCount).toBe(4);
        expect(result).toHaveLength(4);

        const englishTitles = result.map(
          (artwork) =>
            artwork.translations.find((t) => t.language === Language.EN)!.title,
        );

        expect(englishTitles).toEqual(
          expect.arrayContaining([
            'Final Fantasy VII',
            'Dark Souls',
            'Zelda',
            'Final Fantasy XVI',
          ]),
        );
      });

      it('장르를 지정하지 않은 경우, 모든 작품이 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: Sort.CREATED_DESC,
          isDraftIn: [true, false],
        });

        expect(totalCount).toBe(5);
        expect(result).toHaveLength(5);
      });
    });

    describe('정렬 검증', () => {
      it('생성일자 기준으로 내림차순으로 정렬하는 경우, 최신 작품부터 먼저 조회됨', async () => {
        const [result, _] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: Sort.CREATED_DESC,
          isDraftIn: [true, false],
        });

        const englishTitles = result.map(
          (artwork) =>
            artwork.translations.find((t) => t.language === Language.EN)!.title,
        );

        expect(englishTitles).toEqual([
          'Final Fantasy XVI',
          'Witcher 3',
          'Zelda',
          'Dark Souls',
          'Final Fantasy VII',
        ]);
      });

      it('생성일자 기준으로 오름차순으로 정렬하는 경우, 오래된 작품부터 먼저 조회됨', async () => {
        const [result, _] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: Sort.CREATED_ASC,
          isDraftIn: [true, false],
        });

        const englishTitles = result.map(
          (artwork) =>
            artwork.translations.find((t) => t.language === Language.EN)!.title,
        );

        expect(englishTitles).toEqual([
          'Final Fantasy VII',
          'Dark Souls',
          'Zelda',
          'Witcher 3',
          'Final Fantasy XVI',
        ]);
      });

      it('평점 기준으로 내림차순으로 정렬하는 경우, 평점이 높은 작품부터 먼저 조회됨', async () => {
        const [result, _] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: Sort.RATING_DESC,
          isDraftIn: [true, false],
        });

        const englishTitles = result.map(
          (artwork) =>
            artwork.translations.find((t) => t.language === Language.EN)!.title,
        );

        expect(englishTitles).toEqual([
          'Final Fantasy XVI',
          'Witcher 3',
          'Zelda',
          'Dark Souls',
          'Final Fantasy VII',
        ]);
      });

      it('평점 기준으로 오름차순으로 정렬하는 경우, 평점이 낮은 작품부터 먼저 조회됨', async () => {
        const [result, _] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: Sort.RATING_ASC,
          isDraftIn: [true, false],
        });

        const englishTitles = result.map(
          (artwork) =>
            artwork.translations.find((t) => t.language === Language.EN)!.title,
        );

        expect(englishTitles).toEqual([
          'Final Fantasy VII',
          'Dark Souls',
          'Zelda',
          'Witcher 3',
          'Final Fantasy XVI',
        ]);
      });
    });

    describe('페이지네이션 검증', () => {
      it('지정한 페이지 크기만큼 작품이 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 2,
          sort: Sort.CREATED_DESC,
          isDraftIn: [true, false],
        });

        expect(totalCount).toBe(5);
        expect(result).toHaveLength(2);

        const englishTitles = result.map(
          (artwork) =>
            artwork.translations.find((t) => t.language === Language.EN)!.title,
        );

        expect(englishTitles).toEqual(
          expect.arrayContaining(['Final Fantasy XVI', 'Witcher 3']),
        );
      });

      it('지정한 페이지의 작품이 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 2, // 두번째 페이지
          pageSize: 2,
          sort: Sort.CREATED_DESC,
          isDraftIn: [true, false],
        });

        expect(totalCount).toBe(5);
        expect(result).toHaveLength(2);

        const englishTitles = result.map(
          (artwork) =>
            artwork.translations.find((t) => t.language === Language.EN)!.title,
        );

        expect(englishTitles).toEqual(
          expect.arrayContaining(['Zelda', 'Dark Souls']),
        );
      });
    });

    describe('복합 필터링 검증', () => {
      it('상태, 검색어, 플랫폼, 장르, 정렬, 페이지네이션이 모두 적용된 경우, 조회된 작품이 올바르게 필터링됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 1,
          sort: Sort.CREATED_DESC,
          isDraftIn: [true, false],
          search: 'Final',
          platforms: [Platform.STEAM, Platform.EPIC],
          genreIds: [genres[0].id],
        });

        expect(totalCount).toBe(2);
        expect(result).toHaveLength(1);

        const englishTitles = result.map(
          (artwork) =>
            artwork.translations.find((t) => t.language === Language.EN)!.title,
        );

        expect(englishTitles).toEqual(
          expect.arrayContaining(['Final Fantasy XVI']),
        );
      });
    });
  });

  describe('findManyWithDetails', () => {
    let savedArtworks: Artwork[];

    beforeEach(async () => {
      await clearTables(dataSource, [Artwork, Genre]);

      const genre = await saveEntities(genreRepo.repository, [
        GenresFactory.createTestData({}, [
          { language: Language.KO, name: '액션' },
          { language: Language.EN, name: 'Action' },
          { language: Language.JA, name: 'アクション' },
        ]),
      ]);

      savedArtworks = await saveEntities(artworkRepo.repository, [
        ArtworksFactory.createTestData(
          { isDraft: true },
          [
            ArtworkTranslationsFactory.createTestData({
              language: Language.KO,
              title: '다크소울',
            }),
            ArtworkTranslationsFactory.createTestData({
              language: Language.EN,
              title: 'Dark Souls',
            }),
            ArtworkTranslationsFactory.createTestData({
              language: Language.JA,
              title: 'ダークソウル',
            }),
          ],
          genre,
        ),
        ArtworksFactory.createTestData(
          { isDraft: false },
          [
            ArtworkTranslationsFactory.createTestData({
              language: Language.KO,
              title: '젤다',
            }),
            ArtworkTranslationsFactory.createTestData({
              language: Language.EN,
              title: 'Zelda',
            }),
            ArtworkTranslationsFactory.createTestData({
              language: Language.JA,
              title: 'ゼルダ',
            }),
          ],
          genre,
        ),
      ]);
    });

    it('ID 목록으로 작품들을 성공적으로 조회함', async () => {
      const targetIds = savedArtworks.map((artwork) => artwork.id);
      const result = await artworkRepo.findManyWithDetails(targetIds);

      expect(result).toHaveLength(2);
      expect(result[0].translations).toBeDefined();
      expect(result[0].genres).toBeDefined();
      expect(result[1].translations).toBeDefined();
      expect(result[1].genres).toBeDefined();
    });

    it('존재하지 않는 ID가 포함된 경우, 존재하는 작품만 조회됨', async () => {
      const targetIds = [
        ...savedArtworks.map((artwork) => artwork.id),
        'non-existent-id',
      ];
      const result = await artworkRepo.findManyWithDetails(targetIds);

      expect(result).toHaveLength(2);
    });

    it('빈 ID 목록이 주어진 경우, 빈 배열이 반환됨', async () => {
      const result = await artworkRepo.findManyWithDetails([]);
      expect(result).toHaveLength(0);
    });

    it('조회된 작품의 번역 데이터가 모든 언어를 포함함', async () => {
      const [result] = await artworkRepo.findManyWithDetails([
        savedArtworks[0].id,
      ]);

      expect(result.translations).toHaveLength(3);
      expect(result.translations.map((t) => t.language)).toEqual(
        expect.arrayContaining([Language.KO, Language.EN, Language.JA]),
      );
    });
  });

  describe('updateOne', () => {
    let savedGenres: Genre[];
    let savedArtwork: Artwork;

    beforeEach(async () => {
      await clearTables(dataSource, [Artwork, Genre]);

      savedGenres = await saveEntities(genreRepo.repository, [
        GenresFactory.createTestData({}, [
          GenreTranslationsFactory.createTestData({
            language: Language.KO,
            name: '액션',
          }),
          GenreTranslationsFactory.createTestData({
            language: Language.EN,
            name: 'Action',
          }),
          GenreTranslationsFactory.createTestData({
            language: Language.JA,
            name: 'アクション',
          }),
        ]),
      ]);

      savedArtwork = (
        await saveEntities(artworkRepo.repository, [
          ArtworksFactory.createTestData(
            { isDraft: true },
            [
              ArtworkTranslationsFactory.createTestData({
                language: Language.KO,
                title: '다크소울',
                shortReview: '리뷰',
              }),
              ArtworkTranslationsFactory.createTestData({
                language: Language.EN,
                title: 'Dark Souls',
                shortReview: 'Review',
              }),
              ArtworkTranslationsFactory.createTestData({
                language: Language.JA,
                title: 'ダークソウル',
                shortReview: 'レビュー',
              }),
            ],
            savedGenres,
          ),
        ])
      )[0];
    });

    it('기본 정보가 성공적으로 수정됨', async () => {
      const updateData = {
        id: savedArtwork.id,
        rating: 15,
        playedOn: Platform.SWITCH,
        createdAt: new Date('2024-02-01'),
      };

      const updated = await artworkRepo.updateOne(updateData);

      expect(updated.rating).toBe(updateData.rating);
      expect(updated.playedOn).toBe(updateData.playedOn);
      expect(updated.createdAt).toEqual(updateData.createdAt);
    });

    it('번역 정보가 성공적으로 수정됨', async () => {
      const updateData = {
        id: savedArtwork.id,
        translations: [
          {
            language: Language.KO,
            title: '다크소울 수정',
            shortReview: '리뷰 수정',
          },
          {
            language: Language.EN,
            title: 'Dark Souls Edit',
          },
        ] as ArtworkTranslation[],
      };

      const updated = await artworkRepo.updateOne(updateData);

      const koTrans = updated.translations.find(
        (t) => t.language === Language.KO,
      );
      const enTrans = updated.translations.find(
        (t) => t.language === Language.EN,
      );
      const jaTrans = updated.translations.find(
        (t) => t.language === Language.JA,
      );

      expect(koTrans.title).toBe('다크소울 수정');
      expect(koTrans.shortReview).toBe('리뷰 수정');
      expect(enTrans.title).toBe('Dark Souls Edit');
      expect(enTrans.shortReview).toBe('Review'); // 원래 값 유지
      expect(jaTrans.title).toBe('ダークソウル'); // 원래 값 유지
    });

    it('장르 정보가 성공적으로 수정됨', async () => {
      const newGenre = (
        await saveEntities(genreRepo.repository, [
          GenresFactory.createTestData(),
        ])
      )[0];

      const updateData = {
        id: savedArtwork.id,
        genres: [newGenre],
      };

      const updated = await artworkRepo.updateOne(updateData);

      expect(updated.genres).toHaveLength(1);
      expect(updated.genres[0].id).toBe(newGenre.id);
    });

    it('존재하지 않는 작품 ID로 수정 시도 시 에러가 발생함', async () => {
      const updateData = {
        id: 'non-exist',
        rating: 15,
      };

      await expect(artworkRepo.updateOne(updateData)).rejects.toThrow(
        ArtworkException,
      );
    });

    it('발행된 작품 수정 시도 시 에러가 발생함', async () => {
      await artworkRepo.updateManyStatuses([savedArtwork.id], true);

      const updateData = {
        id: savedArtwork.id,
        rating: 15,
      };

      await expect(artworkRepo.updateOne(updateData)).rejects.toThrow(
        ArtworkException,
      );
    });
  });

  describe('updateManyStatuses', () => {
    let savedArtworks: Artwork[];

    beforeEach(async () => {
      await clearTables(dataSource, [Artwork, Genre]);

      const genre = await saveEntities(genreRepo.repository, [
        GenresFactory.createTestData({}, [
          { language: Language.KO, name: '액션' },
          { language: Language.EN, name: 'Action' },
          { language: Language.JA, name: 'アクション' },
        ]),
      ]);

      savedArtworks = await saveEntities(artworkRepo.repository, [
        ArtworksFactory.createTestData(
          { isDraft: true },
          [
            ArtworkTranslationsFactory.createTestData({
              language: Language.KO,
              title: '다크소울',
            }),
            ArtworkTranslationsFactory.createTestData({
              language: Language.EN,
              title: 'Dark Souls',
            }),
            ArtworkTranslationsFactory.createTestData({
              language: Language.JA,
              title: 'ダークソウル',
            }),
          ],
          genre,
        ),
        ArtworksFactory.createTestData(
          { isDraft: true },
          [
            ArtworkTranslationsFactory.createTestData({
              language: Language.KO,
              title: '젤다',
            }),
            ArtworkTranslationsFactory.createTestData({
              language: Language.EN,
              title: 'Zelda',
            }),
            ArtworkTranslationsFactory.createTestData({
              language: Language.JA,
              title: 'ゼルダ',
            }),
          ],
          genre,
        ),
      ]);
    });

    it('비공개 작품을 공개 상태로 변경할 수 있음', async () => {
      const targetIds = savedArtworks.map((artwork) => artwork.id);
      await artworkRepo.updateManyStatuses(targetIds, true);

      const updatedArtworks = await artworkRepo.repository.findBy({
        id: In(targetIds),
      });
      expect(updatedArtworks.every((artwork) => !artwork.isDraft)).toBe(true);
    });

    it('공개 작품을 비공개 상태로 변경할 수 있음', async () => {
      // 먼저 공개 상태로 변경
      const targetIds = savedArtworks.map((artwork) => artwork.id);
      await artworkRepo.updateManyStatuses(targetIds, true);

      // 다시 비공개로 변경
      await artworkRepo.updateManyStatuses(targetIds, false);

      const updatedArtworks = await artworkRepo.repository.findBy({
        id: In(targetIds),
      });
      expect(updatedArtworks.every((artwork) => artwork.isDraft)).toBe(true);
    });

    it('빈 ID 목록이 주어진 경우 에러가 발생하지 않음', async () => {
      await expect(
        artworkRepo.updateManyStatuses([], true),
      ).resolves.not.toThrow();
    });

    it('일부 작품만 상태 변경이 가능함', async () => {
      const targetId = savedArtworks[0].id;
      await artworkRepo.updateManyStatuses([targetId], true);

      const [updated, notUpdated] = await Promise.all([
        artworkRepo.repository.findOneBy({ id: targetId }),
        artworkRepo.repository.findOneBy({ id: savedArtworks[1].id }),
      ]);

      expect(updated.isDraft).toBe(false);
      expect(notUpdated.isDraft).toBe(true);
    });
  });

  describe('deleteMany', () => {
    let artworks: Artwork[];

    beforeEach(async () => {
      await clearTables(dataSource, [Artwork, Genre]);

      const genre = await saveEntities(genreRepo.repository, [
        GenresFactory.createTestData({}, [
          { language: Language.KO, name: '액션' },
          { language: Language.EN, name: 'Action' },
          { language: Language.JA, name: 'アクション' },
        ]),
      ]);

      artworks = await saveEntities(artworkRepo.repository, [
        ArtworksFactory.createTestData(
          {
            isDraft: true,
          },
          [
            ArtworkTranslationsFactory.createTestData({
              language: Language.KO,
              title: '다크소울',
            }),
            ArtworkTranslationsFactory.createTestData({
              language: Language.EN,
              title: 'Dark Souls',
            }),
            ArtworkTranslationsFactory.createTestData({
              language: Language.JA,
              title: 'ダークソウル',
            }),
          ],
          genre,
        ),
        ArtworksFactory.createTestData(
          {
            isDraft: false,
          },
          [
            ArtworkTranslationsFactory.createTestData({
              language: Language.KO,
              title: '젤다',
            }),
            ArtworkTranslationsFactory.createTestData({
              language: Language.EN,
              title: 'Zelda',
            }),
            ArtworkTranslationsFactory.createTestData({
              language: Language.JA,
              title: 'ゼルダ',
            }),
          ],
          genre,
        ),
      ]);
    });

    it('비공개 작품을 성공적으로 삭제함', async () => {
      const targetIds = [artworks[0].id];
      const deletedArtworks = await artworkRepo.deleteMany(targetIds);

      expect(deletedArtworks).toHaveLength(1);

      const saved = await artworkRepo.repository.findBy({ id: In(targetIds) });
      expect(saved).toHaveLength(0);
    });

    it('삭제된 작품의 번역 데이터도 함께 삭제됨', async () => {
      const targetIds = [artworks[0].id];
      await artworkRepo.deleteMany(targetIds);

      const savedTranslations = await artworkTranslationRepo.findBy({
        artworkId: In(targetIds),
      });
      expect(savedTranslations).toHaveLength(0);
    });

    it('존재하지 않는 작품이 포함된 경우 에러가 발생함', async () => {
      const targetIds = [artworks[0].id, 'non-existent-id'];

      await expect(artworkRepo.deleteMany(targetIds)).rejects.toThrow(
        ArtworkException,
      );

      const saved = await artworkRepo.repository.findBy({ id: artworks[0].id });
      expect(saved).toHaveLength(1);
    });

    it('공개된 작품이 포함된 경우 에러가 발생함', async () => {
      const targetIds = [artworks[0].id, artworks[1].id];

      await expect(artworkRepo.deleteMany(targetIds)).rejects.toThrow(
        ArtworkException,
      );

      const saved = await artworkRepo.repository.findBy({ id: In(targetIds) });
      expect(saved).toHaveLength(2);
    });
  });
});
