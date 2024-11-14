import { DataSource } from 'typeorm';

import { Artwork } from '@/src/modules/artworks/artworks.entity';
import { ArtworksRepository } from '@/src/modules/artworks/artworks.repository';
import { Genre } from '@/src/modules/genres/genres.entity';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { ArtworksFactory } from '@/test/factories/artworks.factory';
import { GenresFactory } from '@/test/factories/genres.factory';
import { clearTables, saveEntities } from '@/test/utils/database.util';
import { createRepositoryTestingModule } from '@/test/utils/module-builder.util';

describeWithDeps('ArtworksRepository', () => {
  let artworkRepo: ArtworksRepository;
  let genreRepo: GenresRepository;
  let dataSource: DataSource;
  let savedGenres: Genre[];

  beforeAll(async () => {
    const module = await createRepositoryTestingModule({
      entities: [Artwork, Genre],
      providers: [ArtworksRepository, GenresRepository],
    });

    artworkRepo = module.get<ArtworksRepository>(ArtworksRepository);
    genreRepo = module.get<GenresRepository>(GenresRepository);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await clearTables(dataSource, [Artwork, Genre]);

    const genreEntity = GenresFactory.createTestData();
    savedGenres = await saveEntities(genreRepo, [genreEntity]);
  });

  describe('createOne', () => {
    it('작품 데이터를 성공적으로 생성함', async () => {
      const artworkData = ArtworksFactory.createTestData({}, savedGenres);
      const result = await artworkRepo.createOne(artworkData);

      const saved = await artworkRepo.findOne({
        where: { id: result.id },
        relations: ['genres'],
      });

      expect(saved.title).toBe(artworkData.title);
      expect(saved.imageKey).toBe(artworkData.imageKey);
      expect(saved.playedOn).toBe(artworkData.playedOn);
      expect(saved.rating).toBe(artworkData.rating);
      expect(saved.shortReview).toBe(artworkData.shortReview);
      expect(saved.genres).toEqual(artworkData.genres);
      expect(saved.isDraft).toBe(true);
    });

    describe('필수 필드 검증', () => {
      it('title이 없으면 에러가 발생함', async () => {
        const artworkData = ArtworksFactory.createTestData({
          title: undefined,
        });

        await expect(artworkRepo.createOne(artworkData)).rejects.toThrow();
      });

      it('imageKey가 없으면 에러가 발생함', async () => {
        const artworkData = ArtworksFactory.createTestData({
          imageKey: undefined,
        });

        await expect(artworkRepo.createOne(artworkData)).rejects.toThrow();
      });
    });
  });
});
