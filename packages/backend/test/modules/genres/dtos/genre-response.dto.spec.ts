import { Language } from '@/src/common/enums/language.enum';
import {
  GenreListResponseDto,
  GenreResponseDto,
  GenreSearchResponseDto,
} from '@/src/modules/genres/dtos/genre-response.dto';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { GenreTranslationsFactory } from '@/test/factories/genre-translations.factory';
import { GenresFactory } from '@/test/factories/genres.factory';

describeWithoutDeps('GenreResponse', () => {
  const genre = GenresFactory.createTestData({ id: 'some-nanoid' }, [
    GenreTranslationsFactory.createTestData({
      language: Language.KO,
      name: '액션',
    }),
    GenreTranslationsFactory.createTestData({
      language: Language.EN,
      name: 'Action',
    }),
    GenreTranslationsFactory.createTestData({
      language: Language.JA,
      name: 'アクション',
    }),
  ]) as Genre;

  describe('GenreResponse', () => {
    const response = new GenreResponseDto(genre);

    it('엔티티의 속성 값대로 id 가 반환됨', () => {
      expect(response.id).toBe(genre.id);
    });

    describe('translations', () => {
      it('엔티티에 속성 값이 존재하는 경우, translations 가 반환됨', () => {
        expect(response.translations).toHaveLength(3);
      });

      it('엔티티에 속성 값이 존재하지 않는 경우, translations 이 빈 배열로 반환됨', () => {
        const genreWithNullTranslations = GenresFactory.createTestData({
          id: 'some-nanoid',
          translations: null,
        }) as Genre;

        const responseWithNullTranslations = new GenreResponseDto(
          genreWithNullTranslations,
        );

        expect(responseWithNullTranslations.translations).toEqual([]);
      });
    });
  });

  describe('GenreListResponse', () => {
    const genres = [genre];

    const response = new GenreListResponseDto(genres, 1, 1, 20);

    it('엔티티의 속성 값대로 items 가 반환됨', () => {
      for (const g of genres) {
        expect(response.items).toEqual([new GenreResponseDto(g)]);
      }
    });

    it('엔티티의 속성 값대로 metadata 가 반환됨', () => {
      expect(response.metadata).toEqual({
        totalCount: 1,
        totalPages: 1, // 1/10의 결과값을 올림
        currentPage: 1,
        pageSize: 20,
      });
    });
  });

  describe('GenreSearchResponse', () => {
    const genres = [genre];

    const response = new GenreSearchResponseDto(genres);

    it('엔티티의 속성 값대로 items 가 반환됨', () => {
      for (const g of genres) {
        expect(response.items).toEqual([new GenreResponseDto(g)]);
      }
    });
  });
});
