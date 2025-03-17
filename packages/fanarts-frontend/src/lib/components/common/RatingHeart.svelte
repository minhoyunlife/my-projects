<script lang="ts">
  import { Icon } from 'svelte-icons-pack';
  import { FaHeart, FaSolidHeart } from 'svelte-icons-pack/fa';

  const {
    rating,
    maxValue = 20,
    maxHearts = 5,
    className = ''
  } = $props<{
    rating: number;
    maxValue?: number;
    maxHearts?: number;
    className?: string;
  }>();

  let showTooltip = $state(false);

  const normalizedRating = $derived(rating / (maxValue / maxHearts));
  const hearts = Array(maxHearts).fill(0);

  function getHeartFillPercentage(index: number): number {
    return Math.max(0, Math.min(1, normalizedRating - index));
  }

  function handleMouseEnter() {
    showTooltip = true;
  }

  function handleMouseLeave() {
    showTooltip = false;
  }

  function handleFocus() {
    showTooltip = true;
  }

  function handleBlur() {
    showTooltip = false;
  }
</script>

<div
  class="relative {className}"
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  onfocus={handleFocus}
  onblur={handleBlur}
  role="img"
>
  {#each hearts as _, i}
    {#key i}
      <div class="relative mr-0.5 inline-block h-4 w-4">
        <!-- 빈 하트 배경 -->
        <span class="text-primary-light absolute inset-0">
          <Icon src={FaHeart} size="16" />
        </span>

        <!-- 채워진 하트 -->
        <div
          class="text-secondary absolute inset-0 overflow-hidden"
          style="width: {getHeartFillPercentage(i) * 100}%"
        >
          <Icon src={FaSolidHeart} size="16" className="absolute inset-0 " />
        </div>
      </div>
    {/key}
  {/each}

  {#if showTooltip}
    <div
      class="bg-primary-darkest text-text absolute -top-8 left-1/2 z-50 -translate-x-1/2 transform rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg"
      style="transition: opacity 0.2s ease-in-out;"
      role="tooltip"
    >
      {normalizedRating.toFixed(2)} / 5.00
      <div
        class="bg-primary-darkest absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 transform"
      ></div>
    </div>
  {/if}
</div>
