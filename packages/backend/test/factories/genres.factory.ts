import { Genre } from '@/src/modules/genres/genres.entity';

export class GenresFactory {
  static createTestData(override: Partial<Genre> = {}): Partial<Genre> {
    return {
      name: 'Action',
      ...override,
    };
  }
}
