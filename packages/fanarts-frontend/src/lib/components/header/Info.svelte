<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { backIn, backOut } from 'svelte/easing';
  import { fade, fly } from 'svelte/transition';
  import { Icon } from 'svelte-icons-pack';
  import { BiX } from 'svelte-icons-pack/bi';
  import { IoInformationCircle } from 'svelte-icons-pack/io';
  import { SiSvelte } from 'svelte-icons-pack/si';

  import { t } from '$lib/texts';
  import type { Breakpoint } from '$lib/types/breakpoint';
  import { listenBreakpointChange } from '$lib/utils/breakpoint';

  let size: Breakpoint = $state('small');
  let isOpen = $state(false);

  function toggleOpen() {
    isOpen = !isOpen;
  }

  function closeModal() {
    isOpen = false;
  }

  // ESC 키로 모달 닫기
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      closeModal();
    }
  }

  onMount(() => {
    const unsubscribe = listenBreakpointChange((newBreakpoint) => {
      size = newBreakpoint;
    });

    window.addEventListener('keydown', handleKeydown);

    onDestroy(() => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeydown);
    });
  });
</script>

<button
  class="text-text-muted hover:text-primary-lightest flex cursor-pointer items-center justify-center gap-1 transition-all duration-300 hover:drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]"
  aria-haspopup="true"
  aria-expanded={isOpen}
  onclick={toggleOpen}
>
  <Icon src={IoInformationCircle} size={size === 'small' ? 24 : 32} />
</button>

{#if isOpen}
  <!-- 배경 오버레이 -->
  <div
    class="bg-primary-darkest fixed inset-0 z-30 cursor-default"
    transition:fade={{ duration: 300 }}
    style="background-image: linear-gradient(to right, transparent 3px, rgba(0, 0, 0, 0.7) 1px), linear-gradient(to bottom, transparent 3px, rgba(0, 0, 0, 0.7) 1px); background-size: 4px 4px;"
  ></div>

  <!-- 모달 컨테이너 -->
  <div
    class="fixed inset-0 z-40 flex cursor-default items-center justify-center p-4"
    transition:fade={{ duration: 200 }}
  >
    <div
      class="bg-primary-dark relative flex h-[75vh] w-[80vw] max-w-2xl flex-col items-center rounded-xl shadow-xl"
      in:fly={{ y: 20, duration: 300, easing: backOut }}
      out:fly={{ y: 20, duration: 200, easing: backIn }}
    >
      <!-- 닫기 버튼 -->
      <button
        class="bg-primary-light hover:bg-primary absolute -bottom-10 z-50 flex h-14 w-14 cursor-pointer flex-col items-center justify-center rounded-full p-2 text-white"
        onclick={closeModal}
      >
        <Icon src={BiX} />
        <span class="text-xs">{t('common.close')}</span>
      </button>

      <!-- 헤더 -->
      <div class="p-5 pb-2">
        <div class="flex items-center justify-between">
          <h2 class="text-primary-lightest text-xl font-bold">{t('info.intro')}</h2>
        </div>

        <div class="bg-primary-light mt-3 h-px w-full opacity-30"></div>
      </div>

      <!-- 스크롤 가능한 내용 영역 -->
      <div class="flex-grow overflow-y-auto px-5">
        <div class="text-text space-y-4 py-2">
          <section>
            <h3 class="text-primary-lightest mb-2 text-lg font-semibold">
              {t('info.fanart_gallery')}
            </h3>
            <p class="text-sm sm:text-base">
              {t('info.fanart_gallery_desc')}
            </p>
          </section>

          <section>
            <h3 class="text-primary-lightest mb-2 text-lg font-semibold">
              {t('info.copyright')}
            </h3>
            <p class="text-sm sm:text-base">
              {t('info.copyright_desc')}
            </p>
            <p>
              <a
                href="mailto:your.email@example.com"
                class="text-primary-lightest hover:text-primary-light underline underline-offset-2"
                >minhoyun.life@gmail.com</a
              >
            </p>
          </section>

          <section>
            <h3 class="text-primary-lightest mb-2 text-lg font-semibold">
              {t('info.review')}
            </h3>
            <p class="text-sm sm:text-base">
              {t('info.review_desc')}
            </p>
          </section>

          <section>
            <h3 class="text-primary-lightest mb-2 text-lg font-semibold">
              {t('info.how_to_make')}
            </h3>
            <p class="text-sm sm:text-base">
              {t('info.how_to_make_desc')}
            </p>
            <img src="/images/tools.webp" alt="tools" class="mt-2 w-full rounded-lg shadow-lg" />
          </section>
        </div>
      </div>

      <!-- 푸터 -->
      <div class="p-5 pt-2">
        <div class="bg-primary-light mb-3 h-px w-full opacity-30"></div>
        <div class="mb-2 flex items-center justify-center">
          <span class="text-text-muted mr-1 text-sm">Built with</span>
          <Icon src={SiSvelte} size={16} color={'ff3e00'} />
        </div>
        <div class="text-text-muted text-center text-sm">© 2025 minhoyunlife.</div>
      </div>
    </div>
  </div>
{/if}
