import { INestApplication } from '@nestjs/common';

import Sharp from 'sharp';
import request from 'supertest';
import { DataSource, Repository } from 'typeorm';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { ArtworksController } from '@/src/modules/artworks/artworks.controller';
import { ArtworksRepository } from '@/src/modules/artworks/artworks.repository';
import { ArtworksService } from '@/src/modules/artworks/artworks.service';
import { CreateArtworkDto } from '@/src/modules/artworks/dtos/create-artwork.dto';
<<<<<<< HEAD
<<<<<<< HEAD
import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
=======
>>>>>>> 3ddd721 (chore: move current entity to sub folder)
=======
import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
>>>>>>> e9fd285 (chore: modify service and repository related to artworks)
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { ImageFileType } from '@/src/modules/artworks/enums/file-type.enum';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { SortType } from '@/src/modules/artworks/enums/sort-type.enum';
import { AuthService } from '@/src/modules/auth/auth.service';
import { Administrator } from '@/src/modules/auth/entities/administrator.entity';
import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { StorageService } from '@/src/modules/storage/storage.service';
import { AdministratorsFactory } from '@/test/factories/administrator.factory';
import { ArtworksFactory } from '@/test/factories/artworks.factory';
import { GenresFactory } from '@/test/factories/genres.factory';
import { createTestAccessToken } from '@/test/utils/auth.util';
import { clearTables, saveEntities } from '@/test/utils/database.util';
import { createTestingApp } from '@/test/utils/module-builder.util';

describeWithDeps('ArtworksController', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestingApp({
      entities: [
        Artwork,
        ArtworkTranslation,
        Genre,
        GenreTranslation,
        Administrator,
      ],
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
    await clearTables(dataSource, [Artwork, Genre, Administrator]);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('GET /artworks', () => {
    let authService: AuthService;
    let artworkRepository: Repository<Artwork>;
    let genreRepository: Repository<Genre>;

    let administrator: Administrator;
    let genres: Genre[];

    beforeEach(async () => {
      authService = app.get(AuthService);

      artworkRepository = dataSource.getRepository(Artwork);
      genreRepository = dataSource.getRepository(Genre);
      const administratorRepository = dataSource.getRepository(Administrator);

      administrator = (
        await saveEntities(administratorRepository, [
          AdministratorsFactory.createTestData(),
        ])
      )[0];

      genres = await saveEntities(genreRepository, [
        GenresFactory.createTestData({
          translations: [
            { language: Language.KO, name: '액션' },
            { language: Language.EN, name: 'Action' },
            { language: Language.JA, name: 'アクション' },
          ] as GenreTranslation[],
        }),
        GenresFactory.createTestData({
          translations: [
            { language: Language.KO, name: '롤플레잉' },
            { language: Language.EN, name: 'RPG' },
            { language: Language.JA, name: 'ロールプレイング' },
          ] as GenreTranslation[],
        }),
      ]);

      await saveEntities(artworkRepository, [
        ArtworksFactory.createTestData({
          imageKey: 'artworks/2024/03/public1',
          createdAt: new Date('2024-03-01'),
          playedOn: Platform.STEAM,
          genres: [genres[0]], // Action
          isDraft: false,
        }),
        ArtworksFactory.createTestData({
          imageKey: 'artworks/2024/03/draft1',
          createdAt: new Date('2024-03-02'),
          playedOn: Platform.GOG,
          genres: [genres[1]], // RPG
          isDraft: true,
        }),
        ArtworksFactory.createTestData({
          imageKey: 'artworks/2024/03/public2',
          createdAt: new Date('2024-03-03'),
          playedOn: Platform.ANDROID,
          genres: [genres[0], genres[1]], // Action, RPG
          isDraft: false,
        }),
      ]);
    });

    it('인증되지 않은 요청의 경우, 공개된 작품만 조회할 수 있음', async () => {
      const response = await request(app.getHttpServer())
        .get('/artworks')
        .expect(200);

      await expect(response).toMatchOpenAPISpec();

      const { items, metadata } = response.body;

      expect(items).toHaveLength(2);
      expect(items.every((item) => !item.isDraft)).toBe(true);
      expect(metadata.pageSize).toBe(PAGE_SIZE.PUBLIC);
    });

    it('인증된 요청의 경우, 모든 작품을 조회할 수 있음', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .get('/artworks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      await expect(response).toMatchOpenAPISpec();

      const { items, metadata } = response.body;

      expect(items).toHaveLength(3);
      expect(metadata.pageSize).toBe(PAGE_SIZE.CMS);
    });

    it('플랫폼 필터가 정상적으로 동작함', async () => {
      const response = await request(app.getHttpServer())
        .get('/artworks')
        .query({ platforms: [Platform.STEAM] })
        .expect(200);

      await expect(response).toMatchOpenAPISpec();

      const { items } = response.body;

      expect(items.every((item) => item.playedOn === Platform.STEAM)).toBe(
        true,
      );
    });

    it('장르ID 필터가 정상적으로 동작함', async () => {
      const response = await request(app.getHttpServer())
        .get('/artworks')
        .query({ genreIds: [genres[0].id] })
        .expect(200);

      await expect(response).toMatchOpenAPISpec();

      const { items } = response.body;

      expect(
        items.every((item) =>
          item.genres.some((genre) => genre.id === genres[0].id),
        ),
      ).toBe(true);
    });

    it('검색어로 제목 필터링이 정상적으로 동작함', async () => {
      const response = await request(app.getHttpServer())
        .get('/artworks')
        .query({ search: '공개 작품' })
        .expect(200);

      await expect(response).toMatchOpenAPISpec();

      const { items } = response.body;

      expect(items.every((item) => item.title.includes('공개 작품'))).toBe(
        true,
      );
    });

    it('페이지네이션이 정상적으로 동작함', async () => {
      const response = await request(app.getHttpServer())
        .get('/artworks')
        .query({ page: 1 })
        .expect(200);

      await expect(response).toMatchOpenAPISpec();

      const { metadata } = response.body;

      expect(metadata.currentPage).toBe(1);
      expect(metadata.totalPages).toBeDefined();
      expect(metadata.totalCount).toBeDefined();
    });

    it('정렬이 정상적으로 동작함', async () => {
      const response = await request(app.getHttpServer())
        .get('/artworks')
        .query({ sort: SortType.CREATED_ASC })
        .expect(200);

      await expect(response).toMatchOpenAPISpec();

      const { items } = response.body;

      const dates = items.map((item) => new Date(item.createdAt));
      expect(dates).toEqual(
        [...dates].sort((a, b) => a.getTime() - b.getTime()),
      );
    });

    it('유효하지 않은 쿼리를 전달할 경우, 400 가 발생함', async () => {
      const response = await request(app.getHttpServer())
        .get('/artworks')
        .query({ page: 'a' })
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('잘못된 토큰으로 요청할 경우, 401이 발생함', async () => {
      const response = await request(app.getHttpServer())
        .get('/artworks')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      await expect(response).toMatchOpenAPISpec();
    });
  });

  describe('POST /artworks', () => {
    let genreRepository: Repository<Genre>;

    beforeEach(async () => {
      genreRepository = dataSource.getRepository(Genre);

      await saveEntities(genreRepository, [
        GenresFactory.createTestData({
          id: 'genre-1',
          translations: [
            { language: Language.KO, name: '액션' },
            { language: Language.EN, name: 'Action' },
            { language: Language.JA, name: 'アクション' },
          ] as GenreTranslation[],
        }),
      ]);
    });

    const createDto: CreateArtworkDto = {
      koTitle: '테스트 작품명',
      enTitle: 'Test Artwork',
      jaTitle: 'テスト作品',
      imageKey: 'artworks/2024/03/abc123def456',
      createdAt: '2024-11-01',
      playedOn: Platform.STEAM,
      rating: 18,
      koShortReview: '한국어 짧은 리뷰',
      enShortReview: 'English Short Review',
      jaShortReview: '日本語の短いレビュー',
      genreIds: ['genre-1'],
    };

    it('유효한 DTO로 작품 생성 시 DB에 정상적으로 저장됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/artworks')
        .send(createDto)
        .expect(201);

      await expect(response).toMatchOpenAPISpec();

      const savedArtwork = await dataSource.getRepository(Artwork).findOne({
        where: { id: response.body.id },
        relations: {
          genres: {
            translations: true,
          },
          translations: true,
        },
      });

      expect(savedArtwork).toBeDefined();
      expect(
        savedArtwork.translations.find((t) => t.language === Language.KO).title,
      ).toBe(createDto.koTitle);
      expect(
        savedArtwork.translations.find((t) => t.language === Language.EN).title,
      ).toBe(createDto.enTitle);
      expect(
        savedArtwork.translations.find((t) => t.language === Language.JA).title,
      ).toBe(createDto.jaTitle);
      expect(savedArtwork.genres).toHaveLength(createDto.genreIds.length);
      expect(savedArtwork.genres[0].translations).toHaveLength(3);
    });

    it('필수 필드 누락 시 400 에러가 반환되어야 함', async () => {
      const { koTitle, ...invalidDto } = createDto;

      const response = await request(app.getHttpServer())
        .post('/artworks')
        .send(invalidDto)
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('존재하지 않는 장르 ID로 생성 시도 시 400 에러가 반환되어야 함', async () => {
      const dtoWithInvalidGenreId = {
        ...createDto,
        genreIds: ['non-existing-genre-id'],
      };

      const response = await request(app.getHttpServer())
        .post('/artworks')
        .send(dtoWithInvalidGenreId)
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
