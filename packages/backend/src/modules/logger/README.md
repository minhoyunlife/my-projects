# Logger Module

[한국어](#한국어) | [English](#english) | [日本語](#日本語)

---

# 한국어

## 개요

Winston 기반의 로거입니다.
HTTP 요청과 데이터베이스 쿼리에 대한 로깅을 제공합니다.

## 주요 기능

### 1. HTTP 요청 로깅 (LoggingInterceptor)

- 요청/응답 정보 구조화
  - 요청 ID, 메서드, URL
  - 컨트롤러/핸들러 정보
  - 실행 시간
  - 상태 코드
- 에러 로깅
  - 스택 트레이스 포함
  - 에러 코드 표준화

### 2. 데이터베이스 로깅 (TypeOrmLoggerAdapter)

- 쿼리 실행 로깅
  - SQL 쿼리문
  - 바인딩 파라미터
- 성능 모니터링
  - 슬로우 쿼리 감지
- 스키마 변경 추적
  - 마이그레이션 로깅
  - 스키마 빌드 로깅

## 로그 포맷

```typescript
interface LogFormat {
  context: string; // 로그 발생 컨텍스트
  request?: {
    // HTTP 요청 정보
    id: string;
    method: string;
    path: string;
    duration?: number;
    statusCode?: number;
  };
  metadata?: {
    // 추가 메타데이터
    handler?: string;
    query?: object;
    body?: object;
    error?: string;
    stack?: string;
    ...
  };
}
```

---

# English

## Overview

A logger based on Winston.
Provides logging for HTTP requests and database queries.

## Key Features

### 1. HTTP Request Logging (LoggingInterceptor)

- Request/Response Information Structuring
  - Request ID, Method, URL
  - Controller/Handler Information
  - Execution Time
  - Status Code
- Error Logging
  - Stack Trace Inclusion
  - Error Code Standardization

### 2. Database Logging (TypeOrmLoggerAdapter)

- Query Execution Logging
  - SQL Query Statements
  - Binding Parameters
- Performance Monitoring
  - Slow Query Detection
- Schema Change Tracking
  - Migration Logging
  - Schema Build Logging

## Log Format

```typescript
interface LogFormat {
  context: string; // Log generation context
  request?: {
    // HTTP request information
    id: string;
    method: string;
    path: string;
    duration?: number;
    statusCode?: number;
  };
  metadata?: {
    // Additional metadata
    handler?: string;
    query?: object;
    body?: object;
    error?: string;
    stack?: string;
    ...
  };
}
```

---

# 日本語

## 概要

Winstonベースのロガーです。
HTTPリクエストとデータベースクエリのロギングを提供します。

## 主な機能

### 1. HTTPリクエストロギング (LoggingInterceptor)

- リクエスト/レスポンス情報の構造化
  - リクエストID、メソッド、URL
  - コントローラー/ハンドラー情報
  - 実行時間
  - ステータスコード
- エラーロギング
  - スタックトレース含む
  - エラーコード標準化

### 2. データベースロギング (TypeOrmLoggerAdapter)

- クエリ実行ロギング
  - SQLクエリ文
  - バインディングパラメータ
- パフォーマンスモニタリング
  - スロークエリ検出
- スキーマ変更追跡
  - マイグレーションロギング
  - スキーマビルドロギング

## ログフォーマット

```typescript
interface LogFormat {
  context: string; // ログ発生コンテキスト
  request?: {
    // HTTPリクエスト情報
    id: string;
    method: string;
    path: string;
    duration?: number;
    statusCode?: number;
  };
  metadata?: {
    // 追加メタデータ
    handler?: string;
    query?: object;
    body?: object;
    error?: string;
    stack?: string;
    ...
  };
}
```
