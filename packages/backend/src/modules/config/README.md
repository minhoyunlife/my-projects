# Config Module

[한국어](#한국어) | [English](#english) | [日本語](#日本語)

---

# 한국어

## 개요

환경변수를 로드하고 애플리케이션 전역에서 사용할 수 있게 하는 모듈입니다.

## 구조

```
config/
├── environments/          # 환경변수 유효성 검사용 클래스
├── settings/             # 설정값 정의
├── environment.validator.ts  # 유효성 검사 로직
└── config.module.ts         # 모듈 설정
```

## 주요 기능

### 환경변수 유효성 검사

`environments/` 디렉토리에 환경변수 관련 클래스를 정의하면, 클래스 밸리데이터를 통해 환경변수의 타입과 필수값을 검증합니다:

```typescript
class DatabaseEnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;
  // ...
}
```

위의 클래스 밸리데이터에 의한 검증은 애플리케이션 부트스트래핑 시점에 이뤄집니다:

1. AppModule 초기화 시 ConfigModule이 로드
2. .env 파일의 환경변수를 읽어들임
3. validate 함수를 통해 모든 환경변수의 유효성 검사
4. 검증 실패 시 애플리케이션 실행이 중단되며 에러 메시지 출력

### 설정값 관리

settings/ 하의 디렉토리에서 각 도메인별 설정을 관리합니다:

- app: 애플리케이션 기본 설정
- database: 데이터베이스 연결 설정
- auth: 인증 관련 설정
- s3: 파일 저장소 설정
- logger: 로깅 설정
- health: 헬스체크 설정

## 작업 방법

환경변수를 정의해야 할 경우에는 다음과 같은 절차를 밟습니다:

1. `.env.example` 및 `.env` 에 환경변수 정의
2. `environments/` 에 검증용 클래스 정의
3. `settings` 에서 config 오브젝트 등록
4. `environment.validator.ts` 에서 2에서 정의한 클래스 추가
5. `config.module.ts` 의 load 에서 3에서 정의한 오브젝트를 등록

---

# English

## Overview

A module that loads environment variables and makes them available throughout the application.

## Structure

```
config/
├── environments/          # Classes for environment variable validation
├── settings/             # Configuration value definitions
├── environment.validator.ts  # Validation logic
└── config.module.ts         # Module configuration
```

## Key Features

### Environment Variable Validation

Define environment variable classes in the `environments/` directory to validate types and required values through class validators:

```typescript
class DatabaseEnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;
  // ...
}
```

Validation by the class validator occurs during application bootstrapping:

1. ConfigModule loads during AppModule initialization
2. Reads environment variables from .env file
3. Validates all environment variables through validate function
4. Application execution stops with error message if validation fails

### Configuration Management

Manage domain-specific settings in directories under settings/:

- app: Application basic settings
- database: Database connection settings
- auth: Authentication settings
- s3: File storage settings
- logger: Logging settings
- health: Health check settings

## Working Process

Follow these steps when defining environment variables:

1. Define environment variables in `.env.example` and `.env`
2. Define validation class in `environments/`
3. Register config object in `settings`
4. Add class defined in step 2 to `environment.validator.ts`
5. Register object defined in step 3 in `load` of `config.module.ts`

---

# 日本語

## 概要

環境変数をロードし、アプリケーション全体で使用可能にするモジュールです。

## 構造

```
config/
├── environments/          # 環境変数検証用クラス
├── settings/             # 設定値定義
├── environment.validator.ts  # 検証ロジック
└── config.module.ts         # モジュール設定
```

## 主な機能

### 環境変数の検証

`environments/` ディレクトリで環境変数関連クラスを定義し、クラスバリデータを通じて環境変数の型と値を検証します：

```typescript
class DatabaseEnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;
  // ...
}
```

クラスバリデータによる検証はアプリケーションのブートストラップ時に行われます：

1. AppModule初期化時にConfigModuleがロード
2. .envファイルから環境変数を読み込み
3. validate関数を通じて全環境変数の検証
4. 検証失敗時にアプリケーション実行が停止しエラーメッセージを出力

### 設定値管理

settings/配下のディレクトリで各ドメイン別の設定を管理します：

- app: アプリケーション基本設定
- database: データベース接続設定
- auth: 認証関連設定
- s3: ファイルストレージ設定
- logger: ロギング設定
- health: ヘルスチェック設定

## 作業手順

環境変数を定義する場合は以下の手順に従います：

1. `.env.example` と `.env` に環境変数を定義
2. `environments/` に検証用クラスを定義
3. `settings` でconfigオブジェクトを登録
4. `environment.validator.ts` に2で定義したクラスを追加
5. `config.module.ts` のloadで3で定義したオブジェクトを登録
