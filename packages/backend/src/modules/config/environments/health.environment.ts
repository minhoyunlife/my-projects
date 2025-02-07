import { IsNotEmpty, IsNumber, Max, Min, IsString } from 'class-validator';

/**
 * 유효성 검사용 헬스체크 환경변수 클래스
 */
export class HealthEnvironmentVariables {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  CONTAINER_MEMORY: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(1)
  HEAP_MEMORY_THRESHOLD_RATIO: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(1)
  RSS_MEMORY_THRESHOLD_RATIO: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(1)
  DISK_THRESHOLD_PERCENT: number;

  @IsString()
  @IsNotEmpty()
  DISK_CHECK_PATH: string;
}
