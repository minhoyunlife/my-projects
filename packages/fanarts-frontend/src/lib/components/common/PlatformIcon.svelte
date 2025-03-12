<script lang="ts">
  import { Icon } from 'svelte-icons-pack';
  import { IoGameController } from 'svelte-icons-pack/io';
  import {
    SiNintendoswitch,
    SiSteam,
    SiEpicgames,
    SiAndroid,
    SiGogdotcom
  } from 'svelte-icons-pack/si';

  const { platform, className } = $props();

  let showTooltip = $state(false);

  const normalizedPlatform = platform.toLowerCase();

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'steam':
        return SiSteam;
      case 'switch':
        return SiNintendoswitch;
      case 'gog':
        return SiGogdotcom;
      case 'epic games':
        return SiEpicgames;
      case 'android':
        return SiAndroid;
      default:
        return IoGameController;
    }
  };

  const icon = getPlatformIcon(normalizedPlatform);

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

<span
  class="{className} relative inline-block"
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  onfocus={handleFocus}
  onblur={handleBlur}
  role="img"
  aria-label="{platform} 플랫폼"
  tabindex="-1"
>
  <Icon src={icon} />

  {#if showTooltip}
    <div
      class="bg-primary-darkest text-text absolute -top-8 left-1/2 z-50 -translate-x-1/2 transform rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg"
      style="transition: opacity 0.2s ease-in-out;"
      role="tooltip"
    >
      {platform}
      <div
        class="bg-primary-darkest absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 transform"
      ></div>
    </div>
  {/if}
</span>
