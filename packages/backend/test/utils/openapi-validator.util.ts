import path from 'path';

import SwaggerParser from '@apidevtools/swagger-parser';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { Response } from 'supertest';

interface RequestInfo {
  path: string;
  method: string;
  status: number;
}

/**
 * Supertest 의 리스폰스가 OpenAPI 스펙을 따르고 있는지 검증하기 위한 클래스
 */
export class OpenAPIValidator {
  private spec: any;
  private ajv: Ajv;

  private static instance: OpenAPIValidator;

  private constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false, // OpenAPI spec 과 JSON schema 검증의 호환이 완벽하게 일치하지는 않기 때문에 설정
    });

    addFormats(this.ajv); // ajv 에 uri, date-time 포맷 등의 검증을 추가
  }

  static getInstance(): OpenAPIValidator {
    if (!this.instance) {
      this.instance = new OpenAPIValidator();
    }
    return this.instance;
  }

  async initialize(): Promise<void> {
    if (!this.spec) {
      // 통합된 openapi.json 내의 ref 를 실제 객체로 변환
      this.spec = await SwaggerParser.dereference(
        path.join(__dirname, '../../../../openapi/openapi/output/openapi.json'),
      );
    }
  }

  /**
   * Supertest 의 리스폰스 객체를 기반으로 검증
   * @param {Response} response 검증할 Supertest 의 리스폰스 객체
   */
  validateResponse(response: Response) {
    const { path, method, status } = this.extractRequestInfo(response);
    return this.validateResponseBody(path, method, status, response.body);
  }

  /**
   * 리스폰스로부터 리퀘스트 정보를 추출
   * @param {Response} response 검증할 Supertest 의 리스폰스 객체
   * @returns {RequestInfo} 추출된 리퀘스트 정보
   * @throws {Error} url, method, status 등이 누락된 경우
   */
  private extractRequestInfo(response: Response): RequestInfo {
    const {
      request: { url, method },
      status,
    } = response;

    if (!url || !method || status === undefined) {
      throw new Error('Invalid response object: missing required properties');
    }

    return {
      path: new URL(url).pathname,
      method: method.toLowerCase(),
      status,
    };
  }

  /**
   * 리스폰스 바디를 검증
   * @param {string} path 경로
   * @param {string} method 메서드
   * @param {number} status 상태 코드
   * @param {any} body 리스폰스 바디
   * @throws {Error} 각종 검증이 실패한 경우
   */
  private validateResponseBody(
    path: string,
    method: string,
    status: number,
    body: any,
  ) {
    const operation = this.spec.paths[path]?.[method];
    if (!operation) {
      throw new Error(`No operation found for ${method} ${path}`);
    }

    const responseContent = operation.responses[status]?.content;
    if (!responseContent) {
      // 스펙 정의 상 200 등의 경우에는 리스폰스 바디가 없을 수 있으나, 그럼에도 불구하고 바디가 있는 경우 에러
      if (
        body !== undefined &&
        body !== null &&
        body !== '' &&
        !(typeof body === 'object' && Object.keys(body).length === 0) // {} 을 상정(res.end() 등)
      ) {
        throw new Error(
          `Expected empty response for ${status} but got: ${JSON.stringify(body)}`,
        );
      }
    } else {
      // 리스폰스 바디가 있는 경우의 검증 처리
      const responseSchema =
        operation.responses[status]?.content?.['application/json']?.schema;
      if (!responseSchema) {
        throw new Error(`No response schema found for ${status}`);
      }

      const validate = this.ajv.compile(responseSchema);
      const valid = validate(body);

      if (!valid) {
        const errors = validate.errors
          ?.map((err) => `${err.instancePath} ${err.message}`)
          .join('\n');
        throw new Error(`Validation failed:\n${errors}`);
      }
    }
  }
}
