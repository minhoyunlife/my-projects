import { TestingModule } from '@nestjs/testing';

import { Language } from '@/src/modules/genres/enums/language.enum';
import { CreateSeriesDto } from '@/src/modules/series/dtos/create-series.dto';
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
