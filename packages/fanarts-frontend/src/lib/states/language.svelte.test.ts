import { LanguageState } from '$lib/states/language.svelte';

describe('LanguageState', () => {
  let languageState: LanguageState;

  beforeEach(() => {
    languageState = new LanguageState();

    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn()
    };
    vi.stubGlobal('localStorage', localStorageMock);

    const navigatorMock = {
      language: 'en-US'
    };
    vi.stubGlobal('navigator', navigatorMock);
  });

  describe('initialize', () => {
    it('로컬 스토리지에 저장된 언어 정보가 있을 경우, 해당 언어로 초기화함', () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue('ko');

      languageState.initialize();

      expect(languageState.currentLanguage).toBe('ko');
    });

    it('로컬 스토리지에 저장된 언어 정보가 없을 경우, 브라우저 언어로 초기화함', () => {
      vi.mocked(window.localStorage.getItem).mockReturnValue(null);

      languageState.initialize();

      expect(languageState.currentLanguage).toBe('en');
    });
  });

  describe('setLanguage', () => {
    it('주어진 언어로 상태를 변경함', () => {
      languageState.setLanguage('en');

      expect(languageState.currentLanguage).toBe('en');
    });

    it('로컬 스토리지에 언어 정보를 저장함', () => {
      languageState.setLanguage('ja');

      expect(window.localStorage.setItem).toHaveBeenCalledWith('language', 'ja');
    });
  });
});
