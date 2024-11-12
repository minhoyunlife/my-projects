import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

import { Environment } from '@/src/common/enums/environment.enum';

/**
 * 유효성 검사용 애플리케이션 환경변수 클래스
 */
export class AppEnvironmentVariables {
  @IsNumber()
  @IsNotEmpty()
  SERVER_PORT: number;

  @IsEnum(Environment)
  @IsNotEmpty()
  NODE_ENV: Environment;
}
