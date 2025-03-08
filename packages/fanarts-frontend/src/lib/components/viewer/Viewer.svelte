<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { Icon } from 'svelte-icons-pack';
  import { BiX } from 'svelte-icons-pack/bi';

  import ScrollingText from '$lib/components/common/ScrollingText.svelte';

  import type { TranslatedArtwork } from '$lib/types/artwork';
  import type { Position } from '$lib/types/position';

  const { artwork, initialPosition, onClose } = $props<{
    artwork: TranslatedArtwork;
    initialPosition: Position | null;
    onClose: () => void;
  }>();

  let imageContainer: HTMLElement;
  let isReady = $state(false);

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }
  }

  function moveImageContainer() {
    if (!imageContainer || !initialPosition) return;

    const rect = imageContainer.getBoundingClientRect();

    const initialCenterX = initialPosition.x + initialPosition.width / 2;
    const initialCenterY = initialPosition.y + initialPosition.height / 2;

    const containerCenterX = rect.left + rect.width / 2;
    const containerCenterY = rect.top + rect.height / 2;

    const dx = initialCenterX - containerCenterX;
    const dy = initialCenterY - containerCenterY;

    const scaleX = initialPosition.width / rect.width;
    const scaleY = initialPosition.height / rect.height;

    imageContainer.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;
    imageContainer.style.opacity = '1';

    const _forceReflow = imageContainer.offsetHeight;

    imageContainer.style.transition = 'transform 0.4s ease-out, opacity 0.4s ease-out';
    imageContainer.style.transform = 'translate(0, 0) scale(1)';
  }

  onMount(() => {
    setTimeout(() => {
      moveImageContainer();

      setTimeout(() => {
        isReady = true;
      }, 500);
    }, 50);
  });
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="fixed inset-0 z-30 bg-black" transition:fade={{ duration: 300 }}></div>

<div
  class="fixed inset-0 z-30 flex items-center justify-center"
  transition:fade={{ duration: 300 }}
>
  <div class="relative flex w-full flex-col items-center justify-center md:flex-row">
    <!-- 닫기 버튼 -->
    <button
      class="absolute -top-10 z-50 rounded-full bg-gray-800 p-2 text-white hover:bg-gray-700 sm:-top-20"
      class:opacity-0={!isReady}
      style="transition: opacity 0.4s ease-out, transform 0.4s ease-out;"
      onclick={onClose}
    >
      <Icon src={BiX} />
    </button>

    <!-- 이미지 컨테이너 -->
    <div bind:this={imageContainer} class="flex items-center justify-center opacity-0">
      <div
        class={`relative ${artwork.isVertical ? 'h-[296px] w-[200px] sm:h-[444px] sm:w-[300px] md:h-[592px] md:w-[400px] lg:h-[740px] lg:w-[500px]' : 'h-[200px] w-[296px] sm:h-[300px] sm:w-[444px] md:h-[400px] md:w-[592px] lg:h-[500px] lg:w-[740px]'}`}
      >
        <div
          class="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
          style={`
            background-image: url('${artwork.imageUrl}');
        `}
        ></div>
      </div>
    </div>

    <!-- 작품 정보 컨테이너 -->
    <div
      class={`flex flex-col bg-gray-900 p-2 sm:p-6 ${
        artwork.isVertical
          ? 'h-[200px] w-[200px] sm:h-[300px] sm:w-[300px] md:h-[592px] md:w-[400px] lg:h-[740px] lg:w-[500px]'
          : 'h-[200px] w-[296px] sm:h-[300px] sm:w-[444px] md:h-[400px] md:max-w-[592px] lg:h-[500px] lg:w-[740px]'
      }`}
      class:opacity-0={!isReady}
      class:translate-x-full={!isReady}
      style="transition: opacity 0.4s ease-out, transform 0.4s ease-out;"
    >
      <div
        class="mb-2 flex items-center justify-between overflow-hidden whitespace-nowrap sm:mb-4 md:overflow-visible md:whitespace-normal"
      >
        <ScrollingText
          text={artwork.title}
          className="font-bold text-white sm:text-lg md:text-xl lg:text-3xl"
        />
      </div>

      <div class="overflow-y-auto">
        {#if artwork.genres && artwork.genres.length > 0}
          <div class="mb-2 flex flex-wrap gap-2 sm:mb-4">
            {#each artwork.genres as genre}
              <span
                class="rounded bg-gray-700 px-1 py-0.5 text-xs text-white sm:px-2 sm:py-1 sm:text-sm md:text-sm lg:text-lg"
                >{genre.name}</span
              >
            {/each}
          </div>
        {/if}

        <!-- 게임 플랫폼 -->
        {#if artwork.playedOn}
          <div class="mb-2 text-xs sm:mb-4 sm:text-sm md:text-sm lg:text-lg">
            <span class="text-gray-400">플랫폼:</span>
            <span class="ml-2 text-white">{artwork.playedOn}</span>
          </div>
        {/if}

        <!-- 평점 -->
        {#if artwork.rating !== undefined && artwork.rating !== null}
          <div class="mb-2 text-xs sm:mb-4 sm:text-sm md:text-sm lg:text-lg">
            <span class="text-gray-400">평점:</span>
            <span class="ml-2 text-white">{(artwork.rating / 4).toFixed(1)}/5.0</span>
          </div>
        {/if}

        <!-- 작품 설명 -->
        {#if artwork.shortReview}
          <div class="mb-6 text-xs sm:text-sm md:text-sm lg:text-lg">
            <p class="text-white">{artwork.shortReview}</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
