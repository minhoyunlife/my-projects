<script lang="ts">
  import Carousel from '$lib/components/carousel/Carousel.svelte';
  import Header from '$lib/components/header/Header.svelte';

  import { artworkState } from '$lib/states/artwork.svelte';

  import type { PageData } from './$types';

  const { data } = $props<{ data: PageData }>();
  let initialized = $state(false);

  $effect(() => {
    if (data.artworks && !initialized) {
      artworkState.initialize(data.artworks);
      initialized = true;
    }
  });
</script>

<div class="w-100vw relative flex h-screen items-center">
  <Header />
  <Carousel />
</div>
