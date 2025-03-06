export type LanguageCode = 'ko' | 'en' | 'ja';

export const supportedLanguages: LanguageCode[] = ['ko', 'en', 'ja'];

export const languageNames: Record<LanguageCode, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語'
};
