import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { StatusValidator } from '@/src/modules/artworks/validators/status.validator';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';
import { ArtworkTranslationsFactory } from '@/test/factories/artwork-translations.factory';
import { ArtworksFactory } from '@/test/factories/artworks.factory';
import { GenreTranslationsFactory } from '@/test/factories/genre-translations.factory';
import { GenresFactory } from '@/test/factories/genres.factory';

describeWithoutDeps('StatusValidator', () => {
  const validator = new StatusValidator();

  const artwork = ArtworksFactory.createTestData(
    {},
    [
      ArtworkTranslationsFactory.createTestData({
        language: Language.KO,
      }),
      ArtworkTranslationsFactory.createTestData({
        language: Language.EN,
      }),
      ArtworkTranslationsFactory.createTestData({
        language: Language.JA,
      }),
    ],
    [
      GenresFactory.createTestData({}, [
        GenreTranslationsFactory.createTestData({
          language: Language.KO,
        }),
        GenreTranslationsFactory.createTestData({
          language: Language.EN,
        }),
        GenreTranslationsFactory.createTestData({
          language: Language.JA,
        }),
      ]) as Genre,
    ],
  ) as Artwork;

  describe('validate', () => {
    it('모든 규칙을 통과한 경우, 반환되는 결과가 빈 배열이 됨', () => {
      const results = validator.validate(artwork);

      expect(results).toEqual([]);
    });

    it('규칙 중 하나라도 통과하지 못한 경우, 결과에 에러가 포함됨', () => {
      const invalidArtwork = {
        ...artwork,
        createdAt: null, // 필수 항목 누락
        rating: 30, // 범위 초과
        genres: [], // 존재 누락
      } as Artwork;

      const results = validator.validate(invalidArtwork);

      expect(results).toHaveLength(3);
    });
  });
});
