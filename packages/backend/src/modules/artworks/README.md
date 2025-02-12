# Artworks Module

[한국어](#한국어) | [English](#english) | [日本語](#日本語)

---

# 한국어

## 개요

게임 팬아트 작품(아트워크) 관리를 위한 모듈입니다.

## 주요 기능

### 1. 아트워크 관리

- 이미지 업로드 및 스토리지 연동
- 아트워크 메타데이터 관리 (제목, 설명, 장르 등)
- 공개/비공개 상태 관리

### 2. 권한별 접근 제어

- 인증된 사용자: CMS용 전체 기능 접근 가능
- 비인증 사용자: 공개된 아트워크 조회만 가능
- 페이지 사이즈:
  - CMS: 10개
  - 공개: 20개

### 3. 이미지 업로드 정책

- 최대 파일 크기: 100MB
- 지원 파일 형식: jpeg, png, webp
- 단일 파일 업로드만 지원

## 컴포넌트 구조

### Controller

- API 엔드포인트 정의
- 이미지 업로드 검증 (`FileInterceptor`)
- 권한별 가드 적용 (`BearerAuthGuard`, `OptionalBearerAuthGuard`)
- 요청/응답 DTO 기반 데이터 검증

### Service

- 아트워크 관리 비즈니스 로직 처리
- 트랜잭션 관리
- StorageService와 연동하여 이미지 처리

### Repository

- 데이터베이스 연산 처리를 담당
- 데이터 유효성 검증
- 권한별 조회 필터링

---

# English

## Overview

Module for managing game fanart.

## Key Features

### 1. Artwork Management

- Image upload and storage integration
- Artwork metadata management (title, description, genre, etc.)
- Public/private status management

### 2. Role-based Access Control

- Authenticated users: Full access to CMS features
- Unauthenticated users: Access to public artworks only
- Page size:
  - CMS: 10 items
  - Public: 20 items

### 3. Image Upload Policy

- Maximum file size: 100MB
- Supported formats: jpeg, png, webp
- Single file upload only

## Component Structure

### Controller

- API endpoint definition
- Image upload validation (`FileInterceptor`)
- Role-based guards (`BearerAuthGuard`, `OptionalBearerAuthGuard`)
- Request/Response DTO based validation

### Service

- Artwork management business logic
- Transaction management
- Image processing with StorageService integration

### Repository

- Database operation handling
- Data validation
- Role-based query filtering

---

# 日本語

## 概要

ゲームのファンアート作品（アートワーク）管理のためのモジュールです。

## 主な機能

### 1. アートワーク管理

- 画像アップロードとストレージ連携
- アートワークのメタデータ管理（タイトル、説明、ジャンルなど）
- 公開/非公開状態管理

### 2. 権限別アクセス制御

- 認証ユーザー: CMS機能への完全アクセス
- 未認証ユーザー: 公開アートワークの閲覧のみ
- ページサイズ:
  - CMS: 10件
  - 公開: 20件

### 3. 画像アップロードポリシー

- 最大ファイルサイズ: 100MB
- 対応フォーマット: jpeg, png, webp
- 単一ファイルのアップロードのみ対応

## コンポーネント構造

### Controller

- APIエンドポイント定義
- 画像アップロード検証 (`FileInterceptor`)
- 権限別ガード適用 (`BearerAuthGuard`, `OptionalBearerAuthGuard`)
- リクエスト/レスポンスDTO基準のデータ検証

### Service

- アートワーク管理のビジネスロジック
- トランザクション管理
- StorageServiceと連携した画像処理

### Repository

- データベース操作処理
- データ有効性検証
- 権限別クエリフィルタリング
