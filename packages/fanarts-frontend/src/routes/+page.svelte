<script lang="ts">
  import Carousel from '$lib/components/carousel/Carousel.svelte';
  import Meta from '$lib/components/common/Meta.svelte';
  import Header from '$lib/components/header/Header.svelte';
  import Loader from '$lib/components/loader/Loader.svelte';
  import Viewer from '$lib/components/viewer/Viewer.svelte';

  import { artworkState } from '$lib/states/artwork.svelte';
  import { languageState } from '$lib/states/language.svelte';
  import type { TranslatedArtwork } from '$lib/types/artwork';
  import type { Position } from '$lib/types/position';

  import type { PageData } from './$types';

  const { data } = $props<{ data: PageData }>();

  let initialized = $state<boolean>(false);
  let selectedArtworkId = $state<string | null>(null);
  let position = $state<Position | null>(null);
  let showLoading = $state<boolean>(true);

  const currentArtwork = $derived(
    selectedArtworkId ? artworkState.items.find((item) => item.id === selectedArtworkId) : null
  );

  function handleArtworkClick(artwork: TranslatedArtwork, element: HTMLElement) {
    const rect = element.getBoundingClientRect();

    position = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height
    };

    selectedArtworkId = artwork.id;
  }

  function closeViewer() {
    selectedArtworkId = null;
    position = null;
  }

  function completeLoading() {
    showLoading = false;
  }

  $effect(() => {
    languageState.initialize();

    if (data.artworks && !initialized) {
      artworkState.initialize(data.artworks);
      initialized = true;
    }
  });
</script>

<Meta />

{#if showLoading}
  <Loader onComplete={completeLoading} />
{:else}
  <div
    class="w-100vw bg-primary-dark relative flex h-screen items-center"
    style="
        background-image: 
          linear-gradient(to right, transparent 3px, rgba(0, 0, 0, 0.1) 1px), 
          linear-gradient(to bottom, transparent 3px, rgba(0, 0, 0, 0.1) 1px); 
        background-size: 4px 4px;
      "
  >
    <Header />
    <Carousel artworkClick={handleArtworkClick} />
    {#if currentArtwork}
      <Viewer artwork={currentArtwork} initialPosition={position} onClose={closeViewer} />
    {/if}
  </div>
{/if}
