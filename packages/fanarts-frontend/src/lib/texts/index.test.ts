import { languageState } from '$lib/states/language.svelte';
import { formatDate, t } from '$lib/texts';
import en from '$lib/texts/locales/en';
import ja from '$lib/texts/locales/ja';
import ko from '$lib/texts/locales/ko';
import type { LanguageCode } from '$lib/types/languages';

vi.mock('$lib/states/language.svelte', () => ({
  languageState: {
    currentLanguage: 'ko'
  }
}));

describe('translations', () => {
  describe('t', () => {
    it('한국어에 해당하는 번역 정보를 반환함', () => {
      (languageState.currentLanguage as LanguageCode) = 'ko';
      expect(t('viewer.platform')).toBe(ko.viewer.platform);
    });

    it('영어에 해당하는 번역 정보를 반환함', () => {
      (languageState.currentLanguage as LanguageCode) = 'en';
      expect(t('common.title')).toBe(en.common.title);
    });

    it('일본어에 해당하는 번역 정보를 반환함', () => {
      (languageState.currentLanguage as LanguageCode) = 'ja';
      expect(t('common.title')).toBe(ja.common.title);
    });

    it('키에 해당하는 번역 정보가 없는 경우, 빈 문자열을 반환함', () => {
      expect(t('nonexistent.key')).toBe('');
    });

    it('키가 비어있어도 에러를 발생시키지 않음', () => {
      expect(() => t('')).not.toThrowError();
    });
  });

  describe('formatDate', () => {
    it('한국어의 형식으로 날짜를 포맷함', () => {
      (languageState.currentLanguage as LanguageCode) = 'ko';

      const result = formatDate('2023-01-15T00:00:00.000Z');
      expect(result).toContain('2023년');
      expect(result).toContain('1월');
      expect(result).toContain('15일');
    });

    it('영어의 형식으로 날짜를 포맷함', () => {
      (languageState.currentLanguage as LanguageCode) = 'en';

      const result = formatDate('2023-01-15T00:00:00.000Z');
      expect(result).toContain('January');
      expect(result).toContain('15');
      expect(result).toContain('2023');
    });

    it('일본어의 형식으로 날짜를 포맷함', () => {
      (languageState.currentLanguage as LanguageCode) = 'ja';

      const result = formatDate('2023-01-15T00:00:00.000Z');
      expect(result).toContain('2023年');
      expect(result).toContain('1月');
      expect(result).toContain('15日');
    });

    it('빈 문자열일 경우, 빈 문자열을 그대로 반환함', () => {
      expect(formatDate('')).toBe('');
    });
  });
});
