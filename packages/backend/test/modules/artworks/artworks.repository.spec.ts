import { DataSource } from 'typeorm';

import { Artwork } from '@/src/modules/artworks/artworks.entity';
import { ArtworksRepository } from '@/src/modules/artworks/artworks.repository';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { SortType } from '@/src/modules/artworks/enums/sort-type.enum';
import { Genre } from '@/src/modules/genres/genres.entity';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { ArtworksFactory } from '@/test/factories/artworks.factory';
import { GenresFactory } from '@/test/factories/genres.factory';
import { clearTables, saveEntities } from '@/test/utils/database.util';
import { createTestingModuleWithDB } from '@/test/utils/module-builder.util';

describeWithDeps('ArtworksRepository', () => {
  let artworkRepo: ArtworksRepository;
  let genreRepo: GenresRepository;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module = await createTestingModuleWithDB({
      entities: [Artwork, Genre],
      providers: [ArtworksRepository, GenresRepository],
    });

    artworkRepo = module.get<ArtworksRepository>(ArtworksRepository);
    genreRepo = module.get<GenresRepository>(GenresRepository);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('createOne', () => {
    let savedGenres: Genre[];

    beforeEach(async () => {
      await clearTables(dataSource, [Artwork, Genre]);

      const genreEntity = GenresFactory.createTestData();
      savedGenres = await saveEntities(genreRepo, [genreEntity]);
    });

    it('작품 데이터를 성공적으로 생성함', async () => {
      const artworkData = ArtworksFactory.createTestData({}, savedGenres);
      const result = await artworkRepo.createOne(artworkData);

      const saved = await artworkRepo.findOne({
        where: { id: result.id },
        relations: ['genres'],
      });

      expect(saved.title).toBe(artworkData.title);
      expect(saved.imageKey).toBe(artworkData.imageKey);
      expect(saved.playedOn).toBe(artworkData.playedOn);
      expect(saved.rating).toBe(artworkData.rating);
      expect(saved.shortReview).toBe(artworkData.shortReview);
      expect(saved.genres).toEqual(artworkData.genres);
      expect(saved.isDraft).toBe(true);
    });

    describe('필수 필드 검증', () => {
      it('title이 없으면 에러가 발생함', async () => {
        const artworkData = ArtworksFactory.createTestData({
          title: undefined,
        });

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

      genres = await saveEntities(genreRepo, [
        GenresFactory.createTestData({ name: 'RPG' }),
        GenresFactory.createTestData({ name: 'Action' }),
        GenresFactory.createTestData({ name: 'Adventure' }),
      ]);

      artworks = await saveEntities(artworkRepo, [
        ArtworksFactory.createTestData({
          title: 'Final Fantasy VII',
          isDraft: false,
          playedOn: Platform.STEAM,
          genres: [genres[0]], // RPG
          createdAt: new Date('2024-01-01'),
          rating: 10,
        }), // 공개 + Steam + RPG
        ArtworksFactory.createTestData({
          title: 'Dark Souls',
          isDraft: true,
          playedOn: Platform.STEAM,
          genres: [genres[0], genres[1]], // RPG, Action
          createdAt: new Date('2024-01-02'),
          rating: 12,
        }), // 비공개 + Steam + RPG, Action
        ArtworksFactory.createTestData({
          title: 'Zelda',
          isDraft: false,
          playedOn: Platform.SWITCH,
          genres: [genres[1], genres[2]], // Action, Adventure
          createdAt: new Date('2024-01-03'),
          rating: 14,
        }), // 공개 + Switch + Action, Adventure
        ArtworksFactory.createTestData({
          title: 'Witcher 3',
          isDraft: true,
          playedOn: Platform.GOG,
          genres: [genres[2]], // Adventure
          createdAt: new Date('2024-01-04'),
          rating: 16,
        }), // 비공개 + GOG + Adventure
        ArtworksFactory.createTestData({
          title: 'Final Fantasy XVI',
          isDraft: false,
          playedOn: Platform.EPIC,
          genres: [genres[0], genres[2]], // RPG, Adventure
          createdAt: new Date('2024-01-05'),
          rating: 18,
        }),
      ]);
    });

    describe('상태 필터링 검증', () => {
      it('공개 상태로 필터링하는 경우, 공개된 작품만 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: SortType.CREATED_DESC,
          isDraftIn: [false],
        });

        expect(totalCount).toBe(3);
        expect(result).toHaveLength(3);
        expect(result.every((artwork) => artwork.isDraft === false)).toBe(true);
        expect(result.map((artwork) => artwork.title)).toEqual(
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
          sort: SortType.CREATED_DESC,
          isDraftIn: [true],
        });

        expect(totalCount).toBe(2);
        expect(result).toHaveLength(2);
        expect(result.every((artwork) => artwork.isDraft === true)).toBe(true);
        expect(result.map((artwork) => artwork.title)).toEqual(
          expect.arrayContaining(['Dark Souls', 'Witcher 3']),
        );
      });

      it('공개 및 비공개 상태로 필터링하는 경우, 두 상태의 작품이 모두 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: SortType.CREATED_DESC,
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
          sort: SortType.CREATED_DESC,
          isDraftIn: [true, false],
          search: 'Zelda',
        });

        expect(totalCount).toBe(1);
        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('Zelda');
      });

      it('검색어가 제목 일부와 일치하는 경우, 해당 작품이 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: SortType.CREATED_DESC,
          isDraftIn: [true, false],
          search: 'Final',
        });

        expect(totalCount).toBe(2);
        expect(result).toHaveLength(2);
        expect(result.map((artwork) => artwork.title)).toEqual(
          expect.arrayContaining(['Final Fantasy VII', 'Final Fantasy XVI']),
        );
      });

      it('검색어를 지정하지 않은 경우, 모든 작품이 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: SortType.CREATED_DESC,
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
          sort: SortType.CREATED_DESC,
          isDraftIn: [true, false],
          platforms: [Platform.STEAM],
        });

        expect(totalCount).toBe(2);
        expect(result).toHaveLength(2);
        expect(
          result.every((artwork) => artwork.playedOn === Platform.STEAM),
        ).toBe(true);
        expect(result.map((artwork) => artwork.title)).toEqual(
          expect.arrayContaining(['Final Fantasy VII', 'Dark Souls']),
        );
      });

      it('복수의 플랫폼으로 필터링하는 경우, 해당 플랫폼의 작품이 모두 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: SortType.CREATED_DESC,
          isDraftIn: [true, false],
          platforms: [Platform.STEAM, Platform.SWITCH],
        });

        expect(totalCount).toBe(3);
        expect(result).toHaveLength(3);
        expect(result.map((artwork) => artwork.title)).toEqual(
          expect.arrayContaining(['Final Fantasy VII', 'Zelda', 'Dark Souls']),
        );
      });

      it('플랫폼을 지정하지 않은 경우, 모든 작품이 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 10,
          sort: SortType.CREATED_DESC,
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
          sort: SortType.CREATED_DESC,
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
        expect(result.map((artwork) => artwork.title)).toEqual(
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
          sort: SortType.CREATED_DESC,
          isDraftIn: [true, false],
          genreIds: [genres[0].id, genres[1].id], // RPG, Action
        });

        expect(totalCount).toBe(4);
        expect(result).toHaveLength(4);
        expect(result.map((artwork) => artwork.title)).toEqual(
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
          sort: SortType.CREATED_DESC,
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
          sort: SortType.CREATED_DESC,
          isDraftIn: [true, false],
        });

        expect(result.map((artwork) => artwork.title)).toEqual([
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
          sort: SortType.CREATED_ASC,
          isDraftIn: [true, false],
        });

        expect(result.map((artwork) => artwork.title)).toEqual([
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
          sort: SortType.RATING_DESC,
          isDraftIn: [true, false],
        });

        expect(result.map((artwork) => artwork.title)).toEqual([
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
          sort: SortType.RATING_ASC,
          isDraftIn: [true, false],
        });

        expect(result.map((artwork) => artwork.title)).toEqual([
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
          sort: SortType.CREATED_DESC,
          isDraftIn: [true, false],
        });

        expect(totalCount).toBe(5);
        expect(result).toHaveLength(2);
        expect(result.map((artwork) => artwork.title)).toEqual([
          'Final Fantasy XVI',
          'Witcher 3',
        ]);
      });

      it('지정한 페이지의 작품이 조회됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 2, // 두번째 페이지
          pageSize: 2,
          sort: SortType.CREATED_DESC,
          isDraftIn: [true, false],
        });

        expect(totalCount).toBe(5);
        expect(result).toHaveLength(2);
        expect(result.map((artwork) => artwork.title)).toEqual([
          'Zelda',
          'Dark Souls',
        ]);
      });
    });

    describe('복합 필터링 검증', () => {
      it('상태, 검색어, 플랫폼, 장르, 정렬, 페이지네이션이 모두 적용된 경우, 조회된 작품이 올바르게 필터링됨', async () => {
        const [result, totalCount] = await artworkRepo.getAllWithFilters({
          page: 1,
          pageSize: 1,
          sort: SortType.CREATED_DESC,
          isDraftIn: [true, false],
          search: 'Final',
          platforms: [Platform.STEAM, Platform.EPIC],
          genreIds: [genres[0].id],
        });

        expect(totalCount).toBe(2);
        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('Final Fantasy XVI');
      });
    });
  });
});
