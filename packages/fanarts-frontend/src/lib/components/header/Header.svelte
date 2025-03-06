<script lang="ts">
  import { onMount } from 'svelte';
  import { Icon } from 'svelte-icons-pack';
  import { BiX } from 'svelte-icons-pack/bi';
  import { IoGameController } from 'svelte-icons-pack/io';

  import LanguageSelector from '$lib/components/header/LanguageSelector.svelte';
  import Logo from '$lib/components/header/Logo.svelte';

  let animationStarted = $state(false);

  onMount(() => {
    setTimeout(() => {
      animationStarted = true;
    }, 300);
  });
</script>

<header class="absolute top-0 left-0 z-50 w-full p-4">
  <div class="relative container mx-auto flex items-center justify-center">
    <div class="absolute left-1/2 -translate-x-1/2 transform">
      <div class="flex items-center text-xl font-bold">
        <div class="logo-container" class:animation-started={animationStarted}>
          <div class="transition-transform duration-300">
            <Logo />
          </div>
        </div>

        <div class="x-mark-container" class:animation-started={animationStarted}>
          <Icon src={BiX} />
        </div>

        <div class="gamepad-container" class:animation-started={animationStarted}>
          <div class="transition-transform duration-300">
            <Icon src={IoGameController} size="36" />
          </div>
        </div>
      </div>
    </div>

    <div class="language-container ml-auto" class:animation-started={animationStarted}>
      <LanguageSelector />
    </div>
  </div>
</header>

<style>
  .logo-container,
  .gamepad-container {
    position: relative;
    display: inline-block;
    opacity: 0;
    transform: scale(0) translateX(0);
    transform-origin: center;
  }

  .language-container {
    opacity: 0;
  }

  .x-mark-container {
    transform: scale(0) rotate(180deg);
  }

  .logo-container.animation-started {
    animation: logoMove 0.8s ease-out forwards;
  }

  .x-mark-container.animation-started {
    animation: xAppear 0.6s ease-out forwards;
    animation-delay: 0.8s;
  }

  .gamepad-container.animation-started {
    animation: gamepadMove 0.8s ease-out forwards;
    animation-delay: 0.4s;
  }

  .language-container.animation-started {
    animation: fadeIn 0.6s ease-out forwards;
  }

  @keyframes logoMove {
    0% {
      opacity: 0;
      transform: translateX(0);
    }
    100% {
      opacity: 1;
      transform: translateX(-0.5rem);
    }
  }

  @keyframes xAppear {
    0% {
      opacity: 0;
      transform: scale(0) rotate(180deg);
    }
    100% {
      opacity: 1;
      transform: scale(1) rotate(0);
    }
  }

  @keyframes gamepadMove {
    0% {
      opacity: 0;
      transform: translateX(0);
    }
    100% {
      opacity: 1;
      transform: translateX(0.5rem);
    }
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
