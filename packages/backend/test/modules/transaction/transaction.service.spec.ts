import { DataSource, Repository } from 'typeorm';

import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';
import { TransactionService } from '@/src/modules/transaction/transaction.service';
import { ArtworkTranslationsFactory } from '@/test/factories/artwork-translations.factory';
import { ArtworksFactory } from '@/test/factories/artworks.factory';
import { GenresFactory } from '@/test/factories/genres.factory';
import { clearTables, saveEntities } from '@/test/utils/database.util';
import { createTestingModuleWithDB } from '@/test/utils/module-builder.util';

describeWithDeps('TransactionService', () => {
  let transactionService: TransactionService;
  let dataSource: DataSource;
  let artworkRepository: Repository<Artwork>;
  let genreRepository: Repository<Genre>;

  beforeAll(async () => {
    const module = await createTestingModuleWithDB({
      entities: [Artwork, ArtworkTranslation, Genre, GenreTranslation],
      providers: [TransactionService],
    });

    transactionService = module.get<TransactionService>(TransactionService);
    dataSource = module.get<DataSource>(DataSource);
    artworkRepository = dataSource.getRepository(Artwork);
    genreRepository = dataSource.getRepository(Genre);
  });

  beforeEach(async () => {
    await clearTables(dataSource, [Artwork, Genre]);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('executeInTransaction', () => {
    it('트랜잭션이 성공적으로 커밋되는지 확인', async () => {
      await transactionService.executeInTransaction(async (manager) => {
        const genreRepo = manager.getRepository(Genre);
        const genre = genreRepo.create(
          GenresFactory.createTestData({}, [
            { language: Language.KO, name: '액션' },
            { language: Language.EN, name: 'Action' },
            { language: Language.JA, name: 'アクション' },
          ]),
        );
        await genreRepo.save(genre);

        const artworkRepo = manager.getRepository(Artwork);
        const artwork = artworkRepo.create(
          ArtworksFactory.createTestData(
            {
              imageKey: 'test-image-key',
              playedOn: Platform.STEAM,
              isDraft: true,
              genres: [genre],
            },
            [
              ArtworkTranslationsFactory.createTestData({
                language: Language.KO,
                title: '테스트 작품',
                shortReview: '테스트 리뷰',
              }),
            ],
          ),
        );
        await artworkRepo.save(artwork);
      });

      const genres = await genreRepository.find({
        relations: { translations: true },
      });
      const artworks = await artworkRepository.find({
        relations: { translations: true, genres: true },
      });

      expect(genres).toHaveLength(1);
      expect(genres[0].translations).toHaveLength(3);

      expect(artworks).toHaveLength(1);
      expect(artworks[0].translations).toHaveLength(1);
      expect(artworks[0].genres).toHaveLength(1);
    });

    it('예외 발생 시 트랜잭션이 롤백되는지 확인', async () => {
      await expect(
        transactionService.executeInTransaction(async (manager) => {
          const genreRepo = manager.getRepository(Genre);
          const genre = genreRepo.create(
            GenresFactory.createTestData({}, [
              { language: Language.KO, name: '롤플레잉' },
            ]),
          );
          await genreRepo.save(genre);

          const artworkRepo = manager.getRepository(Artwork);
          const artwork = artworkRepo.create(
            ArtworksFactory.createTestData(
              {
                imageKey: 'will-be-rolled-back',
                genres: [genre],
              },
              [ArtworkTranslationsFactory.createTestData()],
            ),
          );
          await artworkRepo.save(artwork);

          throw new Error('롤백 테스트를 위한 강제 에러');
        }),
      ).rejects.toThrow('롤백 테스트를 위한 강제 에러');

      const genres = await genreRepository.find();
      const artworks = await artworkRepository.find();

      expect(genres).toHaveLength(0);
      expect(artworks).toHaveLength(0);
    });
  });
});
