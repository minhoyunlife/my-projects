<script>
  import { languageState } from '$lib/states/language.svelte';
  import { t } from '$lib/texts';

  const locale = $derived.by(() => {
    switch (languageState.currentLanguage) {
      case 'en':
        return 'en_US';
      case 'ja':
        return 'ja_JP';
      default:
        return 'ko_KR';
    }
  });
</script>

<svelte:head>
  <!-- 기본 메타 태그 -->
  <title>{t('common.title')}</title>
  <meta name="description" content={t('common.description')} />

  <!-- Open Graph 태그 -->
  <meta property="og:title" content={t('common.title')} />
  <meta property="og:description" content={t('common.description')} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://fanarts.minhoyun.life" />
  <meta property="og:image" content="https://fanarts.minhoyun.life/images/og-image.png" />
  <meta property="og:image:alt" content={t('common.title')} />
  <meta property="og:site_name" content={t('common.title')} />
  <meta property="og:locale" content={locale} />

  <!-- 문서 언어 설정 -->
  <html lang={languageState.currentLanguage}></html>
</svelte:head>
