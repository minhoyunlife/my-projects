<script lang="ts">
  import { onMount } from 'svelte';

  import UnifiedLogo from '$lib/components/common/UnifiedLogo.svelte';
  import Info from '$lib/components/header/Info.svelte';
  import LanguageSelector from '$lib/components/header/LanguageSelector.svelte';

  let animationStarted = $state(false);

  onMount(() => {
    setTimeout(() => {
      animationStarted = true;
    }, 300);
  });
</script>

<header class="absolute top-0 left-0 w-full px-2 py-5">
  <div class="relative container mx-auto flex items-center justify-between">
    <!-- 사이트 정보 -->
    <div
      class="side-container z-30 cursor-pointer transition duration-300"
      class:animation-started={animationStarted}
    >
      <Info />
    </div>

    <!-- 메인 로고 -->
    <div class="z-20 transform drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]">
      <div class="flex items-center">
        <UnifiedLogo animated={true} {animationStarted} withShadow={true} />
      </div>
    </div>

    <!-- 언어 선택 -->
    <div
      class="side-container z-50 cursor-pointer transition duration-300"
      class:animation-started={animationStarted}
    >
      <LanguageSelector />
    </div>
  </div>
</header>

<style>
  .side-container {
    opacity: 0;
  }

  .side-container.animation-started {
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
