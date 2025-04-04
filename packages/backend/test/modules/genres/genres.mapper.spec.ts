import { Language } from '@/src/common/enums/language.enum';
import { CreateGenreDto } from '@/src/modules/genres/dtos/create-genre.dto';
import { UpdateGenreDto } from '@/src/modules/genres/dtos/update-genre.dto';
import { GenresMapper } from '@/src/modules/genres/genres.mapper';

describeWithoutDeps('GenresMapper', () => {
  let mapper: GenresMapper;

  beforeEach(() => {
    mapper = new GenresMapper();
  });

  describe('toEntityForCreate', () => {
    it('모든 언어 번역이 있는 장르 엔티티 데이터를 생성함', () => {
      const createDto: CreateGenreDto = {
        koName: '액션',
        enName: 'Action',
        jaName: 'アクション',
      };

      const result = mapper.toEntityForCreate(createDto);

      expect(result).toHaveProperty('translations');
      expect(result.translations).toHaveLength(3);
      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.KO,
          name: '액션',
        }),
      );
      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.EN,
          name: 'Action',
        }),
      );
      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.JA,
          name: 'アクション',
        }),
      );
    });
  });

  describe('toEntityForUpdate', () => {
    it('모든 언어 번역이 업데이트 되는 경우, 모든 언어 정보가 포함된 엔티티로 변환함', () => {
      const updateDto: UpdateGenreDto = {
        koName: '액션',
        enName: 'Action',
        jaName: 'アクション',
      };
      const id = 'genre-1';

      const result = mapper.toEntityForUpdate(updateDto, id);

      expect(result).toHaveProperty('id', id);
      expect(result).toHaveProperty('translations');
      expect(result.translations).toHaveLength(3);
      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.KO,
          name: '액션',
        }),
      );
      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.EN,
          name: 'Action',
        }),
      );
      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.JA,
          name: 'アクション',
        }),
      );
    });

    it('일부 언어 번역만 업데이트 되는 경우, 해당 언어만 존재하는 엔티티로 변환함', () => {
      const updateDto: UpdateGenreDto = {
        koName: '액션',
      };
      const id = 'genre-1';

      const result = mapper.toEntityForUpdate(updateDto, id);

      expect(result).toHaveProperty('id', id);
      expect(result).toHaveProperty('translations');
      expect(result.translations).toHaveLength(1);
      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.KO,
          name: '액션',
        }),
      );
      expect(result.translations).not.toContainEqual(
        expect.objectContaining({
          language: Language.EN,
        }),
      );
      expect(result.translations).not.toContainEqual(
        expect.objectContaining({
          language: Language.JA,
        }),
      );
    });

    it('번역 없이 업데이트 요청할 경우 빈 배열로 처리됨', () => {
      const updateDto: UpdateGenreDto = {};
      const id = 'genre-1';

      const result = mapper.toEntityForUpdate(updateDto, id);

      expect(result).toHaveProperty('id', id);
      expect(result).toHaveProperty('translations');
      expect(result.translations).toHaveLength(0);
    });
  });
});
