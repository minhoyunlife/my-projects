import { INestApplication } from '@nestjs/common';

import request from 'supertest';
import { DataSource, Repository } from 'typeorm';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { AuthService } from '@/src/modules/auth/auth.service';
import { Administrator } from '@/src/modules/auth/entities/administrator.entity';
import { TokenErrorCode } from '@/src/modules/auth/exceptions/token.exception';
import { INVALID_INPUT_DATA } from '@/src/modules/config/settings/validation-pipe.config';
import { CreateGenreDto } from '@/src/modules/genres/dtos/create-genre.dto';
import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';
import { GenreErrorCode } from '@/src/modules/genres/exceptions/genres.exception';
import { GenresController } from '@/src/modules/genres/genres.controller';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { GenresService } from '@/src/modules/genres/genres.service';
import { AdministratorsFactory } from '@/test/factories/administrator.factory';
import { GenresFactory } from '@/test/factories/genres.factory';
import { createTestAccessToken } from '@/test/utils/auth.util';
import { clearTables, saveEntities } from '@/test/utils/database.util';
import { createTestingApp } from '@/test/utils/module-builder.util';

describeWithDeps('GenresController', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let authService: AuthService;
  let genreRepository: Repository<Genre>;
  let administratorRepository: Repository<Administrator>;

  let administrator: Administrator;

  beforeAll(async () => {
    app = await createTestingApp({
      entities: [Genre, GenreTranslation, Administrator],
      controllers: [GenresController],
      providers: [GenresService, GenresRepository],
    });

    dataSource = app.get<DataSource>(DataSource);

    await app.init();
  });

  beforeEach(async () => {
    await clearTables(dataSource, [Genre, Administrator]);

    authService = app.get(AuthService);
    genreRepository = dataSource.getRepository(Genre);
    administratorRepository = dataSource.getRepository(Administrator);

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

  describe('GET /genres', () => {
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
    });

    it('모든 장르를 조회할 수 있음', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .get('/genres')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      await expect(response).toMatchOpenAPISpec();

      const { items, metadata } = response.body;

      expect(items).toHaveLength(2);
      expect(metadata.pageSize).toBe(PAGE_SIZE.CMS);
    });

    it('검색어로 제목 필터링이 정상적으로 동작함', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .get('/genres')
        .set('Authorization', `Bearer ${token}`)
        .query({ search: 'action' })
        .expect(200);

      await expect(response).toMatchOpenAPISpec();

      const { items } = response.body;

      expect(
        items.every((item) =>
          item.translations.some((translation) =>
            translation.name.toLowerCase().includes('action'),
          ),
        ),
      ).toBe(true);
    });

    it('페이지네이션이 정상적으로 동작함', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .get('/genres')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1 })
        .expect(200);

      await expect(response).toMatchOpenAPISpec();

      const { metadata } = response.body;

      expect(metadata.currentPage).toBe(1);
      expect(metadata.totalPages).toBeDefined();
      expect(metadata.totalCount).toBeDefined();
    });

    it('유효하지 않은 쿼리를 전달할 경우, 400 가 발생함', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .get('/genres')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 'a' })
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('잘못된 토큰으로 요청할 경우, 401이 발생함', async () => {
      const response = await request(app.getHttpServer())
        .get('/genres')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      await expect(response).toMatchOpenAPISpec();
    });
  });

  describe('POST /genres', () => {
    beforeEach(async () => {
      await saveEntities(genreRepository, [
        GenresFactory.createTestData({
          translations: [
            { language: Language.KO, name: '롤플레잉' },
            { language: Language.EN, name: 'RPG' },
            { language: Language.JA, name: 'ロールプレイング' },
          ] as GenreTranslation[],
        }),
      ]);
    });

    const createDto: CreateGenreDto = {
      koName: '액션',
      enName: 'Action',
      jaName: 'アクション',
    };

    it('유효한 DTO로 장르 생성 시 DB에 정상적으로 저장됨', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .post('/genres')
        .set('Authorization', `Bearer ${token}`)
        .send(createDto)
        .expect(201);

      await expect(response).toMatchOpenAPISpec();

      const genres = await genreRepository.findBy({ id: response.body.id });
      expect(genres).not.toBeNull();
    });

    it('리퀘스트 바디가 부적절할 경우, 400 에러가 반환됨', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .post('/genres')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...createDto, enName: undefined })
        .expect(400);

      await expect(response).toMatchOpenAPISpec();

      expect(response.body.code).toBe(INVALID_INPUT_DATA);
    });

    it('인증에 실패한 경우, 401 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/genres')
        .set('Authorization', 'Bearer invalid-token')
        .send(createDto)
        .expect(401);

      await expect(response).toMatchOpenAPISpec();

      expect(response.body.code).toBe(TokenErrorCode.INVALID_TOKEN);
    });

    it('이미 존재하는 장르 이름을 생성할 경우, 409 에러가 반환됨', async () => {
      const token = await createTestAccessToken(authService, administrator);

      const response = await request(app.getHttpServer())
        .post('/genres')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...createDto, enName: 'RPG' })
        .expect(409);

      await expect(response).toMatchOpenAPISpec();

      expect(response.body.code).toBe(GenreErrorCode.DUPLICATE_NAME);
    });
  });
});
