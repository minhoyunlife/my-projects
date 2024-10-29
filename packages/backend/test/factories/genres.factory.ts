import { Repository } from 'typeorm';

import { Genre } from '@/src/modules/genres/genres.entity';

export class GenresFactory {
  static async create(
    repository: Repository<Genre>,
    override: Partial<Genre> = {},
  ): Promise<Genre> {
    const genre = repository.create({
      name: 'Action',
      ...override,
    });
    return repository.save(genre);
  }
}
