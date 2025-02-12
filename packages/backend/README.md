# MY Project's Backend

[한국어](#한국어) | [English](#english) | [日本語](#日本語)

---

# 한국어

## 개요

MY Project 의 백엔드를 담당하는 애플리케이션입니다.

## 기술 스택

- 프레임워크: NestJS
- 언어: TypeScript
- 데이터베이스: PostgreSQL
- 스토리지: AWS S3

## 주요 기능

- 작품 관리 (CRUD)
- 장르 관리 (CRUD)
- 이미지 처리 및 보존
- OAuth 2.0 기반 인증
- TOTP 기반 2FA

## 상세 문서

- [공통 유틸리티](./src/common/README.md)
- [설정](./src/modules/config/README.md)
- [인증](./src/modules/auth/README.md)
- [작품 관리](./src/modules/artworks/README.md)
- [장르 관리](./src/modules/genres/README.md)
- [스토리지 관리](./src/modules/storage/README.md)
- [헬스체크](./src/modules/health/README.md)
- [로거](./src/modules/logger/README.md)
- [로컬 개발용 시드](./src/modules/seed/README.md)
- [셧다운 관련](./src/modules/termination/README.md)
- [테스트 가이드](./test/README.md)

## 주요 스크립트

- `build`: 프로젝트 빌드
- `start:dev`: 개발 서버 실행
- `test:no-deps`: 의존성 없는 테스트 실행
- `test:deps`: DB/S3 의존성 필요한 테스트 실행
- `test:all`: 전체 테스트 실행
- `lint`: 코드 린팅
- `format`: 코드 포맷팅

---

# English

## Overview

Backend application for MY Project.

## Tech Stack

- Framework: NestJS
- Language: TypeScript
- Database: PostgreSQL
- Storage: AWS S3

## Key Features

- Artwork Management (CRUD)
- Genre Management (CRUD)
- Image Processing and Storage
- OAuth 2.0 Based Authentication
- TOTP Based 2FA

## Detailed Documentation

- [Common Utilities](./src/common/README.md)
- [Configuration](./src/modules/config/README.md)
- [Authentication](./src/modules/auth/README.md)
- [Artwork Management](./src/modules/artworks/README.md)
- [Genre Management](./src/modules/genres/README.md)
- [Storage Management](./src/modules/storage/README.md)
- [Health Check](./src/modules/health/README.md)
- [Logger](./src/modules/logger/README.md)
- [Local Development Seed](./src/modules/seed/README.md)
- [Termination](./src/modules/termination/README.md)
- [Testing Guide](./test/README.md)

## Main Scripts

- `build`: Build project
- `start:dev`: Run development server
- `test:no-deps`: Run tests without dependencies
- `test:deps`: Run tests requiring DB/S3 dependencies
- `test:all`: Run all tests
- `lint`: Code linting
- `format`: Code formatting

---

# 日本語

## 概要

MY Project のバックエンドアプリケーション。

## 技術スタック

- フレームワーク: NestJS
- 言語: TypeScript
- データベース: PostgreSQL
- ストレージ: AWS S3

## 主な機能

- 作品管理 (CRUD)
- ジャンル管理 (CRUD)
- 画像処理と保存
- OAuth 2.0 認証
- TOTP 二要素認証

## 詳細ドキュメント

- [共通ユーティリティ](./src/common/README.md)
- [設定](./src/modules/config/README.md)
- [認証](./src/modules/auth/README.md)
- [作品管理](./src/modules/artworks/README.md)
- [ジャンル管理](./src/modules/genres/README.md)
- [ストレージ管理](./src/modules/storage/README.md)
- [ヘルスチェック](./src/modules/health/README.md)
- [ロガー](./src/modules/logger/README.md)
- [開発用シード](./src/modules/seed/README.md)
- [終了処理](./src/modules/termination/README.md)
- [テストガイド](./test/README.md)

## 主なスクリプト

- `build`: プロジェクトビルド
- `start:dev`: 開発サーバー起動
- `test:no-deps`: 依存関係なしのテスト実行
- `test:deps`: DB/S3依存のテスト実行
- `test:all`: 全テスト実行
- `lint`: コードリント
- `format`: コードフォーマット
