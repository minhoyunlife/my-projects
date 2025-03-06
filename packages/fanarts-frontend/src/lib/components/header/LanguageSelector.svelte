<script lang="ts">
  import { onMount } from 'svelte';
  import { backIn, backOut } from 'svelte/easing';
  import { slide } from 'svelte/transition';
  import { Icon } from 'svelte-icons-pack';
  import { IoLanguage } from 'svelte-icons-pack/io';

  import { artworkState } from '$lib/states/artwork.svelte';
  import { languageState } from '$lib/states/language.svelte';
  import { languageNames, supportedLanguages, type LanguageCode } from '$lib/types/languages';

  let showDropdown = $state(false);

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
    languageState.initialize();
  });
</script>

<div class="relative">
  <button
    class="text-s flex cursor-pointer items-center gap-1"
    onclick={toggleDropdown}
    aria-haspopup="true"
    aria-expanded={showDropdown}
  >
    <!-- TODO: 동적인 배경색에 잘 보이는 색상으로 동적으로 변경 필요 -->
    <Icon src={IoLanguage} size="24" />
  </button>

  {#if showDropdown}
    <div
      class="absolute right-0 mt-1"
      role="menu"
      in:slide={{ duration: 300, easing: backOut, axis: 'y' }}
      out:slide={{ duration: 300, easing: backIn, axis: 'y' }}
    >
      {#each supportedLanguages as language}
        <button
          class="block w-full py-2 text-right {language === currentLanguage
            ? 'text-amber-100' // TODO: 동적인 배경색에 잘 보이는 색상으로 동적으로 변경 필요
            : ''}"
          role="menuitem"
          onclick={() => handleLanguageChange(language)}
        >
          {languageNames[language]}
        </button>
      {/each}
    </div>
  {/if}
</div>
