export class ImagePreloader {
  private _preloadedUrls = $state(new Set<string>());

  /**
   * 이미지 URL 프리로드
   */
  preloadUrl(url: string): void {
    if (!url || this._preloadedUrls.has(url)) {
      return;
    }

    const img = new Image();
    img.onload = img.onerror = () => {
      this._preloadedUrls.add(url);
    };
    img.src = url;
  }
}

export const imagePreloader = new ImagePreloader();
