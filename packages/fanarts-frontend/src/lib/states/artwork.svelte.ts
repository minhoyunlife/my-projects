import { ArtworkService } from '$lib/services/artwork';

import type { Artwork, ArtworkResponse } from '$lib/types/artwork';

export class ArtworkState {
  private _state = $state({
    items: [] as Artwork[],
    currentIndex: 0,
    currentPage: 1,
    totalPages: 1,
    isLoading: false,
    loadedPages: new Set<number>()
  });

  items = $derived(this._state.items);

  currentIndex = $derived(this._state.currentIndex);

  isLoading = $derived(this._state.isLoading);

  isFirstItem = $derived(
    this._state.items.length === 0 ||
      (this._state.currentIndex === 0 && this._state.loadedPages.has(1))
  );

  isLastItem = $derived(
    this._state.items.length === 0 ||
      (this._state.currentIndex === this._state.items.length - 1 &&
        this._state.loadedPages.has(this._state.totalPages))
  );

  constructor(private artworkService: ArtworkService) {}

  /**
   * 상태를 초기화
   */
  initialize(data: ArtworkResponse): void {
    this._state.items = data.items || [];
    this._state.currentPage = data.metadata.currentPage || 1;
    this._state.totalPages = data.metadata.totalPages || 1;
    this._state.loadedPages = new Set([data.metadata.currentPage || 1]);
    this._state.currentIndex = 0;
    this._state.isLoading = false;
  }

  /**
   * 다음 페이지로의 이동 시의 처리
   */
  async goToNextPage(): Promise<void> {
    if (this._state.items.length === 0) return;

    const nextIndex = (this._state.currentIndex + 1) % this._state.items.length;
    this.setIndex(nextIndex);

    const loadThreshold = 3;
    if (this._state.items.length - nextIndex <= loadThreshold) {
      const loadedPagesArray = Array.from(this._state.loadedPages);
      if (loadedPagesArray.length > 0) {
        const nextPage = Math.max(...loadedPagesArray) + 1;

        if (nextPage <= this._state.totalPages) {
          await this.loadPage(nextPage);
        }
      }
    }
  }

  /**
   * 이전 페이지로의 이동 시의 처리
   */
  async goToPrevPage(): Promise<void> {
    if (this._state.items.length === 0) return;

    const prevIndex =
      (this._state.currentIndex - 1 + this._state.items.length) % this._state.items.length;
    this.setIndex(prevIndex);

    const loadThreshold = 3;
    if (prevIndex < loadThreshold) {
      const loadedPagesArray = Array.from(this._state.loadedPages);

      if (loadedPagesArray.length > 0) {
        const prevPage = Math.min(...loadedPagesArray) - 1;

        if (prevPage >= 1) {
          await this.loadPage(prevPage);
        }
      }
    }
  }

  /**
   * 현재 인덱스를 설정
   */
  private setIndex(index: number): void {
    if (index >= 0 && index < this._state.items.length) {
      this._state.currentIndex = index;
    }
  }

  /**
   * 특정 페이지의 작품 정보를 로드
   */
  private async loadPage(page: number): Promise<boolean> {
    if (this._state.loadedPages.has(page) || page < 1 || page > this._state.totalPages) {
      return false;
    }

    this._state.isLoading = true;

    try {
      const data = await this.artworkService.getArtworks(page);

      const loadedPagesArray = Array.from(this._state.loadedPages);
      const maxLoadedPage = Math.max(...loadedPagesArray);
      const minLoadedPage = Math.min(...loadedPagesArray);

      const newItems = data.items.filter(
        (newItem) => !this._state.items.some((existingItem) => existingItem.id === newItem.id)
      );

      if (page > maxLoadedPage) {
        this._state.items = [...this._state.items, ...newItems];
      } else if (page < minLoadedPage) {
        this._state.items = [...newItems, ...this._state.items];
        this._state.currentIndex += newItems.length;
      }

      this._state.loadedPages = new Set([...this._state.loadedPages, page]);

      if (data.metadata.totalPages) {
        this._state.totalPages = data.metadata.totalPages;
      }

      return true;
    } catch (error) {
      console.error('Error loading artworks page:', error);
      return false;
    } finally {
      this._state.isLoading = false;
    }
  }
}

export const artworkState = new ArtworkState(new ArtworkService());
