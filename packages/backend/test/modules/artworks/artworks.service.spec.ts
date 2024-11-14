import { Test, TestingModule } from '@nestjs/testing';

import { EntityManager } from 'typeorm';

import { Platform } from '@/src/common/enums/platform.enum';
import { ArtworksRepository } from '@/src/modules/artworks/artworks.repository';
import { ArtworksService } from '@/src/modules/artworks/artworks.service';
import { CreateArtworkDto } from '@/src/modules/artworks/dtos/create-artwork.dto';
import { GenresRepository } from '@/src/modules/genres/genres.repository';

describeWithoutDeps('ArtworksService', () => {
  let service: ArtworksService;
  let artworksRepository: Partial<ArtworksRepository>;
  let genresRepository: Partial<GenresRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtworksService,
        {
          provide: ArtworksRepository,
          useValue: { forTransaction: vi.fn() },
        },
        {
          provide: GenresRepository,
          useValue: { forTransaction: vi.fn() },
        },
        {
          provide: EntityManager,
          useValue: {
            transaction: vi.fn((cb) => cb({})),
          },
        },
      ],
    }).compile();

    service = module.get<ArtworksService>(ArtworksService);
    artworksRepository = module.get<ArtworksRepository>(ArtworksRepository);
    genresRepository = module.get<GenresRepository>(GenresRepository);
  });

  describe('createArtwork', () => {
    const dto: CreateArtworkDto = {
      title: '테스트 작품',
      imageKey: 'artworks/2024/03/abc123def456',
      playedOn: Platform.STEAM,
      genres: ['RPG'],
    };

    it('작품 데이터를 기반으로 새로운 작품을 생성함', async () => {
      const mockGenres = [{ id: 'genre-1', name: 'RPG' }];
      const expectedArtwork = {
        id: 'artwork-1',
        title: dto.title,
        imageKey: dto.imageKey,
        playedOn: dto.playedOn,
        genres: mockGenres,
      };

      genresRepository.forTransaction = vi.fn().mockReturnThis();
      genresRepository.bulkCreateIfNotExist = vi
        .fn()
        .mockResolvedValue(mockGenres);
      artworksRepository.forTransaction = vi.fn().mockReturnThis();
      artworksRepository.createOne = vi.fn().mockResolvedValue(expectedArtwork);

      const result = await service.createArtwork(dto);

      expect(genresRepository.bulkCreateIfNotExist).toHaveBeenCalled();
      expect(artworksRepository.createOne).toHaveBeenCalled();
      expect(result).toEqual(expectedArtwork);
    });

    it('장르 생성에 실패할 경우, 에러가 발생', async () => {
      genresRepository.forTransaction = vi.fn().mockReturnThis();
      genresRepository.bulkCreateIfNotExist = vi
        .fn()
        .mockRejectedValue(new Error());

      await expect(service.createArtwork(dto)).rejects.toThrowError();
    });

    it('작품 생성에 실패할 경우, 에러가 발생', async () => {
      artworksRepository.forTransaction = vi.fn().mockReturnThis();
      artworksRepository.createOne = vi.fn().mockRejectedValue(new Error());

      await expect(service.createArtwork(dto)).rejects.toThrowError();
    });
  });
});
