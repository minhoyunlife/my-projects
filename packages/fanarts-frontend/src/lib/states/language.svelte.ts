import { supportedLanguages, type LanguageCode } from '$lib/types/languages';

export class LanguageState {
  private _state = $state<LanguageCode>('ko');

  initialize() {
    const savedLanguage = this.getSavedLanguage();
    if (savedLanguage) {
      this._state = savedLanguage;
      return;
    }

    this._state = this.detectBrowserLanguage();
  }

  get currentLanguage() {
    return this._state;
  }

  setLanguage(language: LanguageCode) {
    this._state = language;

    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }
  }

  private getSavedLanguage(): LanguageCode | null {
    if (typeof window === 'undefined') return null;

    const savedLanguage = localStorage.getItem('language');
    return savedLanguage && supportedLanguages.includes(savedLanguage as LanguageCode)
      ? (savedLanguage as LanguageCode)
      : null;
  }

  private detectBrowserLanguage(): LanguageCode {
    if (typeof window === 'undefined') return 'ko';

    const browserLanguage = navigator.language.split('-')[0] as LanguageCode;
    return supportedLanguages.includes(browserLanguage) ? browserLanguage : 'ko';
  }
}

export const languageState = new LanguageState();
