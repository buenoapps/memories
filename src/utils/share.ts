import { Asset } from 'expo-media-library';
import * as Sharing from 'expo-sharing';

/**
 * Resolves an asset to a shareable local file URI. The asset `id` is the
 * library identifier (`ph://…` on iOS, `content://…` on Android) produced by
 * the `Query` API; `Asset.getUri()` turns it into a concrete `file://` URI that
 * the share sheet and the video player can hand to other modules.
 *
 * The legacy `getAssetInfoAsync` helper is intentionally avoided: in SDK 56 it
 * throws at runtime unless imported from `expo-media-library/legacy`, which is
 * what previously broke sharing (and inline video playback) on every screen.
 * `getUri()` can still reject for assets that live only in iCloud, so callers
 * get `null` rather than a thrown error.
 */
export async function resolveShareUri(id: string): Promise<string | null> {
  try {
    const uri = await new Asset(id).getUri();
    return uri ?? null;
  } catch {
    return null;
  }
}

/**
 * Opens the system share sheet for one or more library assets. Returns `false`
 * when sharing is unavailable or nothing could be resolved.
 */
export async function shareAssets(ids: string[]): Promise<boolean> {
  if (ids.length === 0) return false;
  if (!(await Sharing.isAvailableAsync())) return false;

  // expo-sharing shares a single file at a time; share the first selected
  // asset. (A future enhancement could zip multiple files.)
  const uri = await resolveShareUri(ids[0]);
  if (!uri) return false;

  await Sharing.shareAsync(uri);
  return true;
}
