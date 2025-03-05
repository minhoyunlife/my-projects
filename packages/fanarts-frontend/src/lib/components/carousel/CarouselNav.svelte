<script lang="ts">
  import { Icon } from 'svelte-icons-pack';
  import { TiChevronLeftOutline, TiChevronRightOutline } from 'svelte-icons-pack/ti';

  const { direction, handleClick, disabled } = $props();
</script>

{#if !disabled}
  <button
    class="flex h-full w-full cursor-pointer items-center justify-center text-gray-800"
    onclick={handleClick}
    aria-label={direction === 'before' ? 'prev slide' : 'next slide'}
  >
    {#if direction === 'before'}
      <Icon src={TiChevronLeftOutline} size="48" />
    {:else if direction === 'after'}
      <Icon src={TiChevronRightOutline} size="48" />
    {/if}
  </button>
{/if}
