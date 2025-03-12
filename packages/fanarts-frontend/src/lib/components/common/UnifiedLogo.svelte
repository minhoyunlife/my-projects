<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { Icon } from 'svelte-icons-pack';
  import { BiX } from 'svelte-icons-pack/bi';
  import { IoGameController } from 'svelte-icons-pack/io';

  import MyLogo from '$lib/components/common/MYLogo.svelte';

  import type { Breakpoint } from '$lib/types/breakpoint';
  import { listenBreakpointChange } from '$lib/utils/breakpoint';

  const {
    animated = false,
    animationStarted = false,
    withShadow
  } = $props<{
    animated: boolean;
    animationStarted: boolean;
    withShadow: boolean;
  }>();

  let size: Breakpoint = $state('small');

  onMount(() => {
    const unsubscribe = listenBreakpointChange((newBreakpoint) => {
      size = newBreakpoint;
    });

    onDestroy(() => {
      unsubscribe();
    });
  });

  const shadowClass = withShadow ? 'drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]' : '';
</script>

<div class="flex items-center">
  <div class={animated ? 'logo-container' : ''} class:animation-started={animationStarted}>
    <div class="text-white {shadowClass} transition-transform duration-300">
      <MyLogo size={size === 'small' ? 28 : 36} />
    </div>
  </div>

  <div class={animated && 'x-mark-container'} class:animation-started={animationStarted}>
    <div class="mx-2 text-white {shadowClass}">
      <Icon src={BiX} size={size === 'small' ? 18 : 24} />
    </div>
  </div>

  <div class={animated && 'gamepad-container'} class:animation-started={animationStarted}>
    <div class="text-white {shadowClass} transition-transform duration-300">
      <Icon src={IoGameController} size={size === 'small' ? 28 : 36} />
    </div>
  </div>
</div>

{#if animated}
  <style>
    .logo-container,
    .gamepad-container {
      position: relative;
      display: inline-block;
      opacity: 0;
      transform: scale(0) translateX(0);
      transform-origin: center;
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
  </style>
{/if}
