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

  describe('findGenreIdsByNames', () => {
    it('존재하는 장르들의 ID를 반환함', async () => {
      const genres = await saveEntities(repository, [
        GenresFactory.createTestData({ name: 'Action' }),
        GenresFactory.createTestData({ name: 'RPG' }),
        GenresFactory.createTestData({ name: 'Adventure' }),
      ]);

      const result = await repository.findGenreIdsByNames(['Action', 'RPG']);

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([genres[0].id, genres[1].id]),
      );
    });

    it('존재하지 않는 장르 이름이 포함된 경우, 존재하는 장르의 ID만 반환함', async () => {
      const genres = await saveEntities(repository, [
        GenresFactory.createTestData({ name: 'Action' }),
      ]);

      const result = await repository.findGenreIdsByNames(['Action', 'RPG']);

      expect(result).toHaveLength(1);
      expect(result).toEqual(expect.arrayContaining([genres[0].id]));
    });

    it('모든 장르가 존재하지 않는 경우, 빈 배열을 반환함', async () => {
      const result = await repository.findGenreIdsByNames(['Action', 'RPG']);

      expect(result).toHaveLength(0);
    });

    it('대상 장르가 빈 배열인 경우, 빈 배열을 반환함', async () => {
      const result = await repository.findGenreIdsByNames([]);

      expect(result).toHaveLength(0);
    });

    it('대상 장르에 중복이 있는 경우, 중복을 제거하고 ID를 반환함', async () => {
      const genres = await saveEntities(repository, [
        GenresFactory.createTestData({ name: 'Action' }),
      ]);

      const result = await repository.findGenreIdsByNames(['Action', 'Action']);

      expect(result).toHaveLength(1);
      expect(result).toEqual(expect.arrayContaining([genres[0].id]));
    });
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
