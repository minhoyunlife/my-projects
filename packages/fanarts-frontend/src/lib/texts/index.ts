import { languageState } from '$lib/states/language.svelte';
import en from '$lib/texts/locales/en';
import ja from '$lib/texts/locales/ja';
import ko from '$lib/texts/locales/ko';

const translations = {
  en,
  ko,
  ja
};

type SupportedLanguages = keyof typeof translations;

function getNestedValue<T extends Record<string, unknown>>(obj: T, path: string[]): unknown {
  let current: unknown = obj;

  for (const key of path) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

export function t(key: string): string {
  const language = languageState.currentLanguage as SupportedLanguages;
  const keys = key.split('.');

  const translation = translations[language];

  const result = getNestedValue(translation, keys);

  if (typeof result !== 'string') {
    console.warn(`Translation missing for key: ${key} in language: ${language}`);
    return '';
  }

  return result;
}

export function formatDate(isoString: string): string {
  const language = languageState.currentLanguage;

  if (!isoString || language === 'none') return '';

  try {
    const date = new Date(isoString);

    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    const locales = {
      ko: 'ko-KR',
      en: 'en-US',
      ja: 'ja-JP'
    };

    return date.toLocaleDateString(locales[language], dateOptions);
  } catch {
    return isoString;
  }
}
