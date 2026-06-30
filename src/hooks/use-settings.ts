import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { DEFAULT_SETTINGS, sanitizeSettings, type Settings } from '@/utils/settings';

/** AsyncStorage key the settings JSON blob is persisted under. */
const STORAGE_KEY = 'memories.settings.v1';

/**
 * Reads the persisted settings, falling back to defaults for missing or corrupt
 * data. Used both by the React provider and by the (non-React) notification
 * scheduler, so it lives here next to the storage key.
 */
export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return sanitizeSettings(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** Persists the given settings, swallowing storage errors (best effort). */
export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable; the in-memory value still applies for this session.
  }
}

type SettingsValue = {
  settings: Settings;
  /** False until the persisted settings have been read at startup. */
  loaded: boolean;
  /** Merges and persists a partial update, returning the resulting settings. */
  update: (partial: Partial<Settings>) => Promise<Settings>;
};

const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Keep the latest settings in a ref so `update` can merge onto them without
  // being re-created (and so callers get a stable callback).
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    let cancelled = false;
    loadSettings().then((stored) => {
      if (cancelled) return;
      setSettings(stored);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback(async (partial: Partial<Settings>) => {
    const next = sanitizeSettings({ ...settingsRef.current, ...partial });
    setSettings(next);
    await saveSettings(next);
    return next;
  }, []);

  return createElement(SettingsContext.Provider, { value: { settings, loaded, update } }, children);
}

/**
 * Settings hook. Outside a `SettingsProvider` (e.g. in isolated unit tests) it
 * falls back to the defaults with a no-op `update`, so read-only consumers keep
 * working without wiring up a provider.
 */
export function useSettings(): SettingsValue {
  return (
    useContext(SettingsContext) ?? {
      settings: DEFAULT_SETTINGS,
      loaded: true,
      update: async () => DEFAULT_SETTINGS,
    }
  );
}
