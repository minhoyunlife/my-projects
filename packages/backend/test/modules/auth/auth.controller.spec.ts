import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { authenticator } from 'otplib';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { TokenType } from '@/src/common/enums/token-type.enum';
import { decrypt } from '@/src/common/utils/encryption.util';
import { AuthController } from '@/src/modules/auth/auth.controller';
import { AuthService } from '@/src/modules/auth/auth.service';
import { Administrator } from '@/src/modules/auth/entities/administrator.entity';
import { Totp } from '@/src/modules/auth/entities/totp.entity';
import { AdministratorsFactory } from '@/test/factories/administrator.factory';
import {
  createTestAccessToken,
  createTestRefreshToken,
  createTestTempToken,
} from '@/test/utils/auth.util';
import { clearTables } from '@/test/utils/database.util';
import { createTestingApp } from '@/test/utils/module-builder.util';

describeWithDeps('AuthController', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authService: AuthService;
  let configService: ConfigService;
  let controller: AuthController;

  beforeAll(async () => {
    app = await createTestingApp({
      entities: [Administrator, Totp],
      controllers: [AuthController],
      providers: [JwtService, AuthService],
    });

    dataSource = app.get<DataSource>(DataSource);
    authService = app.get<AuthService>(AuthService);
    configService = app.get<ConfigService>(ConfigService);
    controller = app.get<AuthController>(AuthController);
    await app.init();
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  afterEach(async () => {
    await clearTables(dataSource, [Administrator, Totp]);
  });

  describe('GET /auth/github', () => {
    it('GitHub 로그인 페이지로 리다이렉트됨', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/github')
        .expect(302);

      await expect(response).toMatchOpenAPISpec();

      const redirectUrl = new URL(response.headers.location);
      const scope = decodeURIComponent(redirectUrl.searchParams.get('scope'));

      expect(redirectUrl.origin).toBe('https://github.com');
      expect(redirectUrl.pathname).toBe('/login/oauth/authorize');
      expect(redirectUrl.searchParams.has('client_id')).toBe(true);
      expect(redirectUrl.searchParams.has('redirect_uri')).toBe(true);
      expect(scope).toBe('user:email');
    });
  });

  // NOTE: Github 인증 처리 과정이 복잡하므로 Supertest 를 사용하지 않고 컨트롤러 자체의 테스트로 수행
  describe('GET /auth/github/callback', () => {
    it('초기 설정이 필요한 경우, 인증 성공 후 임시 토큰과 함께 2FA 설정 페이지로 리다이렉트됨', async () => {
      const user = AdministratorsFactory.createTestData({
        isTotpEnabled: false,
      }) as Administrator;

      const mockRequest = { user };
      const mockResponse = { redirect: vi.fn() };

      await controller.githubAuthCallback(
        mockRequest as any,
        mockResponse as any,
      );

      expect(mockResponse.redirect).toHaveBeenCalled();

      const redirectUrl = new URL(mockResponse.redirect.mock.calls[0][0]);
      expect(redirectUrl.origin).toBe(configService.get('auth.adminWebUrl'));
      expect(redirectUrl.pathname).toBe('/2fa-setup');
      expect(redirectUrl.searchParams.has('token')).toBe(true);
    });

    it('초기 설정이 불필요한 경우, 인증 성공 후 임시 토큰과 함께 2FA 인증 페이지로 리다이렉트됨', async () => {
      const user = AdministratorsFactory.createTestData({
        isTotpEnabled: true,
      }) as Administrator;

      const mockRequest = { user };
      const mockResponse = { redirect: vi.fn() };

      await controller.githubAuthCallback(
        mockRequest as any,
        mockResponse as any,
      );

      expect(mockResponse.redirect).toHaveBeenCalled();

      const redirectUrl = new URL(mockResponse.redirect.mock.calls[0][0]);
      expect(redirectUrl.origin).toBe(configService.get('auth.adminWebUrl'));
      expect(redirectUrl.pathname).toBe('/2fa');
      expect(redirectUrl.searchParams.has('token')).toBe(true);
    });
  });

  describe('POST /auth/2fa/setup', () => {
    it('201 상태코드와 함께, QR코드 URL과 백업코드가 반환됨', async () => {
      const user = AdministratorsFactory.createTestData({
        isTotpEnabled: false,
      }) as Administrator;
      await dataSource.getRepository(Administrator).save(user);

      const tempToken = await createTestTempToken(authService, user);

      const response = await request(app.getHttpServer())
        .post('/auth/2fa/setup')
        .set('Authorization', `Bearer ${tempToken}`);

      const totp = await dataSource.getRepository(Totp).findOneBy({
        adminEmail: user.email,
      });
      expect(totp).not.toBeNull();

      await expect(response).toMatchOpenAPISpec();
      expect(response.body.qrCodeUrl).toBeDefined();
      expect(response.body.manualEntryKey).toBeDefined();
      expect(response.body.setupToken).toBeDefined();
    });

    it('인증 헤더가 없는 경우, 400 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/2fa/setup')
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('인증 토큰 형식이 올바르지 않은 경우, 401 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/2fa/setup')
        .set('Authorization', `Bearer invalid-token`)
        .expect(401);

      await expect(response).toMatchOpenAPISpec();
    });

    it('토큰 인증에 실패한 경우, 401 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/2fa/setup')
        .set('Authorization', `Bearer invalid-token`)
        .expect(401);

      await expect(response).toMatchOpenAPISpec();
    });
  });

  describe('POST /auth/2fa/verify', () => {
    let user: Administrator;
    let tempToken: string;
    let code: string;

    beforeEach(async () => {
      user = AdministratorsFactory.createTestData({
        isTotpEnabled: true,
      }) as Administrator;
      await dataSource.getRepository(Administrator).save(user);

      await authService.setupTotp(user.email);

      tempToken = await createTestTempToken(authService, user);

      const totp = await dataSource.getRepository(Totp).findOneBy({
        adminEmail: user.email,
      });
      const secret = decrypt(
        totp.encryptedSecret,
        configService.get('database.encryptionKey'),
      );
      code = authenticator.generate(secret);
    });

    it('200 상태코드와 함께, 인증 토큰과 리프레시 토큰이 반환됨', async () => {
      const totp = await dataSource.getRepository(Totp).findOneBy({
        adminEmail: user.email,
      });

      const secret = decrypt(
        totp.encryptedSecret,
        configService.get('database.encryptionKey'),
      );
      const code = authenticator.generate(secret);

      const tempToken = await createTestTempToken(authService, user);

      const response = await request(app.getHttpServer())
        .post('/auth/2fa/verify')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({ code: code })
        .expect(200);

      await expect(response).toMatchOpenAPISpec();

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.expiresIn).toBe(
        authService.TOKEN_EXPIRY[TokenType.ACCESS],
      );

      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(/^refreshToken=.+/);
    });

    it('최초 인증의 경우, 백업코드도 함께 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/2fa/verify')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({
          code,
          setupToken: 'setup-token', // setupToken 존재 여부로 초기 설정 구분
        })
        .expect(200);

      await expect(response).toMatchOpenAPISpec();
      expect(response.body.backupCodes).toBeDefined();
      expect(response.body.backupCodes).toHaveLength(8);
    });

    it('인증 코드가 전달되지 않은 경우, 400 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/2fa/verify')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({})
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('잘못된 형식의 인증 코드가 전달된 경우, 400 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/2fa/verify')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({ code: '12345' })
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('TOTP가 설정되지 않은 상태에서 인증 시도 시, 400 에러가 반환됨', async () => {
      await dataSource.getRepository(Totp).delete({ adminEmail: user.email }); // TOTP 설정 삭제

      const response = await request(app.getHttpServer())
        .post('/auth/2fa/verify')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({ code })
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('임시 토큰 없이 요청할 경우, 400 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/2fa/verify')
        .send({ code })
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('무효한 토큰이 전달된 경우, 401 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/2fa/verify')
        .set('Authorization', `Bearer invalid-token`)
        .send({ code })
        .expect(401);

      await expect(response).toMatchOpenAPISpec();
    });

    it('일치하지 않는 코드인 경우, 401 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/2fa/verify')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({ code: '000000' });

      await expect(response).toMatchOpenAPISpec();
    });

    it('최대 시도 횟수를 초과하여 인증 시도를 할 경우, 429 에러가 반환됨', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/auth/2fa/verify')
          .set('Authorization', `Bearer ${tempToken}`)
          .send({ code: '123456' }) // 형식은 맞으나 잘못된 코드를 상정
          .expect(401);
      }

      const response = await request(app.getHttpServer())
        .post('/auth/2fa/verify')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({ code: '123456' })
        .expect(429);

      await expect(response).toMatchOpenAPISpec();
    });
  });

  describe('POST /auth/2fa/backup', () => {
    let user: Administrator;
    let tempToken: string;
    let backupCode: string;

    beforeEach(async () => {
      user = AdministratorsFactory.createTestData({
        isTotpEnabled: true,
      }) as Administrator;
      await dataSource.getRepository(Administrator).save(user);

      await authService.setupTotp(user.email);

      const totp = await dataSource
        .getRepository(Totp)
        .findOneBy({ adminEmail: user.email });

      backupCode = decrypt(
        totp.backupCodes[0],
        configService.get('database.encryptionKey'),
      );

      tempToken = await createTestTempToken(authService, user);
    });

    it('200 상태코드와 함께, 인증 토큰과 리프레시 토큰이 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/2fa/backup')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({ code: backupCode })
        .expect(200);

      await expect(response).toMatchOpenAPISpec();

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.expiresIn).toBe(
        authService.TOKEN_EXPIRY[TokenType.ACCESS],
      );

      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(/^refreshToken=.+/);
    });

    it('임시 토큰 없이 요청할 경우, 400 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/2fa/backup')
        .send({ code: backupCode })
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('백업 코드가 전달되지 않은 경우, 400 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/2fa/backup')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({})
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('잘못된 형식의 백업 코드가 전달된 경우, 400 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/2fa/backup')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({ code: '111111' })
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('일치하지 않는 백업 코드가 전달된 경우, 401 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/2fa/backup')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({ code: 'AAAAAAAA' })
        .expect(401);

      await expect(response).toMatchOpenAPISpec();
    });

    it('존재하지 않는 백업 코드로 인증 시도 시, 401 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/2fa/backup')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({ code: 'AAAAAAAA' })
        .expect(401);

      await expect(response).toMatchOpenAPISpec();
    });

    it('최대 시도 횟수를 초과하여 인증 시도를 할 경우, 429 에러가 반환됨', async () => {
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/auth/2fa/backup')
          .set('Authorization', `Bearer ${tempToken}`)
          .send({ code: 'AAAAAAAA' }) // 형식은 맞으나 잘못된 코드를 상정
          .expect(401);
      }

      const response = await request(app.getHttpServer())
        .post('/auth/2fa/backup')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({ code: 'AAAAAAAA' })
        .expect(429);

      await expect(response).toMatchOpenAPISpec();
    });
  });

  describe('POST /auth/refresh', () => {
    it('200 상태코드와 함께, 새로운 액세스 토큰이 반환됨', async () => {
      const user = AdministratorsFactory.createTestData({
        isTotpEnabled: true,
      }) as Administrator;
      await dataSource.getRepository(Administrator).save(user);

      const refreshToken = await createTestRefreshToken(authService, user);

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken};`])
        .expect(200);

      await expect(response).toMatchOpenAPISpec();

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.expiresIn).toBe(
        authService.TOKEN_EXPIRY[TokenType.ACCESS],
      );
    });

    it('리프레시 토큰 쿠키가 없는 경우, 400 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', [])
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('리프레시 토큰이 유효하지 않은 경우, 401 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', ['refreshToken=invalidToken;'])
        .expect(401);

      await expect(response).toMatchOpenAPISpec();
    });
  });

  describe('POST /auth/logout', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      const user = AdministratorsFactory.createTestData({
        isTotpEnabled: true,
      }) as Administrator;
      await dataSource.getRepository(Administrator).save(user);

      accessToken = await createTestAccessToken(authService, user);
      refreshToken = await createTestRefreshToken(authService, user);
    });

    it('200 상태코드와 함께, 리프레시 토큰 쿠키가 제거됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', [`refreshToken=${refreshToken};`])
        .expect(200);

      await expect(response).toMatchOpenAPISpec();

      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(/refreshToken=;/);
      expect(response.headers['set-cookie'][0]).toMatch(/HttpOnly/);
    });

    it('리프레시 토큰 없이 요청할 경우, 400 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(400);

      await expect(response).toMatchOpenAPISpec();
    });

    it('유효하지 않은 리프레시 토큰으로 요청할 경우, 401 에러가 반환됨', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', ['refreshToken=invalid-token;'])
        .expect(401);

      await expect(response).toMatchOpenAPISpec();
    });
  });
});
