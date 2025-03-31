import { Language } from '@/src/modules/genres/enums/language.enum';
import { CreateSeriesDto } from '@/src/modules/series/dtos/create-series.dto';
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
});
