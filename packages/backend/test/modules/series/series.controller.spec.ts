import { INestApplication } from '@nestjs/common';

import request from 'supertest';
import { DataSource, Repository } from 'typeorm';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { AuthService } from '@/src/modules/auth/auth.service';
import { Administrator } from '@/src/modules/auth/entities/administrator.entity';
import { TokenErrorCode } from '@/src/modules/auth/exceptions/token.exception';
import { INVALID_INPUT_DATA } from '@/src/modules/config/settings/validation-pipe.config';
import { Language } from '@/src/modules/genres/enums/language.enum';
import { CreateSeriesDto } from '@/src/modules/series/dtos/create-series.dto';
import { UpdateSeriesDto } from '@/src/modules/series/dtos/update-series.dto';
import { SeriesArtwork } from '@/src/modules/series/entities/series-artworks.entity';
import { SeriesTranslation } from '@/src/modules/series/entities/series-translations.entity';
import { Series } from '@/src/modules/series/entities/series.entity';
import { SeriesController } from '@/src/modules/series/series.controller';
import { SeriesErrorCode } from '@/src/modules/series/series.exception';
import { SeriesMapper } from '@/src/modules/series/series.mapper';
import { SeriesRepository } from '@/src/modules/series/series.repository';
import { SeriesService } from '@/src/modules/series/series.service';
import { SeriesValidator } from '@/src/modules/series/series.validator';
import { AdministratorsFactory } from '@/test/factories/administrator.factory';
import { ArtworkTranslationsFactory } from '@/test/factories/artwork-translations.factory';
import { ArtworksFactory } from '@/test/factories/artworks.factory';
import { SeriesArtworksFactory } from '@/test/factories/series-artworks.factory';
import { SeriesTranslationsFactory } from '@/test/factories/series-translations.factory';
import { SeriesFactory } from '@/test/factories/series.factory';
import { createTestAccessToken } from '@/test/utils/auth.util';
import { clearTables, saveEntities } from '@/test/utils/database.util';
import { createTestingApp } from '@/test/utils/module-builder.util';

describeWithDeps('SeriesController', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let authService: AuthService;
  let seriesRepository: Repository<Series>;
  let artworkRepository: Repository<Artwork>;
  let seriesArtworkRepository: Repository<SeriesArtwork>;
  let administratorRepository: Repository<Administrator>;

  let administrator: Administrator;

  beforeAll(async () => {
    app = await createTestingApp({
      entities: [
        Series,
        SeriesTranslation,
        SeriesArtwork,
        Artwork,
        Administrator,
      ],
      controllers: [SeriesController],
      providers: [
        SeriesService,
        SeriesRepository,
        SeriesMapper,
        SeriesValidator,
      ],
    });

    authService = app.get(AuthService);

    dataSource = app.get<DataSource>(DataSource);
    seriesRepository = dataSource.getRepository(Series);
    artworkRepository = dataSource.getRepository(Artwork);
    seriesArtworkRepository = dataSource.getRepository(SeriesArtwork);
    administratorRepository = dataSource.getRepository(Administrator);

    await app.init();
  });

  beforeEach(async () => {
    await clearTables(dataSource, [Series, Artwork, Administrator]);

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

  describe('GET /series', () => {
    let series: Series[];
    let artworks: Artwork[];

    beforeEach(async () => {
      // 시리즈 데이터 생성
      series = await saveEntities(seriesRepository, [
        SeriesFactory.createTestData({}, [
          SeriesTranslationsFactory.createTestData({
            language: Language.KO,
            title: '파이널 판타지',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.EN,
            title: 'Final Fantasy',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.JA,
            title: 'ファイナルファンタジー',
          }),
        ]),
        SeriesFactory.createTestData({}, [
          SeriesTranslationsFactory.createTestData({
            language: Language.KO,
            title: '젤다의 전설',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.EN,
            title: 'The Legend of Zelda',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.JA,
            title: 'ゼルダの伝説',
          }),
        ]),
      ]);

      // 작품 데이터 생성
      artworks = await saveEntities(artworkRepository, [
        ArtworksFactory.createTestData({}, [
          ArtworkTranslationsFactory.createTestData({
            language: Language.KO,
            title: '파이널 판타지 7',
          }),
          ArtworkTranslationsFactory.createTestData({
            language: Language.EN,
            title: 'Final Fantasy VII',
          }),
          ArtworkTranslationsFactory.createTestData({
            language: Language.JA,
            title: 'ファイナルファンタジーVII',
          }),
        ]),
      ]);

      // 시리즈와 작품 연결
      await saveEntities(seriesArtworkRepository, [
        SeriesArtworksFactory.createTestData(
          { order: 0 },
          series[0],
          artworks[0],
        ),
      ]);
    });

    it('모든 시리즈를 조회할 수 있음', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .get('/series')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      await expect(response).toMatchOpenAPISpec();

      const { items, metadata } = response.body;

      expect(items).toHaveLength(2);
      expect(metadata.pageSize).toBe(PAGE_SIZE.CMS);

      // 시리즈와 연결된 작품 정보 확인
      const ffSeries = items.find((item) =>
        item.translations.some((t) => t.title === '파이널 판타지'),
      );
      expect(ffSeries).toBeDefined();
      expect(ffSeries.seriesArtworks).toHaveLength(1);
      expect(ffSeries.seriesArtworks[0].order).toBe(0);
      expect(ffSeries.seriesArtworks[0].id).toBe(artworks[0].id);

      // 작품이 연결되지 않은 시리즈 확인
      const zeldaSeries = items.find((item) =>
        item.translations.some((t) => t.title === '젤다의 전설'),
      );
      expect(zeldaSeries).toBeDefined();
      expect(zeldaSeries.seriesArtworks).toHaveLength(0);
    });

    it('검색어로 제목 필터링이 정상적으로 동작함', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .get('/series')
        .set('Authorization', `Bearer ${token}`)
        .query({ search: 'fantasy' })
        .expect(200);

      await expect(response).toMatchOpenAPISpec();

      const { items } = response.body;

      expect(
        items.every((item) =>
          item.translations.some((translation) =>
            translation.title.toLowerCase().includes('fantasy'),
          ),
        ),
      ).toBe(true);
    });

    it('페이지네이션이 정상적으로 동작함', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .get('/series')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1 })
        .expect(200);

      await expect(response).toMatchOpenAPISpec();

      const { metadata } = response.body;

      expect(metadata.currentPage).toBe(1);
      expect(metadata.totalPages).toBeDefined();
      expect(metadata.totalCount).toBeDefined();
    });

    it('유효하지 않은 쿼리를 전달할 경우, 400이 발생함', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .get('/series')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 'a' })
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('잘못된 토큰으로 요청할 경우, 401이 발생함', async () => {
      const response = await request(app.getHttpServer())
        .get('/series')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      await expect(response).toMatchOpenAPISpec();
    });
  });

  describe('POST /series', () => {
    beforeEach(async () => {
      await saveEntities(seriesRepository, [
        SeriesFactory.createTestData({}, [
          SeriesTranslationsFactory.createTestData({
            language: Language.KO,
            title: '젤다의 전설',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.EN,
            title: 'The Legend of Zelda',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.JA,
            title: 'ゼルダの伝説',
          }),
        ]),
      ]);
    });

    const createDto: CreateSeriesDto = {
      koTitle: '파이널 판타지',
      enTitle: 'Final Fantasy',
      jaTitle: 'ファイナルファンタジー',
    };

    it('유효한 DTO로 시리즈 생성 시 DB에 정상적으로 저장됨', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .post('/series')
        .set('Authorization', `Bearer ${token}`)
        .send(createDto)
        .expect(201);

      await expect(response).toMatchOpenAPISpec();

      const series = await seriesRepository.findBy({ id: response.body.id });
      expect(series).not.toBeNull();

      const createdSeries = await seriesRepository.findOne({
        where: { id: response.body.id },
        relations: { translations: true },
      });

      expect(createdSeries.translations).toHaveLength(3);
      expect(createdSeries.translations).toContainEqual(
        expect.objectContaining({
          language: Language.KO,
          title: '파이널 판타지',
        }),
      );
      expect(createdSeries.translations).toContainEqual(
        expect.objectContaining({
          language: Language.EN,
          title: 'Final Fantasy',
        }),
      );
      expect(createdSeries.translations).toContainEqual(
        expect.objectContaining({
          language: Language.JA,
          title: 'ファイナルファンタジー',
        }),
      );
    });

    it('리퀘스트 바디가 부적절할 경우, 400 에러가 반환됨', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .post('/series')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...createDto, enTitle: undefined })
        .expect(400);

      await expect(response).toMatchOpenAPISpec();

      expect(response.body.code).toBe(INVALID_INPUT_DATA);
    });

    it('모든 언어 번역이 제공되지 않은 경우, 400 에러가 반환됨', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .post('/series')
        .set('Authorization', `Bearer ${token}`)
        .send({
          koTitle: '파이널 판타지',
          enTitle: 'Final Fantasy',
        })
        .expect(400);

      await expect(response).toMatchOpenAPISpec();

      expect(response.body.code).toBe(INVALID_INPUT_DATA);
    });

    it('인증에 실패한 경우, 401 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/series')
        .set('Authorization', 'Bearer invalid-token')
        .send(createDto)
        .expect(401);

      await expect(response).toMatchOpenAPISpec();

      expect(response.body.code).toBe(TokenErrorCode.INVALID_TOKEN);
    });

    it('이미 존재하는 시리즈 제목을 생성할 경우, 409 에러가 반환됨', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .post('/series')
        .set('Authorization', `Bearer ${token}`)
        .send({
          koTitle: '젤다의 전설', // 중복 타이틀
          enTitle: 'Final Fantasy',
          jaTitle: 'ファイナルファンタジー',
        })
        .expect(409);

      await expect(response).toMatchOpenAPISpec();

      expect(response.body.code).toBe(SeriesErrorCode.DUPLICATE_TITLE);
    });
  });

  describe('PATCH /series/:id', () => {
    let existingSeries: Series;

    beforeEach(async () => {
      existingSeries = (
        await saveEntities(seriesRepository, [
          SeriesFactory.createTestData({}, [
            SeriesTranslationsFactory.createTestData({
              language: Language.KO,
              title: '파이널 판타지',
            }),
            SeriesTranslationsFactory.createTestData({
              language: Language.EN,
              title: 'Final Fantasy',
            }),
            SeriesTranslationsFactory.createTestData({
              language: Language.JA,
              title: 'ファイナルファンタジー',
            }),
          ]),
          SeriesFactory.createTestData({}, [
            SeriesTranslationsFactory.createTestData({
              language: Language.KO,
              title: '젤다의 전설',
            }),
            SeriesTranslationsFactory.createTestData({
              language: Language.EN,
              title: 'The Legend of Zelda',
            }),
            SeriesTranslationsFactory.createTestData({
              language: Language.JA,
              title: 'ゼルダの伝説',
            }),
          ]),
        ])
      )[0];
    });

    it('유효한 DTO로 시리즈 수정 시 200 응답으로 성공함', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const updateDto: UpdateSeriesDto = {
        koTitle: '수정된 파이널 판타지',
        enTitle: 'Updated Final Fantasy',
      };

      const response = await request(app.getHttpServer())
        .patch(`/series/${existingSeries.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateDto)
        .expect(200);

      await expect(response).toMatchOpenAPISpec();

      const updatedSeries = await seriesRepository.findOne({
        where: { id: existingSeries.id },
        relations: { translations: true },
      });

      expect(updatedSeries.translations).toHaveLength(3);
      expect(updatedSeries.translations).toContainEqual(
        expect.objectContaining({
          language: Language.KO,
          title: '수정된 파이널 판타지',
        }),
      );
      expect(updatedSeries.translations).toContainEqual(
        expect.objectContaining({
          language: Language.EN,
          title: 'Updated Final Fantasy',
        }),
      );
      expect(updatedSeries.translations).toContainEqual(
        expect.objectContaining({
          language: Language.JA,
          title: 'ファイナルファンタジー', // 수정되지 않음
        }),
      );
    });

    it('리퀘스트 바디가 비어있을 경우, 400 에러가 반환됨', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .patch(`/series/${existingSeries.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      await expect(response).toMatchOpenAPISpec();

      expect(response.body.code).toBe(SeriesErrorCode.NO_TRANSLATIONS_PROVIDED);
    });

    it('인증에 실패한 경우, 401 에러가 반환됨', async () => {
      const updateDto: UpdateSeriesDto = {
        koTitle: '수정된 파이널 판타지',
      };

      const response = await request(app.getHttpServer())
        .patch(`/series/${existingSeries.id}`)
        .set('Authorization', 'Bearer invalid-token')
        .send(updateDto)
        .expect(401);

      await expect(response).toMatchOpenAPISpec();

      expect(response.body.code).toBe(TokenErrorCode.INVALID_TOKEN);
    });

    it('존재하지 않는 시리즈 ID를 요청할 경우, 404 에러가 반환됨', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const updateDto: UpdateSeriesDto = {
        koTitle: '수정된 파이널 판타지',
      };

      const response = await request(app.getHttpServer())
        .patch('/series/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .send(updateDto)
        .expect(404);

      await expect(response).toMatchOpenAPISpec();

      expect(response.body.code).toBe(SeriesErrorCode.NOT_FOUND);
    });

    it('이미 존재하는 시리즈 제목으로 수정할 경우, 409 에러가 반환됨', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const updateDto: UpdateSeriesDto = {
        koTitle: '젤다의 전설', // 중복 타이틀
      };

      const response = await request(app.getHttpServer())
        .patch(`/series/${existingSeries.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateDto)
        .expect(409);

      await expect(response).toMatchOpenAPISpec();

      expect(response.body.code).toBe(SeriesErrorCode.DUPLICATE_TITLE);
    });
  });

  describe('DELETE /series', () => {
    let deleteSeriesList: Series[];
    let deleteArtworks: Artwork[];

    beforeEach(async () => {
      deleteSeriesList = await saveEntities(seriesRepository, [
        SeriesFactory.createTestData({}, [
          SeriesTranslationsFactory.createTestData({
            language: Language.KO,
            title: '파이널 판타지',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.EN,
            title: 'Final Fantasy',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.JA,
            title: 'ファイナルファンタジー',
          }),
        ]),
        SeriesFactory.createTestData({}, [
          SeriesTranslationsFactory.createTestData({
            language: Language.KO,
            title: '젤다의 전설',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.EN,
            title: 'The Legend of Zelda',
          }),
          SeriesTranslationsFactory.createTestData({
            language: Language.JA,
            title: 'ゼルダの伝説',
          }),
        ]),
      ]);

      deleteArtworks = await saveEntities(artworkRepository, [
        ArtworksFactory.createTestData({}, [
          ArtworkTranslationsFactory.createTestData({
            language: Language.KO,
            title: '파이널 판타지 7',
          }),
        ]),
      ]);

      await saveEntities(seriesArtworkRepository, [
        SeriesArtworksFactory.createTestData(
          { order: 0 },
          deleteSeriesList[0],
          deleteArtworks[0],
        ),
      ]);
    });

    it('유효한 ID 목록으로 시리즈 삭제 시 204 응답으로 성공함', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const deleteDto = {
        ids: [deleteSeriesList[1].id], // 젤다의 전설 (작품과 연결되지 않은 시리즈)
      };

      const response = await request(app.getHttpServer())
        .delete('/series')
        .set('Authorization', `Bearer ${token}`)
        .send(deleteDto)
        .expect(204);

      expect(response.body).toEqual({});

      const remainingSeries = await seriesRepository.find({
        where: { id: deleteSeriesList[1].id },
      });
      expect(remainingSeries).toHaveLength(0);
    });

    it('리퀘스트 바디가 부적절할 경우, 400 오류가 발생함', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .delete('/series')
        .set('Authorization', `Bearer ${token}`)
        .send({ ids: [] }) // 빈 ID 배열
        .expect(400);

      await expect(response).toMatchOpenAPISpec();

      expect(response.body.code).toBe(INVALID_INPUT_DATA);
    });

    it('인증에 실패한 경우, 401 오류가 발생함', async () => {
      const deleteDto = {
        ids: [deleteSeriesList[1].id],
      };

      const response = await request(app.getHttpServer())
        .delete('/series')
        .set('Authorization', 'Bearer invalid-token')
        .send(deleteDto)
        .expect(401);

      await expect(response).toMatchOpenAPISpec();

      expect(response.body.code).toBe(TokenErrorCode.INVALID_TOKEN);
    });

    it('삭제할 시리즈 ID가 존재하지 않을 경우 404 오류가 발생함', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const deleteDto = {
        ids: ['non-existent-id'],
      };

      const response = await request(app.getHttpServer())
        .delete('/series')
        .set('Authorization', `Bearer ${token}`)
        .send(deleteDto)
        .expect(404);

      await expect(response).toMatchOpenAPISpec();

      expect(response.body.code).toBe(SeriesErrorCode.NOT_FOUND);
    });

    it('사용 중인 시리즈를 삭제하려고 할 경우 409 오류가 발생함', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const deleteDto = {
        ids: [deleteSeriesList[0].id], // 파이널 판타지 (작품과 연결된 시리즈)
      };

      const response = await request(app.getHttpServer())
        .delete('/series')
        .set('Authorization', `Bearer ${token}`)
        .send(deleteDto)
        .expect(409);

      await expect(response).toMatchOpenAPISpec();

      expect(response.body.code).toBe(SeriesErrorCode.IN_USE);
      expect(response.body.errors).toHaveProperty('koTitles');
    });
  });
});
