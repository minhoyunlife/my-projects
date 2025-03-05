<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';

  import CarouselNav from '$lib/components/carousel/CarouselNav.svelte';

  import { artworkState } from '$lib/states/artwork.svelte';
  import type { Artwork } from '$lib/types/artwork';
  import { SlideDirection, type Direction } from '$lib/types/slide-direction';
  import { imagePreloader } from '$lib/utils/preloader.svelte';

  let previousItemsCount = $state<number>(0);
  let isAnimating = $state<boolean>(false);
  let direction = $state<Direction>(SlideDirection.RIGHT);

  const currentArtwork = $derived<Artwork | null>(
    artworkState.items.length > 0 ? artworkState.items[artworkState.currentIndex] : null
  );
  const isLoading = $derived<boolean>(artworkState.isLoading);
  const isFirstItem = $derived<boolean>(artworkState.isFirstItem);
  const isLastItem = $derived<boolean>(artworkState.isLastItem);
  const isVertical = $derived<boolean>(currentArtwork?.isVertical || false);

  function handleNextClick() {
    if (isLoading || isLastItem) return;

    direction = SlideDirection.RIGHT;
    isAnimating = true;

    setTimeout(() => {
      artworkState.goToNextPage();
      setTimeout(() => {
        isAnimating = false;
      }, 200);
    }, 150);
  }

  function handlePrevClick() {
    if (isLoading || isFirstItem) return;

    direction = SlideDirection.LEFT;
    isAnimating = true;

    setTimeout(() => {
      artworkState.goToPrevPage();
      setTimeout(() => {
        isAnimating = false;
      }, 200);
    }, 150);
  }

  function preloadNewPageItems() {
    const items = artworkState.items;
    const currentCount = items.length;

    if (currentCount > previousItemsCount) {
      const startIdx = previousItemsCount;
      for (let i = startIdx; i < currentCount; i++) {
        imagePreloader.preloadUrl(items[i].imageUrl);
      }
      previousItemsCount = currentCount;
    }
  }

  $effect(() => {
    const { length } = artworkState.items;
    if (length > previousItemsCount) {
      preloadNewPageItems();
    }
  });
</script>

<div class="relative flex h-full w-full items-center justify-center overflow-hidden">
  {#if currentArtwork}
    <div class="flex h-full w-full items-center justify-between">
      <div class="z-10 h-8 w-8 sm:ml-10">
        <CarouselNav
          direction="before"
          handleClick={handlePrevClick}
          disabled={isFirstItem || isLoading}
        />
      </div>

      <div
        class={`relative flex overflow-hidden ${isVertical ? 'h-[296px] w-[200px] sm:h-[444px] sm:w-[300px] md:h-[592px] md:w-[400px] lg:h-[740px] lg:w-[500px]' : 'h-[200px] w-[296px] sm:h-[300px] sm:w-[444px] md:h-[400px] md:w-[592px] lg:h-[500px] lg:w-[740px]'}`}
      >
        {#key currentArtwork.id}
          <div
            class="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
            style={`
              background-image: url('${currentArtwork.imageUrl}');
            `}
            in:fly={{
              x: direction === SlideDirection.RIGHT ? '100vw' : '-100vw',
              duration: 500,
              opacity: isAnimating ? 0 : 1,
              easing: cubicOut
            }}
            out:fly={{
              x: direction === SlideDirection.RIGHT ? '-100vw' : '100vw',
              duration: 500,
              opacity: isAnimating ? 0 : 1,
              easing: cubicOut
            }}
            role="img"
            aria-label={currentArtwork.translations?.[0]?.title || '이미지'}
          >
            {#if currentArtwork.translations && currentArtwork.translations.length > 0}
              <div
                class="absolute right-0 bottom-0 z-10 bg-black p-2 text-white opacity-75 transition-opacity duration-150"
              >
                <h3 class="text-right text-xs font-semibold sm:text-lg">
                  {currentArtwork.translations[0].title}
                </h3>
              </div>
            {/if}
          </div>
        {/key}
      </div>

      <div class="z-10 h-8 w-8 sm:mr-10">
        <CarouselNav
          direction="after"
          handleClick={handleNextClick}
          disabled={isLastItem || isLoading}
        />
      </div>
    </div>
  {:else}
    <div class="text-center text-gray-500">표시할 이미지가 없습니다</div>
  {/if}
</div>
