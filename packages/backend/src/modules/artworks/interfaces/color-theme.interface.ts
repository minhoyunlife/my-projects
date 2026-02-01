/**
 * 이미지에서 추출된 개별 색상 정보
 */
export interface DominantColor {
  /** HEX 색상 코드 (예: #FF5A5A) */
  color: string;
  /** 해당 색상의 비중 (0-1 사이) */
  weight: number;
  /** 색상 역할 (수동 설정 시 사용) */
  role?: 'primary' | 'secondary' | 'text' | 'accent';
}

/**
 * 작품의 색상 테마 정보
 */
export interface ColorTheme {
  /** 이미지에서 자동 추출된 주요 색상들 */
  dominantColors: DominantColor[];
  /** 적용할 테마 색상들 */
  theme: {
    /** 주 배경색 */
    primaryBg: string;
    /** 보조 배경색 */
    secondaryBg: string;
    /** 기본 텍스트 색상 */
    textColor: string;
    /** 희미한 텍스트 색상 */
    textMuted: string;
    /** 포인트 색상 */
    accent: string;
  };
}

/**
 * 색상 유틸리티 함수들의 반환 타입들
 */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}
