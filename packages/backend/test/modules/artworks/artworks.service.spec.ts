import { TestingModule } from '@nestjs/testing';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { Language } from '@/src/common/enums/language.enum';
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
import { ArtworksValidator } from '@/src/modules/artworks/validators/artworks.validator';
import { StatusValidator } from '@/src/modules/artworks/validators/status.validator';
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
  let artworksValidator: Partial<ArtworksValidator>;
  let transactionService: Partial<TransactionService>;

  beforeEach(async () => {
    artworksRepository = {
      getAllWithFilters: vi.fn(),
      findOneWithDetails: vi.fn(),
      findManyWithDetails: vi.fn(),
      createOne: vi.fn(),
      updateOne: vi.fn(),
      updateManyStatuses: vi.fn(),
      deleteMany: vi.fn(),
      withTransaction: vi.fn(),
    };

    genresRepository = {
      findByIds: vi.fn(),
      withTransaction: vi.fn(),
    };

    storageService = {
      changeImageTag: vi.fn(),
    };

    statusValidator = {
      validateStatusChange: vi.fn(),
    };

    artworksValidator = {
      assertArtworkExists: vi.fn(),
      assertArtworkDraft: vi.fn(),
      assertAllProvidedArtworksExist: vi.fn(),
      assertAllArtworksDraft: vi.fn(),
      assertAllGenresExist: vi.fn(),
      assertAtLeastOneFieldProvided: vi.fn(),
      assertNoErrorsExist: vi.fn(),
    };

    transactionService = {
      executeInTransaction: vi.fn((callback) => callback(genresRepository)),
    };

    const module: TestingModule = await createTestingModuleWithoutDB({
      providers: [
        ArtworksService,
        {
          provide: ArtworksRepository,
          useValue: artworksRepository,
        },
        {
          provide: GenresRepository,
          useValue: genresRepository,
        },
        {
          provide: StorageService,
          useValue: storageService,
        },
        {
          provide: StatusValidator,
          useValue: statusValidator,
        },
        {
          provide: ArtworksValidator,
          useValue: artworksValidator,
        },
        {
          provide: TransactionService,
          useValue: transactionService,
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
      findOneWithDetails: vi.fn(),
      findManyWithDetails: vi.fn(),
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

      artworksValidator.assertAllGenresExist = vi.fn();
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
        isVertical: dto.isVertical,
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

      expect(findByIdsMock).toHaveBeenCalledWith(dto.genreIds);
      expect(createOneMock).toHaveBeenCalled();
      expect(result).toEqual(expectedArtwork);
    });

    it('존재하지 않는 장르 ID가 포함된 경우, 에러가 발생', async () => {
      findByIdsMock.mockResolvedValue([]);

      artworksValidator.assertAllGenresExist = vi
        .fn()
        .mockImplementation(() => {
          throw new ArtworkException(
            ArtworkErrorCode.NOT_EXISTING_GENRES_INCLUDED,
            '일부 장르 ID가 존재하지 않습니다',
          );
        });

      await expect(service.createArtwork(dto)).rejects.toThrow(
        ArtworkException,
      );
      expect(createOneMock).not.toHaveBeenCalled();
    });

    it('작품 생성에 실패할 경우, 에러가 발생', async () => {
      const mockGenres = [{ id: 'genre-1' }];
      findByIdsMock.mockResolvedValue(mockGenres);
      createOneMock.mockRejectedValue(new Error('Database error'));

      await expect(service.createArtwork(dto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('updateArtwork', () => {
    const updateOneMock = vi.fn();
    const findByIdsMock = vi.fn();
    const findOneWithDetailsMock = vi.fn();
    const txRepoMock = {
      updateOne: updateOneMock,
      findOneWithDetails: findOneWithDetailsMock,
      findManyWithDetails: vi.fn(),
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
      findOneWithDetailsMock.mockClear();

      artworksRepository.withTransaction = vi.fn().mockReturnValue(txRepoMock);
      genresRepository.withTransaction = vi
        .fn()
        .mockReturnValue(genresTxRepoMock);
      artworksValidator.assertArtworkExists = vi.fn();
      artworksValidator.assertArtworkDraft = vi.fn();
      artworksValidator.assertAllGenresExist = vi.fn();
      artworksValidator.assertAtLeastOneFieldProvided = vi.fn();
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

      const existingArtwork = {
        id: 'artwork-1',
        isDraft: true,
        isVertical: true,
      };

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

      findOneWithDetailsMock.mockResolvedValue(existingArtwork);
      findByIdsMock.mockResolvedValue(mockGenres);
      updateOneMock.mockResolvedValue(expectedArtwork);

      const result = await service.updateArtwork('artwork-1', baseDto);

      expect(findOneWithDetailsMock).toHaveBeenCalledWith('artwork-1');
      expect(artworksValidator.assertArtworkExists).toHaveBeenCalledWith(
        existingArtwork,
      );
      expect(artworksValidator.assertArtworkDraft).toHaveBeenCalledWith(
        existingArtwork,
      );
      expect(findByIdsMock).toHaveBeenCalledWith(baseDto.genreIds);
      expect(artworksValidator.assertAllGenresExist).toHaveBeenCalledWith(
        mockGenres,
        baseDto.genreIds,
      );
      expect(updateOneMock).toHaveBeenCalled();
      expect(result).toEqual(expectedArtwork);
    });

    it('빈 DTO로 요청 시 에러가 발생함', async () => {
      artworksValidator.assertAtLeastOneFieldProvided = vi
        .fn()
        .mockImplementation(() => {
          throw new ArtworkException(
            ArtworkErrorCode.NO_DATA_PROVIDED,
            '최소 하나의 필드가 제공되어야 합니다',
          );
        });

      await expect(service.updateArtwork('artwork-1', {})).rejects.toThrow(
        ArtworkException,
      );
      expect(updateOneMock).not.toHaveBeenCalled();
    });

    it('존재하지 않는 장르 ID가 포함된 경우 에러가 발생함', async () => {
      const existingArtwork = { id: 'artwork-1', isDraft: true };
      findOneWithDetailsMock.mockResolvedValue(existingArtwork);
      findByIdsMock.mockResolvedValue([]);

      artworksValidator.assertAllGenresExist = vi
        .fn()
        .mockImplementation(() => {
          throw new ArtworkException(
            ArtworkErrorCode.NOT_EXISTING_GENRES_INCLUDED,
            '일부 장르 ID가 존재하지 않습니다',
          );
        });

      await expect(service.updateArtwork('artwork-1', baseDto)).rejects.toThrow(
        ArtworkException,
      );
      expect(updateOneMock).not.toHaveBeenCalled();
    });

    it('일부 필드만 수정할 경우 해당 필드만 포함하여 요청함', async () => {
      const partialDto: UpdateArtworkDto = {
        koTitle: '수정된 제목',
      };

      const existingArtwork = { id: 'artwork-1', isDraft: true };
      const expectedArtwork = {
        id: 'artwork-1',
        translations: [
          {
            language: Language.KO,
            title: partialDto.koTitle,
          },
        ],
      };

      findOneWithDetailsMock.mockResolvedValue(existingArtwork);
      updateOneMock.mockResolvedValue(expectedArtwork);

      await service.updateArtwork('artwork-1', partialDto);

      expect(findByIdsMock).not.toHaveBeenCalled();
      expect(updateOneMock).toHaveBeenCalled();
    });
  });

  describe('updateStatuses', () => {
    const findManyWithDetailsMock = vi.fn();
    const updateManyStatusesMock = vi.fn();
    const validateStatusChangeMock = vi.fn();

    beforeEach(() => {
      findManyWithDetailsMock.mockClear();
      updateManyStatusesMock.mockClear();
      validateStatusChangeMock.mockClear();

      artworksRepository.findManyWithDetails = findManyWithDetailsMock;
      artworksRepository.updateManyStatuses = updateManyStatusesMock;
      statusValidator.validateStatusChange = validateStatusChangeMock;
      artworksValidator.assertNoErrorsExist = vi.fn();
    });

    describe('비공개에서 공개로 상태 변경', () => {
      it('모든 검증을 통과한 경우 성공적으로 상태가 변경됨', async () => {
        const artworks = [
          { id: 'artwork-1', isDraft: true },
          { id: 'artwork-2', isDraft: true },
        ];
        findManyWithDetailsMock.mockResolvedValue(artworks);
        validateStatusChangeMock.mockReturnValue({
          idsToUpdate: ['artwork-1', 'artwork-2'],
          errors: {},
        });

        await service.updateStatuses(['artwork-1', 'artwork-2'], true);

        expect(validateStatusChangeMock).toHaveBeenCalledWith(
          ['artwork-1', 'artwork-2'],
          artworks,
          true,
        );
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
        validateStatusChangeMock.mockReturnValue({
          idsToUpdate: ['artwork-1'],
          errors: {
            [StatusError.FIELD_REQUIRED]: ['artwork-2|createdAt'],
          },
        });

        artworksValidator.assertNoErrorsExist = vi
          .fn()
          .mockImplementation((errors) => {
            if (Object.keys(errors).length > 0) {
              throw new ArtworkException(
                ArtworkErrorCode.SOME_FAILED,
                '상태 변경 검증에 실패했습니다',
              );
            }
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
        validateStatusChangeMock.mockReturnValue({
          idsToUpdate: ['artwork-1', 'artwork-2'],
          errors: {},
        });

        await service.updateStatuses(['artwork-1', 'artwork-2'], false);

        expect(validateStatusChangeMock).toHaveBeenCalledWith(
          ['artwork-1', 'artwork-2'],
          artworks,
          false,
        );
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
        validateStatusChangeMock.mockReturnValue({
          idsToUpdate: ['artwork-1'],
          errors: {
            [StatusError.NOT_FOUND]: ['non-existent|id'],
          },
        });

        artworksValidator.assertNoErrorsExist = vi
          .fn()
          .mockImplementation((errors) => {
            if (Object.keys(errors).length > 0) {
              throw new ArtworkException(
                ArtworkErrorCode.SOME_FAILED,
                '상태 변경 검증에 실패했습니다',
              );
            }
          });

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
        validateStatusChangeMock.mockReturnValue({
          idsToUpdate: ['artwork-2'],
          errors: {},
        });

        await service.updateStatuses(['artwork-1', 'artwork-2'], true);

        expect(updateManyStatusesMock).toHaveBeenCalledWith(
          ['artwork-2'],
          true,
        );
      });
    });
  });

  describe('deleteArtworks', () => {
    const deleteManyMock = vi.fn();
    const findManyWithDetailsMock = vi.fn();
    const changeImageTagMock = vi.fn();

    beforeEach(() => {
      deleteManyMock.mockClear();
      findManyWithDetailsMock.mockClear();
      changeImageTagMock.mockClear();

      const txRepoMock = {
        deleteMany: deleteManyMock,
        findManyWithDetails: findManyWithDetailsMock,
      };

      artworksRepository.withTransaction = vi.fn().mockReturnValue(txRepoMock);
      storageService.changeImageTag = changeImageTagMock;
      artworksValidator.assertAllProvidedArtworksExist = vi.fn();
      artworksValidator.assertAllArtworksDraft = vi.fn();
    });

    it('작품 삭제 및 이미지 태그 변경이 성공적으로 수행됨', async () => {
      const mockArtworks = [
        { id: 'artwork-1', imageKey: 'key1', isDraft: true },
        { id: 'artwork-2', imageKey: 'key2', isDraft: true },
      ];
      findManyWithDetailsMock.mockResolvedValue(mockArtworks);
      deleteManyMock.mockResolvedValue(mockArtworks);
      changeImageTagMock.mockResolvedValue(undefined);

      await service.deleteArtworks(['artwork-1', 'artwork-2']);

      expect(findManyWithDetailsMock).toHaveBeenCalledWith([
        'artwork-1',
        'artwork-2',
      ]);
      expect(
        artworksValidator.assertAllProvidedArtworksExist,
      ).toHaveBeenCalledWith(mockArtworks, ['artwork-1', 'artwork-2']);
      expect(artworksValidator.assertAllArtworksDraft).toHaveBeenCalledWith(
        mockArtworks,
      );
      expect(deleteManyMock).toHaveBeenCalledWith(mockArtworks);
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
      findManyWithDetailsMock.mockResolvedValue([{ id: 'artwork-1' }]);

      artworksValidator.assertAllArtworksDraft = vi
        .fn()
        .mockImplementation(() => {
          throw new ArtworkException(
            ArtworkErrorCode.ALREADY_PUBLISHED,
            '모든 작품이 비공개 상태여야 합니다',
          );
        });

      await expect(service.deleteArtworks(['artwork-1'])).rejects.toThrow(
        ArtworkException,
      );
      expect(deleteManyMock).not.toHaveBeenCalled();
      expect(changeImageTagMock).not.toHaveBeenCalled();
    });
  });
});
