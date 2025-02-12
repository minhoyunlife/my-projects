# Storage Module

[한국어](#한국어) | [English](#english) | [日本語](#日本語)

---

# 한국어

## 개요

S3 기반의 이미지 스토리지 관리 모듈입니다.
이미지의 업로드, 최적화 및 CloudFront를 통한 CDN 배포 관련 코드가 존재합니다.

## 주요 기능

### 1. 이미지 업로드 및 최적화

- WebP 포맷으로 자동 변환
- 이미지 리사이징 (최대 너비: 1440px)
- 품질 최적화 (품질: 85%, 무손실에 가까운 압축)

### 2. 스토리지 관리

- S3 버킷 연결 상태 확인
- 이미지 태깅을 통한 상태 관리
- CloudFront를 통한 이미지 제공

### 3. 이미지 키 관리

- 날짜 기반 폴더 구조 (`artworks/YYYY/MM/`)
- nanoid를 통한 유니크 파일명 생성
- 최종적으로 webp 확장자 강제

### 4. 이미지 라이프사이클 관리

#### 상태 태그

```typescript
enum ImageStatus {
  ACTIVE = 'active', // 활성 상태
  TO_DELETE = 'toDelete', // 삭제 대기 상태
}
```

#### 상태 전이

1. 업로드 시: ACTIVE 태그 부여
2. 삭제 요청 시: DELETED 태그로 변경

#### S3 라이프사이클 정책

- `toDelete` 태그가 부여된 이미지 객체는 일정 기간이 지난 후 자동 삭제

## AWS 서비스 연동

### S3 설정

```typescript
const s3Client = new S3Client({
  region: config.region,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
  endpoint: config.endpoint, // LocalStack을 통한 테스트용
  forcePathStyle: true, // LocalStack을 통한 테스트용
});
```

---

# English

## Overview

An S3-based image storage management module.
Contains code related to image upload, optimization, and CDN distribution through CloudFront.

## Key Features

### 1. Image Upload and Optimization

- Automatic conversion to WebP format
- Image resizing (max width: 1440px)
- Quality optimization (quality: 85%, near-lossless compression)

### 2. Storage Management

- S3 bucket connection status check
- State management through image tagging
- Image serving through CloudFront

### 3. Image Key Management

- Date-based folder structure (`artworks/YYYY/MM/`)
- Unique filename generation through nanoid
- Enforced webp extension for final output

### 4. Image Lifecycle Management

#### Status Tags

```typescript
enum ImageStatus {
  ACTIVE = 'active', // Active status
  TO_DELETE = 'toDelete', // Pending deletion status
}
```

#### State Transitions

1. On upload: Assign ACTIVE tag
2. On deletion request: Change to DELETED tag

#### S3 Lifecycle Policy

- Image objects tagged with `toDelete` are automatically deleted after a certain period

## AWS Service Integration

### S3 Configuration

```typescript
const s3Client = new S3Client({
  region: config.region,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
  endpoint: config.endpoint, // For testing through LocalStack
  forcePathStyle: true, // For testing through LocalStack
});
```

---

# 日本語

## 概要

S3ベースの画像ストレージ管理モジュールです。
画像のアップロード、最適化、およびCloudFrontを通じたCDN配信に関するコードが含まれています。

## 主な機能

### 1. 画像アップロードと最適化

- WebPフォーマットへの自動変換
- 画像リサイズ（最大幅：1440px）
- 品質最適化（品質：85%、ほぼ無損失圧縮）

### 2. ストレージ管理

- S3バケット接続状態確認
- 画像タグによる状態管理
- CloudFrontを通じた画像提供

### 3. 画像キー管理

- 日付ベースのフォルダ構造（`artworks/YYYY/MM/`）
- nanoidによるユニークファイル名生成
- 最終的にwebp拡張子を強制

### 4. 画像ライフサイクル管理

#### ステータスタグ

```typescript
enum ImageStatus {
  ACTIVE = 'active', // アクティブ状態
  TO_DELETE = 'toDelete', // 削除待ち状態
}
```

#### 状態遷移

1. アップロード時：ACTIVEタグ付与
2. 削除リクエスト時：DELETEDタグに変更

#### S3ライフサイクルポリシー

- `toDelete`タグが付与された画像オブジェクトは一定期間後に自動削除

## AWSサービス連携

### S3設定

```typescript
const s3Client = new S3Client({
  region: config.region,
  credentials: {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
  },
  endpoint: config.endpoint, // LocalStackを通じたテスト用
  forcePathStyle: true, // LocalStackを通じたテスト用
});
```
