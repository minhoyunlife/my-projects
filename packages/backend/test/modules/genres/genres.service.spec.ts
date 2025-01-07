import { TestingModule } from '@nestjs/testing';

import { EntityManager } from 'typeorm';

import { GenresController } from '@/src/modules/genres/genres.controller';
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
          expect.objectContaining({ pageSize: GenresController.PAGE_SIZE }),
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
});
