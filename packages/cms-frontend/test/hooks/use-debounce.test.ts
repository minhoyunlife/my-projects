import { useDebounce } from "@/src/hooks/use-debounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  it("초기값이 즉시 반환됨", () => {
    const initialValue = "initial";
    const { result } = renderHook(() => useDebounce(initialValue, 300));

    expect(result.current).toBe(initialValue);
  });

  it("값이 변경되면 지정된 시간 후에 업데이트됨", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "", delay: 300 },
      },
    );

    rerender({ value: "new value", delay: 300 });

    expect(result.current).toBe("");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("new value");
  });

  it("지연 시간 내에 여러 번 값이 변경되면 마지막 값만 반영됨", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "", delay: 300 },
      },
    );

    rerender({ value: "first", delay: 300 });
    rerender({ value: "second", delay: 300 });
    rerender({ value: "final", delay: 300 });

    expect(result.current).toBe("");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("final");
  });
});
