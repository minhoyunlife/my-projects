import { TestingModule } from '@nestjs/testing';

import { EntityManager, In } from 'typeorm';

import { ArtworksRepository } from '@/src/modules/artworks/artworks.repository';
import { ArtworksService } from '@/src/modules/artworks/artworks.service';
import { PAGE_SIZE } from '@/src/modules/artworks/constants/page-size.constant';
import { CreateArtworkDto } from '@/src/modules/artworks/dtos/create-artwork.dto';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { SortType } from '@/src/modules/artworks/enums/sort-type.enum';
import { Status } from '@/src/modules/artworks/enums/status.enum';
import { ArtworkException } from '@/src/modules/artworks/exceptions/artworks.exception';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { createTestingModuleWithoutDB } from '@/test/utils/module-builder.util';

describeWithoutDeps('ArtworksService', () => {
  let service: ArtworksService;
  let artworksRepository: Partial<ArtworksRepository>;
  let genresRepository: Partial<GenresRepository>;
  let entityManager: EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModuleWithoutDB({
      providers: [
        ArtworksService,
        {
          provide: ArtworksRepository,
          useValue: { forTransaction: vi.fn() },
        },
        {
          provide: GenresRepository,
          useValue: { forTransaction: vi.fn() },
        },
        {
          provide: EntityManager,
          useValue: {
            transaction: vi.fn((cb) => cb(entityManager)),
          },
        },
      ],
    });

    service = module.get<ArtworksService>(ArtworksService);
    artworksRepository = module.get<ArtworksRepository>(ArtworksRepository);
    genresRepository = module.get<GenresRepository>(GenresRepository);
    entityManager = module.get<EntityManager>(EntityManager);
  });

  describe('getArtworks', () => {
    const getAllWithFiltersMock = vi.fn();

    beforeEach(() => {
      getAllWithFiltersMock.mockClear();

      artworksRepository.getAllWithFilters = getAllWithFiltersMock;
      getAllWithFiltersMock.mockResolvedValue([[], 0]);
    });

    describe('페이지 번호 검증', () => {
      it('쿼리 파라미터에 page 가 지정된 경우, 해당 값으로 지정됨', async () => {
        await service.getArtworks({ page: 2 }, false);

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 2,
          }),
        );
      });

      it('쿼리 파라미터에 page 가 미지정인 경우, 1 로 고정됨', async () => {
        await service.getArtworks({}, false);

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 1,
          }),
        );
      });
    });

    describe('페이지 당 표시 작품 수 검증', () => {
      it('인증된 사용자인 경우, CMS 페이지 수로 고정됨', async () => {
        await service.getArtworks({}, true);

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({ pageSize: PAGE_SIZE.CMS }),
        );
      });

      it('인증되지 않은 사용자인 경우, PUBLIC 페이지 수로 고정됨', async () => {
        await service.getArtworks({}, false);

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({ pageSize: PAGE_SIZE.PUBLIC }),
        );
      });
    });

    describe('정렬 방식 검증', () => {
      it('쿼리 파라미터에 sort 가 지정된 경우, 해당 값으로 지정됨', async () => {
        await service.getArtworks({ sort: SortType.RATING_ASC }, false);

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({ sort: SortType.RATING_ASC }),
        );
      });

      it('쿼리 파라미터에 sort 가 미지정인 경우, 작성일자 기준 최신순으로 정렬됨', async () => {
        await service.getArtworks({}, false);

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({ sort: SortType.CREATED_DESC }),
        );
      });
    });

    describe('플랫폼 필터 검증', () => {
      it('쿼리 파라미터에 platforms 가 지정된 경우, 해당 값으로 지정됨', async () => {
        await service.getArtworks(
          { platforms: [Platform.STEAM, Platform.EPIC] },
          false,
        );

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({
            platforms: [Platform.STEAM, Platform.EPIC],
          }),
        );
      });

      it('쿼리 파라미터에 platforms 가 미지정인 경우, undefined 로 지정됨', async () => {
        await service.getArtworks({}, false);

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({ platforms: undefined }),
        );
      });

      it('쿼리 파라미터에 platforms 가 빈 배열인 경우, undefined 로 지정됨', async () => {
        await service.getArtworks({ platforms: [] }, false);

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({ platforms: undefined }),
        );
      });
    });

    describe('장르 필터 검증', () => {
      it('쿼리 파라미터에 genreIds가 지정된 경우, 해당 값으로 지정됨', async () => {
        const genreIds = ['genre-1', 'genre-2'];

        await service.getArtworks({ genreIds }, false);

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({ genreIds }),
        );
      });

      it('쿼리 파라미터에 genreIds 가 미지정인 경우, undefined 로 지정됨', async () => {
        await service.getArtworks({}, false);

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({ genreIds: undefined }),
        );
      });

      it('쿼리 파라미터에 genreIds가 빈 배열인 경우, undefined로 지정됨', async () => {
        await service.getArtworks({ genreIds: [] }, false);

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({ genreIds: undefined }),
        );
      });
    });

    describe('검색어 필터 검증', () => {
      it('쿼리 파라미터에 search 가 지정된 경우, 해당 값으로 지정됨', async () => {
        await service.getArtworks({ search: '테스트' }, false);

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({ search: '테스트' }),
        );
      });

      it('쿼리 파라미터에 search 가 미지정인 경우, undefined 로 지정됨', async () => {
        await service.getArtworks({}, false);

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({ search: undefined }),
        );
      });
    });

    describe('상태 필터 검증', () => {
      it('인증된 사용자이면서 별도로 status 를 지정하지 않은 경우, 모든 상태로 필터됨', async () => {
        await service.getArtworks({}, true);

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({ isDraftIn: [true, false] }),
        );
      });

      it('인증된 사용자이면서 쿼리 파라미터에 status 를 지정한 경우, 해당 값으로 지정됨', async () => {
        await service.getArtworks({ status: [Status.DRAFT] }, true);

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({ isDraftIn: [true] }),
        );
      });

      it('인증되지 않은 사용자인 경우, 공개된 작품만 필터됨', async () => {
        await service.getArtworks({}, false);

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({ isDraftIn: [false] }),
        );
      });
    });
  });

  describe('createArtwork', () => {
    const createOneMock = vi.fn();
    const findByMock = vi.fn();

    const dto: CreateArtworkDto = {
      title: '테스트 작품',
      imageKey: 'artworks/2024/03/abc123def456',
      playedOn: Platform.STEAM,
      genreIds: ['genre-1'],
    };

    beforeEach(() => {
      createOneMock.mockClear();
      findByMock.mockClear();

      artworksRepository.createOne = createOneMock;
      genresRepository.findBy = findByMock;
    });

    it('작품 데이터를 기반으로 새로운 작품을 생성함', async () => {
      const mockGenres = [
        {
          id: 'genre-1',
          translations: [
            { language: 'ko', name: '롤플레잉' },
            { language: 'en', name: 'RPG' },
            { language: 'ja', name: 'ロールプレイング' },
          ],
        },
      ];

      const expectedArtwork = {
        id: 'artwork-1',
        title: dto.title,
        imageKey: dto.imageKey,
        playedOn: dto.playedOn,
        genres: mockGenres,
      };

      findByMock.mockResolvedValue(mockGenres);
      createOneMock.mockResolvedValue(expectedArtwork);

      const result = await service.createArtwork(dto);

      expect(findByMock).toHaveBeenCalledWith({ id: In(['genre-1']) });
      expect(createOneMock).toHaveBeenCalled();
      expect(result).toEqual(expectedArtwork);
    });

    it('존재하지 않는 장르 ID가 포함된 경우, 에러가 발생', async () => {
      findByMock.mockResolvedValue([]);

      await expect(service.createArtwork(dto)).rejects.toThrowError(
        ArtworkException,
      );
    });

    it('작품 생성에 실패할 경우, 에러가 발생', async () => {
      findByMock.mockResolvedValue([{ id: 'genre-1' }]);
      createOneMock.mockRejectedValue(new Error());

      await expect(service.createArtwork(dto)).rejects.toThrowError();
    });
  });
});
