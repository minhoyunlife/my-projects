import {
  HSL,
  RGB,
} from '@/src/modules/artworks/interfaces/color-theme.interface';

/**
 * HEX 색상을 RGB로 변환
 */
export function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * RGB를 HEX로 변환
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number): string => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * RGB를 HSL로 변환
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const add = max + min;
  const l = add * 0.5;

  let s: number;
  let h: number;

  if (diff === 0) {
    s = h = 0;
  } else {
    s = l < 0.5 ? diff / add : diff / (2 - add);

    switch (max) {
      case r:
        h = (g - b) / diff + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
      default:
        h = 0;
    }
    h /= 6;
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
}

/**
 * HSL을 RGB로 변환
 */
export function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * HEX 색상을 HSL로 변환
 */
export function hexToHsl(hex: string): HSL {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

/**
 * HSL을 HEX로 변환
 */
export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

/**
 * 색상의 휘도(luminance) 계산 (WCAG 기준)
 */
export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);

  const sRGB = (color: number): number => {
    color = color / 255;
    return color <= 0.03928
      ? color / 12.92
      : Math.pow((color + 0.055) / 1.055, 2.4);
  };

  return 0.2126 * sRGB(r) + 0.7152 * sRGB(g) + 0.0722 * sRGB(b);
}

/**
 * 두 색상 간의 대비 비율 계산 (WCAG 기준)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 색상을 어둡게 만들기
 */
export function darken(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  hsl.l = Math.max(0, hsl.l - amount * 100);
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * 색상을 밝게 만들기
 */
export function lighten(hex: string, amount: number): string {
  const hsl = hexToHsl(hex);
  hsl.l = Math.min(100, hsl.l + amount * 100);
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * 보색 계산
 */
export function getComplementaryColor(hex: string): string {
  const hsl = hexToHsl(hex);
  hsl.h = (hsl.h + 180) % 360;
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * 유사색 계산 (지정된 각도만큼 떨어진 색상)
 */
export function getAnalogousColor(hex: string, angle: number): string {
  const hsl = hexToHsl(hex);
  hsl.h = (hsl.h + angle + 360) % 360;
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * 색상 온도 계산 (따뜻함/차가움 정도)
 * 양수: 따뜻한 색상, 음수: 차가운 색상
 */
export function getColorTemperature(hex: string): number {
  const { r, g, b } = hexToRgb(hex);

  // 간단한 색온도 지표: (빨강 + 노랑 성분) - (파랑 + 초록 성분)
  const warmth = r + (r + g) / 2 - (b + g);

  return warmth;
}
