<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { fly } from 'svelte/transition';

  import CarouselNav from '$lib/components/carousel/CarouselNav.svelte';
  import ScrollingText from '$lib/components/common/ScrollingText.svelte';

  import { artworkState } from '$lib/states/artwork.svelte';
  import { t } from '$lib/texts';
  import type { TranslatedArtwork } from '$lib/types/artwork';
  import { SlideDirection, type Direction } from '$lib/types/slide-direction';
  import { imagePreloader } from '$lib/utils/preloader.svelte';

  const { artworkClick } = $props();

  let previousItemsCount = $state<number>(0);
  let isAnimating = $state<boolean>(false);
  let direction = $state<Direction>(SlideDirection.RIGHT);

  const currentArtwork = $derived<TranslatedArtwork | null>(
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

  function handleImageClick(event: MouseEvent | KeyboardEvent) {
    if (!currentArtwork) return;

    artworkClick(currentArtwork, event.currentTarget as HTMLDivElement);
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

<div class="relative z-10 flex h-full w-full items-center justify-center overflow-hidden">
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
        class={`relative flex overflow-hidden ${isVertical ? 'h-[296px] w-[200px] sm:h-[444px] sm:w-[300px] md:h-[592px] md:w-[400px] lg:h-[666px] lg:w-[450px]' : 'h-[200px] w-[296px] sm:h-[300px] sm:w-[444px] md:h-[400px] md:w-[592px] lg:h-[450px] lg:w-[666px]'}`}
      >
        {#key currentArtwork.id}
          <div
            role="button"
            tabindex="0"
            class="absolute inset-0 cursor-pointer bg-cover bg-center bg-no-repeat will-change-transform"
            style={`
              background-image: url('${currentArtwork.imageUrl}');
            `}
            data-artwork-id={currentArtwork.id}
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
            aria-label={currentArtwork.title || '이미지'}
            onclick={handleImageClick}
            onkeydown={(e) => e.key === 'Enter' && handleImageClick(e)}
          >
            <div
              class="absolute right-0 bottom-0 z-10 max-w-full overflow-hidden bg-black p-2 whitespace-nowrap text-white opacity-75 transition-opacity duration-150 md:overflow-visible md:whitespace-normal"
            >
              <ScrollingText
                text={currentArtwork.title}
                className=" text-xs font-semibold sm:text-lg"
              />
            </div>
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
    <div class="text-center text-gray-500">{t('carousel.noData')}</div>
  {/if}
</div>
