import { withRetry } from '@/src/common/utils/retry.util';

const mockOperation = vi.fn();

describeWithoutDeps('withRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('성공 시 바로 결과를 반환함', async () => {
    const operation = mockOperation.mockResolvedValue('success');
    const result = await withRetry(operation);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('첫 번째 실패 시 재시도하여 성공한다면 결과를 반환함', async () => {
    const operation = mockOperation
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success');

    const result = await withRetry(operation);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('최대 시도 횟수 초과 시 마지막 에러가 반환됨', async () => {
    const error = new Error('fail');
    const operation = mockOperation.mockRejectedValue(error);

    await expect(withRetry(operation, { maxAttempts: 2 })).rejects.toThrow(
      error,
    );

    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('에러 발생 시 onError 콜백을 호출함', async () => {
    const onError = vi.fn();
    const operation = mockOperation
      .mockRejectedValueOnce(new Error('fail1'))
      .mockRejectedValueOnce(new Error('fail2'))
      .mockResolvedValueOnce('success');

    await withRetry(operation, { onError });

    expect(onError).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenNthCalledWith(1, expect.any(Error), 1);
    expect(onError).toHaveBeenNthCalledWith(2, expect.any(Error), 2);
  });
});
