<script lang="ts">
  import { onMount } from 'svelte';

  let { text, className = '', duration = 5, delay = 1 } = $props();

  let containerEl: HTMLElement;
  let textEl: HTMLElement;
  let shouldScroll = $state(false);
  let distanceToScroll = $state(0);

  onMount(() => {
    setTimeout(checkOverflow, 100);

    window.addEventListener('resize', checkOverflow);
    return () => {
      window.removeEventListener('resize', checkOverflow);
    };
  });

  function checkOverflow() {
    if (!containerEl || !textEl) return;

    const textWidth = textEl.scrollWidth;
    const containerWidth = containerEl.clientWidth;

    shouldScroll = textWidth > containerWidth;
    distanceToScroll = textWidth - containerWidth;
  }
</script>

<div bind:this={containerEl} class="max-w-full {className}">
  <span
    bind:this={textEl}
    class="inline-block w-auto transition-all duration-300 md:block"
    class:scrolling={shouldScroll}
    style={`--scroll-distance: ${-distanceToScroll}px; --duration: ${duration}s; --delay: ${delay}s; padding-right: ${shouldScroll ? '4rem' : '0'};`}
  >
    {text}
  </span>
</div>

<style>
  .scrolling {
    animation: scroll var(--duration) linear var(--delay) infinite;
  }

  @keyframes scroll {
    0%,
    10% {
      transform: translateX(0);
    }
    90%,
    100% {
      transform: translateX(var(--scroll-distance));
    }
  }
</style>
