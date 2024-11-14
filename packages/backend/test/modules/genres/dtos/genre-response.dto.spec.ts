import { GenreResponse } from '@/src/modules/genres/dtos/genre-response.dto';
import { Genre } from '@/src/modules/genres/genres.entity';
import { GenresFactory } from '@/test/factories/genres.factory';

describeWithoutDeps('GenreResponse', () => {
  const genre = GenresFactory.createTestData({ id: 'some-nanoid' }) as Genre;

  const response = new GenreResponse(genre);

  it('엔티티의 속성 값대로 id 가 반환됨', () => {
    expect(response.id).toBe(genre.id);
  });

  it('엔티티의 속성 값대로 name 이 반환됨', () => {
    expect(response.name).toBe(genre.name);
  });
});
