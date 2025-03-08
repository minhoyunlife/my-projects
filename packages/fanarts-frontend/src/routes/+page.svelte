<script lang="ts">
  import Carousel from '$lib/components/carousel/Carousel.svelte';
  import Header from '$lib/components/header/Header.svelte';
  import Viewer from '$lib/components/viewer/Viewer.svelte';

  import { artworkState } from '$lib/states/artwork.svelte';
  import type { TranslatedArtwork } from '$lib/types/artwork';
  import type { Position } from '$lib/types/position';

  import type { PageData } from './$types';

  const { data } = $props<{ data: PageData }>();

  let initialized = $state<boolean>(false);
  let selectedArtworkId = $state<string | null>(null);
  let position = $state<Position | null>(null);

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

  $effect(() => {
    if (data.artworks && !initialized) {
      artworkState.initialize(data.artworks);
      initialized = true;
    }
  });
</script>

<div class="w-100vw relative flex h-screen items-center">
  <Header />

  <Carousel artworkClick={handleArtworkClick} />

  {#if currentArtwork}
    <Viewer artwork={currentArtwork} initialPosition={position} onClose={closeViewer} />
  {/if}
</div>
