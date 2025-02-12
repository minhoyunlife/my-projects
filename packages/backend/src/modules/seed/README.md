# Seed Module

[한국어](#한국어) | [English](#english) | [日本語](#日本語)

---

# 한국어

## 개요

로컬 개발에서 사용할 초기 데이터를 생성하는 모듈입니다.

## 주요 기능

### 데이터 시드

다음 순서로 초기 데이터를 생성합니다:

1. 관리자 계정
2. 장르 데이터 (다국어)
3. 작품 데이터 (다국어)

## 사용법

```typescript
// app.module.ts 의 onModuleInit 에서 시드 자동 실행
await seedService.seed();
```

## 주의사항

- 프로덕션 환경에서는 실행이 차단됩니다.
- 이미 데이터가 존재하는 경우 해당 단계는 건너뜁니다.
- 관리자 이메일은 환경 설정(auth.adminEmail)에서 가져옵니다.

## 시드 데이터 배치

시드 데이터는 data/ 디렉토리에 정의되어 있습니다:

- artworks.ts: 작품 초기 데이터
- genres.ts: 장르 초기 데이터

---

# English

## Overview

A module that generates initial data for local development.

## Key Features

### Data Seeding

Creates initial data in the following order:

1. Administrator account
2. Genre data (multilingual)
3. Artwork data (multilingual)

## Usage

```typescript
// Automatic seed execution in onModuleInit of app.module.ts
await seedService.seed();
```

## Precautions

- Execution is blocked in production environment
- Steps are skipped if data already exists
- Admin email is retrieved from environment configuration (auth.adminEmail)

## Seed Data Placement

Seed data is defined in the data/ directory:

- artworks.ts: Initial artwork data
- genres.ts: Initial genre data

---

# 日本語

## 概要

ローカル開発で使用する初期データを生成するモジュールです。

## 主な機能

### データシード

以下の順序で初期データを生成します：

1. 管理者アカウント
2. ジャンルデータ（多言語）
3. 作品データ（多言語）

## 使用方法

```typescript
// app.module.tsのonModuleInitでシードを自動実行
await seedService.seed();
```

## 注意事項

- 本番環境では実行がブロックされます。
- すでにデータが存在する場合、該当ステップはスキップされます。
- 管理者メールは環境設定（auth.adminEmail）から取得します。

## シードデータの配置

シードデータはdata/ディレクトリに定義されています：

- artworks.ts: 作品初期データ
- genres.ts: ジャンル初期データ
