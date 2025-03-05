<script lang="ts">
  import Carousel from '$lib/components/carousel/Carousel.svelte';

  import { artworkState } from '$lib/states/artwork.svelte';

  import type { PageData } from './$types';

  const { data } = $props<{ data: PageData }>();

  $effect(() => {
    if (data.artworks) {
      artworkState.initialize(data.artworks);
    }
  });
</script>

<div class="w-100vw flex h-screen items-center">
  <Carousel />
</div>
