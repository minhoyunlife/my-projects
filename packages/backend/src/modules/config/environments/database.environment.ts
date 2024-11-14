import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * 유효성 검사용 데이터베이스 환경변수
 */
export class DatabaseEnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsNumber()
  @IsNotEmpty()
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_USER: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;
}
