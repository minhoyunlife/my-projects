import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * 유효성 검사용 인증/인가 환경변수 클래스
 */
export class AuthEnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  GITHUB_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  GITHUB_CLIENT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  GITHUB_CALLBACK_URL: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  ADMIN_WEB_URL: string;

  @IsEmail()
  @IsNotEmpty()
  ADMIN_EMAIL: string;
}
