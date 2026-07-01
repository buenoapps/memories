import { resources, SUPPORTED_LANGUAGES } from '@/i18n/locales';
import {
  getActiveLocale,
  isSupportedLanguage,
  plural,
  resolveLocale,
  setActiveLocale,
  SUPPORTED_LANGUAGE_CODES,
  translate,
} from '@/i18n';

describe('translate', () => {
  afterEach(() => setActiveLocale('en'));

  it('looks up a nested key in the active locale', () => {
    setActiveLocale('en');
    expect(translate('settings.title')).toBe('Settings');
    setActiveLocale('de');
    expect(translate('settings.title')).toBe('Einstellungen');
  });

  it('interpolates placeholders', () => {
    setActiveLocale('en');
    expect(translate('selection.selectedCount', { count: 3 })).toBe('3 Selected');
    expect(translate('slideshow.counter', { index: 2, total: 9 })).toBe('2 of 9');
  });

  it('accepts an explicit locale override without changing the active one', () => {
    setActiveLocale('en');
    expect(translate('settings.title', undefined, 'de')).toBe('Einstellungen');
    expect(getActiveLocale()).toBe('en');
  });

  it('falls back to English then to the key for unknown keys', () => {
    setActiveLocale('de');
    expect(translate('does.not.exist')).toBe('does.not.exist');
  });
});

describe('resolveLocale', () => {
  it('uses an explicit supported language setting', () => {
    expect(resolveLocale('de', ['fr', 'en'])).toBe('de');
  });

  it('follows the device languages for the system setting', () => {
    expect(resolveLocale('system', ['fr-FR', 'en'])).toBe('fr');
    expect(resolveLocale('system', ['pt-BR'])).toBe('pt');
  });

  it('falls back to English when nothing matches', () => {
    expect(resolveLocale('system', ['zz', 'qq'])).toBe('en');
    expect(resolveLocale('system', [])).toBe('en');
  });

  it('ignores an unsupported explicit setting and tries the device', () => {
    expect(resolveLocale('xx', ['it'])).toBe('it');
  });
});

describe('plural', () => {
  it('picks the One key only for a count of 1', () => {
    expect(plural('memory.photo', 1)).toBe('memory.photoOne');
    expect(plural('memory.photo', 0)).toBe('memory.photoOther');
    expect(plural('memory.photo', 5)).toBe('memory.photoOther');
  });
});

describe('supported languages', () => {
  it('recognises supported and rejects unsupported codes', () => {
    expect(isSupportedLanguage('en')).toBe(true);
    expect(isSupportedLanguage('de')).toBe(true);
    expect(isSupportedLanguage('xx')).toBe(false);
  });

  it('has a translation bundle for every listed language', () => {
    for (const { code } of SUPPORTED_LANGUAGES) {
      expect(resources[code]).toBeDefined();
      expect(SUPPORTED_LANGUAGE_CODES).toContain(code);
    }
  });
});
