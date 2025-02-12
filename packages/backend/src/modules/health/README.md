# Health Module

[한국어](#한국어) | [English](#english) | [日本語](#日本語)

---

# 한국어

## 개요

API 서버의 상태를 모니터링하기 위한 헬스체크 엔드포인트를 제공하는 모듈입니다.
@nestjs/terminus를 기반으로 구현되어 있습니다.

## 구성

### 1. Liveness Check

컨테이너의 기본적인 실행 상태를 확인합니다.

#### 체크 항목

- 메모리 상태
- 디스크 상태

### 2. Readiness Check

외부 서비스와의 연결 상태를 확인합니다.

#### 체크 항목

- 데이터베이스 연결
  - TypeORM 연결 상태
- 스토리지 연결(커스텀 인디케이터)
  - S3 버킷 접근 가능 여부
- 인증 서비스(커스텀 인디케이터)
  - GitHub OAuth 연결 상태

---

# English

## Overview

A module that provides health check endpoints for monitoring the API server status.
Implemented based on @nestjs/terminus.

## Configuration

### 1. Liveness Check

Checks the basic operational status of the container.

#### Check Items

- Memory status
- Disk status

### 2. Readiness Check

Verifies connection status with external services.

#### Check Items

- Database Connection
  - TypeORM connection status
- Storage Connection (Custom Indicator)
  - S3 bucket accessibility
- Authentication Service (Custom Indicator)
  - GitHub OAuth connection status

---

# 日本語

## 概要

APIサーバーの状態を監視するためのヘルスチェックエンドポイントを提供するモジュールです。
@nestjs/terminusをベースに実装されています。

## 構成

### 1. Liveness Check

コンテナの基本的な実行状態を確認します。

#### チェック項目

- メモリ状態
- ディスク状態

### 2. Readiness Check

外部サービスとの接続状態を確認します。

#### チェック項目

- データベース接続
  - TypeORM接続状態
- ストレージ接続（カスタムインディケーター）
  - S3バケットアクセス可否
- 認証サービス（カスタムインディケーター）
  - GitHub OAuth接続状態
