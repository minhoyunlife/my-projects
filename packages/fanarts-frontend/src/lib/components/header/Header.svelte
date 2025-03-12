<script lang="ts">
  import { onMount } from 'svelte';

  import UnifiedLogo from '$lib/components/common/UnifiedLogo.svelte';
  import LanguageSelector from '$lib/components/header/LanguageSelector.svelte';

  let animationStarted = $state(false);

  onMount(() => {
    setTimeout(() => {
      animationStarted = true;
    }, 300);
  });
</script>

<header class="absolute top-0 left-0 w-full px-2 py-5">
  <div class="relative container mx-auto flex items-center justify-center">
    <div
      class="absolute left-1/2 z-30 -translate-x-1/2 transform drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]"
    >
      <div class="flex items-center">
        <UnifiedLogo animated={true} {animationStarted} withShadow={true} />
      </div>
    </div>

    <div
      class="language-container z-50 ml-auto cursor-pointer transition duration-300"
      class:animation-started={animationStarted}
    >
      <LanguageSelector />
    </div>
  </div>
</header>

<style>
  .language-container {
    opacity: 0;
  }

  .language-container.animation-started {
    animation: 2.5s fadeIn 0.5s ease-out forwards;
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
</style>
