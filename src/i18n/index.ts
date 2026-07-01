/**
 * Lightweight, dependency-free translation layer for the app.
 *
 * Locale detection uses `expo-localization`; the actual translation is a small
 * nested-key lookup with `{{placeholder}}` interpolation and an `en` fallback,
 * kept here (rather than pulling in a heavier i18n library) so it is trivial to
 * unit test and works identically in React and in the non-React notification
 * scheduler.
 *
 * The active locale is module-global so pure helpers (e.g. the memory labels)
 * can translate without threading a locale through every call. React consumers
 * read the resolved locale reactively via `useTranslation`, which re-renders
 * them whenever the language setting changes.
 */
import { SUPPORTED_LANGUAGES, resources, type LanguageCode } from '@/i18n/locales';

/** Value stored in settings to follow the device's language automatically. */
export const SYSTEM_LANGUAGE = 'system';

/** Locale used when nothing else matches, and the source for the fallback copy. */
export const DEFAULT_LOCALE: LanguageCode = 'en';

export { SUPPORTED_LANGUAGES };
export type { LanguageCode };

/** The set of language codes the app ships translations for. */
export const SUPPORTED_LANGUAGE_CODES: LanguageCode[] = SUPPORTED_LANGUAGES.map((l) => l.code);

/** True when `code` is a language we ship translations for. */
export function isSupportedLanguage(code: string): code is LanguageCode {
  return (SUPPORTED_LANGUAGE_CODES as string[]).includes(code);
}

// The locale every `translate()` call resolves against unless overridden.
let activeLocale: LanguageCode = DEFAULT_LOCALE;

/** Sets the module-global locale used by helpers that don't take one explicitly. */
export function setActiveLocale(locale: LanguageCode): void {
  activeLocale = isSupportedLanguage(locale) ? locale : DEFAULT_LOCALE;
}

/** The currently active module-global locale. */
export function getActiveLocale(): LanguageCode {
  return activeLocale;
}

/** Reads a dotted key path out of a (possibly nested) translation object. */
function lookup(bundle: unknown, path: string[]): string | undefined {
  let current: unknown = bundle;
  for (const segment of path) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return typeof current === 'string' ? current : undefined;
}

/** Replaces `{{name}}` tokens in `template` with values from `params`. */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/**
 * Translates a dotted `key` (e.g. `settings.title`) into the given `locale`,
 * falling back to `en` and finally to the key itself, then interpolates any
 * `{{placeholders}}` from `params`.
 */
export function translate(
  key: string,
  params?: Record<string, string | number>,
  locale: LanguageCode = activeLocale,
): string {
  const path = key.split('.');
  const template =
    lookup(resources[locale], path) ?? lookup(resources[DEFAULT_LOCALE], path) ?? key;
  return interpolate(template, params);
}

/** Chooses the singular/other translation key based on `count` (one/other rule). */
export function plural(baseKey: string, count: number): string {
  return count === 1 ? `${baseKey}One` : `${baseKey}Other`;
}

/**
 * Resolves the language setting to a concrete supported locale. `system` (or any
 * unknown value) walks the device's preferred languages and returns the first
 * one we support, else the default locale.
 */
export function resolveLocale(languageSetting: string, deviceLanguageCodes: string[]): LanguageCode {
  if (languageSetting !== SYSTEM_LANGUAGE && isSupportedLanguage(languageSetting)) {
    return languageSetting;
  }
  for (const code of deviceLanguageCodes) {
    const base = code.split('-')[0].toLowerCase();
    if (isSupportedLanguage(base)) return base;
  }
  return DEFAULT_LOCALE;
}
