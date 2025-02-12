# Common

[한국어](#한국어) | [English](#english) | [日本語](#日本語)

---

# 한국어

## 개요

백엔드 애플리케이션 내의 모듈 전반에서 공통적으로 사용되는 코드를 관리합니다.
열거형, 상수, 데코레이터 등, 여러 모듈에서 재활용이 가능한 코드는 여기에 정의해나갑니다.

## 구조 가이드라인

| 디렉토리     | 목적                                                |
| ------------ | --------------------------------------------------- |
| constants    | 상수 정의                                           |
| decorators   | 엔티티 클래스를 위한 데코레이터 배치                |
| enums        | 각종 처리를 위한 열거형 타입 배치                   |
| exceptions   | 베이스 예외 클래스 정의                             |
| interfaces   | 각종 인터페이스 정의                                |
| repositories | 트랜잭션용 추상 클래스 등 리포지토리 관련 코드 배치 |
| utils        | 공통 유틸리티 함수                                  |

---

# English

## Overview

Manages code commonly used across modules in the backend application.
Reusable code such as enums, constants, and decorators are defined here for using across multiple modules.

## Structure Guidelines

| Directory    | Purpose                                                             |
| ------------ | ------------------------------------------------------------------- |
| constants    | Definition of constants                                             |
| decorators   | Placement of decorators for entity classes                          |
| enums        | Placement of enumeration types for various processes                |
| exceptions   | Definition of base exception classes                                |
| interfaces   | Definition of various interfaces                                    |
| repositories | Repository-related code including abstract classes for transactions |
| utils        | Common utility functions                                            |

---

# 日本語

## 概要

バックエンドアプリケーション全体のモジュールで共通して使用されるコードを管理します。
列挙型、定数、デコレーターなど、複数のモジュールで再利用可能なコードをここで定義します。

## 構造ガイドライン

| ディレクトリ | 目的                                                 |
| ------------ | ---------------------------------------------------- |
| constants    | 定数の定義                                           |
| decorators   | エンティティクラス用デコレーターの配置               |
| enums        | 各種処理用の列挙型の配置                             |
| exceptions   | 基本例外クラスの定義                                 |
| interfaces   | 各種インターフェースの定義                           |
| repositories | トランザクション用抽象クラスなどリポジトリ関連コード |
| utils        | 共通ユーティリティ関数                               |
