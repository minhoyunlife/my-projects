import { TestingModule } from '@nestjs/testing';

import { EntityManager } from 'typeorm';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { CreateGenreDto } from '@/src/modules/genres/dtos/create-genre.dto';
import { Language } from '@/src/modules/genres/enums/language.enum';
import {
  GenreErrorCode,
  GenreException,
} from '@/src/modules/genres/exceptions/genres.exception';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { GenresService } from '@/src/modules/genres/genres.service';
import { createTestingModuleWithoutDB } from '@/test/utils/module-builder.util';

describeWithoutDeps('GenresService', () => {
  let service: GenresService;
  let genresRepository: Partial<GenresRepository>;
  let entityManager: EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModuleWithoutDB({
      providers: [
        GenresService,
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

    service = module.get<GenresService>(GenresService);
    genresRepository = module.get<GenresRepository>(GenresRepository);
    entityManager = module.get<EntityManager>(EntityManager);
  });

  describe('getGenres', () => {
    const getAllWithFiltersMock = vi.fn();

    beforeEach(() => {
      getAllWithFiltersMock.mockClear();

      genresRepository.getAllWithFilters = getAllWithFiltersMock;
      getAllWithFiltersMock.mockResolvedValue([[], 0]);
    });

    describe('페이지 번호 검증', () => {
      it('쿼리 파라미터에 page 가 지정된 경우, 해당 값으로 지정됨', async () => {
        await service.getGenres({ page: 2 });

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 2,
          }),
        );
      });

      it('쿼리 파라미터에 page 가 미지정인 경우, 1 로 고정됨', async () => {
        await service.getGenres({});

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 1,
          }),
        );
      });
    });

    describe('페이지 당 표시 장르 수 검증', () => {
      it('컨트롤러에 정의된 페이지 수로 고정됨', async () => {
        await service.getGenres({});

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({ pageSize: PAGE_SIZE.CMS }),
        );
      });
    });

    describe('검색어 필터 검증', () => {
      it('쿼리 파라미터에 search 가 지정된 경우, 해당 값으로 지정됨', async () => {
        await service.getGenres({ search: '테스트' });

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({ search: '테스트' }),
        );
      });

      it('쿼리 파라미터에 search 가 미지정인 경우, undefined 로 지정됨', async () => {
        await service.getGenres({});

        expect(getAllWithFiltersMock).toHaveBeenCalledWith(
          expect.objectContaining({ search: undefined }),
        );
      });
    });
  });

  describe('createGenre', () => {
    const createOneMock = vi.fn();

    const createGenreDto: CreateGenreDto = {
      koName: '액션',
      enName: 'Action',
      jaName: 'アクション',
    };

    beforeEach(() => {
      createOneMock.mockClear();

      genresRepository.forTransaction = vi.fn().mockReturnThis();
      genresRepository.createOne = createOneMock;
    });

    it('장르가 성공적으로 생성됨', async () => {
      const expectedGenre = {
        id: 'genre-1',
        translations: [
          { language: Language.KO, name: '액션' },
          { language: Language.EN, name: 'Action' },
          { language: Language.JA, name: 'アクション' },
        ],
      };

      createOneMock.mockResolvedValue(expectedGenre);

      const result = await service.createGenre(createGenreDto);

      expect(createOneMock).toHaveBeenCalledWith({
        translations: [
          { language: Language.KO, name: '액션' },
          { language: Language.EN, name: 'Action' },
          { language: Language.JA, name: 'アクション' },
        ],
      });
      expect(result).toEqual(expectedGenre);
    });

    it('리포지토리에서 에러가 발생하면 그대로 전파됨', async () => {
      const error = new GenreException(
        GenreErrorCode.DUPLICATE_NAME,
        'Duplicate name error',
      );
      createOneMock.mockRejectedValue(error);

      await expect(service.createGenre(createGenreDto)).rejects.toThrowError(
        error,
      );
    });
  });
});
