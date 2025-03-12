<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';

  import UnifiedLogo from '$lib/components/common/UnifiedLogo.svelte';

  import { t } from '$lib/texts';

  let { onComplete } = $props<{ onComplete: () => void }>();

  let progress = $state(0);
  let isComplete = $state(false);
  let showTip = $state(false);

  const loadingMessages = [
    'loader.loadingMessages.0',
    'loader.loadingMessages.1',
    'loader.loadingMessages.2',
    'loader.loadingMessages.3',
    'loader.loadingMessages.4'
  ];

  const currentMessage = $derived(t(loadingMessages[Math.floor(progress / 25)]));

  onMount(() => {
    const interval = setInterval(() => {
      if (progress < 100) {
        progress += Math.random() * 3 + 1;
        if (progress > 100) progress = 100;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          isComplete = true;
          setTimeout(onComplete, 800);
        }, 500);
      }
    }, 100);

    setTimeout(() => {
      showTip = true;
    }, 1500);

    return () => clearInterval(interval);
  });
</script>

<div
  class="bg-primary-dark fixed inset-0 z-50 flex items-center justify-center"
  style="background-image: linear-gradient(to right, transparent 3px, rgba(0, 0, 0, 0.1) 1px), linear-gradient(to bottom, transparent 3px, rgba(0, 0, 0, 0.1) 1px); background-size: 4px 4px;"
  out:fade={{ duration: 300 }}
>
  <div class="flex w-full flex-col items-center justify-center sm:w-2/3 xl:w-1/3">
    <div class="mb-6 flex flex-row items-center">
      <UnifiedLogo animated={false} animationStarted={false} withShadow={true} />
    </div>

    <div
      class="text-primary-lightest mb-8 flex min-h-[2em] items-center justify-center text-xl font-bold sm:text-2xl"
    >
      {t('common.title')}
    </div>

    <div class="text-text mb-4 flex min-h-[1.5em] items-center justify-center text-base sm:text-lg">
      {currentMessage}
    </div>

    <div class="bg-primary-darkest relative mx-10 h-8 w-3/4 overflow-hidden rounded-md p-1">
      <div
        class="animated-rainbow h-full rounded transition-all duration-200"
        style="width: {progress}%"
      ></div>

      <div
        class="pointer-events-none absolute inset-0 opacity-20"
        style="background-image: linear-gradient(to right, transparent 3px, rgba(0, 0, 0, 0.7) 1px), linear-gradient(to bottom, transparent 3px, rgba(0, 0, 0, 0.7) 1px); background-size: 4px 4px;"
      ></div>
    </div>

    <div class="text-text-muted mt-2 font-mono text-sm">
      {Math.floor(progress)}%
    </div>

    <div class="mt-8 min-h-[3em] w-full max-w-xs sm:max-w-md">
      {#if showTip}
        <div class="text-text text-center text-xs sm:text-sm" in:fade={{ duration: 300 }}>
          <span class="text-primary-lightest">Tip:</span>
          {t('loader.tip')}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .animated-rainbow {
    animation: rainbow-animation 6s linear infinite;
  }

  @keyframes rainbow-animation {
    0% {
      background-color: #ff5a5a;
    }
    20% {
      background-color: #ffd166;
    }
    40% {
      background-color: #06d6a0;
    }
    60% {
      background-color: #118ab2;
    }
    80% {
      background-color: #7877a7;
    }
    100% {
      background-color: #ff5a5a;
    }
  }
</style>
