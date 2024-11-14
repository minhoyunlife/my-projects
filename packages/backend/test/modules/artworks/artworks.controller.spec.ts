import { INestApplication } from '@nestjs/common';

import Sharp from 'sharp';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { ImageFileType } from '@/src/common/enums/file-type.enum';
import { Platform } from '@/src/common/enums/platform.enum';
import { ArtworksController } from '@/src/modules/artworks/artworks.controller';
import { Artwork } from '@/src/modules/artworks/artworks.entity';
import { ArtworksRepository } from '@/src/modules/artworks/artworks.repository';
import { ArtworksService } from '@/src/modules/artworks/artworks.service';
import { CreateArtworkDto } from '@/src/modules/artworks/dtos/create-artwork.dto';
import { Genre } from '@/src/modules/genres/genres.entity';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { StorageService } from '@/src/modules/storage/storage.service';
import { clearTables } from '@/test/utils/database.util';
import { createControllerTestingApp } from '@/test/utils/module-builder.util';

describeWithDeps('ArtworksController', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createControllerTestingApp({
      entities: [Artwork, Genre],
      controllers: [ArtworksController],
      providers: [
        ArtworksService,
        StorageService,
        ArtworksRepository,
        GenresRepository,
      ],
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
      imageKey: 'artworks/2024/03/abc123def456',
      createdAt: '2024-11-01',
      playedOn: Platform.STEAM,
      genres: ['Action', 'RPG'],
      rating: 18,
      shortReview: '정말 재미있는 게임!',
    };

    it('유효한 DTO로 작품 생성 시 DB에 정상적으로 저장됨', async () => {
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

  describe('POST /artworks/images', () => {
    it('유효한 이미지로 업로드할 경우, 처리가 성공함', async () => {
      const imageData = await Sharp({
        create: {
          width: 2000,
          height: 2000,
          channels: 3,
          background: 'green',
        },
      })
        .png()
        .toBuffer();

      const response = await request(app.getHttpServer())
        .post('/artworks/images')
        .attach('image', imageData, {
          filename: 'test.png',
          contentType: ImageFileType.PNG,
        })
        .expect((res) => {
          if (res.status === 500) {
            console.error('Server Error Response:', res.body);
          }
          return res;
        })
        .expect(201);

      await expect(response).toMatchOpenAPISpec();
      expect(response.body.imageKey).toBeDefined();
    });

    it('이미지 파일이 누락될 경우, 400 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/artworks/images')
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('이미지 파일 형식이 사양 외인 경우, 400 에러가 반환됨', async () => {
      const imageData = await Sharp({
        create: {
          width: 2000,
          height: 2000,
          channels: 3,
          background: 'green',
        },
      })
        .gif()
        .toBuffer();

      const response = await request(app.getHttpServer())
        .post('/artworks/images')
        .attach('image', imageData, {
          filename: 'test.gif',
          contentType: 'image/gif',
        })
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('이미지 파일 용량이 제한치를 초과할 경우, 413 에러가 반환됨', async () => {
      const largeBuffer = Buffer.alloc(101 * 1024 * 1024); // 101MB

      const response = await request(app.getHttpServer())
        .post('/artworks/images')
        .attach('image', largeBuffer, {
          filename: 'larger.jpg',
          contentType: ImageFileType.JPEG,
        })
        .expect(413);

      await expect(response).toMatchOpenAPISpec();
    });
  });
});
