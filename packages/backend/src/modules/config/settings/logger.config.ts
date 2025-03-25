import { registerAs } from '@nestjs/config';

import * as winston from 'winston';

export interface LogRequest {
  id: string;
  method?: string;
  path?: string;
  duration?: number;
  statusCode?: number;
}

export interface LogMetadata {
  [key: string]: any;
}

// Winston의 로그 정보 타입 확장
export interface CustomLogInfo extends winston.Logform.TransformableInfo {
  timestamp?: string;
  context?: string;
  service?: string;
  request?: LogRequest | null;
  metadata?: LogMetadata;
}

/**
 * 로거 설정 파일
 */
export default registerAs('logger', () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    level: isProduction ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      isProduction
        ? winston.format.combine(
            winston.format((info: CustomLogInfo) => {
              return {
                ...info,
                context: info.context || 'Application',
                service: info.service || 'backend',
                request: info.request || undefined,
                metadata:
                  Object.keys(info.metadata || {}).length > 0
                    ? info.metadata
                    : undefined,
              };
            })(),
            winston.format.json(),
          )
        : winston.format.printf((info: CustomLogInfo) => {
            const {
              timestamp,
              level,
              context = 'Application',
              message,
              service = 'backend',
              request,
              metadata,
            } = info;

            let log = `${timestamp} [${level}] [${service}] [${context}] ${message}`;

            if (request?.id) {
              log += ` | requestId=${request.id}`;
              if (request.method && request.path) {
                log += ` | ${request.method} ${request.path}`;
              }
              if (request.statusCode) {
                log += ` | status=${request.statusCode}`;
              }
              if (request.duration) {
                log += ` | duration=${request.duration}ms`;
              }
            }

            if (metadata && Object.keys(metadata).length > 0) {
              log += ` | ${JSON.stringify(metadata)}`;
            }

            return log;
          }),
    ),
    transports: [
      new winston.transports.Console(),
      ...(!isProduction
        ? [
            new winston.transports.File({
              filename: 'logs/error.log',
              level: 'error',
            }),
            new winston.transports.File({
              filename: 'logs/combined.log',
            }),
          ]
        : []),
    ],
  };
});
