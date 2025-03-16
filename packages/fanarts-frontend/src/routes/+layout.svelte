<script>
  import '../app.css';
  import { languageState } from '$lib/states/language.svelte';

  let { children } = $props();

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = languageState.currentLanguage;
    }
  });
</script>

{@render children()}
