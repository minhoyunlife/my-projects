import { TestingModule } from '@nestjs/testing';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { Language } from '@/src/modules/genres/enums/language.enum';
import { CreateSeriesDto } from '@/src/modules/series/dtos/create-series.dto';
import { GetSeriesQueryDto } from '@/src/modules/series/dtos/get-series-query.dto';
import { SeriesTranslation } from '@/src/modules/series/entities/series-translations.entity';
import { Series } from '@/src/modules/series/entities/series.entity';
import {
  SeriesErrorCode,
  SeriesException,
} from '@/src/modules/series/series.exception';
import { SeriesMapper } from '@/src/modules/series/series.mapper';
import { SeriesRepository } from '@/src/modules/series/series.repository';
import { SeriesService } from '@/src/modules/series/series.service';
import { SeriesValidator } from '@/src/modules/series/series.validator';
import { TransactionService } from '@/src/modules/transaction/transaction.service';
import { createTestingModuleWithoutDB } from '@/test/utils/module-builder.util';

describeWithoutDeps('SeriesService', () => {
  let service: SeriesService;
  let seriesRepository: Partial<SeriesRepository>;
  let seriesValidator: Partial<SeriesValidator>;
  let transactionService: Partial<TransactionService>;

  beforeEach(async () => {
    seriesRepository = {
      getAllWithFilters: vi.fn(),
      findDuplicateTitleOfSeries: vi.fn(),
      createOne: vi.fn(),
      withTransaction: vi.fn(),
    };

    seriesValidator = {
      assertTranslationsExist: vi.fn(),
      assertDuplicatesNotExist: vi.fn(),
    };

    transactionService = {
      executeInTransaction: vi.fn((callback) => callback(seriesRepository)),
    };

    (seriesRepository.withTransaction as any).mockImplementation(
      () => seriesRepository,
    );

    const module: TestingModule = await createTestingModuleWithoutDB({
      providers: [
        SeriesService,
        {
          provide: SeriesRepository,
          useValue: seriesRepository,
        },
        {
          provide: TransactionService,
          useValue: transactionService,
        },
        {
          provide: SeriesValidator,
          useValue: seriesValidator,
        },
        SeriesMapper,
      ],
    });

    service = module.get<SeriesService>(SeriesService);
  });

  describe('getSeries', () => {
    const mockSeries: Partial<Series>[] = [
      {
        id: 'series-1',
        translations: [
          { language: Language.KO, title: '파이널 판타지' },
          { language: Language.EN, title: 'Final Fantasy' },
          { language: Language.JA, title: 'ファイナルファンタジー' },
        ] as SeriesTranslation[],
        seriesArtworks: [],
      },
      {
        id: 'series-2',
        translations: [
          { language: Language.KO, title: '젤다의 전설' },
          { language: Language.EN, title: 'The Legend of Zelda' },
          { language: Language.JA, title: 'ゼルダの伝説' },
        ] as SeriesTranslation[],
        seriesArtworks: [],
      },
    ];

    beforeEach(() => {
      (seriesRepository.getAllWithFilters as any).mockResolvedValue([
        mockSeries,
        mockSeries.length,
      ]);
    });

    describe('페이지 번호 검증', () => {
      it('쿼리 파라미터에 page가 지정된 경우, 해당 값으로 지정됨', async () => {
        const query: GetSeriesQueryDto = { page: 2 };
        await service.getSeries(query);

        expect(seriesRepository.getAllWithFilters).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 2,
          }),
        );
      });

      it('쿼리 파라미터에 page가 미지정인 경우, 1로 고정됨', async () => {
        const query: GetSeriesQueryDto = {};
        await service.getSeries(query);

        expect(seriesRepository.getAllWithFilters).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 1,
          }),
        );
      });
    });

    describe('페이지 당 표시 시리즈 수 검증', () => {
      it('컨트롤러에 정의된 페이지 수로 고정됨', async () => {
        const query: GetSeriesQueryDto = {};
        await service.getSeries(query);

        expect(seriesRepository.getAllWithFilters).toHaveBeenCalledWith(
          expect.objectContaining({ pageSize: PAGE_SIZE.CMS }),
        );
      });
    });

    describe('검색어 필터 검증', () => {
      it('쿼리 파라미터에 search가 지정된 경우, 해당 값으로 지정됨', async () => {
        const query: GetSeriesQueryDto = { search: '판타지' };
        await service.getSeries(query);

        expect(seriesRepository.getAllWithFilters).toHaveBeenCalledWith(
          expect.objectContaining({ search: '판타지' }),
        );
      });

      it('쿼리 파라미터에 search가 미지정인 경우, undefined로 지정됨', async () => {
        const query: GetSeriesQueryDto = {};
        await service.getSeries(query);

        expect(seriesRepository.getAllWithFilters).toHaveBeenCalledWith(
          expect.objectContaining({ search: undefined }),
        );
      });
    });

    describe('반환 형식 검증', () => {
      it('시리즈 목록과 메타데이터를 포함한 결과를 반환함', async () => {
        const query: GetSeriesQueryDto = {};
        const result = await service.getSeries(query);

        expect(result).toEqual({
          items: mockSeries,
          totalCount: mockSeries.length,
        });
      });
    });
  });

  describe('createSeries', () => {
    const createSeriesDto: CreateSeriesDto = {
      koTitle: '파이널 판타지',
      enTitle: 'Final Fantasy',
      jaTitle: 'ファイナルファンタジー',
    };

    const mockSeries: Partial<Series> = {
      id: 'series-1',
      translations: [
        { language: Language.KO, title: '파이널 판타지' },
        { language: Language.EN, title: 'Final Fantasy' },
        { language: Language.JA, title: 'ファイナルファンタジー' },
      ] as SeriesTranslation[],
      seriesArtworks: [],
    };

    beforeEach(() => {
      (seriesRepository.createOne as any).mockResolvedValue(mockSeries);
      (seriesRepository.findDuplicateTitleOfSeries as any).mockResolvedValue(
        [],
      );
    });

    it('시리즈가 성공적으로 생성됨', async () => {
      const result = await service.createSeries(createSeriesDto);

      expect(seriesValidator.assertTranslationsExist).toHaveBeenCalled();
      expect(seriesRepository.findDuplicateTitleOfSeries).toHaveBeenCalled();
      expect(seriesValidator.assertDuplicatesNotExist).toHaveBeenCalled();
      expect(seriesRepository.createOne).toHaveBeenCalledWith(
        expect.objectContaining({
          translations: expect.arrayContaining([
            expect.objectContaining({
              language: Language.KO,
              title: '파이널 판타지',
            }),
            expect.objectContaining({
              language: Language.EN,
              title: 'Final Fantasy',
            }),
            expect.objectContaining({
              language: Language.JA,
              title: 'ファイナルファンタジー',
            }),
          ]),
          seriesArtworks: [],
        }),
      );
      expect(result).toEqual(mockSeries);
    });

    it('번역 정보가 부족하면 검증 에러가 발생함', async () => {
      (seriesValidator.assertTranslationsExist as any).mockImplementation(
        () => {
          throw new SeriesException(
            SeriesErrorCode.NOT_ENOUGH_TRANSLATIONS,
            'All language translations are required',
            {
              languages: [Language.KO, Language.EN, Language.JA],
            },
          );
        },
      );

      await expect(service.createSeries(createSeriesDto)).rejects.toThrow(
        SeriesException,
      );
      expect(seriesRepository.createOne).not.toHaveBeenCalled();
    });

    it('중복 타이틀이 있으면 검증 에러가 발생함', async () => {
      const duplicates = [{ id: 'existing-series', translations: [] }];
      (seriesRepository.findDuplicateTitleOfSeries as any).mockResolvedValue(
        duplicates,
      );

      (seriesValidator.assertDuplicatesNotExist as any).mockImplementation(
        () => {
          throw new SeriesException(
            SeriesErrorCode.DUPLICATE_TITLE,
            "Some of the provided series' title are duplicated",
            {
              titles: [
                '파이널 판타지',
                'Final Fantasy',
                'ファイナルファンタジー',
              ],
            },
          );
        },
      );

      await expect(service.createSeries(createSeriesDto)).rejects.toThrow(
        SeriesException,
      );
      expect(seriesRepository.createOne).not.toHaveBeenCalled();
    });

    it('트랜잭션 내에서 시리즈가 생성됨', async () => {
      await service.createSeries(createSeriesDto);

      expect(transactionService.executeInTransaction).toHaveBeenCalled();
      expect(seriesRepository.withTransaction).toHaveBeenCalled();
    });
  });
});
