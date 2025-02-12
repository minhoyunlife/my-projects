# Genres Module

[한국어](#한국어) | [English](#english) | [日本語](#日本語)

---

# 한국어

## 개요

게임 장르 관리를 위한 모듈입니다.

## 주요 기능

### 1. 다국어 장르 관리

- 3개 언어(한국어, 영어, 일본어) 필수 지원
- 장르명 중복 검사
- 부분 일치 검색 지원

### 2. 페이지네이션

- CMS 페이지 사이즈: 20개
- 검색어 기반 필터링 지원(다국어로 검색 가능)

## 컴포넌트 구조

### Controller

- API 엔드포인트 정의
- 인증된 사용자만 접근 가능 (`BearerAuthGuard`)
- 요청/응답 DTO 기반 데이터 검증

### Service

- 장르 관리 비즈니스 로직 처리
- 트랜잭션 관리
- Controller와 Repository 계층 사이 조정

### Repository

- 데이터베이스 연산 처리를 담당
- 데이터 유효성 검증:
  - 필수 언어 번역 존재 여부
  - 장르명 중복 검사
  - 사용 중인 장르 삭제 방지

## 에러 핸들링

모든 에러는 `BaseException`을 상속한 `GenreException`을 통해 처리됩니다.

```typescript
// 에러 코드 정의
export enum GenreErrorCode {
  ERROR_NAME = 'ERROR_NAME',
  ...
}

// HTTP 상태 코드 매핑
const ERROR_STATUS_MAP: Record<GenreErrorCode, HttpStatus> = {
  [GenreErrorCode.ERROR_NAME]: HttpStatus.XXX,
  ...
};

// 에러 클래스
export class GenreException extends BaseException {
  constructor(
    code: GenreErrorCode,
    message: string,
    errors?: Record<string, string[]>,
  ) {
    super(
      { message, code, errors },
      ERROR_STATUS_MAP[code],
    );
  }
}
```

---

# English

## Overview

A module for managing game genres.

## Key Features

### 1. Multilingual Genre Management

- Mandatory support for 3 languages (Korean, English, Japanese)
- Genre name duplication check
- Partial match search support

### 2. Pagination

- CMS page size: 20 items
- Search term-based filtering support (searchable in multiple languages)

## Component Structure

### Controller

- API endpoint definition
- Accessible only to authenticated users (`BearerAuthGuard`)
- Data validation based on request/response DTOs

### Service

- Handles genre management business logic
- Transaction management
- Coordination between Controller and Repository layers

### Repository

- Handles database operations
- Data validation:
  - Required language translation existence check
  - Genre name duplication check
  - Prevention of in-use genre deletion

## Error Handling

All errors are handled through `GenreException` which inherits from `BaseException`.

```typescript
// Error code definition
export enum GenreErrorCode {
  ERROR_NAME = 'ERROR_NAME',
  ...
}

// HTTP status code mapping
const ERROR_STATUS_MAP: Record<GenreErrorCode, HttpStatus> = {
  [GenreErrorCode.ERROR_NAME]: HttpStatus.XXX,
  ...
};

// Error class
export class GenreException extends BaseException {
  constructor(
    code: GenreErrorCode,
    message: string,
    errors?: Record<string, string[]>,
  ) {
    super(
      { message, code, errors },
      ERROR_STATUS_MAP[code],
    );
  }
}
```

---

# 日本語

## 概要

ゲームのジャンル管理のためのモジュールです。

## 主な機能

### 1. 多言語ジャンル管理

- 3言語（韓国語、英語、日本語）サポート
- ジャンル名の重複チェック
- 部分一致検索サポート

### 2. ページネーション

- CMSページサイズ：20件
- 検索語に基づくフィルタリングサポート（多言語で検索可能）

## コンポーネント構造

### Controller

- APIエンドポイント定義
- 認証されたユーザーのみアクセス可能（`BearerAuthGuard`）
- リクエスト/レスポンスDTOに基づくデータ検証

### Service

- ジャンル管理ビジネスロジックの処理
- トランザクション管理
- ControllerとRepositoryレイヤー間の調整

### Repository

- データベース操作の担当
- データ有効性検証：
  - 必須言語翻訳の存在確認
  - ジャンル名重複チェック
  - 使用中のジャンル削除防止

## エラーハンドリング

すべてのエラーは`BaseException`を継承した`GenreException`を通じて処理されます。

```typescript
// エラーコード定義
export enum GenreErrorCode {
  ERROR_NAME = 'ERROR_NAME',
  ...
}

// HTTPステータスコードマッピング
const ERROR_STATUS_MAP: Record<GenreErrorCode, HttpStatus> = {
  [GenreErrorCode.ERROR_NAME]: HttpStatus.XXX,
  ...
};

// エラークラス
export class GenreException extends BaseException {
  constructor(
    code: GenreErrorCode,
    message: string,
    errors?: Record<string, string[]>,
  ) {
    super(
      { message, code, errors },
      ERROR_STATUS_MAP[code],
    );
  }
}
```
