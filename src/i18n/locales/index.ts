/**
 * Registry of every language the app is translated into. Each locale is a JSON
 * bundle with the same shape as `en.json` (the source of truth and fallback).
 *
 * `SUPPORTED_LANGUAGES` drives the language picker on the settings screen and is
 * ordered alphabetically by English name; `label` is each language's own
 * endonym so users recognise it regardless of the current UI language.
 */
import bg from './bg.json';
import bs from './bs.json';
import ca from './ca.json';
import cs from './cs.json';
import da from './da.json';
import de from './de.json';
import el from './el.json';
import en from './en.json';
import es from './es.json';
import et from './et.json';
import fi from './fi.json';
import fr from './fr.json';
import ga from './ga.json';
import hr from './hr.json';
import hu from './hu.json';
import is from './is.json';
import it from './it.json';
import lt from './lt.json';
import lv from './lv.json';
import mk from './mk.json';
import mt from './mt.json';
import nb from './nb.json';
import nl from './nl.json';
import pl from './pl.json';
import pt from './pt.json';
import ro from './ro.json';
import sk from './sk.json';
import sl from './sl.json';
import sq from './sq.json';
import sr from './sr.json';
import sv from './sv.json';
import tr from './tr.json';
import uk from './uk.json';

/** All translation bundles keyed by language code. */
export const resources = {
  bg,
  bs,
  ca,
  cs,
  da,
  de,
  el,
  en,
  es,
  et,
  fi,
  fr,
  ga,
  hr,
  hu,
  is,
  it,
  lt,
  lv,
  mk,
  mt,
  nb,
  nl,
  pl,
  pt,
  ro,
  sk,
  sl,
  sq,
  sr,
  sv,
  tr,
  uk,
} as const;

export type LanguageCode = keyof typeof resources;

/** A user-selectable language: its code and its own-language display name. */
export type Language = {
  code: LanguageCode;
  /** Endonym — the language's name in that language. */
  label: string;
};

/** Every supported language, ordered alphabetically by English name. */
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'sq', label: 'Shqip' },
  { code: 'bs', label: 'Bosanski' },
  { code: 'bg', label: 'Български' },
  { code: 'ca', label: 'Català' },
  { code: 'hr', label: 'Hrvatski' },
  { code: 'cs', label: 'Čeština' },
  { code: 'da', label: 'Dansk' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'en', label: 'English' },
  { code: 'et', label: 'Eesti' },
  { code: 'fi', label: 'Suomi' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'el', label: 'Ελληνικά' },
  { code: 'hu', label: 'Magyar' },
  { code: 'is', label: 'Íslenska' },
  { code: 'ga', label: 'Gaeilge' },
  { code: 'it', label: 'Italiano' },
  { code: 'lv', label: 'Latviešu' },
  { code: 'lt', label: 'Lietuvių' },
  { code: 'mk', label: 'Македонски' },
  { code: 'mt', label: 'Malti' },
  { code: 'nb', label: 'Norsk bokmål' },
  { code: 'pl', label: 'Polski' },
  { code: 'pt', label: 'Português' },
  { code: 'ro', label: 'Română' },
  { code: 'sr', label: 'Српски' },
  { code: 'sk', label: 'Slovenčina' },
  { code: 'sl', label: 'Slovenščina' },
  { code: 'es', label: 'Español' },
  { code: 'sv', label: 'Svenska' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'uk', label: 'Українська' },
];
