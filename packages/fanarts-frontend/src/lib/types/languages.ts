export type LanguageCode = 'none' | 'ko' | 'en' | 'ja';

export const supportedLanguages: LanguageCode[] = ['none', 'ko', 'en', 'ja'];

export const languageNames: Record<LanguageCode, string> = {
  none: '',
  ko: '한국어',
  en: 'English',
  ja: '日本語'
};
