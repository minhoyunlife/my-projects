import { registerAs } from '@nestjs/config';

/**
 * 헬스체크 관련 설정
 */
export default registerAs('health', () => ({
  // 컨테이너 전체 메모리 (바이트 단위)
  containerMemory: parseInt(process.env.CONTAINER_MEMORY) * 1024 * 1024,

  // 메모리 임계값 비율
  heapMemoryThresholdRatio: parseFloat(process.env.HEAP_MEMORY_THRESHOLD_RATIO),
  rssMemoryThresholdRatio: parseFloat(process.env.RSS_MEMORY_THRESHOLD_RATIO),

  // 디스크 임계값
  diskThresholdPercent: parseFloat(process.env.DISK_THRESHOLD_PERCENT),
  diskPath: process.env.DISK_CHECK_PATH,
}));
