import { INestApplication } from '@nestjs/common';

import request from 'supertest';
import { DataSource } from 'typeorm';

import { Platform } from '@/src/common/enums/platform.enum';
import { ArtworksController } from '@/src/modules/artworks/artworks.controller';
import { Artwork } from '@/src/modules/artworks/artworks.entity';
import { ArtworksRepository } from '@/src/modules/artworks/artworks.repository';
import { ArtworksService } from '@/src/modules/artworks/artworks.service';
import { CreateArtworkDto } from '@/src/modules/artworks/dtos/create-artwork.dto';
import { Genre } from '@/src/modules/genres/genres.entity';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { clearTables } from '@/test/utils/database.util';
import { createControllerTestingApp } from '@/test/utils/module-builder.util';

describeWithDB('ArtworksController', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createControllerTestingApp({
      entities: [Artwork, Genre],
      controllers: [ArtworksController],
      providers: [ArtworksService, ArtworksRepository, GenresRepository],
    });

    dataSource = app.get<DataSource>(DataSource);

    await app.init();
  });

  beforeEach(async () => {
    await clearTables(dataSource, [Artwork, Genre]);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('POST /artworks', () => {
    const createDto: CreateArtworkDto = {
      title: '테스트 작품명',
      imageUrl: 'https://example.com/image.jpg',
      createdAt: '2024-11-01',
      playedOn: Platform.STEAM,
      genres: ['Action', 'RPG'],
      rating: 18,
      shortReview: '정말 재미있는 게임!',
    };

    it('유효한 DTO로 작품 생성 시 DB에 정상적으로 저장되어야 함', async () => {
      const response = await request(app.getHttpServer())
        .post('/artworks')
        .send(createDto)
        .expect(201);

      await expect(response).toMatchOpenAPISpec();

      const savedArtwork = await dataSource.getRepository(Artwork).findOne({
        where: { id: response.body.id },
        relations: ['genres'],
      });

      expect(savedArtwork).toBeDefined();
      expect(savedArtwork.title).toBe(createDto.title);
      expect(savedArtwork.genres).toHaveLength(createDto.genres.length);
    });

    it('필수 필드 누락 시 400 에러가 반환되어야 함', async () => {
      const { title, ...invalidDto } = createDto;

      const response = await request(app.getHttpServer())
        .post('/artworks')
        .send(invalidDto)
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });
  });
});
