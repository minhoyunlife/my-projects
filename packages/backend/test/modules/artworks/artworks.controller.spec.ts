import { INestApplication } from '@nestjs/common';

import Sharp from 'sharp';
import request from 'supertest';
import { DataSource, In, Repository } from 'typeorm';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { ArtworksController } from '@/src/modules/artworks/artworks.controller';
import { ArtworksRepository } from '@/src/modules/artworks/artworks.repository';
import { ArtworksService } from '@/src/modules/artworks/artworks.service';
import { CreateArtworkDto } from '@/src/modules/artworks/dtos/create-artwork.dto';
import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { ImageFileType } from '@/src/modules/artworks/enums/file-type.enum';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { SortType } from '@/src/modules/artworks/enums/sort-type.enum';
import { StatusValidator } from '@/src/modules/artworks/validators/artwork-status.validator';
import { AuthService } from '@/src/modules/auth/auth.service';
import { Administrator } from '@/src/modules/auth/entities/administrator.entity';
import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { StorageService } from '@/src/modules/storage/storage.service';
import { AdministratorsFactory } from '@/test/factories/administrator.factory';
import { ArtworkTranslationsFactory } from '@/test/factories/artwork-translations.factory';
import { ArtworksFactory } from '@/test/factories/artworks.factory';
import { GenresFactory } from '@/test/factories/genres.factory';
import { createTestAccessToken } from '@/test/utils/auth.util';
import { clearTables, saveEntities } from '@/test/utils/database.util';
import { createTestingApp } from '@/test/utils/module-builder.util';

describeWithDeps('ArtworksController', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let authService: AuthService;
  let artworkRepository: Repository<Artwork>;
  let genreRepository: Repository<Genre>;
  let administratorRepository: Repository<Administrator>;

  let administrator: Administrator;

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
        StatusValidator,
        StorageService,
        ArtworksRepository,
        GenresRepository,
      ],
    });

    authService = app.get(AuthService);

    dataSource = app.get<DataSource>(DataSource);
    genreRepository = dataSource.getRepository(Genre);
    artworkRepository = dataSource.getRepository(Artwork);
    administratorRepository = dataSource.getRepository(Administrator);

    await app.init();
  });

  beforeEach(async () => {
    await clearTables(dataSource, [Artwork, Genre, Administrator]);

    administrator = (
      await saveEntities(administratorRepository, [
        AdministratorsFactory.createTestData(),
      ])
    )[0];
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('GET /artworks', () => {
    let genres: Genre[];

    beforeEach(async () => {
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
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .post('/artworks')
        .set('Authorization', `Bearer ${token}`)
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
      const token = await createTestAccessToken(authService, administrator);

      const { koTitle, ...invalidDto } = createDto;

      const response = await request(app.getHttpServer())
        .post('/artworks')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidDto)
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('존재하지 않는 장르 ID로 생성 시도 시 400 에러가 반환되어야 함', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const dtoWithInvalidGenreId = {
        ...createDto,
        genreIds: ['non-existing-genre-id'],
      };

      const response = await request(app.getHttpServer())
        .post('/artworks')
        .set('Authorization', `Bearer ${token}`)
        .send(dtoWithInvalidGenreId)
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('인증에 실패한 경우, 401 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/artworks')
        .set('Authorization', 'Bearer invalid-token')
        .send(createDto)
        .expect(401);

      await expect(response).toMatchOpenAPISpec();
    });
  });

  describe('POST /artworks/images', () => {
    it('유효한 이미지로 업로드할 경우, 처리가 성공함', async () => {
      const token = await createTestAccessToken(authService, administrator);

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
        .set('Authorization', `Bearer ${token}`)
        .attach('image', imageData, {
          filename: 'test.png',
          contentType: ImageFileType.PNG,
        })
        .expect(201);

      await expect(response).toMatchOpenAPISpec();
      expect(response.body.imageKey).toBeDefined();
    });

    it('이미지 파일이 누락될 경우, 400 에러가 반환됨', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .post('/artworks/images')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('이미지 파일 형식이 사양 외인 경우, 400 에러가 반환됨', async () => {
      const token = await createTestAccessToken(authService, administrator);

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
        .set('Authorization', `Bearer ${token}`)
        .attach('image', imageData, {
          filename: 'test.gif',
          contentType: 'image/gif',
        })
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('인증에 실패한 경우, 401 에러가 반환됨', async () => {
      const imageData = await Sharp({
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: 'green',
        },
      })
        .png()
        .toBuffer();

      const response = await request(app.getHttpServer())
        .post('/artworks/images')
        .set('Authorization', 'Bearer invalid-token')
        .attach('image', imageData, {
          filename: 'test.png',
          contentType: ImageFileType.PNG,
        })
        .expect(401);

      await expect(response).toMatchOpenAPISpec();
    });

    it('이미지 파일 용량이 제한치를 초과할 경우, 413 에러가 반환됨', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const largeBuffer = Buffer.alloc(101 * 1024 * 1024); // 101MB

      const response = await request(app.getHttpServer())
        .post('/artworks/images')
        .set('Authorization', `Bearer ${token}`)
        .attach('image', largeBuffer, {
          filename: 'larger.jpg',
          contentType: ImageFileType.JPEG,
        })
        .expect(413);

      await expect(response).toMatchOpenAPISpec();
    });
  });

  describe('PATCH /artworks/statuses', () => {
    let artworks: Artwork[];
    let genres: Genre[];

    beforeEach(async () => {
      genres = await saveEntities(genreRepository, [
        GenresFactory.createTestData({
          translations: [
            { language: Language.KO, name: '액션' },
            { language: Language.EN, name: 'Action' },
            { language: Language.JA, name: 'アクション' },
          ] as GenreTranslation[],
        }),
      ]);

      artworks = await saveEntities(artworkRepository, [
        ArtworksFactory.createTestData(
          {
            isDraft: true,
            genres: [genres[0]],
            createdAt: new Date(),
            playedOn: Platform.STEAM,
            rating: 15,
          },
          [
            ArtworkTranslationsFactory.createTestData({
              shortReview: '리뷰 작성 완료',
            }),
          ],
        ), // 검증 통과할 비공개인 작품
        ArtworksFactory.createTestData(
          {
            isDraft: true,
            createdAt: null,
            genres: [genres[0]],
          },
          [ArtworkTranslationsFactory.createTestData()],
        ), // 검증 실패할 비공개인 작품
        ArtworksFactory.createTestData(
          {
            isDraft: false,
            genres: [genres[0]],
          },
          [ArtworkTranslationsFactory.createTestData()],
        ), // 공개인 작품
      ]);
    });

    it('모든 작품의 상태 변경이 성공할 경우, 204가 반환됨', async () => {
      const updateDto = {
        ids: [artworks[0].id],
        setPublished: true,
      };

      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .patch('/artworks/statuses')
        .set('Authorization', `Bearer ${token}`)
        .send(updateDto)
        .expect(204);

      await expect(response).toMatchOpenAPISpec();

      const updated = await artworkRepository.findOneBy({ id: artworks[0].id });
      expect(updated.isDraft).toBe(false);
    });

    it('일부 작품만 상태 변경이 성공할 경우, 207이 반환됨', async () => {
      const updateDto = {
        ids: [artworks[0].id, artworks[1].id], // 검증 통과 작품 + 검증 실패 작품
        setPublished: true,
      };

      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .patch('/artworks/statuses')
        .set('Authorization', `Bearer ${token}`)
        .send(updateDto)
        .expect(207);

      await expect(response).toMatchOpenAPISpec();

      const success = await artworkRepository.findOneBy({ id: artworks[0].id });
      expect(success.isDraft).toBe(false);

      const failed = await artworkRepository.findOneBy({ id: artworks[1].id });
      expect(failed.isDraft).toBe(true);
    });

    it('모든 작품이 상태 변경에 실패한 경우, 207이 반환됨', async () => {
      const updateDto = {
        ids: [artworks[1].id, 'non-existent-id'], // 검증 실패 작품 + 존재하지 않는 ID
        setPublished: true,
      };

      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .patch('/artworks/statuses')
        .set('Authorization', `Bearer ${token}`)
        .send(updateDto)
        .expect(207);

      await expect(response).toMatchOpenAPISpec();

      const unchanged = await artworkRepository.findOneBy({
        id: artworks[1].id,
      });
      expect(unchanged.isDraft).toBe(true);
    });

    it('리퀘스트 바디가 부적절할 경우, 400 에러가 반환됨', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .patch('/artworks/statuses')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [] })
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('인증에 실패한 경우, 401 에러가 반환됨', async () => {
      const updateDto = {
        ids: [artworks[0].id],
        setPublished: true,
      };

      const response = await request(app.getHttpServer())
        .patch('/artworks/statuses')
        .set('Authorization', 'Bearer invalid-token')
        .send(updateDto)
        .expect(401);

      await expect(response).toMatchOpenAPISpec();
    });
  });

  describe('DELETE /artworks', () => {
    let artworks: Artwork[];
    let genres: Genre[];

    beforeEach(async () => {
      genres = await saveEntities(genreRepository, [
        GenresFactory.createTestData({
          translations: [
            { language: Language.KO, name: '액션' },
            { language: Language.EN, name: 'Action' },
            { language: Language.JA, name: 'アクション' },
          ] as GenreTranslation[],
        }),
      ]);

      artworks = await saveEntities(artworkRepository, [
        // 비공개 작품
        ArtworksFactory.createTestData(
          {
            isDraft: true,
            genres: [genres[0]],
          },
          [ArtworkTranslationsFactory.createTestData()],
        ),
        // 다른 비공개 작품
        ArtworksFactory.createTestData(
          {
            isDraft: true,
            genres: [genres[0]],
          },
          [ArtworkTranslationsFactory.createTestData()],
        ),
        // 공개 작품
        ArtworksFactory.createTestData(
          {
            isDraft: false,
            genres: [genres[0]],
          },
          [ArtworkTranslationsFactory.createTestData()],
        ),
      ]);
    });

    it('유효한 ID 목록으로 비공개 작품 삭제 시 성공적으로 처리됨', async () => {
      const deleteDto = {
        ids: [artworks[0].id, artworks[1].id], // 비공개 작품들
      };

      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .delete('/artworks')
        .set('Authorization', `Bearer ${token}`)
        .send(deleteDto)
        .expect(204);

      await expect(response).toMatchOpenAPISpec();

      const saved = await artworkRepository.findBy({
        id: In(deleteDto.ids),
      });
      expect(saved).toEqual([]);
    });

    it('리퀘스트 바디가 부적절할 경우, 400 에러가 반환됨', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .delete('/artworks')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [] })
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('인증에 실패한 경우, 401 에러가 반환됨', async () => {
      const deleteDto = {
        ids: [artworks[0].id],
      };

      const response = await request(app.getHttpServer())
        .delete('/artworks')
        .set('Authorization', 'Bearer invalid-token')
        .send(deleteDto)
        .expect(401);

      await expect(response).toMatchOpenAPISpec();
    });

    it('존재하지 않는 ID로 작품 삭제 시 404 에러가 반환됨', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .delete('/artworks')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: ['invalid-id'] })
        .expect(404);

      await expect(response).toMatchOpenAPISpec();
    });

    it('공개 상태인 작품을 포함하여 삭제 시도할 경우, 409 에러가 반환됨', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .delete('/artworks')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [artworks[0].id, artworks[2].id] }) // 비공개 + 공개 작품
        .expect(409);

      await expect(response).toMatchOpenAPISpec();
    });
  });
});
