# Auth Module

[한국어](#한국어) | [English](#english) | [日本語](#日本語)

---

# 한국어

## 개요

관리자 인증을 위한 모듈입니다. GitHub OAuth를 통한 소셜 로그인과 2FA(TOTP) 인증을 필수로 합니다.

## 주요 기능

### 1. 인증 시스템

- GitHub OAuth 기반 소셜 로그인
- TOTP 기반의 2단계 인증(2FA)
- 백업 코드 시스템
- JWT 기반의 토큰 시스템

### 2. 토큰 시스템

| 토큰 종류       | 용도                  |
| --------------- | --------------------- |
| Temporary Token | 2FA 인증 전 임시 토큰 |
| Access Token    | API 접근용 토큰       |
| Refresh Token   | 토큰 갱신용           |

### 3. 인증 플로우

```mermaid
sequenceDiagram
actor 사용자
participant 클라이언트
participant 서버
participant GitHub
participant DB

    사용자->>클라이언트: 로그인 시도
    클라이언트->>서버: GET /auth/github
    서버->>GitHub: GitHub OAuth 리다이렉트
    GitHub-->>서버: 콜백 (/github/callback)

    alt 최초 로그인 (2FA 미설정)
        서버->>DB: 사용자 확인
        서버->>클라이언트: 리다이렉트 (/2fa-setup + temp token)
        클라이언트->>서버: POST /2fa/setup
        서버-->>클라이언트: TOTP Secret & QR Code
        사용자->>클라이언트: TOTP 코드 입력
        클라이언트->>서버: POST /2fa/verify (with setupToken)
        서버->>DB: TOTP 설정 저장
        서버-->>클라이언트: Access Token + Refresh Token + 백업 코드
        Note over 클라이언트: 백업 코드는 최초 1회만 제공
    else 일반 로그인 (2FA 설정됨)
        서버->>클라이언트: 리다이렉트 (/2fa + temp token)
        alt TOTP 코드로 인증
            사용자->>클라이언트: TOTP 코드 입력
            클라이언트->>서버: POST /2fa/verify
            서버-->>클라이언트: Access Token + Refresh Token
        else 백업 코드로 인증
            사용자->>클라이언트: 백업 코드 입력
            클라이언트->>서버: POST /2fa/backup
            서버-->>클라이언트: Access Token + Refresh Token
        end
    end

    Note over 서버: 실패 시 5회 시도 제한
    Note over 서버: 마지막 실패로부터 5분 후 실패 횟수 리셋
```

### 4. 설정 및 제한사항

#### 토큰 만료 시간

| 토큰 종류       | 만료 시간 |
| --------------- | --------- |
| Temporary Token | 10분      |
| Access Token    | 15분      |
| Refresh Token   | 7일       |

#### 보안 정책

- TOTP 인증 시도
  - 최대 실패 횟수: 5회
  - 실패 횟수 리셋: 마지막 시도로부터 5분 후
- 백업 코드
  - 생성 개수: 8개
  - 최초 설정 시에만 제공

---

# English

## Overview

Authentication module for administrator access. Requires social login through GitHub OAuth and 2FA(TOTP) authentication.

## Key Features

### 1. Authentication System

- GitHub OAuth-based social login
- TOTP-based two-factor authentication (2FA)
- Backup code system
- JWT-based token system

### 2. Token System

| Token Type      | Purpose                    |
| --------------- | -------------------------- |
| Temporary Token | Temporary token before 2FA |
| Access Token    | API access token           |
| Refresh Token   | Token renewal              |

### 3. Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant Client
    participant Server
    participant GitHub
    participant DB

    User->>Client: Login attempt
    Client->>Server: GET /auth/github
    Server->>GitHub: GitHub OAuth redirect
    GitHub-->>Server: Callback (/github/callback)

    alt First login (2FA not set)
        Server->>DB: Verify user
        Server->>Client: Redirect (/2fa-setup + temp token)
        Client->>Server: POST /2fa/setup
        Server-->>Client: TOTP Secret & QR Code
        User->>Client: Enter TOTP code
        Client->>Server: POST /2fa/verify (with setupToken)
        Server->>DB: Save TOTP settings
        Server-->>Client: Access Token + Refresh Token + Backup Codes
        Note over Client: Backup codes provided only once
    else Regular login (2FA set)
        Server->>Client: Redirect (/2fa + temp token)
        alt Authentication with TOTP
            User->>Client: Enter TOTP code
            Client->>Server: POST /2fa/verify
            Server-->>Client: Access Token + Refresh Token
        else Authentication with backup code
            User->>Client: Enter backup code
            Client->>Server: POST /2fa/backup
            Server-->>Client: Access Token + Refresh Token
        end
    end

    Note over Server: 5 attempts limit on failure
    Note over Server: Failure count resets after 5 minutes
```

### 4. Configuration and Limitations

#### Token Expiration Times

| Token Type      | Expiration |
| --------------- | ---------- |
| Temporary Token | 10 minutes |
| Access Token    | 15 minutes |
| Refresh Token   | 7 days     |

#### Security Policies

- TOTP Authentication Attempts
  - Maximum failure count: 5 times
  - Failure count reset: 5 minutes after last attempt
- Backup Codes
  - Generated amount: 8 codes
  - Provided only during initial setup

---

# 日本語

## 概要

管理者認証のためのモジュールです。GitHub OAuthによるソーシャルログインと2FA(TOTP)認証を必須とします。

## 主な機能

### 1. 認証システム

- GitHub OAuthベースのソーシャルログイン
- TOTPベースの二要素認証(2FA)
- バックアップコードシステム
- JWTベースのトークンシステム

### 2. トークンシステム

| トークン種類         | 用途                    |
| -------------------- | ----------------------- |
| 一時トークン         | 2FA認証前の一時トークン |
| アクセストークン     | API アクセス用          |
| リフレッシュトークン | トークン更新用          |

### 3. 認証フロー

```mermaid
sequenceDiagram
    actor ユーザー
    participant クライアント
    participant サーバー
    participant GitHub
    participant DB

    ユーザー->>クライアント: ログイン試行
    クライアント->>サーバー: GET /auth/github
    サーバー->>GitHub: GitHub OAuthリダイレクト
    GitHub-->>サーバー: コールバック (/github/callback)

    alt 初回ログイン (2FA未設定)
        サーバー->>DB: ユーザー確認
        サーバー->>クライアント: リダイレクト (/2fa-setup + 一時トークン)
        クライアント->>サーバー: POST /2fa/setup
        サーバー-->>クライアント: TOTP Secret & QRコード
        ユーザー->>クライアント: TOTPコード入力
        クライアント->>サーバー: POST /2fa/verify (with setupToken)
        サーバー->>DB: TOTP設定保存
        サーバー-->>クライアント: アクセストークン + リフレッシュトークン + バックアップコード
        Note over クライアント: バックアップコードは初回のみ提供
    else 通常ログイン (2FA設定済み)
        サーバー->>クライアント: リダイレクト (/2fa + 一時トークン)
        alt TOTPコードで認証
            ユーザー->>クライアント: TOTPコード入力
            クライアント->>サーバー: POST /2fa/verify
            サーバー-->>クライアント: アクセストークン + リフレッシュトークン
        else バックアップコードで認証
            ユーザー->>クライアント: バックアップコード入力
            クライアント->>サーバー: POST /2fa/backup
            サーバー-->>クライアント: アクセストークン + リフレッシュトークン
        end
    end

    Note over サーバー: 失敗時5回試行制限
    Note over サーバー: 最後の失敗から5分後にリセット
```

### 4. 設定と制限事項

#### トークン有効期限

| トークン種類         | 有効期限 |
| -------------------- | -------- |
| 一時トークン         | 10分     |
| アクセストークン     | 15分     |
| リフレッシュトークン | 7日      |

#### セキュリティポリシー

- TOTP認証試行
  - 最大失敗回数: 5回
  - 失敗回数リセット: 最後の試行から5分後
- バックアップコード
  - 生成数: 8個
  - 初期設定時のみ提供
