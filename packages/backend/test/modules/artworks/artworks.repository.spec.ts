import { DataSource } from 'typeorm';

import { Artwork } from '@/src/modules/artworks/artworks.entity';
import { ArtworksRepository } from '@/src/modules/artworks/artworks.repository';
import { Genre } from '@/src/modules/genres/genres.entity';
import { ArtworksFactory } from '@/test/factories/artworks.factory';
import { GenresFactory } from '@/test/factories/genres.factory';
import {
  clearTables,
  createRepositoryTestingModule,
} from '@/test/utils/database.util';

describeWithDB('ArtworksRepository', () => {
  let repository: ArtworksRepository;
  let dataSource: DataSource;
  let savedGenres: Genre[];

  beforeAll(async () => {
    const module = await createRepositoryTestingModule({
      entities: [Artwork, Genre],
      providers: [ArtworksRepository],
    });

    repository = module.get<ArtworksRepository>(ArtworksRepository);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await clearTables(dataSource, [Artwork, Genre]);

    savedGenres = [await GenresFactory.create(dataSource.getRepository(Genre))];
  });

  describe('createOne', () => {
    it('작품 데이터를 성공적으로 생성함', async () => {
      const artworkData = ArtworksFactory.createTestData({}, savedGenres);
      const result = await repository.createOne(artworkData);

      const saved = await repository.findOne({
        where: { id: result.id },
        relations: ['genres'],
      });

      expect(saved.title).toBe(artworkData.title);
      expect(saved.imageUrl).toBe(artworkData.imageUrl);
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

        await expect(repository.createOne(artworkData)).rejects.toThrow();
      });

      it('imageUrl이 없으면 에러가 발생함', async () => {
        const artworkData = ArtworksFactory.createTestData({
          imageUrl: undefined,
        });

        await expect(repository.createOne(artworkData)).rejects.toThrow();
      });
    });
  });
});
