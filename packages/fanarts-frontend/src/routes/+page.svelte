<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1>Artworks</h1>
<pre>{JSON.stringify(data.artworks, null, 2)}</pre>
