import { Language } from '@/src/modules/genres/enums/language.enum';
import { CreateSeriesDto } from '@/src/modules/series/dtos/create-series.dto';
import { UpdateSeriesDto } from '@/src/modules/series/dtos/update-series.dto';
import { SeriesMapper } from '@/src/modules/series/series.mapper';

describeWithoutDeps('SeriesMapper', () => {
  let mapper: SeriesMapper;

  beforeEach(() => {
    mapper = new SeriesMapper();
  });

  describe('toEntityForCreate', () => {
    const createDto: CreateSeriesDto = {
      koTitle: '타이틀',
      enTitle: 'title',
      jaTitle: 'タイトル',
    };

    it('모든 언어 번역이 있는 시리즈 엔티티 데이터를 생성함', () => {
      const result = mapper.toEntityForCreate(createDto);

      expect(result).toHaveProperty('translations');
      expect(result.translations).toHaveLength(3);
      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.KO,
          title: '타이틀',
        }),
      );
      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.EN,
          title: 'title',
        }),
      );
      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.JA,
          title: 'タイトル',
        }),
      );
    });

    it('생성된 엔티티 인스턴스에서 작품은 연결되어 있지 않음', () => {
      const result = mapper.toEntityForCreate(createDto);

      expect(result).toHaveProperty('seriesArtworks');
      expect(result.seriesArtworks).toHaveLength(0);
    });
  });

  describe('toEntityForUpdate', () => {
    const seriesId = 'test-series-id';

    it('모든 언어 번역이 있는 경우 모든 번역 데이터를 포함한 엔티티 데이터를 생성함', () => {
      const updateDto: UpdateSeriesDto = {
        koTitle: '수정된 타이틀',
        enTitle: 'updated title',
        jaTitle: '更新されたタイトル',
      };

      const result = mapper.toEntityForUpdate(updateDto, seriesId);

      expect(result).toHaveProperty('id', seriesId);
      expect(result).toHaveProperty('translations');
      expect(result.translations).toHaveLength(3);
      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.KO,
          title: '수정된 타이틀',
        }),
      );
      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.EN,
          title: 'updated title',
        }),
      );
      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.JA,
          title: '更新されたタイトル',
        }),
      );
    });

    it('일부 언어 번역만 있는 경우 해당 번역 데이터만 포함한 엔티티 데이터를 생성함', () => {
      const updateDto: UpdateSeriesDto = {
        koTitle: '수정된 타이틀',
        enTitle: 'updated title',
      };

      const result = mapper.toEntityForUpdate(updateDto, seriesId);

      expect(result).toHaveProperty('id', seriesId);
      expect(result).toHaveProperty('translations');
      expect(result.translations).toHaveLength(2);
      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.KO,
          title: '수정된 타이틀',
        }),
      );
      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.EN,
          title: 'updated title',
        }),
      );
      expect(result.translations).not.toContainEqual(
        expect.objectContaining({
          language: Language.JA,
        }),
      );
    });

    it('빈 언어 번역 필드의 경우 해당 번역 데이터를 포함하지 않음', () => {
      const updateDto: UpdateSeriesDto = {
        koTitle: '',
        enTitle: 'updated title',
      };

      const result = mapper.toEntityForUpdate(updateDto, seriesId);

      expect(result).toHaveProperty('id', seriesId);
      expect(result).toHaveProperty('translations');
      expect(result.translations).toHaveLength(2);
      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.KO,
          title: '',
        }),
      );
      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.EN,
          title: 'updated title',
        }),
      );
    });

    it('번역 필드가 없는 경우 빈 번역 배열을 포함한 엔티티 데이터를 생성함', () => {
      const updateDto: UpdateSeriesDto = {};

      const result = mapper.toEntityForUpdate(updateDto, seriesId);

      expect(result).toHaveProperty('id', seriesId);
      expect(result).toHaveProperty('translations');
      expect(result.translations).toHaveLength(0);
    });
  });
});
