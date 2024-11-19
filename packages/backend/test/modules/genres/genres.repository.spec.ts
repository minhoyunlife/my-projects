import { DataSource } from 'typeorm';

import { Genre } from '@/src/modules/genres/genres.entity';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { GenresFactory } from '@/test/factories/genres.factory';
import { clearTables, saveEntities } from '@/test/utils/database.util';
import { createTestingModuleWithDB } from '@/test/utils/module-builder.util';

describeWithDeps('GenresRepository', () => {
  let repository: GenresRepository;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module = await createTestingModuleWithDB({
      entities: [Genre],
      providers: [GenresRepository],
    });

    repository = module.get<GenresRepository>(GenresRepository);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await clearTables(dataSource, [Genre]);
  });

  describe('bulkCreateIfNotExist', () => {
    it('모든 장르가 존재하지 않는 경우, 대상 장르 전체를 생성하고 반환함', async () => {
      const genreNames = ['Action', 'RPG', 'Adventure'];
      const result = await repository.bulkCreateIfNotExist(genreNames);
      expect(result).toHaveLength(3);

      const saved = await repository.find();
      expect(saved).toHaveLength(3);
      expect(saved.map((genre) => genre.name)).toEqual(
        expect.arrayContaining(result.map((genre) => genre.name)),
      );
    });

    it('일부 장르만 존재하는 경우, 기존에 없는 장르만 생성하고 반환함', async () => {
      const existingGenre = await saveEntities(repository, [
        GenresFactory.createTestData({
          name: 'Action',
        }),
      ]);

      const genreNames = ['Action', 'RPG', 'Adventure'];
      const result = await repository.bulkCreateIfNotExist(genreNames);
      expect(result).toHaveLength(3);

      const existingGenreInResult = result.find(
        (genre) => genre.name === 'Action',
      );
      expect(existingGenreInResult.id).toBe(existingGenre[0].id); // 기존 장르의 ID가 유지되는지 확인

      const saved = await repository.find();
      expect(saved).toHaveLength(3);
      expect(saved.map((genre) => genre.name)).toEqual(
        expect.arrayContaining(result.map((genre) => genre.name)),
      );
    });

    it('모든 장르가 이미 존재하는 경우, 기존 장르들을 그대로 반환함', async () => {
      const existingGenres = await saveEntities(repository, [
        GenresFactory.createTestData({ name: 'Action' }),
        GenresFactory.createTestData({ name: 'RPG' }),
        GenresFactory.createTestData({ name: 'Adventure' }),
      ]);

      const result = await repository.bulkCreateIfNotExist([
        'Action',
        'RPG',
        'Adventure',
      ]);
      expect(result).toHaveLength(3);

      const saved = await repository.find();
      expect(saved).toHaveLength(3);
      expect(saved.map((genre) => genre.id)).toEqual(
        expect.arrayContaining(existingGenres.map((genre) => genre.id)),
      );
    });

    it('대상 장르가 빈 배열인 경우, 빈 배열을 반환함', async () => {
      const result = await repository.bulkCreateIfNotExist([]);
      expect(result).toHaveLength(0);

      const saved = await repository.find();
      expect(saved).toHaveLength(0);
    });
  });
});
