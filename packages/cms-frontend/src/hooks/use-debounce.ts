import { useEffect, useState } from "react";

/**
 * 지정된 지연 시간 동안 추가 입력이 없을 때만 값을 업데이트하는 훅
 * @param value - 디바운스 처리할 입력값
 * @param delay - 디바운스 지연 시간(ms)
 * @returns 디바운스 처리된 값
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
