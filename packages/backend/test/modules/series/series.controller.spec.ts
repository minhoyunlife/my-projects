import { INestApplication } from '@nestjs/common';

import request from 'supertest';
import { DataSource, Repository } from 'typeorm';

import { AuthService } from '@/src/modules/auth/auth.service';
import { Administrator } from '@/src/modules/auth/entities/administrator.entity';
import { TokenErrorCode } from '@/src/modules/auth/exceptions/token.exception';
import { INVALID_INPUT_DATA } from '@/src/modules/config/settings/validation-pipe.config';
import { Language } from '@/src/modules/genres/enums/language.enum';
import { CreateSeriesDto } from '@/src/modules/series/dtos/create-series.dto';
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
  let administratorRepository: Repository<Administrator>;

  let administrator: Administrator;

  beforeAll(async () => {
    app = await createTestingApp({
      entities: [Series, SeriesTranslation, SeriesArtwork, Administrator],
      controllers: [SeriesController],
      providers: [
        SeriesService,
        SeriesRepository,
        SeriesMapper,
        SeriesValidator,
      ],
    });

    authService = app.get(AuthService);

    dataSource = app.get(DataSource);
    seriesRepository = dataSource.getRepository(Series);
    administratorRepository = dataSource.getRepository(Administrator);

    await app.init();
  });

  beforeEach(async () => {
    await clearTables(dataSource, [Series, Administrator]);

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
});
