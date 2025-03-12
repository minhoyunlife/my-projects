<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { backIn, backOut } from 'svelte/easing';
  import { slide } from 'svelte/transition';
  import { Icon } from 'svelte-icons-pack';
  import { IoLanguage } from 'svelte-icons-pack/io';

  import { artworkState } from '$lib/states/artwork.svelte';
  import { languageState } from '$lib/states/language.svelte';
  import type { Breakpoint } from '$lib/types/breakpoint';
  import { languageNames, supportedLanguages, type LanguageCode } from '$lib/types/languages';
  import { listenBreakpointChange } from '$lib/utils/breakpoint';

  let showDropdown = $state(false);
  let size: Breakpoint = $state('small');

  const currentLanguage = $derived(languageState.currentLanguage);

  const handleLanguageChange = (language: LanguageCode) => {
    languageState.setLanguage(language);
    artworkState.updateLanguage(language);
    showDropdown = false;
  };

  function toggleDropdown() {
    showDropdown = !showDropdown;
  }

  onMount(() => {
    const unsubscribe = listenBreakpointChange((newBreakpoint) => {
      size = newBreakpoint;
    });

    onDestroy(() => {
      unsubscribe();
    });
  });
</script>

<button
  class="hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]flex w-full cursor-pointer items-center justify-center gap-1 text-white transition-all duration-300 hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] sm:mr-10"
  onclick={toggleDropdown}
  aria-haspopup="true"
  aria-expanded={showDropdown}
>
  <Icon src={IoLanguage} size={size === 'small' ? 24 : 32} />
</button>

{#if showDropdown}
  <div
    class="bg-primary-dark absolute right-0 z-40 w-20 overflow-hidden rounded-lg shadow-lg"
    role="menu"
    in:slide={{ duration: 300, easing: backOut, axis: 'y' }}
    out:slide={{ duration: 300, easing: backIn, axis: 'y' }}
  >
    <div class="py-1">
      {#each supportedLanguages as language}
        {#if language != 'none'}
          <button
            class="w-full cursor-pointer py-2 text-center text-sm transition-colors duration-200 sm:text-base {language ===
            currentLanguage
              ? 'bg-primary text-primary-lightest font-bold'
              : 'hover:bg-primary text-white'}"
            role="menuitem"
            onclick={() => handleLanguageChange(language)}
          >
            {languageNames[language]}
          </button>
        {/if}
      {/each}
    </div>
  </div>
{/if}
