<script>
  import { languageState } from '$lib/states/language.svelte';
  import { t } from '$lib/texts';

  $effect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = languageState.currentLanguage;
    }
  });
</script>

<svelte:head>
  <title>{t('common.title')}</title>
  <meta name="description" content={t('common.description')} />
</svelte:head>
