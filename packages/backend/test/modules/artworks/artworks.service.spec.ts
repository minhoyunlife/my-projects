import { TestingModule } from '@nestjs/testing';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { ArtworksMapper } from '@/src/modules/artworks/artworks.mapper';
import { ArtworksRepository } from '@/src/modules/artworks/artworks.repository';
import { ArtworksService } from '@/src/modules/artworks/artworks.service';
import { CreateArtworkDto } from '@/src/modules/artworks/dtos/create-artwork.dto';
import { UpdateArtworkDto } from '@/src/modules/artworks/dtos/update-artwork.dto';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { Sort } from '@/src/modules/artworks/enums/sort-type.enum';
import { StatusError } from '@/src/modules/artworks/enums/status-error.enum';
import { Status } from '@/src/modules/artworks/enums/status.enum';
import {
  ArtworkErrorCode,
  ArtworkException,
} from '@/src/modules/artworks/exceptions/artworks.exception';
import { StatusValidator } from '@/src/modules/artworks/validators/artwork-status.validator';
import { Language } from '@/src/modules/genres/enums/language.enum';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { ImageStatus } from '@/src/modules/storage/enums/status.enum';
import { StorageService } from '@/src/modules/storage/storage.service';
import { TransactionService } from '@/src/modules/transaction/transaction.service';
import { createTestingModuleWithoutDB } from '@/test/utils/module-builder.util';

describeWithoutDeps('ArtworksService', () => {
  let service: ArtworksService;
  let artworksRepository: Partial<ArtworksRepository>;
  let genresRepository: Partial<GenresRepository>;
  let storageService: Partial<StorageService>;
  let statusValidator: Partial<StatusValidator>;

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
          provide: StorageService,
          useValue: { changeImageTag: vi.fn() },
        },
        {
          provide: StatusValidator,
          useValue: {
            validate: vi.fn(),
            formatErrors: vi.fn(),
          },
        },
        {
          provide: TransactionService,
          useValue: {
            executeInTransaction: vi.fn((cb) => cb()),
          },
        },
        ArtworksMapper,
      ],
    });

    service = module.get<ArtworksService>(ArtworksService);
    artworksRepository = module.get<ArtworksRepository>(ArtworksRepository);
    genresRepository = module.get<GenresRepository>(GenresRepository);
    storageService = module.get<StorageService>(StorageService);
    statusValidator = module.get<StatusValidator>(StatusValidator);
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
        await service.getArtworks({ sort: Sort.RATING_ASC }, false);

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({ sort: Sort.RATING_ASC }),
        );
      });

      it('쿼리 파라미터에 sort 가 미지정인 경우, 작성일자 기준 최신순으로 정렬됨', async () => {
        await service.getArtworks({}, false);

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({ sort: Sort.CREATED_DESC }),
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
    const findByIdsMock = vi.fn();
    const txRepoMock = {
      createOne: createOneMock,
    };
    const genresTxRepoMock = {
      findByIds: findByIdsMock,
    };

    const dto: CreateArtworkDto = {
      imageKey: 'artworks/2024/03/abc123def456',
      isVertical: true,
      playedOn: Platform.STEAM,
      genreIds: ['genre-1'],
      koTitle: '테스트 작품',
      koShortReview: '한국어 리뷰입니다',
      enTitle: 'Test Artwork',
      enShortReview: 'This is English review',
      jaTitle: 'テスト作品',
      jaShortReview: '日本語レビューです',
    };

    beforeEach(() => {
      createOneMock.mockClear();
      findByIdsMock.mockClear();

      artworksRepository.withTransaction = vi.fn().mockReturnValue(txRepoMock);
      genresRepository.withTransaction = vi
        .fn()
        .mockReturnValue(genresTxRepoMock);
    });

    it('작품 데이터를 기반으로 새로운 작품을 생성함', async () => {
      const mockGenres = [
        {
          id: 'genre-1',
          translations: [
            { language: Language.KO, name: '롤플레잉' },
            { language: Language.EN, name: 'RPG' },
            { language: Language.JA, name: 'ロールプレイング' },
          ],
        },
      ];

      const expectedArtwork = {
        id: 'artwork-1',
        imageKey: dto.imageKey,
        playedOn: dto.playedOn,
        genres: mockGenres,
        translations: [
          {
            language: Language.KO,
            title: dto.koTitle,
            shortReview: dto.koShortReview,
          },
          {
            language: Language.EN,
            title: dto.enTitle,
            shortReview: dto.enShortReview,
          },
          {
            language: Language.JA,
            title: dto.jaTitle,
            shortReview: dto.jaShortReview,
          },
        ],
      };

      findByIdsMock.mockResolvedValue(mockGenres);
      createOneMock.mockResolvedValue(expectedArtwork);

      const result = await service.createArtwork(dto);

      expect(createOneMock).toHaveBeenCalled();
      expect(result).toEqual(expectedArtwork);
    });

    it('존재하지 않는 장르 ID가 포함된 경우, 에러가 발생', async () => {
      findByIdsMock.mockResolvedValue([]);

      await expect(service.createArtwork(dto)).rejects.toThrowError(
        ArtworkException,
      );
    });

    it('작품 생성에 실패할 경우, 에러가 발생', async () => {
      findByIdsMock.mockResolvedValue([{ id: 'genre-1' }]);
      createOneMock.mockRejectedValue(new Error());

      await expect(service.createArtwork(dto)).rejects.toThrowError();
    });
  });

  describe('updateArtwork', () => {
    const updateOneMock = vi.fn();
    const findByIdsMock = vi.fn();
    const txRepoMock = {
      updateOne: updateOneMock,
    };
    const genresTxRepoMock = {
      findByIds: findByIdsMock,
    };

    const baseDto: UpdateArtworkDto = {
      koTitle: '수정된 제목',
      koShortReview: '수정된 리뷰',
      playedOn: Platform.STEAM,
      rating: 15,
      genreIds: ['genre-1'],
    };

    beforeEach(() => {
      updateOneMock.mockClear();
      findByIdsMock.mockClear();

      artworksRepository.withTransaction = vi.fn().mockReturnValue(txRepoMock);
      genresRepository.withTransaction = vi
        .fn()
        .mockReturnValue(genresTxRepoMock);
    });

    it('작품 데이터가 성공적으로 수정됨', async () => {
      const mockGenres = [
        {
          id: 'genre-1',
          translations: [
            { language: Language.KO, name: '액션' },
            { language: Language.EN, name: 'Action' },
            { language: Language.JA, name: 'アクション' },
          ],
        },
      ];

      const expectedArtwork = {
        id: 'artwork-1',
        playedOn: baseDto.playedOn,
        rating: baseDto.rating,
        genres: mockGenres,
        translations: [
          {
            language: Language.KO,
            title: baseDto.koTitle,
            shortReview: baseDto.koShortReview,
          },
        ],
      };

      findByIdsMock.mockResolvedValue(mockGenres);
      updateOneMock.mockResolvedValue(expectedArtwork);

      const result = await service.updateArtwork('artwork-1', baseDto);

      expect(findByIdsMock).toHaveBeenCalledWith(baseDto.genreIds);
      expect(updateOneMock).toHaveBeenCalledWith({
        id: 'artwork-1',
        playedOn: baseDto.playedOn,
        rating: baseDto.rating,
        genres: mockGenres,
        translations: expect.arrayContaining([
          expect.objectContaining({
            language: Language.KO,
            title: baseDto.koTitle,
            shortReview: baseDto.koShortReview,
          }),
        ]),
      });
      expect(result).toEqual(expectedArtwork);
    });

    it('빈 DTO로 요청 시 에러가 발생함', async () => {
      await expect(service.updateArtwork('artwork-1', {})).rejects.toThrow(
        ArtworkException,
      );

      expect(updateOneMock).not.toHaveBeenCalled();
    });

    it('존재하지 않는 장르 ID가 포함된 경우 에러가 발생함', async () => {
      findByIdsMock.mockResolvedValue([]);

      await expect(service.updateArtwork('artwork-1', baseDto)).rejects.toThrow(
        ArtworkException,
      );

      expect(updateOneMock).not.toHaveBeenCalled();
    });

    it('일부 필드만 수정할 경우 해당 필드만 포함하여 요청함', async () => {
      const partialDto: UpdateArtworkDto = {
        koTitle: '수정된 제목',
      };

      const expectedArtwork = {
        id: 'artwork-1',
        translations: [
          {
            language: Language.KO,
            title: partialDto.koTitle,
          },
        ],
      };

      updateOneMock.mockResolvedValue(expectedArtwork);

      await service.updateArtwork('artwork-1', partialDto);

      expect(findByIdsMock).not.toHaveBeenCalled();
      expect(updateOneMock).toHaveBeenCalledWith({
        id: 'artwork-1',
        translations: expect.arrayContaining([
          expect.objectContaining({
            language: Language.KO,
            title: partialDto.koTitle,
          }),
        ]),
      });
    });
  });

  describe('updateStatuses', () => {
    const findManyWithDetailsMock = vi.fn();
    const updateManyStatusesMock = vi.fn();
    const validateMock = vi.fn();
    const formatErrorsMock = vi.fn();

    beforeEach(() => {
      findManyWithDetailsMock.mockClear();
      updateManyStatusesMock.mockClear();
      validateMock.mockClear();
      formatErrorsMock.mockClear();

      artworksRepository.findManyWithDetails = findManyWithDetailsMock;
      artworksRepository.updateManyStatuses = updateManyStatusesMock;
      statusValidator.validate = validateMock;
      statusValidator.formatErrors = formatErrorsMock;
    });

    describe('비공개에서 공개로 상태 변경', () => {
      it('모든 검증을 통과한 경우 성공적으로 상태가 변경됨', async () => {
        const artworks = [
          { id: 'artwork-1', isDraft: true },
          { id: 'artwork-2', isDraft: true },
        ];
        findManyWithDetailsMock.mockResolvedValue(artworks);
        validateMock.mockReturnValue([]);

        await service.updateStatuses(['artwork-1', 'artwork-2'], true);

        expect(updateManyStatusesMock).toHaveBeenCalledWith(
          ['artwork-1', 'artwork-2'],
          true,
        );
      });

      it('일부 작품이 검증에 실패한 경우, 검증 통과한 작품만 상태가 변경됨', async () => {
        const artworks = [
          { id: 'artwork-1', isDraft: true },
          { id: 'artwork-2', isDraft: true },
        ];
        findManyWithDetailsMock.mockResolvedValue(artworks);
        validateMock
          .mockReturnValueOnce([])
          .mockReturnValueOnce([
            { code: StatusError.FIELD_REQUIRED, field: 'createdAt' },
          ]);

        formatErrorsMock.mockReturnValue({
          [StatusError.FIELD_REQUIRED]: ['artwork-2|createdAt'],
        });

        await expect(
          service.updateStatuses(['artwork-1', 'artwork-2'], true),
        ).rejects.toThrow(ArtworkException);

        expect(updateManyStatusesMock).toHaveBeenCalledWith(
          ['artwork-1'],
          true,
        );
      });
    });

    describe('공개에서 비공개로 상태 변경', () => {
      it('검증 없이 성공적으로 상태가 변경됨', async () => {
        const artworks = [
          { id: 'artwork-1', isDraft: false },
          { id: 'artwork-2', isDraft: false },
        ];
        findManyWithDetailsMock.mockResolvedValue(artworks);

        await service.updateStatuses(['artwork-1', 'artwork-2'], false);

        expect(validateMock).not.toHaveBeenCalled();
        expect(updateManyStatusesMock).toHaveBeenCalledWith(
          ['artwork-1', 'artwork-2'],
          false,
        );
      });
    });

    describe('에러 케이스', () => {
      it('존재하지 않는 작품이 포함된 경우, 해당 작품은 에러가 발생하고 나머지는 성공함', async () => {
        findManyWithDetailsMock.mockResolvedValue([
          { id: 'artwork-1', isDraft: true },
        ]);

        await expect(
          service.updateStatuses(['artwork-1', 'non-existent'], true),
        ).rejects.toThrow(ArtworkException);

        expect(updateManyStatusesMock).toHaveBeenCalledWith(
          ['artwork-1'],
          true,
        );
      });

      it('이미 원하는 상태인 작품은 업데이트되지 않음', async () => {
        const artworks = [
          { id: 'artwork-1', isDraft: false }, // 이미 공개 상태
          { id: 'artwork-2', isDraft: true }, // 비공개 상태
        ];
        findManyWithDetailsMock.mockResolvedValue(artworks);
        validateMock.mockReturnValue([]);

        await service.updateStatuses(['artwork-1', 'artwork-2'], true);

        expect(updateManyStatusesMock).toHaveBeenCalledWith(
          ['artwork-2'],
          true,
        );
      });

      it('DB 업데이트 실패 시 에러가 발생함', async () => {
        const artworks = [{ id: 'artwork-1', isDraft: true }];
        findManyWithDetailsMock.mockResolvedValue(artworks);
        validateMock.mockReturnValue([]);
        updateManyStatusesMock.mockRejectedValue(new Error());

        await expect(
          service.updateStatuses(['artwork-1'], true),
        ).rejects.toThrow(ArtworkException);
      });
    });
  });

  describe('deleteArtworks', () => {
    const deleteManyMock = vi.fn();
    const changeImageTagMock = vi.fn();

    beforeEach(() => {
      deleteManyMock.mockClear();
      changeImageTagMock.mockClear();

      artworksRepository.withTransaction = vi.fn().mockReturnValue({
        deleteMany: deleteManyMock,
      });
      storageService.changeImageTag = changeImageTagMock;
    });

    it('작품 삭제 및 이미지 태그 변경이 성공적으로 수행됨', async () => {
      const mockDeletedArtworks = [
        { id: 'artwork-1', imageKey: 'key1' },
        { id: 'artwork-2', imageKey: 'key2' },
      ];
      deleteManyMock.mockResolvedValue(mockDeletedArtworks);
      changeImageTagMock.mockResolvedValue(undefined);

      await service.deleteArtworks(['artwork-1', 'artwork-2']);

      expect(deleteManyMock).toHaveBeenCalledWith(['artwork-1', 'artwork-2']);
      expect(changeImageTagMock).toHaveBeenCalledTimes(2);
      expect(changeImageTagMock).toHaveBeenCalledWith(
        'key1',
        ImageStatus.TO_DELETE,
      );
      expect(changeImageTagMock).toHaveBeenCalledWith(
        'key2',
        ImageStatus.TO_DELETE,
      );
    });

    it('작품 삭제 실패 시 에러가 발생함', async () => {
      deleteManyMock.mockRejectedValue(
        new ArtworkException(
          ArtworkErrorCode.NOT_FOUND,
          'Some artworks not found',
        ),
      );

      await expect(service.deleteArtworks(['artwork-1'])).rejects.toThrow(
        ArtworkException,
      );

      expect(changeImageTagMock).not.toHaveBeenCalled();
    });
  });
});
