/**
 * Thin wrapper around `expo-localization` so the rest of the i18n code (and the
 * tests) never import the native module directly. Returns the device's preferred
 * language codes, most-preferred first, and tolerates the module being
 * unavailable (e.g. under Jest) by falling back to English.
 */
import { getLocales } from 'expo-localization';

/** The device's preferred language codes (e.g. `["de", "en"]`), best first. */
export function getDeviceLanguageCodes(): string[] {
  try {
    const codes = getLocales()
      .map((locale) => locale.languageCode)
      .filter((code): code is string => !!code);
    return codes.length > 0 ? codes : ['en'];
  } catch {
    return ['en'];
  }
}
