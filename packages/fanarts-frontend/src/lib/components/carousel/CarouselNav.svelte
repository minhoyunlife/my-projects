<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { Icon } from 'svelte-icons-pack';
  import { FaSolidChevronLeft, FaSolidChevronRight } from 'svelte-icons-pack/fa';

  import type { Breakpoint } from '$lib/types/breakpoint';
  import { listenBreakpointChange } from '$lib/utils/breakpoint';

  const { direction, handleClick, disabled } = $props();

  let size: Breakpoint = $state('small');

  onMount(() => {
    const unsubscribe = listenBreakpointChange((newBreakpoint) => {
      size = newBreakpoint;
    });

    onDestroy(() => {
      unsubscribe();
    });
  });
</script>

{#if !disabled}
  <button
    class="text-text-muted flex cursor-pointer items-center justify-center transition duration-300 hover:text-white hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]"
    onclick={handleClick}
    aria-label={direction === 'before' ? 'prev slide' : 'next slide'}
  >
    {#if direction === 'before'}
      <Icon src={FaSolidChevronLeft} size={size === 'small' ? 28 : 36} />
    {:else if direction === 'after'}
      <Icon src={FaSolidChevronRight} size={size === 'small' ? 28 : 36} />
    {/if}
  </button>
{/if}
