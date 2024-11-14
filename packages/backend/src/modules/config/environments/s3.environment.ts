import { IsNotEmpty, IsString } from 'class-validator';

export class S3EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  AWS_REGION: string;

  @IsString()
  @IsNotEmpty()
  AWS_ACCESS_KEY_ID: string;

  @IsString()
  @IsNotEmpty()
  AWS_SECRET_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  AWS_BUCKET: string;

  @IsString()
  @IsNotEmpty()
  AWS_CLOUDFRONT_DOMAIN: string;
}
