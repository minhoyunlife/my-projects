import { ImagePreloader } from '$lib/utils/preloader.svelte';

describe('ImagePreloader', () => {
  let imagePreloader: ImagePreloader;

  const mockImage = {
    onload: null as (() => void) | null,
    onerror: null as (() => void) | null,
    src: ''
  };

  beforeEach(() => {
    mockImage.onload = null;
    mockImage.onerror = null;
    mockImage.src = '';

    global.Image = vi.fn(() => mockImage) as unknown as typeof Image;

    imagePreloader = new ImagePreloader();
  });

  it('이미지 URL 을 바탕으로 프리로드함', () => {
    const url = 'https://example.com/image.jpg';

    imagePreloader.preloadUrl(url);

    expect(global.Image).toHaveBeenCalled();
    expect(mockImage.src).toBe(url);
  });

  it('같은 URL 을 두 번 프리로드 하지 않음', () => {
    const url = 'https://example.com/image.jpg';

    imagePreloader.preloadUrl(url);

    if (mockImage.onload) mockImage.onload();

    mockImage.src = '';
    vi.mocked(global.Image).mockClear();

    imagePreloader.preloadUrl(url);

    expect(global.Image).not.toHaveBeenCalled();
    expect(mockImage.src).toBe('');
  });

  it('빈 URL 의 경우, 조기 리턴함', () => {
    imagePreloader.preloadUrl('');
    expect(global.Image).not.toHaveBeenCalled();
  });

  it('유효하지 않은 URL 의 경우, 조기 리턴함', () => {
    imagePreloader.preloadUrl(undefined as unknown as string);
    expect(global.Image).not.toHaveBeenCalled();
  });
});
