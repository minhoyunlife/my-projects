export type Direction = 'left' | 'right' | '';

export const SlideDirection = {
  LEFT: 'left' as Direction,
  RIGHT: 'right' as Direction,
  NONE: '' as Direction
} as const;
