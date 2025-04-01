import { TestingModule } from '@nestjs/testing';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { CreateGenreDto } from '@/src/modules/genres/dtos/create-genre.dto';
import { UpdateGenreDto } from '@/src/modules/genres/dtos/update-genre.dto';
import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';
import {
  GenreErrorCode,
  GenreException,
} from '@/src/modules/genres/exceptions/genres.exception';
import { GenresMapper } from '@/src/modules/genres/genres.mapper';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { GenresService } from '@/src/modules/genres/genres.service';
import { GenresValidator } from '@/src/modules/genres/genres.validator';
import { TransactionService } from '@/src/modules/transaction/transaction.service';
import { createTestingModuleWithoutDB } from '@/test/utils/module-builder.util';

describeWithoutDeps('GenresService', () => {
  let service: GenresService;
  let genresRepository: Partial<GenresRepository>;
  let genresValidator: Partial<GenresValidator>;
  let transactionService: Partial<TransactionService>;

  beforeEach(async () => {
    genresRepository = {
      getAllWithFilters: vi.fn(),
      findByName: vi.fn(),
      findOneWithDetails: vi.fn(),
      findManyWithDetails: vi.fn(),
      findDuplicateNameOfGenres: vi.fn(),
      createOne: vi.fn(),
      updateOne: vi.fn(),
      deleteMany: vi.fn(),
      withTransaction: vi.fn(),
    };

    genresValidator = {
      assertAtLeastOneTranslationNameExist: vi.fn(),
      assertTranslationsExist: vi.fn(),
      assertGenreExist: vi.fn(),
      assertAllGenresExist: vi.fn(),
      assertGenresNotInUse: vi.fn(),
      assertDuplicatesNotExist: vi.fn(),
    };

    transactionService = {
      executeInTransaction: vi.fn((callback) => callback(genresRepository)),
    };

    (genresRepository.withTransaction as any).mockImplementation(
      () => genresRepository,
    );

    const module: TestingModule = await createTestingModuleWithoutDB({
      providers: [
        GenresService,
        {
          provide: GenresRepository,
          useValue: genresRepository,
        },
        {
          provide: TransactionService,
          useValue: transactionService,
        },
        {
          provide: GenresValidator,
          useValue: genresValidator,
        },
        GenresMapper,
      ],
    });

    service = module.get<GenresService>(GenresService);
  });

  describe('getGenres', () => {
    beforeEach(() => {
      (genresRepository.getAllWithFilters as any).mockResolvedValue([[], 0]);
    });

    describe('페이지 번호 검증', () => {
      it('쿼리 파라미터에 page 가 지정된 경우, 해당 값으로 지정됨', async () => {
        await service.getGenres({ page: 2 });

        expect(genresRepository.getAllWithFilters).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 2,
          }),
        );
      });

      it('쿼리 파라미터에 page 가 미지정인 경우, 1 로 고정됨', async () => {
        await service.getGenres({});

        expect(genresRepository.getAllWithFilters).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 1,
          }),
        );
      });
    });

    describe('페이지 당 표시 장르 수 검증', () => {
      it('컨트롤러에 정의된 페이지 수로 고정됨', async () => {
        await service.getGenres({});

        expect(genresRepository.getAllWithFilters).toHaveBeenCalledWith(
          expect.objectContaining({ pageSize: PAGE_SIZE.CMS }),
        );
      });
    });

    describe('검색어 필터 검증', () => {
      it('쿼리 파라미터에 search 가 지정된 경우, 해당 값으로 지정됨', async () => {
        await service.getGenres({ search: '테스트' });

        expect(genresRepository.getAllWithFilters).toHaveBeenCalledWith(
          expect.objectContaining({ search: '테스트' }),
        );
      });

      it('쿼리 파라미터에 search 가 미지정인 경우, undefined 로 지정됨', async () => {
        await service.getGenres({});

        expect(genresRepository.getAllWithFilters).toHaveBeenCalledWith(
          expect.objectContaining({ search: undefined }),
        );
      });
    });
  });

  describe('getGenresByName', () => {
    beforeEach(() => {
      (genresRepository.findByName as any).mockResolvedValue([]);
    });

    it('검색어를 바탕으로 장르를 조회함', async () => {
      await service.getGenresByName({ search: '테스트' });

      expect(genresRepository.findByName).toHaveBeenCalledWith('테스트');
    });
  });

  describe('createGenre', () => {
    const createGenreDto: CreateGenreDto = {
      koName: '액션',
      enName: 'Action',
      jaName: 'アクション',
    };

    const mockGenre: Partial<Genre> = {
      id: 'genre-1',
      translations: [
        { language: Language.KO, name: '액션' },
        { language: Language.EN, name: 'Action' },
        { language: Language.JA, name: 'アクション' },
      ] as GenreTranslation[],
    };

    beforeEach(() => {
      (genresRepository.createOne as any).mockResolvedValue(mockGenre);
      (genresRepository.findDuplicateNameOfGenres as any).mockResolvedValue([]);
    });

    it('장르가 성공적으로 생성됨', async () => {
      const result = await service.createGenre(createGenreDto);

      expect(genresValidator.assertTranslationsExist).toHaveBeenCalled();
      expect(genresRepository.findDuplicateNameOfGenres).toHaveBeenCalled();
      expect(genresValidator.assertDuplicatesNotExist).toHaveBeenCalled();
      expect(genresRepository.createOne).toHaveBeenCalledWith(
        expect.objectContaining({
          translations: expect.arrayContaining([
            expect.objectContaining({ language: Language.KO, name: '액션' }),
            expect.objectContaining({ language: Language.EN, name: 'Action' }),
            expect.objectContaining({
              language: Language.JA,
              name: 'アクション',
            }),
          ]),
        }),
      );
      expect(result).toEqual(mockGenre);
    });

    it('중복 이름이 있으면 검증 에러가 발생함', async () => {
      const duplicates = [{ id: 'existing-genre' }];
      (genresRepository.findDuplicateNameOfGenres as any).mockResolvedValue(
        duplicates,
      );

      const error = new GenreException(
        GenreErrorCode.DUPLICATE_NAME,
        "Some of the provided genre's names are duplicated",
      );
      (genresValidator.assertDuplicatesNotExist as any).mockImplementation(
        () => {
          throw error;
        },
      );

      await expect(service.createGenre(createGenreDto)).rejects.toThrow(error);
      expect(genresRepository.createOne).not.toHaveBeenCalled();
    });
  });

  describe('updateGenre', () => {
    const updateGenreDto: UpdateGenreDto = {
      koName: '롤플레잉',
    };

    const mockGenre: Partial<Genre> = {
      id: 'genre-1',
      translations: [
        { language: Language.KO, name: '액션' },
        { language: Language.EN, name: 'Action' },
        { language: Language.JA, name: 'アクション' },
      ] as GenreTranslation[],
    };

    const updatedMockGenre: Partial<Genre> = {
      id: 'genre-1',
      translations: [
        { language: Language.KO, name: '롤플레잉' },
        { language: Language.EN, name: 'Action' },
        { language: Language.JA, name: 'アクション' },
      ] as GenreTranslation[],
    };

    beforeEach(() => {
      (genresRepository.findOneWithDetails as any).mockResolvedValue(mockGenre);
      (genresRepository.findDuplicateNameOfGenres as any).mockResolvedValue([]);
      (genresRepository.updateOne as any).mockResolvedValue(updatedMockGenre);
    });

    it('장르를 성공적으로 수정함', async () => {
      const result = await service.updateGenre('genre-1', updateGenreDto);

      expect(
        genresValidator.assertAtLeastOneTranslationNameExist,
      ).toHaveBeenCalledWith(updateGenreDto);
      expect(genresRepository.findOneWithDetails).toHaveBeenCalledWith(
        'genre-1',
      );
      expect(genresValidator.assertGenreExist).toHaveBeenCalledWith(mockGenre);
      expect(genresRepository.findDuplicateNameOfGenres).toHaveBeenCalled();
      expect(genresValidator.assertDuplicatesNotExist).toHaveBeenCalled();
      expect(genresRepository.updateOne).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'genre-1',
          translations: expect.arrayContaining([
            expect.objectContaining({
              language: Language.KO,
              name: '롤플레잉',
            }),
          ]),
        }),
        mockGenre,
      );
      expect(result).toEqual(updatedMockGenre);
    });

    it('장르가 존재하지 않으면 검증 에러가 발생함', async () => {
      (genresRepository.findOneWithDetails as any).mockResolvedValue(null);

      const error = new GenreException(
        GenreErrorCode.NOT_FOUND,
        'The genre with the provided ID does not exist',
      );
      (genresValidator.assertGenreExist as any).mockImplementation(() => {
        throw error;
      });

      await expect(
        service.updateGenre('non-existent', updateGenreDto),
      ).rejects.toThrow(error);
      expect(genresRepository.updateOne).not.toHaveBeenCalled();
    });

    it('수정할 번역 정보가 없으면 검증 에러가 발생함', async () => {
      const error = new GenreException(
        GenreErrorCode.NO_TRANSLATIONS_PROVIDED,
        'At least one translation must be provided',
      );
      (
        genresValidator.assertAtLeastOneTranslationNameExist as any
      ).mockImplementation(() => {
        throw error;
      });

      await expect(service.updateGenre('genre-1', {})).rejects.toThrow(error);
      expect(transactionService.executeInTransaction).not.toHaveBeenCalled();
    });
  });

  describe('deleteGenres', () => {
    const ids = ['genre-1', 'genre-2'];
    const mockGenres = [
      { id: 'genre-1', translations: [], artworks: [] },
      { id: 'genre-2', translations: [], artworks: [] },
    ];

    beforeEach(() => {
      (genresRepository.findManyWithDetails as any).mockResolvedValue(
        mockGenres,
      );
      (genresRepository.deleteMany as any).mockResolvedValue(undefined);
    });

    it('장르들을 성공적으로 삭제함', async () => {
      await service.deleteGenres(ids);

      expect(genresRepository.findManyWithDetails).toHaveBeenCalledWith(ids);
      expect(genresValidator.assertAllGenresExist).toHaveBeenCalledWith(
        mockGenres,
        ids,
      );
      expect(genresValidator.assertGenresNotInUse).toHaveBeenCalledWith(
        mockGenres,
      );
      expect(genresRepository.deleteMany).toHaveBeenCalledWith(mockGenres);
    });

    it('장르가 존재하지 않으면 검증 에러가 발생함', async () => {
      const error = new GenreException(
        GenreErrorCode.NOT_FOUND,
        'Some of the provided genres do not exist',
      );
      (genresValidator.assertAllGenresExist as any).mockImplementation(() => {
        throw error;
      });

      await expect(service.deleteGenres(ids)).rejects.toThrow(error);
      expect(genresRepository.deleteMany).not.toHaveBeenCalled();
    });

    it('장르가 아트워크에서 사용 중이면 검증 에러가 발생함', async () => {
      const error = new GenreException(
        GenreErrorCode.IN_USE,
        'Some of the genres are in use by artworks',
      );
      (genresValidator.assertGenresNotInUse as any).mockImplementation(() => {
        throw error;
      });

      await expect(service.deleteGenres(ids)).rejects.toThrow(error);
      expect(genresRepository.deleteMany).not.toHaveBeenCalled();
    });
  });
});
