# Testing Guideline

[한국어](#한국어) | [English](#english) | [日本語](#日本語)

---

# 한국어

## 개요

테스트 및 테스트 코드에 대한 가이드라인을 담고 있습니다.

## 테스트 구조

```
test/
├── factories/            # 테스트용 엔티티 생성기
├── utils/               # 테스트 유틸리티
│   ├── auth.util.ts     # 인증 관련 헬퍼
│   ├── database.util.ts # DB 조작 헬퍼
│   ├── dto.util.ts      # DTO 생성 헬퍼
│   └── module-builder.util.ts  # 테스트 모듈 생성기
└── modules/                 # 실제 테스트 케이스 (src 하의 폴더 구조 미러링)
```

## 주요 기능

### 1. OpenAPI 스펙 검증

- Supertest 응답이 OpenAPI 스펙을 준수하는지 자동 검증
- `toMatchOpenAPISpec()` 커스텀 매처 정의

### 2. 엔티티 팩토리 메소드

- 테스트용 엔티티 생성을 위한 팩토리 클래스들

### 3. 테스트 모듈 빌더

- DB 연결이 필요한 테스트용 모듈 정의
  - ex) 리포지토리 테스트
- DB 연결이 불필요한 테스트용 모듈 정의
  - ex) dto 테스트
- 컨트롤러 테스트용 전체 앱 생성 정의

### 4. 테스트 셋업

- `test:no-deps`: DB 나 S3 의존성이 필요 없는 테스트 실행
- `test:deps`: DB 나 S3 의존성이 필요한 테스트 실행
- `test:all`: 위 둘의 테스트를 모두 실행

의존성이 있는 테스트 실행 시에는 도커를 이용하므로, 실행 전 도커가 기동되어 있는지 확인해야 합니다.

## 사용 예시

### 컨트롤러 테스트

```typescript
describeWithDeps('ArtworksController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestingApp({
      entities: [Artwork],
      controllers: [ArtworksController],
      providers: [ArtworksService],
    });
  });

  it('should match OpenAPI spec', async () => {
    const response = await request(app.getHttpServer())
      .get('/artworks')
      .expect(200);

    await expect(response).toMatchOpenAPISpec();
  });
});
```

### 서비스 테스트

```typescript
describeWithoutDeps('ArtworksService', () => {
  let service: ArtworksService;

  beforeEach(async () => {
    const module = await createTestingModuleWithoutDB({
      providers: [
        ArtworksService,
        {
          provide: ArtworksRepository,
          useValue: mockRepository,
        },
      ],
    });

    service = module.get<ArtworksService>(ArtworksService);
  });
});
```

### Factory 사용

```typescript
const artwork = ArtworksFactory.createTestData({ isDraft: true }, [
  ArtworkTranslationsFactory.createTestData({
    language: Language.KO,
    title: '테스트',
  }),
]);
```

## 테스트 가이드라인

1. 각 테스트는 독립적으로 실행 가능해야 함
2. DB 테스트 시 기본적으로 매 테스트마다 데이터 초기화
3. Mocking은 최소한으로 사용
4. 컨트롤러 테스트 시, OpenAPI 스펙 준수 여부 항상 검증

## 테스트 레벨별 가이드라인

### 컨트롤러 테스트

E2E 테스트 관점으로 접근
실제 HTTP 요청/응답 사이클 테스트
OpenAPI 스펙 준수 여부 필수 검증
인증이 필요한 엔드포인트는 인증 실패 케이스도 반드시 포함

### 서비스 테스트

비즈니스 로직에 집중
엣지 케이스 및 예외 상황 테스트에 중점
트랜잭션 처리가 필요한 케이스 검증

### 리포지토리 테스트

실제 DB 연동하여 테스트
쿼리 결과 검증
데이터 정합성 검증

---

# English

## Overview

This document contains guidelines for tests and test code.

## Test Structure

```
test/
├── factories/            # Entity factories for testing
├── utils/               # Test utilities
│   ├── auth.util.ts     # Authentication helpers
│   ├── database.util.ts # DB operation helpers
│   ├── dto.util.ts      # DTO creation helpers
│   └── module-builder.util.ts  # Test module builder
└── modules/             # Actual test cases (mirroring src folder structure)
```

## Key Features

### 1. OpenAPI Spec Validation

- Automatic validation of Supertest responses against OpenAPI specification
- Custom matcher `toMatchOpenAPISpec()` defined

### 2. Entity Factory Methods

- Factory classes for creating test entities

### 3. Test Module Builder

- Define test modules requiring DB connection
  - ex) repository tests
- Define test modules not requiring DB connection
  - ex) dto tests
- Define full app creation for controller tests

### 4. Test Setup

- `test:no-deps`: Run tests without DB or S3 dependencies
- `test:deps`: Run tests requiring DB or S3 dependencies
- `test:all`: Run both types of tests

When running tests with dependencies, Docker must be running, so make sure Docker is active before execution.

## Usage Examples

### Controller Test

```typescript
describeWithDeps('ArtworksController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestingApp({
      entities: [Artwork],
      controllers: [ArtworksController],
      providers: [ArtworksService],
    });
  });

  it('should match OpenAPI spec', async () => {
    const response = await request(app.getHttpServer())
      .get('/artworks')
      .expect(200);

    await expect(response).toMatchOpenAPISpec();
  });
});
```

### Service Test

```typescript
describeWithoutDeps('ArtworksService', () => {
  let service: ArtworksService;

  beforeEach(async () => {
    const module = await createTestingModuleWithoutDB({
      providers: [
        ArtworksService,
        {
          provide: ArtworksRepository,
          useValue: mockRepository,
        },
      ],
    });

    service = module.get<ArtworksService>(ArtworksService);
  });
});
```

### Using Factories

```typescript
const artwork = ArtworksFactory.createTestData({ isDraft: true }, [
  ArtworkTranslationsFactory.createTestData({
    language: Language.KO,
    title: 'Test',
  }),
]);
```

## Testing Guidelines

1. Each test should be independently executable
2. Database is reset for each test by default
3. Use mocking minimally
4. Always validate OpenAPI spec compliance for controller tests

## Guidelines by Test Level

### Controller Tests

- Approach from E2E testing perspective
- Test actual HTTP request/response cycle
- Mandatory validation of OpenAPI spec compliance
- Must include authentication failure cases for endpoints requiring authentication

### Service Tests

- Focus on business logic
- Emphasis on edge cases and exception scenarios
- Verify cases requiring transaction processing

### Repository Tests

- Test with actual DB connection
- Validate query results
- Verify data consistency

---

# 日本語

## 概要

テストおよびテストコードに関するガイドラインを含んでいます。

## テスト構造

```
test/
├── factories/            # テスト用エンティティファクトリー
├── utils/               # テストユーティリティ
│   ├── auth.util.ts     # 認証関連ヘルパー
│   ├── database.util.ts # DB操作ヘルパー
│   ├── dto.util.ts      # DTO生成ヘルパー
│   └── module-builder.util.ts  # テストモジュールビルダー
└── modules/             # 実際のテストケース（srcフォルダ構造をミラーリング）
```

## 主要機能

### 1. OpenAPI仕様の検証

- SupertestレスポンスがOpenAPI仕様に準拠しているかを自動検証
- `toMatchOpenAPISpec()`カスタムマッチャーの定義

### 2. エンティティファクトリーメソッド

- テスト用エンティティ生成のためのファクトリークラス群

### 3. テストモジュールビルダー

- DB接続が必要なテスト用モジュールの定義
  - 例）リポジトリテスト
- DB接続が不要なテスト用モジュールの定義
  - 例）DTOテスト
- コントローラーテスト用の完全なアプリケーション生成の定義

### 4. テストセットアップ

- `test:no-deps`: DBやS3の依存関係が不要なテストの実行
- `test:deps`: DBやS3の依存関係が必要なテストの実行
- `test:all`: 上記両方のテストを実行

依存関係のあるテストを実行する際はDockerを使用するため、実行前にDockerが起動していることを確認する必要があります。

## 使用例

### コントローラーテスト

```typescript
describeWithDeps('ArtworksController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestingApp({
      entities: [Artwork],
      controllers: [ArtworksController],
      providers: [ArtworksService],
    });
  });

  it('should match OpenAPI spec', async () => {
    const response = await request(app.getHttpServer())
      .get('/artworks')
      .expect(200);

    await expect(response).toMatchOpenAPISpec();
  });
});
```

### サービステスト

```typescript
describeWithoutDeps('ArtworksService', () => {
  let service: ArtworksService;

  beforeEach(async () => {
    const module = await createTestingModuleWithoutDB({
      providers: [
        ArtworksService,
        {
          provide: ArtworksRepository,
          useValue: mockRepository,
        },
      ],
    });

    service = module.get<ArtworksService>(ArtworksService);
  });
});
```

### ファクトリーの使用

```typescript
const artwork = ArtworksFactory.createTestData({ isDraft: true }, [
  ArtworkTranslationsFactory.createTestData({
    language: Language.KO,
    title: 'テスト',
  }),
]);
```

## テストガイドライン

1. 各テストは独立して実行可能であること
2. DBテストでは基本的に毎テストごとにデータを初期化
3. モッキングは最小限に使用
4. コントローラーテスト時、OpenAPI仕様準拠の検証を必ず実施

## テストレベル別ガイドライン

### コントローラーテスト

- E2Eテストの観点からアプローチ
- 実際のHTTPリクエスト/レスポンスサイクルをテスト
- OpenAPI仕様準拠の検証が必須
- 認証が必要なエンドポイントは認証失敗ケースも必ず含める

### サービステスト

- ビジネスロジックに集中
- エッジケースと例外状況のテストに重点
- トランザクション処理が必要なケースの検証

### リポジトリテスト

- 実際のDB連携でテスト
- クエリ結果の検証
- データ整合性の検証
